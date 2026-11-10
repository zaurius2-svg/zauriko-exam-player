package main

import (
	"archive/zip"
	"encoding/base64"
	"encoding/xml"
	"fmt"
	"io"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
)

// ParseDocxNative распаковывает .docx и собирает структуру экзамена
func ParseDocxNative(docxPath string) (*ExamData, error) {
	r, err := zip.OpenReader(docxPath)
	if err != nil {
		return nil, fmt.Errorf("ошибка открытия DOCX как архива: %w", err)
	}
	defer r.Close()

	// 1. Извлекаем все медиафайлы из архива word/media/
	mediaMap := make(map[string]string)
	var docXMLFile *zip.File
	var relsXMLFile *zip.File

	for _, f := range r.File {
		nameLower := strings.ToLower(f.Name)
		if nameLower == "word/document.xml" {
			docXMLFile = f
		} else if nameLower == "word/_rels/document.xml.rels" {
			relsXMLFile = f
		} else if strings.HasPrefix(nameLower, "word/media/") {
			rc, err := f.Open()
			if err == nil {
				data, _ := io.ReadAll(rc)
				rc.Close()
				// Фильтруем пустые файлы, сохраняем изображения
				if len(data) > 500 {
					ext := strings.ToLower(filepath.Ext(f.Name))
					mime := "image/png"
					if ext == ".jpg" || ext == ".jpeg" {
						mime = "image/jpeg"
					} else if ext == ".gif" {
						mime = "image/gif"
					}
					b64 := fmt.Sprintf("data:%s;base64,%s", mime, base64.StdEncoding.EncodeToString(data))
					mediaMap[filepath.Base(f.Name)] = b64
				}
			}
		}
	}

	if docXMLFile == nil {
		return nil, fmt.Errorf("word/document.xml не найден внутри файла")
	}

	// 2. Читаем карту связей rId -> имя файла (Target)
	relIdToFilename := make(map[string]string)
	if relsXMLFile != nil {
		rc, err := relsXMLFile.Open()
		if err == nil {
			type Relationships struct {
				Rel []struct {
					ID     string `xml:"Id,attr"`
					Target string `xml:"Target,attr"`
				} `xml:"Relationship"`
			}
			var rels Relationships
			data, _ := io.ReadAll(rc)
			rc.Close()
			if err := xml.Unmarshal(data, &rels); err == nil {
				for _, rl := range rels.Rel {
					relIdToFilename[rl.ID] = filepath.Base(rl.Target)
				}
			}
		}
	}

	// 3. Читаем raw XML документа
	rc, err := docXMLFile.Open()
	if err != nil {
		return nil, err
	}
	defer rc.Close()

	xmlData, err := io.ReadAll(rc)
	if err != nil {
		return nil, err
	}

	type PBlock struct {
		Text   string
		Images []string
	}

	var pBlocks []PBlock

	// Регулярные выражения для поиска любого упоминания картинок (DrawingML, VML, Legacy)
	reAnyRId := regexp.MustCompile(`(?:embed|id)="([^"]+)"`)
	reTextTags := regexp.MustCompile(`<w:t[^>]*>([^<]*)</w:t>`)
	reParagraphBlocks := regexp.MustCompile(`(?s)<w:p\b[^>]*>(.*?)</w:p>`)

	matches := reParagraphBlocks.FindAllSubmatch(xmlData, -1)
	for _, m := range matches {
		pContent := string(m[1])

		// Извлекаем чистый текст
		var textParts []string
		tMatches := reTextTags.FindAllStringSubmatch(pContent, -1)
		for _, tm := range tMatches {
			textParts = append(textParts, tm[1])
		}
		fullText := strings.TrimSpace(strings.Join(textParts, ""))

		// Извлекаем любые связанные картинки по rId
		var pImages []string
		ridMatches := reAnyRId.FindAllStringSubmatch(pContent, -1)
		seenImages := make(map[string]bool)

		for _, rm := range ridMatches {
			rId := rm[1]
			if targetFile, exists := relIdToFilename[rId]; exists {
				if b64, ok := mediaMap[targetFile]; ok {
					if !seenImages[b64] {
						seenImages[b64] = true
						pImages = append(pImages, b64)
					}
				}
			}
		}

		if fullText != "" || len(pImages) > 0 {
			pBlocks = append(pBlocks, PBlock{Text: fullText, Images: pImages})
		}
	}

	// 4. Поиск вопросов и ответов
	reQ := regexp.MustCompile(`(?i)^\s*(?:QUESTION|Question|Topic\s*\d*\s*Question)[\s\.:#-]*(\d+)\s*$`)
	reAns := regexp.MustCompile(`(?i)^\s*(?:Correct\s*Answer|Answer|Correct\s*Aswer)\s*[:#\.\s-]*([A-F,\s]+)`)
	reOptExplicit := regexp.MustCompile(`(?i)^([A-F])[\.\)]\s*(.*)`)

	type RawQGroup struct {
		Number int
		Blocks []PBlock
	}

	var groups []RawQGroup
	var curGroup *RawQGroup

	for _, pb := range pBlocks {
		m := reQ.FindStringSubmatch(pb.Text)
		if len(m) > 1 {
			if curGroup != nil {
				groups = append(groups, *curGroup)
			}
			num, _ := strconv.Atoi(m[1])
			curGroup = &RawQGroup{Number: num, Blocks: []PBlock{}}
		} else if curGroup != nil {
			curGroup.Blocks = append(curGroup.Blocks, pb)
		}
	}
	if curGroup != nil {
		groups = append(groups, *curGroup)
	}

	var questions []Question

	for _, g := range groups {
		ansIdx := -1
		var correctAnswers []string
		explanation := ""

		for idx, blk := range g.Blocks {
			m := reAns.FindStringSubmatch(blk.Text)
			if len(m) > 1 {
				ansIdx = idx
				clean := strings.ToUpper(strings.ReplaceAll(strings.ReplaceAll(m[1], " ", ""), ",", ""))
				for _, ch := range clean {
					if ch >= 'A' && ch <= 'F' {
						correctAnswers = append(correctAnswers, string(ch))
					}
				}
				break
			}
		}

		if ansIdx != -1 && ansIdx+1 < len(g.Blocks) {
			var expLines []string
			for _, b := range g.Blocks[ansIdx+1:] {
				if b.Text != "" {
					expLines = append(expLines, b.Text)
				}
			}
			explanation = strings.Join(expLines, "\n")
		}

		var content []PBlock
		if ansIdx != -1 {
			content = g.Blocks[:ansIdx]
		} else {
			content = g.Blocks
		}

		var options []Option
		var qLines []string
		var qImages []string

		hasExplicit := false
		for _, b := range content {
			if reOptExplicit.MatchString(b.Text) {
				hasExplicit = true
				break
			}
		}

		if hasExplicit {
			var curOpt *Option
			inOptions := false

			for _, b := range content {
				m := reOptExplicit.FindStringSubmatch(b.Text)
				if len(m) > 2 {
					inOptions = true
					if curOpt != nil {
						options = append(options, *curOpt)
					}
					img := ""
					if len(b.Images) > 0 {
						img = b.Images[0]
					}
					curOpt = &Option{
						Key:   strings.ToUpper(m[1]),
						Text:  strings.TrimSpace(m[2]),
						Image: img,
					}
				} else if inOptions && curOpt != nil {
					if b.Text != "" {
						curOpt.Text = strings.TrimSpace(curOpt.Text + " " + b.Text)
					}
					if len(b.Images) > 0 && curOpt.Image == "" {
						curOpt.Image = b.Images[0]
					}
				} else {
					if b.Text != "" {
						qLines = append(qLines, b.Text)
					}
					qImages = append(qImages, b.Images...)
				}
			}
			if curOpt != nil {
				options = append(options, *curOpt)
			}
		} else {
			numOpts := 4
			for _, a := range correctAnswers {
				if a == "F" {
					numOpts = 6
					break
				} else if a == "E" {
					numOpts = 5
				}
			}

			var textBlocks []PBlock
			for _, b := range content {
				if b.Text != "" {
					textBlocks = append(textBlocks, b)
				}
				qImages = append(qImages, b.Images...)
			}

			var rawOpts []PBlock
			if len(textBlocks) > numOpts {
				for _, b := range textBlocks[:len(textBlocks)-numOpts] {
					qLines = append(qLines, b.Text)
				}
				rawOpts = textBlocks[len(textBlocks)-numOpts:]
			} else if len(textBlocks) > 1 {
				qLines = append(qLines, textBlocks[0].Text)
				rawOpts = textBlocks[1:]
			} else {
				for _, b := range textBlocks {
					qLines = append(qLines, b.Text)
				}
			}

			letters := []string{"A", "B", "C", "D", "E", "F"}
			for i, ob := range rawOpts {
				k := letters[i]
				img := ""
				if len(ob.Images) > 0 {
					img = ob.Images[0]
				}
				options = append(options, Option{
					Key:   k,
					Text:  ob.Text,
					Image: img,
				})
			}
		}

		reExhibit := regexp.MustCompile(`(?i)^refer to the exhibit[\.:]?`)
		var cleanQLines []string
		for _, ql := range qLines {
			if !reExhibit.MatchString(ql) {
				cleanQLines = append(cleanQLines, ql)
			}
		}

		finalQText := strings.TrimSpace(strings.Join(cleanQLines, " "))
		if finalQText == "" && len(qLines) > 0 {
			finalQText = strings.TrimSpace(strings.Join(qLines, " "))
		}

		qType := "single_choice"
		if len(correctAnswers) > 1 || strings.Contains(strings.ToLower(finalQText), "choose") {
			qType = "multiple_choice"
		}

		questions = append(questions, Question{
			Number:         g.Number,
			OrigNumber:     g.Number,
			Type:           qType,
			QuestionText:   finalQText,
			Images:         qImages,
			Options:        options,
			CorrectAnswers: correctAnswers,
			Explanation:    explanation,
		})
	}

	baseName := strings.TrimSuffix(filepath.Base(docxPath), filepath.Ext(docxPath))
	return &ExamData{
		ExamTitle:              baseName,
		TotalQuestions:         len(questions),
		PassingScorePercentage: 80.0,
		TimeLimitMinutes:       len(questions) * 2,
		Questions:              questions,
	}, nil
}
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx         context.Context
	currentExam *ExamData
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// SelectAndImportDOCX напрямую открывает .docx через встроенный движок Go
func (a *App) SelectAndImportDOCX() (*ExamData, error) {
	selectedFile, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Выберите файл дампа Word (.docx)",
		Filters: []runtime.FileFilter{
			{DisplayName: "Word Documents (*.docx)", Pattern: "*.docx"},
		},
	})
	if err != nil || selectedFile == "" {
		return nil, err
	}

	exam, err := ParseDocxNative(selectedFile)
	if err != nil {
		return nil, fmt.Errorf("ошибка обработки DOCX: %w", err)
	}

	// Автоматически сохраняем резервную копию JSON рядом с файлом
	dir := filepath.Dir(selectedFile)
	baseName := strings.TrimSuffix(filepath.Base(selectedFile), filepath.Ext(selectedFile))
	jsonOutputPath := filepath.Join(dir, baseName+"_from_word.json")

	jsonData, err := json.MarshalIndent(exam, "", "  ")
	if err == nil {
		_ = os.WriteFile(jsonOutputPath, jsonData, 0644)
	}

	a.currentExam = exam
	return exam, nil
}

// LoadExistingJSON загружает готовый JSON-файл экзамена
func (a *App) LoadExistingJSON() (*ExamData, error) {
	selectedFile, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Выберите JSON файл экзамена",
		Filters: []runtime.FileFilter{
			{DisplayName: "JSON Files (*.json)", Pattern: "*.json"},
		},
	})
	if err != nil || selectedFile == "" {
		return nil, err
	}

	data, err := os.ReadFile(selectedFile)
	if err != nil {
		return nil, fmt.Errorf("ошибка чтения файла: %w", err)
	}

	var exam ExamData
	if err := json.Unmarshal(data, &exam); err != nil {
		return nil, fmt.Errorf("ошибка парсинга JSON: %w", err)
	}

	a.currentExam = &exam
	return &exam, nil
}

// SaveUpdatedExam сохраняет измененную структуру экзамена (например, добавленные скриншоты)
func (a *App) SaveUpdatedExam(exam *ExamData) error {
	a.currentExam = exam
	return nil
}

// SubmitExam проверяет переданные ответы и рассчитывает результат
func (a *App) SubmitExam(sub Submission) (*ExamResult, error) {
	if a.currentExam == nil {
		return nil, fmt.Errorf("экзамен не загружен")
	}

	correctCount := 0
	totalCount := len(a.currentExam.Questions)
	var details []QuestionResultDetail

	for _, q := range a.currentExam.Questions {
		userAns := sub.Answers[q.Number]

		// Сортировка для корректного сравнения массивов
		uSorted := append([]string(nil), userAns...)
		cSorted := append([]string(nil), q.CorrectAnswers...)
		sort.Strings(uSorted)
		sort.Strings(cSorted)

		isCorrect := false
		if len(uSorted) > 0 && len(uSorted) == len(cSorted) {
			isCorrect = true
			for i := range uSorted {
				if uSorted[i] != cSorted[i] {
					isCorrect = false
					break
				}
			}
		}

		if isCorrect {
			correctCount++
		}

		details = append(details, QuestionResultDetail{
			Number:         q.Number,
			UserAnswers:    userAns,
			CorrectAnswers: q.CorrectAnswers,
			IsCorrect:      isCorrect,
		})
	}

	scorePct := 0.0
	if totalCount > 0 {
		scorePct = (float64(correctCount) / float64(totalCount)) * 100.0
	}

	isPassed := scorePct >= a.currentExam.PassingScorePercentage

	return &ExamResult{
		TotalQuestions:  totalCount,
		CorrectCount:    correctCount,
		ScorePercentage: scorePct,
		IsPassed:        isPassed,
		Details:         details,
	}, nil
}
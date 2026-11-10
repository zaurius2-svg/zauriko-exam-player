package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

// ParseExamFromPDF запускает extractor.py и читает созданный JSON
func ParseExamFromPDF(filePath string) (*ExamData, error) {
	dir := filepath.Dir(filePath)
	baseName := strings.TrimSuffix(filepath.Base(filePath), filepath.Ext(filePath))
	jsonOutputPath := filepath.Join(dir, baseName+"_converted.json")

	// Находим путь к скрипту extractor.py в рабочей директории
	scriptPath := "extractor.py"
	if _, err := os.Stat(scriptPath); os.IsNotExist(err) {
		// Запасной путь относительно бинарника
		exeDir, _ := os.Executable()
		scriptPath = filepath.Join(filepath.Dir(exeDir), "extractor.py")
	}

	cmd := exec.Command("python", scriptPath, filePath, jsonOutputPath)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	err := cmd.Run()
	if err != nil {
		return nil, fmt.Errorf("ошибка выполнения extractor.py: %v, детали: %s", err, stderr.String())
	}

	// Считываем сохраненный файл
	data, err := os.ReadFile(jsonOutputPath)
	if err != nil {
		return nil, fmt.Errorf("не удалось прочитать сформированный JSON: %w", err)
	}

	var exam ExamData
	if err := json.Unmarshal(data, &exam); err != nil {
		return nil, fmt.Errorf("ошибка структуры JSON: %w", err)
	}

	return &exam, nil
}
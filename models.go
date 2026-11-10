package main

// ExamData структура для полного экзамена
type ExamData struct {
	ExamTitle              string     `json:"exam_title"`
	TotalQuestions         int        `json:"total_questions"`
	PassingScorePercentage float64    `json:"passing_score_percentage"`
	TimeLimitMinutes       int        `json:"time_limit_minutes"`
	Questions              []Question `json:"questions"`
}

// Question представляет один вопрос
type Question struct {
	Number         int      `json:"number"`
	OrigNumber     int      `json:"orig_number"`
	Type           string   `json:"type"`
	QuestionText   string   `json:"question_text"`
	Images         []string `json:"images"`
	Options        []Option `json:"options"`
	CorrectAnswers []string `json:"correct_answers"`
	Explanation    string   `json:"explanation"`
}

// Option представляет вариант ответа (с текстом и опциональной картинкой)
type Option struct {
	Key   string `json:"key"`
	Text  string `json:"text"`
	Image string `json:"image,omitempty"`
}

// Submission отправка ответов пользователя
type Submission struct {
	Answers map[int][]string `json:"answers"`
}

// ExamResult итоговый результат экзамена
type ExamResult struct {
	TotalQuestions  int                    `json:"total_questions"`
	CorrectCount    int                    `json:"correct_count"`
	ScorePercentage float64                `json:"score_percentage"`
	IsPassed        bool                   `json:"is_passed"`
	Details         []QuestionResultDetail `json:"details"`
}

// QuestionResultDetail детали проверки конкретного вопроса
type QuestionResultDetail struct {
	Number         int      `json:"number"`
	UserAnswers    []string `json:"user_answers"`
	CorrectAnswers []string `json:"correct_answers"`
	IsCorrect      bool     `json:"is_correct"`
}
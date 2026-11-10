package main

import (
	"testing"
)

func TestSubmitExam(t *testing.T) {
	app := NewApp()
	app.currentExam = &ExamData{
		ExamTitle:              "Test Exam",
		TotalQuestions:         2,
		PassingScorePercentage: 70.0,
		Questions: []Question{
			{
				Number:         1,
				QuestionText:   "Question 1",
				CorrectAnswers: []string{"A", "B"},
			},
			{
				Number:         2,
				QuestionText:   "Question 2",
				CorrectAnswers: []string{"C"},
			},
		},
	}

	sub := Submission{
		Answers: map[int][]string{
			1: {"B", "A"}, // Порядок отличается, но набор тот же
			2: {"D"},      // Неверный ответ
		},
	}

	res, err := app.SubmitExam(sub)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if res.CorrectCount != 1 {
		t.Errorf("expected 1 correct, got %d", res.CorrectCount)
	}

	if res.ScorePercentage != 50.0 {
		t.Errorf("expected score 50.0, got %f", res.ScorePercentage)
	}

	if res.IsPassed {
		t.Errorf("expected exam not passed with 50%% and pass threshold 70%%")
	}

	if !res.Details[0].IsCorrect {
		t.Errorf("expected question 1 to be marked correct")
	}

	if res.Details[1].IsCorrect {
		t.Errorf("expected question 2 to be marked incorrect")
	}
}

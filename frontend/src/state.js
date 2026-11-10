// ==================== СОСТОЯНИЕ ЭКЗАМЕНА И ХРАНИЛИЩЕ ====================

export const STORAGE_SESSION_KEY = "zauriko_exam_active_session";
export const STORAGE_HISTORY_KEY = "zauriko_exam_history_logs";
export const STORAGE_NOTES_KEY = "zauriko_exam_user_notes";

export const state = {
    fullExamSource: null,
    currentExam: null,
    currentIndex: 0,
    userAnswers: {},
    markedQuestions: new Set(),
    userNotes: {}, // { [questionNumber]: string }

    searchQuery: "",
    activeFilter: "all", // "all", "unanswered", "marked", "images", "notes"

    timerInterval: null,
    remainingSeconds: 0,
    isExamFinished: false,
    isSimulationMode: false,
    isPracticeMode: false,
    examResultData: null
};

export function loadUserNotes() {
    try {
        state.userNotes = JSON.parse(localStorage.getItem(STORAGE_NOTES_KEY) || "{}");
    } catch (e) {
        state.userNotes = {};
    }
}

export function saveQuestionNote(qNumber, noteText) {
    if (!state.userNotes) state.userNotes = {};
    if (!noteText || !noteText.trim()) {
        delete state.userNotes[qNumber];
    } else {
        state.userNotes[qNumber] = noteText.trim();
    }
    try {
        localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(state.userNotes));
    } catch (e) {
        console.error("Notes save error:", e);
    }
}

export function getQuestionNote(qNumber) {
    if (!state.userNotes) loadUserNotes();
    return state.userNotes[qNumber] || "";
}

export function saveActiveSession(displayTitle) {
    if (!state.currentExam || state.isExamFinished) return;
    try {
        const session = {
            fullExamSource: state.fullExamSource,
            currentExam: state.currentExam,
            currentIndex: state.currentIndex,
            userAnswers: state.userAnswers,
            markedQuestions: Array.from(state.markedQuestions),
            remainingSeconds: state.remainingSeconds,
            isSimulationMode: state.isSimulationMode,
            isPracticeMode: state.isPracticeMode,
            displayTitle: displayTitle || (state.currentExam && state.currentExam.exam_title) || ""
        };
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    } catch (e) {
        console.error("Session save error:", e);
    }
}

export function clearActiveSession() {
    localStorage.removeItem(STORAGE_SESSION_KEY);
}

export function loadSavedSession() {
    try {
        const saved = localStorage.getItem(STORAGE_SESSION_KEY);
        if (!saved) return null;
        return JSON.parse(saved);
    } catch (e) {
        console.error("Session read error:", e);
        return null;
    }
}

export function saveHistoryEntry(entry) {
    try {
        let history = JSON.parse(localStorage.getItem(STORAGE_HISTORY_KEY) || "[]");
        history.unshift(entry);
        if (history.length > 50) history = history.slice(0, 50);
        localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
        console.error("History save error:", e);
    }
}

export function getHistoryLogs() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_HISTORY_KEY) || "[]");
    } catch (e) {
        return [];
    }
}

export function clearHistoryLogs() {
    localStorage.removeItem(STORAGE_HISTORY_KEY);
}

import { t, applyLanguage, getCurrentLang } from "./i18n.js";
import { 
    state, 
    saveActiveSession, 
    clearActiveSession, 
    loadSavedSession, 
    saveHistoryEntry,
    loadUserNotes,
    saveQuestionNote,
    getQuestionNote
} from "./state.js";
import { parseDocxOnClient } from "./docxParser.js";
import { initTimer, startTimer, stopTimer, updateTimerDisplay } from "./timer.js";
import { buildQuestionGrid, updateGridStyles, showExplanationBox } from "./ui/renderer.js";
import { renderHistoryTable, generateExamReportHTML } from "./ui/modals.js";

// ==================== UI ЭЛЕМЕНТЫ ====================
const selectLang = document.getElementById("select-lang");
const btnImportDocx = document.getElementById("btn-import-docx");
const mobileDocxInput = document.getElementById("mobile-docx-input");
const btnLoadJson = document.getElementById("btn-load-json");
const mobileFileInput = document.getElementById("mobile-file-input");
const btnExportJson = document.getElementById("btn-export-json");
const btnStartExam60 = document.getElementById("btn-start-exam-60");
const btnHistory = document.getElementById("btn-history");
const chkPracticeMode = document.getElementById("chk-practice-mode");
const modeSwitchWrapper = document.getElementById("mode-switch-wrapper");
const examTitle = document.getElementById("exam-title");
const btnToggleSidebar = document.getElementById("btn-toggle-sidebar");
const answeredStat = document.getElementById("answered-stat");
const totalStat = document.getElementById("total-stat");

const timerWrapper = document.getElementById("timer-wrapper");
const timerDisplay = document.getElementById("timer-display");

const sidebar = document.getElementById("sidebar");
const questionSearchInput = document.getElementById("question-search-input");
const filterChips = document.querySelectorAll(".filter-chip");
const questionGrid = document.getElementById("question-grid");
const quizArea = document.getElementById("quiz-area");
const footerControls = document.getElementById("footer-controls");

const qCounter = document.getElementById("q-counter");
const qType = document.getElementById("q-type");
const qModeBadge = document.getElementById("q-mode-badge");
const qText = document.getElementById("q-text");
const imagesContainer = document.getElementById("images-container");
const optionsContainer = document.getElementById("options-container");
const expBox = document.getElementById("explanation-box");
const btnToggleNote = document.getElementById("btn-toggle-note");
const noteBox = document.getElementById("note-box");
const noteTextarea = document.getElementById("note-textarea");
const btnAddImage = document.getElementById("btn-add-image");
const btnMarkReview = document.getElementById("btn-mark-review");

const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const btnShowAns = document.getElementById("btn-show-ans");
const btnSubmit = document.getElementById("btn-submit");

const resultModal = document.getElementById("result-modal");
const modalStatusTitle = document.getElementById("modal-status-title");
const modalScorePct = document.getElementById("modal-score-pct");
const modalScoreDetails = document.getElementById("modal-score-details");
const modalBtnClose = document.getElementById("modal-btn-close");
const modalBtnReviewErrors = document.getElementById("modal-btn-review-errors");
const modalBtnRetryMistakes = document.getElementById("modal-btn-retry-mistakes");
const modalBtnExportReport = document.getElementById("modal-btn-export-report");

const historyModal = document.getElementById("history-modal");
const historyTableContainer = document.getElementById("history-table-container");
const btnCloseHistory = document.getElementById("btn-close-history");
const btnClearHistory = document.getElementById("btn-clear-history");

// Инициализация заметок
loadUserNotes();

// Предупреждение при закрытии
window.addEventListener("beforeunload", (e) => {
    if (state.currentExam && !state.isExamFinished) {
        saveActiveSession(examTitle.innerText);
        e.preventDefault();
        e.returnValue = "";
    }
});

// Инициализация таймера
initTimer(timerDisplay, timerWrapper, handleTimeExpired);

// Локализация
if (selectLang) {
    selectLang.value = getCurrentLang();
    selectLang.addEventListener("change", (e) => {
        applyLanguage(e.target.value, () => {
            if (state.currentExam) renderQuestion();
        });
    });
}

window.addEventListener("DOMContentLoaded", () => {
    try {
        applyLanguage(getCurrentLang(), () => {
            if (state.currentExam) renderQuestion();
        });
    } catch (e) {
        console.error("Language init error:", e);
    }

    setTimeout(() => {
        checkSavedSession();
    }, 200);
});

// Поиск и фильтры в сайдбаре
if (questionSearchInput) {
    questionSearchInput.addEventListener("input", (e) => {
        state.searchQuery = e.target.value;
        buildQuestionGrid({
            gridElement: questionGrid,
            sidebarElement: sidebar,
            onQuestionSelect: () => {
                renderQuestion();
                saveActiveSession(examTitle.innerText);
            }
        });
    });
}

filterChips.forEach(chip => {
    chip.addEventListener("click", () => {
        filterChips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        state.activeFilter = chip.getAttribute("data-filter") || "all";
        buildQuestionGrid({
            gridElement: questionGrid,
            sidebarElement: sidebar,
            onQuestionSelect: () => {
                renderQuestion();
                saveActiveSession(examTitle.innerText);
            }
        });
    });
});

// Заметки к вопросам
if (btnToggleNote) {
    btnToggleNote.addEventListener("click", () => {
        noteBox.style.display = noteBox.style.display === "none" ? "block" : "none";
        if (noteBox.style.display === "block") {
            noteTextarea.focus();
        }
    });
}

if (noteTextarea) {
    noteTextarea.addEventListener("input", (e) => {
        if (!state.currentExam) return;
        const q = state.currentExam.questions[state.currentIndex];
        saveQuestionNote(q.number, e.target.value);
        updateGridStyles({ answeredStatElement: answeredStat });
    });
}

function checkSavedSession() {
    try {
        const session = loadSavedSession();
        if (!session || !session.currentExam || !session.currentExam.questions.length) return;

        if (confirm(t("resumePrompt", { title: session.displayTitle }))) {
            state.fullExamSource = session.fullExamSource;
            state.currentExam = session.currentExam;
            state.currentIndex = session.currentIndex || 0;
            state.userAnswers = session.userAnswers || {};
            state.markedQuestions = new Set(session.markedQuestions || []);
            state.remainingSeconds = session.remainingSeconds || 0;
            state.isSimulationMode = session.isSimulationMode || false;
            state.isPracticeMode = session.isPracticeMode || false;

            chkPracticeMode.checked = state.isPracticeMode;
            btnStartExam60.style.display = "inline-block";
            btnExportJson.style.display = "inline-block";
            modeSwitchWrapper.style.display = "inline-block";

            restoreExamUI(session.displayTitle);
            if (state.remainingSeconds > 0) {
                startTimer(state.remainingSeconds, () => examTitle.innerText);
            }
        } else {
            clearActiveSession();
        }
    } catch (e) {
        console.error("Session restore error:", e);
    }
}

// ==================== ИМПОРТ DOCX ====================
if (btnImportDocx) {
    btnImportDocx.addEventListener("click", async () => {
        if (window.go && window.go.main && window.go.main.App) {
            const origText = btnImportDocx.innerText;
            try {
                btnImportDocx.innerText = "...";
                const exam = await window.go.main.App.SelectAndImportDOCX();
                if (!exam) return;

                state.fullExamSource = JSON.parse(JSON.stringify(exam));
                btnStartExam60.style.display = "inline-block";
                btnExportJson.style.display = "inline-block";
                modeSwitchWrapper.style.display = "inline-block";
                setupExamSession(exam, `${exam.exam_title} (${t("fullBaseTitle")})`, false);
            } catch (err) {
                alert("Error DOCX:\n" + err);
            } finally {
                btnImportDocx.innerText = origText;
            }
        } else if (mobileDocxInput) {
            mobileDocxInput.click();
        }
    });
}

if (mobileDocxInput) {
    mobileDocxInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const origText = btnImportDocx.innerText;
        try {
            btnImportDocx.innerText = "Чтение...";
            const exam = await parseDocxOnClient(file);
            if (!exam || !exam.questions || exam.questions.length === 0) {
                alert("Не удалось извлечь вопросы из выбранного DOCX файла.");
                return;
            }
            state.fullExamSource = JSON.parse(JSON.stringify(exam));
            btnStartExam60.style.display = "inline-block";
            btnExportJson.style.display = "inline-block";
            modeSwitchWrapper.style.display = "inline-block";
            setupExamSession(exam, `${exam.exam_title} (${t("fullBaseTitle")})`, false);
        } catch (err) {
            alert("Ошибка парсинга DOCX:\n" + (err.message || err));
        } finally {
            btnImportDocx.innerText = origText;
            mobileDocxInput.value = "";
        }
    });
}

// ==================== ОТКРЫТИЕ И ЭКСПОРТ JSON ====================
if (btnLoadJson) {
    btnLoadJson.addEventListener("click", async () => {
        if (window.go && window.go.main && window.go.main.App) {
            try {
                const exam = await window.go.main.App.LoadExistingJSON();
                if (!exam) return;
                state.fullExamSource = JSON.parse(JSON.stringify(exam));
                btnStartExam60.style.display = "inline-block";
                btnExportJson.style.display = "inline-block";
                modeSwitchWrapper.style.display = "inline-block";
                setupExamSession(exam, `${exam.exam_title} (${t("fullBaseTitle")})`, false);
            } catch (err) {
                alert("Error JSON:\n" + err);
            }
        } else if (mobileFileInput) {
            mobileFileInput.click();
        }
    });
}

if (mobileFileInput) {
    mobileFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const exam = JSON.parse(event.target.result);
                state.fullExamSource = JSON.parse(JSON.stringify(exam));
                btnStartExam60.style.display = "inline-block";
                btnExportJson.style.display = "inline-block";
                modeSwitchWrapper.style.display = "inline-block";
                setupExamSession(exam, `${exam.exam_title || file.name} (${t("fullBaseTitle")})`, false);
            } catch (err) {
                alert("Ошибка чтения JSON:\n" + err);
            }
        };
        reader.readAsText(file);
    });
}

// Экспорт базы в файл JSON
if (btnExportJson) {
    btnExportJson.addEventListener("click", () => {
        if (!state.currentExam) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.currentExam, null, 2));
        const downloadAnchor = document.createElement("a");
        const safeTitle = (state.currentExam.exam_title || "exam_dump").replace(/[^a-zA-Z0-9_\-]/g, "_");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `${safeTitle}_exported.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });
}

chkPracticeMode.addEventListener("change", () => {
    state.isPracticeMode = chkPracticeMode.checked;
    saveActiveSession(examTitle.innerText);
    renderQuestion();
});

// ==================== СИМУЛЯЦИЯ ====================
if (btnStartExam60) {
    btnStartExam60.addEventListener("click", () => {
        if (!state.fullExamSource || !state.fullExamSource.questions.length) return;
        if (confirm(t("confirmSimStart"))) {
            startSimulationMode();
        }
    });
}

function shuffleOptionsForQuestion(q) {
    if (!q.options || q.options.length < 2) return q;

    const originalCorrectTexts = q.options
        .filter(opt => q.correct_answers.includes(opt.key))
        .map(opt => opt.text);

    const shuffledOpts = [...q.options];
    for (let i = shuffledOpts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOpts[i], shuffledOpts[j]] = [shuffledOpts[j], shuffledOpts[i]];
    }

    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const newCorrectAnswers = [];

    const remappedOptions = shuffledOpts.map((opt, idx) => {
        const newKey = letters[idx] || String(idx + 1);
        if (originalCorrectTexts.includes(opt.text)) {
            newCorrectAnswers.push(newKey);
        }
        return {
            key: newKey,
            text: opt.text,
            image: opt.image || ""
        };
    });

    return {
        ...q,
        options: remappedOptions,
        correct_answers: newCorrectAnswers
    };
}

function startSimulationMode() {
    state.isSimulationMode = true;
    state.isPracticeMode = false;
    chkPracticeMode.checked = false;

    const pool = JSON.parse(JSON.stringify(state.fullExamSource.questions));
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const selectedCount = Math.min(60, pool.length);
    const examQuestions = pool.slice(0, selectedCount).map(q => shuffleOptionsForQuestion(q));

    const simulationExam = {
        exam_title: `${state.fullExamSource.exam_title} [SIMULATION]`,
        total_questions: selectedCount,
        passing_score_percentage: state.fullExamSource.passing_score_percentage || 70.0,
        time_limit_minutes: 70,
        questions: examQuestions
    };

    setupExamSession(simulationExam, t("simTitle"), true);
}

function startMistakesPractice(mistakeQuestionNumbers) {
    const mistakeQuestions = state.fullExamSource.questions.filter(q => mistakeQuestionNumbers.includes(q.number));

    const mistakesExam = {
        exam_title: `${t("mistakesTitle")} (${mistakeQuestions.length})`,
        total_questions: mistakeQuestions.length,
        passing_score_percentage: 100,
        time_limit_minutes: mistakeQuestions.length * 2,
        questions: JSON.parse(JSON.stringify(mistakeQuestions))
    };

    state.isPracticeMode = true;
    chkPracticeMode.checked = true;
    setupExamSession(mistakesExam, t("mistakesTitle"), false);
}

function setupExamSession(exam, displayTitle, isSimMode) {
    state.currentExam = exam;
    state.currentIndex = 0;
    state.userAnswers = {};
    state.markedQuestions.clear();
    state.isExamFinished = false;
    state.isSimulationMode = isSimMode;
    state.examResultData = null;

    if (window.go && window.go.main && window.go.main.App) {
        window.go.main.App.SaveUpdatedExam(state.currentExam);
    }

    restoreExamUI(displayTitle);

    const totalMinutes = state.currentExam.time_limit_minutes > 0 
        ? state.currentExam.time_limit_minutes 
        : state.currentExam.total_questions * 2;
    startTimer(totalMinutes * 60, () => examTitle.innerText);

    saveActiveSession(displayTitle);
}

function restoreExamUI(displayTitle) {
    resultModal.style.display = "none";
    examTitle.innerText = displayTitle;
    totalStat.innerText = state.currentExam.total_questions;
    answeredStat.innerText = Object.keys(state.userAnswers).filter(k => state.userAnswers[k].length > 0).length;

    if (window.innerWidth <= 768) {
        sidebar.style.display = "none";
    } else {
        sidebar.style.display = "flex";
    }

    btnToggleSidebar.style.display = "block";
    quizArea.style.display = "block";
    footerControls.style.display = "flex";

    qModeBadge.style.display = state.isSimulationMode ? "inline-block" : "none";
    btnShowAns.style.display = state.isSimulationMode ? "none" : "inline-block";

    buildQuestionGrid({
        gridElement: questionGrid,
        sidebarElement: sidebar,
        onQuestionSelect: () => {
            renderQuestion();
            saveActiveSession(examTitle.innerText);
        }
    });
    renderQuestion();
}

async function handleTimeExpired() {
    if (state.isExamFinished) return;
    alert("TIME EXPIRED!");
    await submitAndShowReport();
}

function renderQuestion() {
    if (!state.currentExam || !state.currentExam.questions.length) return;

    const q = state.currentExam.questions[state.currentIndex];
    const displayNum = state.isSimulationMode ? (state.currentIndex + 1) : q.number;
    
    qCounter.innerText = t("qCounterText", {
        cur: displayNum,
        idx: state.currentIndex + 1,
        total: state.currentExam.total_questions
    });

    const expectedCount = q.correct_answers ? q.correct_answers.length : 1;
    if (expectedCount > 1) {
        qType.innerText = t("qMultipleChoice", { n: expectedCount });
    } else {
        qType.innerText = t("qSingleChoice");
    }

    qText.innerText = q.question_text;

    // Загрузка заметки к вопросу
    const curNote = getQuestionNote(q.number);
    noteTextarea.value = curNote;
    if (curNote) {
        btnToggleNote.classList.add("has-note-badge");
    } else {
        btnToggleNote.classList.remove("has-note-badge");
    }

    imagesContainer.innerHTML = "";
    if (q.images && q.images.length > 0) {
        imagesContainer.style.display = "flex";
        q.images.forEach((imgSrc, imgIdx) => {
            const imgWrapper = document.createElement("div");
            imgWrapper.style.position = "relative";
            imgWrapper.style.display = "inline-block";

            const img = document.createElement("img");
            img.src = imgSrc;
            img.className = "exam-image";
            img.onclick = () => img.classList.toggle("zoomed");

            if (!state.isSimulationMode) {
                const delBtn = document.createElement("button");
                delBtn.innerText = "✕";
                delBtn.style.position = "absolute";
                delBtn.style.top = "10px";
                delBtn.style.right = "10px";
                delBtn.style.background = "#f43f5e";
                delBtn.style.color = "#ffffff";
                delBtn.style.border = "none";
                delBtn.style.borderRadius = "50%";
                delBtn.style.width = "24px";
                delBtn.style.height = "24px";
                delBtn.style.cursor = "pointer";
                delBtn.style.fontWeight = "bold";
                delBtn.onclick = async (e) => {
                    e.stopPropagation();
                    q.images.splice(imgIdx, 1);
                    renderQuestion();
                    if (window.go && window.go.main && window.go.main.App) {
                        await window.go.main.App.SaveUpdatedExam(state.currentExam);
                    }
                };
                imgWrapper.appendChild(delBtn);
            }

            imgWrapper.appendChild(img);
            imagesContainer.appendChild(imgWrapper);
        });
    } else {
        imagesContainer.style.display = "none";
    }

    const isMarked = state.markedQuestions.has(q.number);
    btnMarkReview.classList.toggle("active", isMarked);
    btnMarkReview.innerText = isMarked ? t("btnMarkReviewOn") : t("btnMarkReviewOff");

    optionsContainer.innerHTML = "";
    expBox.style.display = "none";
    expBox.innerHTML = "";

    const selectedKeys = state.userAnswers[q.number] || [];
    const isMultiple = expectedCount > 1 || q.type === "multiple_choice";
    const inputType = isMultiple ? "checkbox" : "radio";
    const optionsList = q.options || [];

    const isAnsweredInPractice = state.isPracticeMode && selectedKeys.length > 0;

    optionsList.forEach(opt => {
        const row = document.createElement("label");
        row.className = "option-row";
        if (selectedKeys.includes(opt.key)) {
            row.classList.add("selected");
        }

        if (isAnsweredInPractice) {
            const isThisCorrect = q.correct_answers.includes(opt.key);
            if (isThisCorrect) {
                row.classList.add("practice-correct");
            } else if (selectedKeys.includes(opt.key)) {
                row.classList.add("practice-incorrect");
            }
        }

        const input = document.createElement("input");
        input.type = inputType;
        input.name = "option-choice";
        input.value = opt.key;
        input.checked = selectedKeys.includes(opt.key);
        input.disabled = state.isExamFinished;

        input.onchange = () => {
            selectOption(opt.key, isMultiple, expectedCount);
        };

        row.appendChild(input);

        const labelSpan = document.createElement("span");
        labelSpan.style.fontWeight = "bold";
        labelSpan.style.marginRight = "6px";
        labelSpan.innerText = `${opt.key}.`;
        row.appendChild(labelSpan);

        if (opt.text) {
            const textSpan = document.createElement("span");
            textSpan.innerText = opt.text;
            row.appendChild(textSpan);
        }

        if (opt.image) {
            const optImg = document.createElement("img");
            optImg.src = opt.image;
            optImg.className = "exam-image";
            optImg.style.maxHeight = "140px";
            optImg.style.marginLeft = "10px";
            optImg.onclick = (e) => {
                e.stopPropagation();
                optImg.classList.toggle("zoomed");
            };
            row.appendChild(optImg);
        }

        optionsContainer.appendChild(row);
    });

    btnPrev.disabled = state.currentIndex === 0;
    btnNext.disabled = state.currentIndex === state.currentExam.questions.length - 1;

    if (state.isExamFinished || (state.isPracticeMode && selectedKeys.length > 0)) {
        showExplanationBox(expBox);
    }

    updateGridStyles({ answeredStatElement: answeredStat });
}

function selectOption(key, isMultiple, expectedCount) {
    if (state.isExamFinished || !state.currentExam) return;
    const q = state.currentExam.questions[state.currentIndex];

    if (!isMultiple) {
        state.userAnswers[q.number] = [key];
    } else {
        if (!state.userAnswers[q.number]) state.userAnswers[q.number] = [];

        const idx = state.userAnswers[q.number].indexOf(key);
        if (idx > -1) {
            state.userAnswers[q.number].splice(idx, 1);
        } else {
            if (expectedCount > 1 && state.userAnswers[q.number].length >= expectedCount) {
                alert(t("maxOptionsAlert", { n: expectedCount }));
                renderQuestion();
                return;
            }
            state.userAnswers[q.number].push(key);
        }
    }
    saveActiveSession(examTitle.innerText);
    renderQuestion();
}

// Горячие клавиши
window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (!state.currentExam || !state.currentExam.questions.length) return;

    const q = state.currentExam.questions[state.currentIndex];
    const expectedCount = q.correct_answers ? q.correct_answers.length : 1;
    const isMultiple = expectedCount > 1 || q.type === "multiple_choice";

    const keyMap = {
        "Digit1": "A", "KeyA": "A",
        "Digit2": "B", "KeyB": "B",
        "Digit3": "C", "KeyC": "C",
        "Digit4": "D", "KeyD": "D",
        "Digit5": "E", "KeyE": "E",
        "Digit6": "F", "KeyF": "F"
    };

    if (keyMap[e.code]) {
        const targetKey = keyMap[e.code];
        const exists = (q.options || []).some(opt => opt.key === targetKey);
        if (exists) {
            selectOption(targetKey, isMultiple, expectedCount);
        }
        return;
    }

    if (e.code === "ArrowLeft") {
        if (state.currentIndex > 0) {
            state.currentIndex--;
            renderQuestion();
            saveActiveSession(examTitle.innerText);
        }
        return;
    }

    if (e.code === "ArrowRight") {
        if (state.currentIndex < state.currentExam.questions.length - 1) {
            state.currentIndex++;
            renderQuestion();
            saveActiveSession(examTitle.innerText);
        }
        return;
    }

    if (e.code === "KeyF") {
        toggleReviewFlag();
        return;
    }

    if (e.code === "Space" && !state.isSimulationMode) {
        e.preventDefault();
        showExplanationBox(expBox);
        return;
    }
});

function toggleReviewFlag() {
    if (!state.currentExam || state.isExamFinished) return;
    const q = state.currentExam.questions[state.currentIndex];

    if (state.markedQuestions.has(q.number)) {
        state.markedQuestions.delete(q.number);
    } else {
        state.markedQuestions.add(q.number);
    }
    saveActiveSession(examTitle.innerText);
    renderQuestion();
}

btnMarkReview.addEventListener("click", toggleReviewFlag);

btnPrev.addEventListener("click", () => {
    if (state.currentIndex > 0) {
        state.currentIndex--;
        renderQuestion();
        saveActiveSession(examTitle.innerText);
    }
});

btnNext.addEventListener("click", () => {
    if (state.currentIndex < state.currentExam.questions.length - 1) {
        state.currentIndex++;
        renderQuestion();
        saveActiveSession(examTitle.innerText);
    }
});

btnShowAns.addEventListener("click", () => showExplanationBox(expBox));

btnSubmit.addEventListener("click", async () => {
    if (state.isExamFinished) return;

    const total = state.currentExam ? state.currentExam.total_questions : 0;
    const answered = Object.keys(state.userAnswers).filter(k => state.userAnswers[k].length > 0).length;
    const marked = state.markedQuestions.size;

    const confirmMsg = t("confirmFinish", {
        answered: answered,
        total: total,
        marked: marked
    });

    if (!confirm(confirmMsg)) return;

    await submitAndShowReport();
});

async function submitAndShowReport() {
    state.isExamFinished = true;
    stopTimer();
    clearActiveSession();

    let res = null;

    if (window.go && window.go.main && window.go.main.App) {
        try {
            res = await window.go.main.App.SubmitExam({ answers: state.userAnswers });
        } catch (err) {
            console.error("Wails submit error, fallback to local:", err);
        }
    }

    if (!res) {
        let correctCount = 0;
        const details = state.currentExam.questions.map(q => {
            const userAns = (state.userAnswers[q.number] || []).slice().sort().join();
            const correctAns = (q.correct_answers || []).slice().sort().join();
            const isCorrect = userAns.length > 0 && userAns === correctAns;
            if (isCorrect) correctCount++;
            return {
                number: q.number,
                is_correct: isCorrect
            };
        });

        const totalQ = state.currentExam.total_questions || state.currentExam.questions.length;
        const scorePct = totalQ > 0 ? (correctCount / totalQ) * 100 : 0;
        const passingScore = state.currentExam.passing_score_percentage || 70.0;

        res = {
            total_questions: totalQ,
            correct_count: correctCount,
            score_percentage: scorePct,
            is_passed: scorePct >= passingScore,
            details: details
        };
    }

    state.examResultData = res;

    modalStatusTitle.innerText = res.is_passed ? t("examPassed") : t("examFailed");
    modalStatusTitle.className = res.is_passed ? "status-pass" : "status-fail";

    modalScorePct.innerText = `${res.score_percentage.toFixed(0)}%`;
    modalScoreDetails.innerText = `${t("colCorrect")}: ${res.correct_count} / ${res.total_questions}`;

    saveHistoryEntry({
        date: new Date().toLocaleString(),
        title: examTitle.innerText,
        scorePct: res.score_percentage.toFixed(0),
        correct: res.correct_count,
        total: res.total_questions,
        isPassed: res.is_passed
    });

    const failedDetails = res.details.filter(d => !d.is_correct);
    if (failedDetails.length > 0) {
        modalBtnRetryMistakes.style.display = "inline-block";
        modalBtnRetryMistakes.innerText = `${t("retryMistakes")} (${failedDetails.length})`;
        modalBtnRetryMistakes.onclick = () => {
            resultModal.style.display = "none";
            const mistakeNumbers = failedDetails.map(d => d.number);
            startMistakesPractice(mistakeNumbers);
        };
    } else {
        modalBtnRetryMistakes.style.display = "none";
    }

    resultModal.style.display = "flex";
    btnShowAns.style.display = "inline-block";
    updateGridStyles({ answeredStatElement: answeredStat });
    renderQuestion();
}

// Экспорт отчета в новой вкладке для печати или сохранения в PDF
if (modalBtnExportReport) {
    modalBtnExportReport.addEventListener("click", () => {
        if (!state.examResultData || !state.currentExam) return;
        const html = generateExamReportHTML({
            examTitle: examTitle.innerText,
            resultData: state.examResultData,
            questions: state.currentExam.questions,
            userAnswers: state.userAnswers
        });
        const reportWindow = window.open("", "_blank");
        if (reportWindow) {
            reportWindow.document.write(html);
            reportWindow.document.close();
        }
    });
}

btnHistory.addEventListener("click", () => {
    renderHistoryTable(historyTableContainer);
    historyModal.style.display = "flex";
});

btnCloseHistory.addEventListener("click", () => {
    historyModal.style.display = "none";
});

btnClearHistory.addEventListener("click", () => {
    if (confirm(t("confirmClearHistory"))) {
        localStorage.removeItem("zauriko_exam_history_logs");
        renderHistoryTable(historyTableContainer);
    }
});

modalBtnClose.addEventListener("click", () => {
    resultModal.style.display = "none";
});

modalBtnReviewErrors.addEventListener("click", () => {
    resultModal.style.display = "none";
    if (!state.examResultData || !state.examResultData.details) return;

    const firstFailIndex = state.currentExam.questions.findIndex(q => {
        const d = state.examResultData.details.find(x => x.number === q.number);
        return d && !d.is_correct;
    });

    if (firstFailIndex !== -1) {
        state.currentIndex = firstFailIndex;
        renderQuestion();
    }
});

if (btnAddImage) {
    btnAddImage.addEventListener("click", () => {
        if (!state.currentExam) return;
        const q = state.currentExam.questions[state.currentIndex];

        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (event) => {
                if (!q.images) q.images = [];
                q.images.push(event.target.result);
                renderQuestion();
                if (window.go && window.go.main && window.go.main.App) {
                    await window.go.main.App.SaveUpdatedExam(state.currentExam);
                }
            };
            reader.readAsDataURL(file);
        };
        fileInput.click();
    });
}

btnToggleSidebar.addEventListener("click", () => {
    sidebar.style.display = sidebar.style.display === "none" ? "flex" : "none";
});

import JSZip from "jszip";

// ==================== СЛОВАРЬ ЛОКАЛИЗАЦИИ ====================
const translations = {
    ru: {
        importDocx: "Импорт DOCX",
        openJson: "Открыть JSON",
        sim60: "🎯 Симуляция (60)",
        historyBtn: "📊 История",
        practiceMode: "Practice Mode (мгновенный ответ)",
        fileNotSelected: "Файл не выбран",
        timerLeft: "Осталось:",
        questionsList: "Список вопросов",
        legendAnswered: "Отвечен",
        legendReview: "Review",
        addImage: "📷 Добавить картинку",
        btnMarkReviewOn: "★ Отложен (Review)",
        btnMarkReviewOff: "☆ Отложить (Review)",
        btnPrev: "Назад (←)",
        btnNext: "Вперед (→)",
        btnShowAns: "Показать ответ (Space)",
        btnSubmit: "Завершить экзамен",
        examPassed: "ЭКЗАМЕН СДАН (PASS)!",
        examFailed: "ЭКЗАМЕН НЕ СДАН (FAIL)",
        retryMistakes: "🔥 Тренировка по ошибкам",
        reviewErrors: "Обзор ошибок",
        btnClose: "Закрыть",
        historyTitle: "История экзаменационных попыток",
        clearHistory: "Очистить историю",
        historyEmpty: "История пуста. Пройдите симуляцию для фиксации результатов.",
        colDateTime: "Дата и время",
        colMode: "Режим",
        colResult: "Результат",
        colScore: "Балл",
        colCorrect: "Верно",
        hotkeyHint: "<small>Горячие клавиши:<br>• <b>1..6</b> или <b>A..F</b> — выбор ответа<br>• <b>← / →</b> — навигация<br>• <b>F</b> — Review (флаг)<br>• <b>Space</b> — показать ответ</small>",
        confirmSimStart: "Начать симуляцию реального экзамена?\n\n• 60 случайных вопросов\n• Варианты ответов перемешаны\n• Время: 70 минут\n• Подсказки отключены",
        confirmFinish: "Вы ответили на {answered} из {total} вопросов.\nОтложено (Review): {marked}.\n\nЗавершить экзамен и сдать результаты?",
        confirmClearHistory: "Очистить журнал всех попыток?",
        resumePrompt: "Найдена сохраненная сессия («{title}»).\nПродолжить тестирование?",
        qCounterText: "Вопрос {cur} ({idx} из {total})",
        qSingleChoice: "Single Choice",
        qMultipleChoice: "Multiple Choice (Выберите {n})",
        ansCorrect: "✔ ВЕРНО",
        ansWrong: "✖ ОШИБКА (Ваш ответ: {ans})",
        labelCorrectAnswer: "Правильный ответ:",
        labelExplanation: "Пояснение:",
        noExplanation: "Объяснение отсутствует.",
        noUserAns: "Нет ответа",
        maxOptionsAlert: "Для этого вопроса нужно выбрать ровно {n} варианта!",
        fullBaseTitle: "Полная база",
        simTitle: "Экзамен (60 вопросов)",
        mistakesTitle: "Тренировка по ошибкам"
    },
    en: {
        importDocx: "Import DOCX",
        openJson: "Open JSON",
        sim60: "🎯 Simulation (60)",
        historyBtn: "📊 History",
        practiceMode: "Practice Mode (instant answer)",
        fileNotSelected: "No file selected",
        timerLeft: "Time left:",
        questionsList: "Questions List",
        legendAnswered: "Answered",
        legendReview: "Review",
        addImage: "📷 Add Image",
        btnMarkReviewOn: "★ Marked (Review)",
        btnMarkReviewOff: "☆ Mark (Review)",
        btnPrev: "Back (←)",
        btnNext: "Next (→)",
        btnShowAns: "Show Answer (Space)",
        btnSubmit: "Submit Exam",
        examPassed: "EXAM PASSED (PASS)!",
        examFailed: "EXAM FAILED (FAIL)",
        retryMistakes: "🔥 Practice Mistakes",
        reviewErrors: "Review Errors",
        btnClose: "Close",
        historyTitle: "Exam Attempt History",
        clearHistory: "Clear History",
        historyEmpty: "History is empty. Complete a simulation to log results.",
        colDateTime: "Date & Time",
        colMode: "Mode",
        colResult: "Result",
        colScore: "Score",
        colCorrect: "Correct",
        hotkeyHint: "<small>Hotkeys:<br>• <b>1..6</b> or <b>A..F</b> — select choice<br>• <b>← / →</b> — navigation<br>• <b>F</b> — Review (flag)<br>• <b>Space</b> — show answer</small>",
        confirmSimStart: "Start realistic exam simulation?\n\n• 60 random questions\n• Shuffled answer options\n• Time limit: 70 minutes\n• Instant hints disabled",
        confirmFinish: "You have answered {answered} of {total} questions.\nMarked (Review): {marked}.\n\nAre you sure you want to finish the exam?",
        confirmClearHistory: "Clear all attempt records?",
        resumePrompt: "Unfinished saved session found («{title}»).\nDo you want to resume it?",
        qCounterText: "Question {cur} ({idx} of {total})",
        qSingleChoice: "Single Choice",
        qMultipleChoice: "Multiple Choice (Choose {n})",
        ansCorrect: "✔ CORRECT",
        ansWrong: "✖ INCORRECT (Your answer: {ans})",
        labelCorrectAnswer: "Correct Answer:",
        labelExplanation: "Explanation:",
        noExplanation: "No explanation provided.",
        noUserAns: "No answer",
        maxOptionsAlert: "You must choose exactly {n} options for this question!",
        fullBaseTitle: "Full Pool",
        simTitle: "Exam (60 questions)",
        mistakesTitle: "Mistakes Practice"
    },
    az: {
        importDocx: "DOCX İdxal et",
        openJson: "JSON Aç",
        sim60: "🎯 Simulyasiya (60)",
        historyBtn: "📊 Tarixçə",
        practiceMode: "Məşq rejimi (ani cavab)",
        fileNotSelected: "Fayl seçilməyib",
        timerLeft: "Qalan vaxt:",
        questionsList: "Sual siyahısı",
        legendAnswered: "Cavablanıb",
        legendReview: "Review",
        addImage: "📷 Şəkil əlavə et",
        btnMarkReviewOn: "★ Saxlanılıb (Review)",
        btnMarkReviewOff: "☆ Saxla (Review)",
        btnPrev: "Geri (←)",
        btnNext: "İrəli (→)",
        btnShowAns: "Cavabı göstər (Space)",
        btnSubmit: "İmtahanı bitir",
        examPassed: "İMTAHANDAN KEÇDİNİZ (PASS)!",
        examFailed: "İMTAHANDAN KƏSİLDİNİZ (FAIL)",
        retryMistakes: "🔥 Səhvlər üzərində iş",
        reviewErrors: "Səhvlərə baxış",
        btnClose: "Bağla",
        historyTitle: "İmtahan cəhdləri tarixçəsi",
        clearHistory: "Tarixçəni təmizlə",
        historyEmpty: "Tarixçə boşdur. Nəticələrin qeydə alınması üçün simulyasiyanı tamamlayın.",
        colDateTime: "Tarix və vaxt",
        colMode: "Rejim",
        colResult: "Nəticə",
        colScore: "Bal",
        colCorrect: "Düzgün",
        hotkeyHint: "<small>Qaynar düymələr:<br>• <b>1..6</b> və ya <b>A..F</b> — variantı seç<br>• <b>← / →</b> — keçid<br>• <b>F</b> — Review (bayraq)<br>• <b>Space</b> — cavabı göstər</small>",
        confirmSimStart: "Real imtahan simulyasiyasına başlansın?\n\n• 60 təsadüfi sual\n• Qarışdırılmış cavab variantları\n• Vaxt: 70 dəqiqə\n• İpucları deaktivdir",
        confirmFinish: "{total} sualdan {answered} cavablandırdınız.\nSaxlanılan (Review): {marked}.\n\nİmtahanı bitirib nəticəni təsdiqləmək istəyirsiniz?",
        confirmClearHistory: "Bütün imtahan tarixçəsi silinsin?",
        resumePrompt: "Yarımçıq saxlanılmış sessiya tapıldı («{title}»).\nTesti davam etdirmək istəyirsiniz?",
        qCounterText: "Sual {cur} ({idx} / {total})",
        qSingleChoice: "Tək seçim (Single Choice)",
        qMultipleChoice: "Çoxlu seçim ({n} variant seçin)",
        ansCorrect: "✔ DOĞRU",
        ansWrong: "✖ YANLIŞ (Sizin cavab: {ans})",
        labelCorrectAnswer: "Doğru cavab:",
        labelExplanation: "İzah:",
        noExplanation: "İzah qeyd edilməyib.",
        noUserAns: "Cavab verilməyib",
        maxOptionsAlert: "Bu sual üçün yalnız {n} variant seçməlisiniz!",
        fullBaseTitle: "Tam baza",
        simTitle: "İmtahan (60 sual)",
        mistakesTitle: "Səhvlərin məşqi"
    },
    uk: {
        importDocx: "Імпорт DOCX",
        openJson: "Відкрити JSON",
        sim60: "🎯 Симуляція (60)",
        historyBtn: "📊 Історія",
        practiceMode: "Practice Mode (миттєва відповідь)",
        fileNotSelected: "Файл не вибрано",
        timerLeft: "Залишилось:",
        questionsList: "Список питань",
        legendAnswered: "Відповіли",
        legendReview: "Review",
        addImage: "📷 Додати зображення",
        btnMarkReviewOn: "★ Відкладено (Review)",
        btnMarkReviewOff: "☆ Відкласти (Review)",
        btnPrev: "Назад (←)",
        btnNext: "Вперед (→)",
        btnShowAns: "Показати відповідь (Space)",
        btnSubmit: "Завершити іспит",
        examPassed: "ІСПИТ СКЛАДЕНО (PASS)!",
        examFailed: "ІСПИТ НЕ СКЛАДЕНО (FAIL)",
        retryMistakes: "🔥 Тренування за помилками",
        reviewErrors: "Огляд помилок",
        btnClose: "Закрити",
        historyTitle: "Історія спроб складання",
        clearHistory: "Очистити історію",
        historyEmpty: "Історія порожня. Пройдіть симуляцію для фіксації результатів.",
        colDateTime: "Дата і час",
        colMode: "Режим",
        colResult: "Результат",
        colScore: "Бал",
        colCorrect: "Вірно",
        hotkeyHint: "<small>Гарячі клавіші:<br>• <b>1..6</b> або <b>A..F</b> — вибір варіанта<br>• <b>← / →</b> — навігація<br>• <b>F</b> — Review (прапорець)<br>• <b>Space</b> — показати відповідь</small>",
        confirmSimStart: "Розпочати симуляцію реального іспиту?\n\n• 60 випадкових питань\n• Варіанти відповідей перемішані\n• Час: 70 хвилин\n• Підказки вимкнено",
        confirmFinish: "Ви відповіли на {answered} з {total} питань.\nВідкладено (Review): {marked}.\n\nЗавершити іспит і перевірити результат?",
        confirmClearHistory: "Очистити журнал усіх спроб?",
        resumePrompt: "Знайдено збережену незавершену сесію («{title}»).\nПродовжити тестування?",
        qCounterText: "Питання {cur} ({idx} з {total})",
        qSingleChoice: "Single Choice",
        qMultipleChoice: "Multiple Choice (Оберіть {n})",
        ansCorrect: "✔ ВІРНО",
        ansWrong: "✖ ПОМИЛКА (Ваша відповідь: {ans})",
        labelCorrectAnswer: "Правильна відповідь:",
        labelExplanation: "Пояснення:",
        noExplanation: "Пояснення відсутнє.",
        noUserAns: "Немає відповіді",
        maxOptionsAlert: "Для цього питання потрібно обрати рівно {n} варіанти!",
        fullBaseTitle: "Повна база",
        simTitle: "Іспит (60 питань)",
        mistakesTitle: "Тренування за помилками"
    }
};

let currentLang = localStorage.getItem("zauriko_exam_lang") || "ru";

function t(key, vars = {}) {
    let str = (translations[currentLang] && translations[currentLang][key]) || translations["ru"][key] || key;
    for (const v in vars) {
        str = str.replace(new RegExp(`\\{${v}\\}`, 'g'), vars[v]);
    }
    return str;
}

function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("zauriko_exam_lang", lang);

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (key && translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });

    const hotkeyHint = document.getElementById("hotkey-hint");
    if (hotkeyHint) hotkeyHint.innerHTML = t("hotkeyHint");

    if (currentExam) {
        renderQuestion();
    }
}

// ==================== СОСТОЯНИЕ ====================
let fullExamSource = null;
let currentExam = null;
let currentIndex = 0;
let userAnswers = {};
let markedQuestions = new Set();

let timerInterval = null;
let remainingSeconds = 0;
let isExamFinished = false;
let isSimulationMode = false;
let isPracticeMode = false;
let examResultData = null;

const STORAGE_SESSION_KEY = "zauriko_exam_active_session";
const STORAGE_HISTORY_KEY = "zauriko_exam_history_logs";

// Элементы UI
const selectLang = document.getElementById("select-lang");
const btnImportDocx = document.getElementById("btn-import-docx");
const mobileDocxInput = document.getElementById("mobile-docx-input");
const btnLoadJson = document.getElementById("btn-load-json");
const mobileFileInput = document.getElementById("mobile-file-input");
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

const historyModal = document.getElementById("history-modal");
const historyTableContainer = document.getElementById("history-table-container");
const btnCloseHistory = document.getElementById("btn-close-history");
const btnClearHistory = document.getElementById("btn-clear-history");

if (selectLang) {
    selectLang.value = currentLang;
    selectLang.addEventListener("change", (e) => {
        applyLanguage(e.target.value);
    });
}

window.addEventListener("DOMContentLoaded", () => {
    try {
        applyLanguage(currentLang);
    } catch (e) {
        console.error("Language init error:", e);
    }

    setTimeout(() => {
        checkSavedSession();
    }, 200);
});

function checkSavedSession() {
    try {
        const saved = localStorage.getItem(STORAGE_SESSION_KEY);
        if (!saved) return;
        const session = JSON.parse(saved);
        if (session && session.currentExam && session.currentExam.questions.length > 0) {
            if (confirm(t("resumePrompt", { title: session.displayTitle }))) {
                fullExamSource = session.fullExamSource;
                currentExam = session.currentExam;
                currentIndex = session.currentIndex || 0;
                userAnswers = session.userAnswers || {};
                markedQuestions = new Set(session.markedQuestions || []);
                remainingSeconds = session.remainingSeconds || 0;
                isSimulationMode = session.isSimulationMode || false;
                isPracticeMode = session.isPracticeMode || false;

                chkPracticeMode.checked = isPracticeMode;
                btnStartExam60.style.display = "inline-block";
                modeSwitchWrapper.style.display = "inline-block";

                restoreExamUI(session.displayTitle);
            } else {
                localStorage.removeItem(STORAGE_SESSION_KEY);
            }
        }
    } catch (e) {
        console.error("Session restore error:", e);
    }
}

function saveActiveSession() {
    if (!currentExam || isExamFinished) return;
    try {
        const session = {
            fullExamSource,
            currentExam,
            currentIndex,
            userAnswers,
            markedQuestions: Array.from(markedQuestions),
            remainingSeconds,
            isSimulationMode,
            isPracticeMode,
            displayTitle: examTitle.innerText
        };
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    } catch (e) {
        console.error("Session save error:", e);
    }
}

function clearActiveSession() {
    localStorage.removeItem(STORAGE_SESSION_KEY);
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

                fullExamSource = JSON.parse(JSON.stringify(exam));
                btnStartExam60.style.display = "inline-block";
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
            fullExamSource = JSON.parse(JSON.stringify(exam));
            btnStartExam60.style.display = "inline-block";
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

// ==================== МОЩНЫЙ КЛИЕНТСКИЙ ПАРСЕР DOCX С СОХРАНЕНИЕМ ПРОБЕЛОВ ====================
async function parseDocxOnClient(file) {
    const zip = await JSZip.loadAsync(file);
    const docXmlFile = zip.file("word/document.xml");
    if (!docXmlFile) throw new Error("Неверный формат DOCX: отсутствует word/document.xml");

    const xmlText = await docXmlFile.async("text");
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");

    // 1. Извлекаем медиа-файлы (изображения)
    const imagesMap = {};
    const relsFile = zip.file("word/_rels/document.xml.rels");
    if (relsFile) {
        try {
            const relsText = await relsFile.async("text");
            const relsDoc = parser.parseFromString(relsText, "application/xml");
            const relationships = relsDoc.getElementsByTagName("Relationship");
            for (let rel of relationships) {
                const rId = rel.getAttribute("Id");
                const target = rel.getAttribute("Target");
                if (target && target.startsWith("media/")) {
                    const imgZipEntry = zip.file(`word/${target}`);
                    if (imgZipEntry) {
                        const base64 = await imgZipEntry.async("base64");
                        const ext = target.split('.').pop().toLowerCase();
                        const mime = ext === "png" ? "image/png" : "image/jpeg";
                        imagesMap[rId] = `data:${mime};base64,${base64}`;
                    }
                }
            }
        } catch (e) {
            console.warn("Media rels error:", e);
        }
    }

    // 2. Извлекаем параграфы с ГАРАНТИРОВАННЫМ сохранением пробелов
    const pNodes = xmlDoc.getElementsByTagName("w:p");
    const paragraphs = [];

    for (let p of pNodes) {
        let pText = "";
        
        // В Word внутри <w:p> идут блоки <w:r> (runs)
        const runs = p.querySelectorAll("w\\:r, r");
        
        if (runs.length > 0) {
            for (let r of runs) {
                let runText = "";
                // Читаем текст внутри <w:t>
                const tNodes = r.querySelectorAll("w\\:t, t");
                for (let t of tNodes) {
                    runText += t.textContent;
                }
                
                // Табуляции и разрывы строк
                if (r.querySelector("w\\:tab, tab")) runText += " ";
                if (r.querySelector("w\\:br, br")) runText += "\n";

                // Если предыдущий текст не кончался пробелом и новый не начинается,
                // но они в разных <w:r>, разделяем пробелом при необходимости
                if (pText.length > 0 && runText.length > 0) {
                    const lastChar = pText[pText.length - 1];
                    const firstChar = runText[0];
                    if (!/\s/.test(lastChar) && !/\s/.test(firstChar)) {
                        // Если это склеенные слова, вставляем разделитель
                        pText += " ";
                    }
                }
                pText += runText;
            }
        } else {
            // Запасной вариант, если runs не сработал
            const allT = p.querySelectorAll("w\\:t, t");
            for (let t of allT) {
                pText += (pText && !pText.endsWith(" ") ? " " : "") + t.textContent;
            }
        }

        // Проверяем, является ли параграф пунктом списка Word
        const hasNumPr = p.getElementsByTagName("w:numPr").length > 0 || p.getElementsByTagName("numPr").length > 0;

        // Поиск встроенных изображений
        const embeddedImages = [];
        const blips = p.querySelectorAll("a\\:blip, blip");
        for (let blip of blips) {
            const embedId = blip.getAttribute("r:embed");
            if (embedId && imagesMap[embedId]) {
                embeddedImages.push(imagesMap[embedId]);
            }
        }

        // Нормализуем неразрывные пробелы и множественные пробелы внутри строки
        pText = pText.replace(/[\u00A0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000]/g, " ")
                     .replace(/[ \t]+/g, " ")
                     .trim();

        if (pText || embeddedImages.length > 0) {
            paragraphs.push({ text: pText, images: embeddedImages, isListItem: hasNumPr });
        }
    }

    // 3. Структурный разбор вопросов по блокам
    const rawQuestions = [];
    let curBlock = null;

    for (let item of paragraphs) {
        const text = item.text;

        // Поиск маркера начала вопроса (QUESTION 1, ВОПРОС 1)
        const qMatch = text.match(/^(?:QUESTION|ВОПРОС|Вопрос)\s*(\d+)[:.]?\s*(.*)/i);
        if (qMatch) {
            if (curBlock) rawQuestions.push(curBlock);
            curBlock = {
                number: parseInt(qMatch[1], 10),
                rawLines: [],
                images: [...item.images]
            };
            if (qMatch[2] && qMatch[2].trim()) {
                curBlock.rawLines.push({ text: qMatch[2].trim(), isListItem: item.isListItem });
            }
            continue;
        }

        if (!curBlock) continue;

        if (item.images.length > 0) {
            curBlock.images.push(...item.images);
        }

        if (text) {
            curBlock.rawLines.push({ text: text, isListItem: item.isListItem });
        }
    }

    if (curBlock) rawQuestions.push(curBlock);

    // 4. Построение объектов вопросов с отделением вариантов
    const questions = [];
    const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    rawQuestions.forEach((block, bIdx) => {
        let correctAnswers = [];
        let explanation = "";
        let inExplanation = false;

        const preLines = [];

        // Шаг А: Извлечение Correct Answer и Explanation
        for (let lineObj of block.rawLines) {
            const line = lineObj.text;

            // Поиск правильного ответа (например "Correct Answer: D" или "CorrectAnswer:D")
            const ansMatch = line.match(/(?:Correct\s*Answer|Ответ|Правильный\s*ответ)[:\s]*([A-F,\s]+)/i);
            if (ansMatch) {
                const rawAns = ansMatch[1].toUpperCase();
                correctAnswers = rawAns.match(/[A-F]/g) || [];
                continue;
            }

            const expMatch = line.match(/(?:Explanation|Пояснение|Объяснение)[:\s]*(.*)/i);
            if (expMatch) {
                inExplanation = true;
                explanation = expMatch[1] ? expMatch[1].trim() : "";
                continue;
            }

            if (inExplanation) {
                explanation += (explanation ? "\n" : "") + line;
                continue;
            }

            preLines.push(lineObj);
        }

        // Шаг Б: Распознавание вариантов ответов
        const options = [];
        let questionTextLines = [];

        // Проверяем, есть ли явные буквы A., B., C., D.
        const hasExplicitLetters = preLines.some(l => /^(?:[\u2022\-\*]\s*)?\[?([A-F])\]?[\.\):\-]\s+/i.test(l.text));

        if (hasExplicitLetters) {
            for (let lineObj of preLines) {
                const line = lineObj.text;
                const optMatch = line.match(/^(?:[\u2022\-\*]\s*)?\[?([A-F])\]?[\.\):\-]\s*(.*)/i);
                if (optMatch) {
                    options.push({
                        key: optMatch[1].toUpperCase(),
                        text: optMatch[2].trim(),
                        image: ""
                    });
                } else if (options.length > 0) {
                    options[options.length - 1].text += " " + line;
                } else {
                    questionTextLines.push(line);
                }
            }
        } else {
            // Если явных букв нет: варианты идут перед Correct Answer
            // Определяем количество вариантов (обычно 4 или по максимальной букве правильного ответа)
            const expectedCount = (correctAnswers.length > 0) 
                ? Math.max(...correctAnswers.map(c => alphabet.indexOf(c) + 1), 4) 
                : 4;

            if (preLines.length > expectedCount) {
                const qLines = preLines.slice(0, preLines.length - expectedCount);
                const optLines = preLines.slice(preLines.length - expectedCount);

                questionTextLines = qLines.map(l => l.text);
                optLines.forEach((l, idx) => {
                    options.push({
                        key: alphabet[idx] || String(idx + 1),
                        text: l.text,
                        image: ""
                    });
                });
            } else {
                questionTextLines = preLines.map(l => l.text);
            }
        }

        questions.push({
            number: block.number || (bIdx + 1),
            question_text: questionTextLines.join("\n\n"),
            options: options,
            correct_answers: correctAnswers,
            explanation: explanation,
            images: block.images,
            type: (correctAnswers.length > 1) ? "multiple_choice" : "single_choice"
        });
    });

    return {
        exam_title: file.name.replace(/\.[^/.]+$/, ""),
        total_questions: questions.length,
        passing_score_percentage: 70.0,
        time_limit_minutes: Math.max(questions.length * 2, 60),
        questions: questions
    };
}

// ==================== ОТКРЫТИЕ JSON ====================
if (btnLoadJson) {
    btnLoadJson.addEventListener("click", async () => {
        if (window.go && window.go.main && window.go.main.App) {
            try {
                const exam = await window.go.main.App.LoadExistingJSON();
                if (!exam) return;
                fullExamSource = JSON.parse(JSON.stringify(exam));
                btnStartExam60.style.display = "inline-block";
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
                fullExamSource = JSON.parse(JSON.stringify(exam));
                btnStartExam60.style.display = "inline-block";
                modeSwitchWrapper.style.display = "inline-block";
                setupExamSession(exam, `${exam.exam_title || file.name} (${t("fullBaseTitle")})`, false);
            } catch (err) {
                alert("Ошибка чтения JSON:\n" + err);
            }
        };
        reader.readAsText(file);
    });
}

chkPracticeMode.addEventListener("change", () => {
    isPracticeMode = chkPracticeMode.checked;
    saveActiveSession();
    renderQuestion();
});

// ==================== СИМУЛЯЦИЯ ====================
if (btnStartExam60) {
    btnStartExam60.addEventListener("click", () => {
        if (!fullExamSource || !fullExamSource.questions.length) return;
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
    isSimulationMode = true;
    isPracticeMode = false;
    chkPracticeMode.checked = false;

    const pool = JSON.parse(JSON.stringify(fullExamSource.questions));
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const selectedCount = Math.min(60, pool.length);
    const examQuestions = pool.slice(0, selectedCount).map(q => shuffleOptionsForQuestion(q));

    const simulationExam = {
        exam_title: `${fullExamSource.exam_title} [SIMULATION]`,
        total_questions: selectedCount,
        passing_score_percentage: fullExamSource.passing_score_percentage || 70.0,
        time_limit_minutes: 70,
        questions: examQuestions
    };

    setupExamSession(simulationExam, t("simTitle"), true);
}

function startMistakesPractice(mistakeQuestionNumbers) {
    const mistakeQuestions = fullExamSource.questions.filter(q => mistakeQuestionNumbers.includes(q.number));

    const mistakesExam = {
        exam_title: `${t("mistakesTitle")} (${mistakeQuestions.length})`,
        total_questions: mistakeQuestions.length,
        passing_score_percentage: 100,
        time_limit_minutes: mistakeQuestions.length * 2,
        questions: JSON.parse(JSON.stringify(mistakeQuestions))
    };

    isPracticeMode = true;
    chkPracticeMode.checked = true;
    setupExamSession(mistakesExam, t("mistakesTitle"), false);
}

function setupExamSession(exam, displayTitle, isSimMode) {
    currentExam = exam;
    currentIndex = 0;
    userAnswers = {};
    markedQuestions.clear();
    isExamFinished = false;
    isSimulationMode = isSimMode;
    examResultData = null;

    if (window.go && window.go.main && window.go.main.App) {
        window.go.main.App.SaveUpdatedExam(currentExam);
    }

    restoreExamUI(displayTitle);

    const totalMinutes = currentExam.time_limit_minutes > 0 
        ? currentExam.time_limit_minutes 
        : currentExam.total_questions * 2;
    startTimer(totalMinutes * 60);

    saveActiveSession();
}

function restoreExamUI(displayTitle) {
    resultModal.style.display = "none";
    examTitle.innerText = displayTitle;
    totalStat.innerText = currentExam.total_questions;
    answeredStat.innerText = Object.keys(userAnswers).filter(k => userAnswers[k].length > 0).length;

    // На мобильных скрываем сайдбар по умолчанию, чтобы не загораживать вопрос
    if (window.innerWidth <= 768) {
        sidebar.style.display = "none";
    } else {
        sidebar.style.display = "flex";
    }

    btnToggleSidebar.style.display = "block";
    quizArea.style.display = "block";
    footerControls.style.display = "flex";

    qModeBadge.style.display = isSimulationMode ? "inline-block" : "none";
    btnShowAns.style.display = isSimulationMode ? "none" : "inline-block";

    buildQuestionGrid();
    renderQuestion();
}

function startTimer(seconds) {
    if (timerInterval) clearInterval(timerInterval);

    remainingSeconds = seconds;
    timerWrapper.style.display = "flex";
    timerWrapper.classList.remove("warning", "critical");

    updateTimerDisplay();

    timerInterval = setInterval(() => {
        if (remainingSeconds <= 0) {
            clearInterval(timerInterval);
            handleTimeExpired();
            return;
        }

        remainingSeconds--;
        updateTimerDisplay();

        if (remainingSeconds <= 300) {
            timerWrapper.classList.add("critical");
            timerWrapper.classList.remove("warning");
        } else if (remainingSeconds <= 600) {
            timerWrapper.classList.add("warning");
            timerWrapper.classList.remove("critical");
        } else {
            timerWrapper.classList.remove("warning", "critical");
        }

        if (remainingSeconds % 15 === 0) {
            saveActiveSession();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;
    const pad = (n) => String(n).padStart(2, "0");
    timerDisplay.innerText = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

async function handleTimeExpired() {
    if (isExamFinished) return;
    alert("TIME EXPIRED!");
    await submitAndShowReport();
}

function buildQuestionGrid() {
    questionGrid.innerHTML = "";
    if (!currentExam) return;

    currentExam.questions.forEach((q, idx) => {
        const item = document.createElement("button");
        item.className = "grid-item";
        item.id = `grid-btn-${idx}`;
        item.innerText = isSimulationMode ? (idx + 1) : q.number;

        item.onclick = () => {
            currentIndex = idx;
            renderQuestion();
            saveActiveSession();
            if (window.innerWidth <= 768) {
                sidebar.style.display = "none";
            }
        };

        questionGrid.appendChild(item);
    });
}

function updateGridStyles() {
    if (!currentExam) return;

    let answeredCount = 0;

    currentExam.questions.forEach((q, idx) => {
        const item = document.getElementById(`grid-btn-${idx}`);
        if (!item) return;

        const isAnswered = userAnswers[q.number] && userAnswers[q.number].length > 0;
        if (isAnswered) answeredCount++;

        const isMarked = markedQuestions.has(q.number);

        item.classList.toggle("answered", isAnswered);
        item.classList.toggle("marked", isMarked);
        item.classList.toggle("active", idx === currentIndex);

        if (examResultData && examResultData.details) {
            const detail = examResultData.details.find(d => d.number === q.number);
            if (detail) {
                item.classList.toggle("result-correct", detail.is_correct);
                item.classList.toggle("result-incorrect", !detail.is_correct);
            }
        }
    });

    answeredStat.innerText = answeredCount;
}

function renderQuestion() {
    if (!currentExam || !currentExam.questions.length) return;

    const q = currentExam.questions[currentIndex];
    const displayNum = isSimulationMode ? (currentIndex + 1) : q.number;
    
    qCounter.innerText = t("qCounterText", {
        cur: displayNum,
        idx: currentIndex + 1,
        total: currentExam.total_questions
    });

    const expectedCount = q.correct_answers ? q.correct_answers.length : 1;
    if (expectedCount > 1) {
        qType.innerText = t("qMultipleChoice", { n: expectedCount });
    } else {
        qType.innerText = t("qSingleChoice");
    }

    qText.innerText = q.question_text;

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

            if (!isSimulationMode) {
                const delBtn = document.createElement("button");
                delBtn.innerText = "✕";
                delBtn.style.position = "absolute";
                delBtn.style.top = "10px";
                delBtn.style.right = "10px";
                delBtn.style.background = "#f38ba8";
                delBtn.style.color = "#11111b";
                delBtn.style.border = "none";
                delBtn.style.borderRadius = "50%";
                delBtn.style.width = "22px";
                delBtn.style.height = "22px";
                delBtn.style.cursor = "pointer";
                delBtn.style.fontWeight = "bold";
                delBtn.onclick = async (e) => {
                    e.stopPropagation();
                    q.images.splice(imgIdx, 1);
                    renderQuestion();
                    if (window.go && window.go.main && window.go.main.App) {
                        await window.go.main.App.SaveUpdatedExam(currentExam);
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

    const isMarked = markedQuestions.has(q.number);
    btnMarkReview.classList.toggle("active", isMarked);
    btnMarkReview.innerText = isMarked ? t("btnMarkReviewOn") : t("btnMarkReviewOff");

    optionsContainer.innerHTML = "";
    expBox.style.display = "none";
    expBox.innerHTML = "";

    const selectedKeys = userAnswers[q.number] || [];
    const isMultiple = expectedCount > 1 || q.type === "multiple_choice";
    const inputType = isMultiple ? "checkbox" : "radio";
    const optionsList = q.options || [];

    const isAnsweredInPractice = isPracticeMode && selectedKeys.length > 0;

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
        input.disabled = isExamFinished;

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

    btnPrev.disabled = currentIndex === 0;
    btnNext.disabled = currentIndex === currentExam.questions.length - 1;

    if (isExamFinished || (isPracticeMode && selectedKeys.length > 0)) {
        showExplanationBox();
    }

    updateGridStyles();
}

function selectOption(key, isMultiple, expectedCount) {
    if (isExamFinished || !currentExam) return;
    const q = currentExam.questions[currentIndex];

    if (!isMultiple) {
        userAnswers[q.number] = [key];
    } else {
        if (!userAnswers[q.number]) userAnswers[q.number] = [];

        const idx = userAnswers[q.number].indexOf(key);
        if (idx > -1) {
            userAnswers[q.number].splice(idx, 1);
        } else {
            if (expectedCount > 1 && userAnswers[q.number].length >= expectedCount) {
                alert(t("maxOptionsAlert", { n: expectedCount }));
                renderQuestion();
                return;
            }
            userAnswers[q.number].push(key);
        }
    }
    saveActiveSession();
    renderQuestion();
}

function showExplanationBox() {
    if (!currentExam) return;
    const q = currentExam.questions[currentIndex];
    const answersText = q.correct_answers && q.correct_answers.length > 0 
        ? q.correct_answers.join(", ") 
        : "N/A";

    const userAns = userAnswers[q.number] ? userAnswers[q.number].join(", ") : t("noUserAns");
    const isCorrect = userAnswers[q.number] && 
        userAnswers[q.number].slice().sort().join() === (q.correct_answers || []).slice().sort().join();

    const statusBadge = isCorrect 
        ? `<span style="color: #a6e3a1; font-weight: bold;">${t("ansCorrect")}</span>` 
        : `<span style="color: #f38ba8; font-weight: bold;">${t("ansWrong", { ans: userAns })}</span>`;

    expBox.innerHTML = `
        <div style="margin-bottom: 8px;">${statusBadge}</div>
        <strong>${t("labelCorrectAnswer")}</strong> <span style="color: #a6e3a1; font-size: 1.1rem; font-weight: bold;">${answersText}</span><br><br>
        <strong>${t("labelExplanation")}</strong><br>${q.explanation || t("noExplanation")}
    `;
    expBox.style.display = "block";
}

// Горячие клавиши
window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" && e.target.type === "text") return;
    if (!currentExam || !currentExam.questions.length) return;

    const q = currentExam.questions[currentIndex];
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
        if (currentIndex > 0) {
            currentIndex--;
            renderQuestion();
            saveActiveSession();
        }
        return;
    }

    if (e.code === "ArrowRight") {
        if (currentIndex < currentExam.questions.length - 1) {
            currentIndex++;
            renderQuestion();
            saveActiveSession();
        }
        return;
    }

    if (e.code === "KeyF") {
        toggleReviewFlag();
        return;
    }

    if (e.code === "Space" && !isSimulationMode) {
        e.preventDefault();
        showExplanationBox();
        return;
    }
});

function toggleReviewFlag() {
    if (!currentExam || isExamFinished) return;
    const q = currentExam.questions[currentIndex];

    if (markedQuestions.has(q.number)) {
        markedQuestions.delete(q.number);
    } else {
        markedQuestions.add(q.number);
    }
    saveActiveSession();
    renderQuestion();
}

btnMarkReview.addEventListener("click", toggleReviewFlag);

btnPrev.addEventListener("click", () => {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
        saveActiveSession();
    }
});

btnNext.addEventListener("click", () => {
    if (currentIndex < currentExam.questions.length - 1) {
        currentIndex++;
        renderQuestion();
        saveActiveSession();
    }
});

btnShowAns.addEventListener("click", showExplanationBox);

btnSubmit.addEventListener("click", async () => {
    if (isExamFinished) return;

    const total = currentExam ? currentExam.total_questions : 0;
    const answered = Object.keys(userAnswers).filter(k => userAnswers[k].length > 0).length;
    const marked = markedQuestions.size;

    const confirmMsg = t("confirmFinish", {
        answered: answered,
        total: total,
        marked: marked
    });

    if (!confirm(confirmMsg)) return;

    await submitAndShowReport();
});

async function submitAndShowReport() {
    isExamFinished = true;
    if (timerInterval) clearInterval(timerInterval);
    clearActiveSession();

    let res = null;

    if (window.go && window.go.main && window.go.main.App) {
        try {
            res = await window.go.main.App.SubmitExam({ answers: userAnswers });
        } catch (err) {
            console.error("Wails submit error, fallback to local:", err);
        }
    }

    if (!res) {
        let correctCount = 0;
        const details = currentExam.questions.map(q => {
            const userAns = (userAnswers[q.number] || []).slice().sort().join();
            const correctAns = (q.correct_answers || []).slice().sort().join();
            const isCorrect = userAns.length > 0 && userAns === correctAns;
            if (isCorrect) correctCount++;
            return {
                number: q.number,
                is_correct: isCorrect
            };
        });

        const totalQ = currentExam.total_questions || currentExam.questions.length;
        const scorePct = totalQ > 0 ? (correctCount / totalQ) * 100 : 0;
        const passingScore = currentExam.passing_score_percentage || 70.0;

        res = {
            total_questions: totalQ,
            correct_count: correctCount,
            score_percentage: scorePct,
            is_passed: scorePct >= passingScore,
            details: details
        };
    }

    examResultData = res;

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
    updateGridStyles();
    renderQuestion();
}

function saveHistoryEntry(entry) {
    try {
        let history = JSON.parse(localStorage.getItem(STORAGE_HISTORY_KEY) || "[]");
        history.unshift(entry);
        if (history.length > 30) history = history.slice(0, 30);
        localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
        console.error("History save error:", e);
    }
}

btnHistory.addEventListener("click", () => {
    renderHistoryModal();
    historyModal.style.display = "flex";
});

btnCloseHistory.addEventListener("click", () => {
    historyModal.style.display = "none";
});

btnClearHistory.addEventListener("click", () => {
    if (confirm(t("confirmClearHistory"))) {
        localStorage.removeItem(STORAGE_HISTORY_KEY);
        renderHistoryModal();
    }
});

function renderHistoryModal() {
    const history = JSON.parse(localStorage.getItem(STORAGE_HISTORY_KEY) || "[]");
    if (history.length === 0) {
        historyTableContainer.innerHTML = `<p style="color: #a6adc8; margin: 20px 0;">${t("historyEmpty")}</p>`;
        return;
    }

    let html = `
        <table class="history-table">
            <thead>
                <tr>
                    <th>${t("colDateTime")}</th>
                    <th>${t("colMode")}</th>
                    <th>${t("colResult")}</th>
                    <th>${t("colScore")}</th>
                    <th>${t("colCorrect")}</th>
                </tr>
            </thead>
            <tbody>
    `;

    history.forEach(item => {
        const badgeClass = item.isPassed ? "badge-pass" : "badge-fail";
        const badgeText = item.isPassed ? "PASS" : "FAIL";
        html += `
            <tr>
                <td>${item.date}</td>
                <td>${item.title}</td>
                <td class="${badgeClass}">${badgeText}</td>
                <td><b>${item.scorePct}%</b></td>
                <td>${item.correct} / ${item.total}</td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    historyTableContainer.innerHTML = html;
}

modalBtnClose.addEventListener("click", () => {
    resultModal.style.display = "none";
});

modalBtnReviewErrors.addEventListener("click", () => {
    resultModal.style.display = "none";
    if (!examResultData || !examResultData.details) return;

    const firstFailIndex = currentExam.questions.findIndex(q => {
        const d = examResultData.details.find(x => x.number === q.number);
        return d && !d.is_correct;
    });

    if (firstFailIndex !== -1) {
        currentIndex = firstFailIndex;
        renderQuestion();
    }
});

if (btnAddImage) {
    btnAddImage.addEventListener("click", () => {
        if (!currentExam) return;
        const q = currentExam.questions[currentIndex];

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
                    await window.go.main.App.SaveUpdatedExam(currentExam);
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
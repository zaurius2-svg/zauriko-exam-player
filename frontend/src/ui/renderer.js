import { state } from "../state.js";
import { t } from "../i18n.js";

export function buildQuestionGrid({
    gridElement,
    sidebarElement,
    onQuestionSelect
}) {
    gridElement.innerHTML = "";
    if (!state.currentExam) return;

    const query = (state.searchQuery || "").toLowerCase().trim();
    const filter = state.activeFilter || "all";

    state.currentExam.questions.forEach((q, idx) => {
        const isAnswered = state.userAnswers[q.number] && state.userAnswers[q.number].length > 0;
        const isMarked = state.markedQuestions.has(q.number);
        const hasImages = q.images && q.images.length > 0;
        const hasNotes = state.userNotes && !!state.userNotes[q.number];

        // Фильтрация по критериям
        if (filter === "unanswered" && isAnswered) return;
        if (filter === "marked" && !isMarked) return;
        if (filter === "images" && !hasImages) return;
        if (filter === "notes" && !hasNotes) return;

        // Поиск по тексту вопроса и вариантам
        if (query) {
            const matchNumber = String(q.number).includes(query);
            const matchText = (q.question_text || "").toLowerCase().includes(query);
            const matchOptions = (q.options || []).some(opt => (opt.text || "").toLowerCase().includes(query));
            const matchNotes = (state.userNotes && state.userNotes[q.number] || "").toLowerCase().includes(query);

            if (!matchNumber && !matchText && !matchOptions && !matchNotes) {
                return;
            }
        }

        const item = document.createElement("button");
        item.className = "grid-item";
        item.id = `grid-btn-${idx}`;
        item.innerText = state.isSimulationMode ? (idx + 1) : q.number;

        if (hasNotes) {
            item.title = `Заметка: ${state.userNotes[q.number]}`;
        }

        item.onclick = () => {
            state.currentIndex = idx;
            if (typeof onQuestionSelect === "function") {
                onQuestionSelect(idx);
            }
            if (window.innerWidth <= 768 && sidebarElement) {
                sidebarElement.style.display = "none";
            }
        };

        gridElement.appendChild(item);
    });

    updateGridStyles({});
}

export function updateGridStyles({ answeredStatElement }) {
    if (!state.currentExam) return;

    let answeredCount = 0;

    state.currentExam.questions.forEach((q, idx) => {
        const item = document.getElementById(`grid-btn-${idx}`);
        const isAnswered = state.userAnswers[q.number] && state.userAnswers[q.number].length > 0;
        if (isAnswered) answeredCount++;

        if (!item) return;

        const isMarked = state.markedQuestions.has(q.number);
        const hasNotes = state.userNotes && !!state.userNotes[q.number];

        item.classList.toggle("answered", isAnswered);
        item.classList.toggle("marked", isMarked);
        item.classList.toggle("has-note", hasNotes);
        item.classList.toggle("active", idx === state.currentIndex);

        if (state.examResultData && state.examResultData.details) {
            const detail = state.examResultData.details.find(d => d.number === q.number);
            if (detail) {
                item.classList.toggle("result-correct", detail.is_correct);
                item.classList.toggle("result-incorrect", !detail.is_correct);
            }
        }
    });

    if (answeredStatElement) {
        answeredStatElement.innerText = answeredCount;
    }
}

export function showExplanationBox(expBox) {
    if (!state.currentExam || !expBox) return;
    const q = state.currentExam.questions[state.currentIndex];
    const answersText = q.correct_answers && q.correct_answers.length > 0 
        ? q.correct_answers.join(", ") 
        : "N/A";

    const userAns = state.userAnswers[q.number] ? state.userAnswers[q.number].join(", ") : t("noUserAns");
    const isCorrect = state.userAnswers[q.number] && 
        state.userAnswers[q.number].slice().sort().join() === (q.correct_answers || []).slice().sort().join();

    const statusBadge = isCorrect 
        ? `<span style="color: #10b981; font-weight: bold;">${t("ansCorrect")}</span>` 
        : `<span style="color: #f43f5e; font-weight: bold;">${t("ansWrong", { ans: userAns })}</span>`;

    expBox.innerHTML = `
        <div style="margin-bottom: 8px;">${statusBadge}</div>
        <strong>${t("labelCorrectAnswer")}</strong> <span style="color: #10b981; font-size: 1.15rem; font-weight: bold;">${answersText}</span><br><br>
        <strong>${t("labelExplanation")}</strong><br>${q.explanation || t("noExplanation")}
    `;
    expBox.style.display = "block";
}

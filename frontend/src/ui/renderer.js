import { state, saveActiveSession } from "../state.js";
import { t } from "../i18n.js";

export function buildQuestionGrid({
    gridElement,
    sidebarElement,
    onQuestionSelect
}) {
    gridElement.innerHTML = "";
    if (!state.currentExam) return;

    state.currentExam.questions.forEach((q, idx) => {
        const item = document.createElement("button");
        item.className = "grid-item";
        item.id = `grid-btn-${idx}`;
        item.innerText = state.isSimulationMode ? (idx + 1) : q.number;

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
}

export function updateGridStyles({ answeredStatElement }) {
    if (!state.currentExam) return;

    let answeredCount = 0;

    state.currentExam.questions.forEach((q, idx) => {
        const item = document.getElementById(`grid-btn-${idx}`);
        if (!item) return;

        const isAnswered = state.userAnswers[q.number] && state.userAnswers[q.number].length > 0;
        if (isAnswered) answeredCount++;

        const isMarked = state.markedQuestions.has(q.number);

        item.classList.toggle("answered", isAnswered);
        item.classList.toggle("marked", isMarked);
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
        ? `<span style="color: #a6e3a1; font-weight: bold;">${t("ansCorrect")}</span>` 
        : `<span style="color: #f38ba8; font-weight: bold;">${t("ansWrong", { ans: userAns })}</span>`;

    expBox.innerHTML = `
        <div style="margin-bottom: 8px;">${statusBadge}</div>
        <strong>${t("labelCorrectAnswer")}</strong> <span style="color: #a6e3a1; font-size: 1.1rem; font-weight: bold;">${answersText}</span><br><br>
        <strong>${t("labelExplanation")}</strong><br>${q.explanation || t("noExplanation")}
    `;
    expBox.style.display = "block";
}

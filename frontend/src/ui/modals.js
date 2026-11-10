import { state, getHistoryLogs, clearHistoryLogs } from "../state.js";
import { t } from "../i18n.js";

export function renderHistoryTable(container) {
    const history = getHistoryLogs();
    if (history.length === 0) {
        container.innerHTML = `<p style="color: #a6adc8; margin: 20px 0;">${t("historyEmpty")}</p>`;
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
    container.innerHTML = html;
}

// Генерация красивого отчета для печати или сохранения в PDF/HTML
export function generateExamReportHTML({ examTitle, resultData, questions, userAnswers }) {
    if (!resultData) return "";

    const statusText = resultData.is_passed ? "PASSED" : "FAILED";
    const statusColor = resultData.is_passed ? "#10b981" : "#f43f5e";

    let errorsHtml = "";
    const failedQuestions = questions.filter(q => {
        const d = resultData.details.find(x => x.number === q.number);
        return d && !d.is_correct;
    });

    failedQuestions.forEach((q, idx) => {
        const userAns = (userAnswers[q.number] || []).join(", ") || "Нет ответа";
        const correctAns = (q.correct_answers || []).join(", ") || "N/A";
        
        let optsHtml = "";
        (q.options || []).forEach(opt => {
            const isUser = (userAnswers[q.number] || []).includes(opt.key);
            const isCorrect = (q.correct_answers || []).includes(opt.key);
            let style = "padding: 6px 10px; margin: 4px 0; border-radius: 4px; border: 1px solid #ddd;";
            if (isCorrect) style += " background-color: #d1fae5; border-color: #10b981; font-weight: bold;";
            else if (isUser) style += " background-color: #fee2e2; border-color: #ef4444;";

            optsHtml += `<div style="${style}"><b>${opt.key}.</b> ${opt.text || ""}</div>`;
        });

        errorsHtml += `
            <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; page-break-inside: avoid;">
                <div style="font-size: 0.95rem; font-weight: bold; color: #1e293b; margin-bottom: 8px;">
                    #${idx + 1} (Вопрос ${q.number}):
                </div>
                <div style="white-space: pre-wrap; margin-bottom: 12px; color: #334155;">${q.question_text}</div>
                <div style="margin-bottom: 12px;">${optsHtml}</div>
                <div style="font-size: 0.88rem; color: #475569; background: #f8fafc; padding: 10px; border-left: 3px solid #6366f1; border-radius: 4px;">
                    <b>Правильный ответ:</b> <span style="color: #059669;">${correctAns}</span> &nbsp;|&nbsp; 
                    <b>Ваш ответ:</b> <span style="color: #dc2626;">${userAns}</span>
                    ${q.explanation ? `<div style="margin-top: 6px;"><b>Пояснение:</b> ${q.explanation}</div>` : ""}
                </div>
            </div>
        `;
    });

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Отчет по экзамену - ${examTitle}</title>
            <style>
                body { font-family: system-ui, -apple-system, sans-serif; padding: 30px; color: #0f172a; max-width: 900px; margin: auto; }
                .report-header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
                .status-badge { display: inline-block; padding: 8px 18px; border-radius: 20px; font-weight: bold; color: white; background-color: ${statusColor}; font-size: 1.2rem; }
                .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center; margin-top: 20px; }
                .stat-box { background: #f1f5f9; padding: 14px; border-radius: 8px; }
                .stat-val { font-size: 1.6rem; font-weight: bold; color: #1e293b; }
                .stat-lbl { font-size: 0.85rem; color: #64748b; }
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="no-print" style="margin-bottom: 20px; text-align: right;">
                <button onclick="window.print()" style="padding: 10px 20px; font-size: 1rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer;">🖨️ Печать / Сохранить в PDF</button>
            </div>
            <div class="report-header">
                <h2>${examTitle}</h2>
                <div style="margin: 14px 0;"><span class="status-badge">${statusText} (${resultData.score_percentage.toFixed(0)}%)</span></div>
                <div class="stats-grid">
                    <div class="stat-box"><div class="stat-val">${resultData.correct_count} / ${resultData.total_questions}</div><div class="stat-lbl">Верных ответов</div></div>
                    <div class="stat-box"><div class="stat-val">${resultData.score_percentage.toFixed(0)}%</div><div class="stat-lbl">Итоговый балл</div></div>
                    <div class="stat-box"><div class="stat-val">${failedQuestions.length}</div><div class="stat-lbl">Ошибок</div></div>
                </div>
            </div>
            <h3>Детальный разбор вопросов с ошибками:</h3>
            ${errorsHtml || "<p style='color: #10b981; font-weight: bold;'>Поздравляем! Ошибок нет, все ответы верны!</p>"}
        </body>
        </html>
    `;
}

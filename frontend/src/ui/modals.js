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

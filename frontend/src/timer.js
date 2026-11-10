import { state, saveActiveSession } from "./state.js";

let timerDisplayEl = null;
let timerWrapperEl = null;
let onTimeExpiredCallback = null;

export function initTimer(timerDisplay, timerWrapper, onTimeExpired) {
    timerDisplayEl = timerDisplay;
    timerWrapperEl = timerWrapper;
    onTimeExpiredCallback = onTimeExpired;
}

export function startTimer(seconds, getDisplayTitle) {
    stopTimer();

    state.remainingSeconds = seconds;
    if (timerWrapperEl) {
        timerWrapperEl.style.display = "flex";
        timerWrapperEl.classList.remove("warning", "critical");
    }

    updateTimerDisplay();

    state.timerInterval = setInterval(() => {
        if (state.remainingSeconds <= 0) {
            stopTimer();
            if (typeof onTimeExpiredCallback === "function") {
                onTimeExpiredCallback();
            }
            return;
        }

        state.remainingSeconds--;
        updateTimerDisplay();

        if (timerWrapperEl) {
            if (state.remainingSeconds <= 300) {
                timerWrapperEl.classList.add("critical");
                timerWrapperEl.classList.remove("warning");
            } else if (state.remainingSeconds <= 600) {
                timerWrapperEl.classList.add("warning");
                timerWrapperEl.classList.remove("critical");
            } else {
                timerWrapperEl.classList.remove("warning", "critical");
            }
        }

        if (state.remainingSeconds % 10 === 0) {
            saveActiveSession(typeof getDisplayTitle === "function" ? getDisplayTitle() : "");
        }
    }, 1000);
}

export function stopTimer() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
}

export function updateTimerDisplay() {
    if (!timerDisplayEl) return;
    const hours = Math.floor(state.remainingSeconds / 3600);
    const minutes = Math.floor((state.remainingSeconds % 3600) / 60);
    const seconds = state.remainingSeconds % 60;
    const pad = (n) => String(n).padStart(2, "0");
    timerDisplayEl.innerText = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

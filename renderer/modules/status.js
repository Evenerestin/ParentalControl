import { DAY_NAMES } from "./constants.js";
import { markToday } from "./days-table.js";
import { el } from "./dom.js";
import { setMessage } from "./feedback.js";
import { formatDuration, parseNumber } from "./format.js";
import { state } from "./state.js";
import { userPicker } from "./user-picker.js";

let usageRequest = 0;

function renderDayOff(name) {
	el.statusText.textContent = `Dzisiaj (${name}) komputer jest niedostępny.`;
	el.progressFill.style.width = "100%";
	el.progressFill.classList.add("danger");
}

export function renderStatus() {
	const today = new Date().getDay();
	const name = DAY_NAMES[today];
	const entry = state.rows[today];
	if (!entry) return;

	if (!entry.enabled.checked) {
		renderDayOff(name);
		return;
	}

	const hours = parseNumber(entry.limit);
	const limitMin =
		Number.isFinite(hours) && hours > 0 ? Math.round(hours * 60) : 0;
	const used = Math.max(0, state.used);
	const remaining = Math.max(0, limitMin - used);
	el.statusText.textContent = `Dzisiaj (${name}): wykorzystano ${formatDuration(used)}, pozostało ${formatDuration(remaining)}.`;

	const ratio = limitMin > 0 ? Math.min(1, used / limitMin) : 1;
	el.progressFill.style.width = `${(ratio * 100).toFixed(1)}%`;
	el.progressFill.classList.toggle("danger", ratio >= 0.9);
}

export async function refreshUsage() {
	const user = userPicker.value;
	if (!user) return;
	const requestId = ++usageRequest;
	markToday();
	try {
		const res = await window.panel.usage(user);
		if (requestId !== usageRequest) return;
		if (res.ok) {
			state.used = res.used;
		} else {
			setMessage(res.message, "error");
		}
	} catch {
		setMessage("Nie udało się odczytać licznika.", "error");
	}
	renderStatus();
}

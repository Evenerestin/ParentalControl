import { DAY_NAMES, ROW_ORDER } from "./constants.js";
import { el } from "./dom.js";
import { hoursToText } from "./format.js";
import { state } from "./state.js";

function createNumberInput(className, min, max, step, label) {
	const input = document.createElement("input");
	input.type = "number";
	input.className = className;
	input.min = String(min);
	input.max = String(max);
	input.step = String(step);
	input.setAttribute("aria-label", label);
	return input;
}

function applyEnabled(entry) {
	const on = entry.enabled.checked;
	entry.row.classList.toggle("off", !on);
	entry.from.disabled = !on;
	entry.to.disabled = !on;
	entry.limit.disabled = !on;
}

function createRow(dayIndex, onEdit) {
	const name = DAY_NAMES[dayIndex];
	const row = document.createElement("div");
	row.className = "grid day-row";

	const nameEl = document.createElement("span");
	nameEl.className = "day-name";
	nameEl.textContent = name;

	const enabled = document.createElement("input");
	enabled.type = "checkbox";
	enabled.setAttribute("aria-label", `Dostęp: ${name}`);

	const from = createNumberInput("hour-input", 0, 23, 1, `Od godziny: ${name}`);
	const to = createNumberInput("hour-input", 1, 23, 1, `Do godziny: ${name}`);
	const limit = createNumberInput(
		"limit-input",
		0.5,
		24,
		0.5,
		`Limit w godzinach: ${name}`,
	);

	row.append(nameEl, enabled, from, to, limit);
	const entry = { row, nameEl, enabled, from, to, limit };

	enabled.addEventListener("change", () => {
		applyEnabled(entry);
		onEdit();
	});
	for (const input of [from, to, limit]) {
		input.addEventListener("input", () => {
			input.classList.remove("invalid");
			onEdit();
		});
	}
	return entry;
}

export function buildRows(onEdit) {
	el.days.replaceChildren();
	state.rows = [];
	for (const dayIndex of ROW_ORDER) {
		const entry = createRow(dayIndex, onEdit);
		el.days.appendChild(entry.row);
		state.rows[dayIndex] = entry;
	}
	markToday();
}

export function markToday() {
	const today = new Date().getDay();
	state.rows.forEach((entry, i) => {
		const isToday = i === today;
		entry.nameEl.classList.toggle("today", isToday);
		entry.nameEl.textContent = isToday
			? `${DAY_NAMES[i]} (dziś)`
			: DAY_NAMES[i];
	});
}

export function fillRows(config) {
	config.Dni.forEach((day, i) => {
		const entry = state.rows[i];
		entry.enabled.checked = !!day.Wlaczony;
		entry.from.value = String(day.Od);
		entry.to.value = String(day.Do);
		entry.limit.value = hoursToText(day.LimitMin);
		applyEnabled(entry);
	});
}

export function clearInvalidMarks() {
	for (const entry of state.rows) {
		for (const input of [entry.from, entry.to, entry.limit]) {
			input.classList.remove("invalid");
		}
	}
}

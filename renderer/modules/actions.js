import { clearInvalidMarks } from "./days-table.js";
import { el } from "./dom.js";
import { setMessage, showNotAdmin } from "./feedback.js";
import { readForm } from "./form.js";
import { showConfirm } from "./modal.js";
import { state } from "./state.js";
import { renderStatus } from "./status.js";
import { userPicker } from "./user-picker.js";

export function onEdit() {
	if (!state.loaded) return;
	state.dirty = true;
	setMessage("Niezapisane zmiany");
	renderStatus();
}

function showFormError(form) {
	setMessage(form.error, "error");
	if (!form.input) return;
	form.input.classList.add("invalid");
	if (!form.input.disabled) form.input.focus();
}

function handleSaveResult(res, form) {
	if (res.ok) {
		state.dirty = false;
		state.savedDays = form.config.Dni;
		setMessage(res.message, "success");
	} else if (res.notAdmin) {
		showNotAdmin();
		setMessage("");
	} else {
		setMessage(res.message, "error");
	}
}

export async function save() {
	if (!state.canSave) return;
	clearInvalidMarks();
	const form = readForm(userPicker.value);
	if (form.error) {
		showFormError(form);
		return;
	}

	el.saveBtn.disabled = true;
	setMessage("Zapisywanie…");
	try {
		handleSaveResult(await window.panel.save(form.config), form);
	} catch {
		setMessage("Nie udało się zapisać ustawień.", "error");
	} finally {
		el.saveBtn.disabled = !state.canSave;
	}
}

export async function closeWindow() {
	if (state.dirty) {
		const leave = await showConfirm({
			title: "Niezapisane zmiany",
			text: "Wprowadzone zmiany nie zostały zapisane. Czy chcesz zamknąć okno bez zapisywania?",
			confirmLabel: "Zamknij bez zapisywania",
			cancelLabel: "Anuluj",
		});
		if (!leave) return;
	}
	state.closing = true;
	window.close();
}

import { closeWindow, onEdit, save } from "./modules/actions.js";
import {
	NOT_ADMIN_TEXT,
	PREVIEW_TEXT,
	REFRESH_MS,
} from "./modules/constants.js";
import { buildRows, fillRows } from "./modules/days-table.js";
import { el } from "./modules/dom.js";
import { renderBanner, setMessage } from "./modules/feedback.js";
import { initModal } from "./modules/modal.js";
import { state } from "./modules/state.js";
import { refreshUsage, renderStatus } from "./modules/status.js";
import { userPicker } from "./modules/user-picker.js";
import { fillUsers } from "./modules/users.js";

async function loadPanel() {
	try {
		return await window.panel.load();
	} catch {
		return { ok: false, message: "Nie udało się wczytać ustawień." };
	}
}

function showLoadError(message) {
	setMessage(message, "error");
	el.statusText.textContent = "Brak danych.";
	el.saveBtn.disabled = true;
	el.refreshBtn.disabled = true;
}

function showBanners(res) {
	if (!res.isWin) {
		state.banner.push(PREVIEW_TEXT);
	} else if (!res.isAdmin) {
		state.banner.push(NOT_ADMIN_TEXT);
	}
	if (res.setupError) state.banner.push(res.setupError);
	renderBanner();
}

function applyLoadedData(res) {
	const users = Array.isArray(res.users) ? res.users : [];
	const admins = Array.isArray(res.admins) ? res.admins : [];
	const userNote = fillUsers(users, admins, res.config.User);
	fillRows(res.config);
	state.savedDays = res.config.Dni;
	state.loaded = true;

	state.canSave = (!res.isWin || res.isAdmin) && userPicker.items.length > 0;
	el.saveBtn.disabled = !state.canSave;
	if (userNote) setMessage(userNote.text, userNote.kind);
}

function bindEvents() {
	userPicker.onChange = () => {
		state.used = 0;
		onEdit();
		refreshUsage();
	};
	el.saveBtn.addEventListener("click", save);
	el.refreshBtn.addEventListener("click", refreshUsage);
}

async function init() {
	userPicker.init();
	initModal();
	buildRows(onEdit);

	const res = await loadPanel();
	if (!res.ok) {
		showLoadError(res.message);
		return;
	}

	showBanners(res);
	applyLoadedData(res);
	bindEvents();

	renderStatus();
	await refreshUsage();
	setInterval(refreshUsage, REFRESH_MS);
}

el.closeBtn.addEventListener("click", closeWindow);

window.addEventListener("beforeunload", (e) => {
	if (state.dirty && !state.closing) {
		e.preventDefault();
		e.returnValue = "";
		setTimeout(closeWindow, 0);
	}
});

init();

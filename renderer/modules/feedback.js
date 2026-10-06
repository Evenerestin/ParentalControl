import { NOT_ADMIN_TEXT } from "./constants.js";
import { el } from "./dom.js";
import { state } from "./state.js";

export function setMessage(text, kind) {
	el.message.textContent = text || "";
	el.message.className = kind ? `message ${kind}` : "message";
}

export function renderBanner() {
	el.banner.replaceChildren();
	for (const line of state.banner) {
		const p = document.createElement("p");
		p.textContent = line;
		el.banner.appendChild(p);
	}
	el.banner.hidden = state.banner.length === 0;
}

export function addBannerLine(text) {
	if (!state.banner.includes(text)) state.banner.push(text);
	renderBanner();
}

export function showNotAdmin() {
	addBannerLine(NOT_ADMIN_TEXT);
	state.canSave = false;
}

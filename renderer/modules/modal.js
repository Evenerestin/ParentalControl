import { el } from "./dom.js";

const modal = {
	root: document.getElementById("modal"),
	title: document.getElementById("modal-title"),
	text: document.getElementById("modal-text"),
	confirmBtn: document.getElementById("modal-confirm"),
	cancelBtn: document.getElementById("modal-cancel"),
	resolve: null,
	returnFocus: null,
};

export function showConfirm({ title, text, confirmLabel, cancelLabel }) {
	if (modal.resolve) return Promise.resolve(false);
	modal.title.textContent = title;
	modal.text.textContent = text;
	modal.confirmBtn.textContent = confirmLabel;
	modal.cancelBtn.textContent = cancelLabel;
	modal.returnFocus = document.activeElement;
	el.app.inert = true;
	modal.root.hidden = false;
	modal.cancelBtn.focus();
	return new Promise((resolve) => {
		modal.resolve = resolve;
	});
}

function closeConfirm(result) {
	if (!modal.resolve) return;
	const resolve = modal.resolve;
	modal.resolve = null;
	modal.root.hidden = true;
	el.app.inert = false;
	modal.returnFocus?.focus?.();
	resolve(result);
}

function onModalKeydown(e) {
	if (e.key === "Escape") {
		e.preventDefault();
		closeConfirm(false);
	} else if (e.key === "Tab") {
		e.preventDefault();
		const next =
			document.activeElement === modal.confirmBtn
				? modal.cancelBtn
				: modal.confirmBtn;
		next.focus();
	}
}

export function initModal() {
	modal.confirmBtn.addEventListener("click", () => closeConfirm(true));
	modal.cancelBtn.addEventListener("click", () => closeConfirm(false));
	modal.root.addEventListener("keydown", onModalKeydown);
}

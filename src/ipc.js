const { ipcMain } = require("electron");
const { PanelError } = require("./errors");
const { loadPanel, savePanel, getUsage } = require("./panel");

function isTrustedSender(event) {
	const frame = event.senderFrame;
	return (
		!!frame && typeof frame.url === "string" && frame.url.startsWith("file:")
	);
}

function handle(channel, fn) {
	ipcMain.handle(channel, async (event, ...args) => {
		if (!isTrustedSender(event))
			return { ok: false, message: "Odrzucono żądanie z nieznanego źródła." };
		try {
			return await fn(...args);
		} catch (err) {
			if (err instanceof PanelError) return { ok: false, message: err.message };
			const msg = err?.message || String(err);
			return { ok: false, message: `Wystąpił nieoczekiwany błąd: ${msg}` };
		}
	});
}

function registerIpcHandlers() {
	handle("panel:load", loadPanel);
	handle("panel:save", savePanel);
	handle("panel:usage", getUsage);
}

module.exports = { registerIpcHandlers };

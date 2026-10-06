const { app, BrowserWindow } = require("electron");
const path = require("node:path");
const { WINDOW_TITLE } = require("./constants");

const ROOT = path.join(__dirname, "..");

let mainWindow = null;

function lockDownNavigation(wc) {
	wc.on("will-navigate", (e) => e.preventDefault());
	wc.on("will-redirect", (e) => e.preventDefault());
	wc.on("will-attach-webview", (e) => e.preventDefault());
	wc.setWindowOpenHandler(() => ({ action: "deny" }));
}

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 640,
		height: 740,
		useContentSize: true,
		resizable: false,
		maximizable: false,
		fullscreenable: false,
		title: WINDOW_TITLE,
		...(app.isPackaged ? {} : { icon: path.join(ROOT, "build", "icon.ico") }),
		backgroundColor: "#F3F3F3",
		show: false,
		webPreferences: {
			preload: path.join(ROOT, "preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true,
			webviewTag: false,
			spellcheck: false,
			devTools: !app.isPackaged,
		},
	});

	mainWindow.removeMenu();
	mainWindow.once("ready-to-show", () => mainWindow.show());
	mainWindow.on("page-title-updated", (e) => e.preventDefault());
	lockDownNavigation(mainWindow.webContents);

	mainWindow.on("closed", () => {
		mainWindow = null;
	});
	mainWindow.loadFile(path.join(ROOT, "renderer", "index.html"));
}

function focusWindow() {
	if (!mainWindow) return;
	if (mainWindow.isMinimized()) mainWindow.restore();
	mainWindow.show();
	mainWindow.focus();
}

module.exports = { createWindow, focusWindow };

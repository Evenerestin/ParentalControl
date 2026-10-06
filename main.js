const { app, session } = require("electron");
const { registerIpcHandlers } = require("./src/ipc");
const { createWindow, focusWindow } = require("./src/window");

if (!app.requestSingleInstanceLock()) {
	app.quit();
} else {
	registerIpcHandlers();

	app.on("second-instance", focusWindow);

	app.whenReady().then(() => {
		session.defaultSession.setPermissionRequestHandler((_wc, _perm, callback) =>
			callback(false),
		);
		createWindow();
	});

	app.on("window-all-closed", () => app.quit());
}

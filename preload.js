const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("panel", {
	load: () => ipcRenderer.invoke("panel:load"),
	save: (config) => ipcRenderer.invoke("panel:save", config),
	usage: (user) => ipcRenderer.invoke("panel:usage", user),
});

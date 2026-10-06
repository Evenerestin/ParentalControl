const fs = require("node:fs");
const path = require("node:path");
const {
	DATA_DIR,
	SCRIPT_PATH,
	SCRIPT_TEMPLATE,
	TASK_NAME,
	SID_ADMINS,
	SID_SYSTEM,
	SID_USERS,
	BOM,
	BOM_PATTERN,
} = require("./constants");
const { PanelError } = require("./errors");
const { systemExe, run, outputText } = require("./system");
const { configExists } = require("./config");

function writeScript() {
	const template = fs
		.readFileSync(SCRIPT_TEMPLATE, "utf8")
		.replace(BOM_PATTERN, "");
	const crlf = template.replace(/\r?\n/g, "\r\n");
	fs.writeFileSync(SCRIPT_PATH, `${BOM}${crlf}`, "utf8");
}

async function ensureTask() {
	const schtasks = systemExe("schtasks.exe");
	const query = await run(schtasks, ["/query", "/tn", TASK_NAME]);
	if (query.code === 0) return; // Zadanie już istnieje – nie ruszamy go.

	const action = `powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File ${SCRIPT_PATH}`;
	const create = await run(schtasks, [
		"/create",
		"/tn",
		TASK_NAME,
		"/tr",
		action,
		"/sc",
		"minute",
		"/mo",
		"1",
		"/ru",
		"SYSTEM",
		"/rl",
		"HIGHEST",
		"/f",
	]);
	if (create.code !== 0) {
		throw new PanelError(
			`Nie udało się utworzyć zaplanowanego zadania: ${outputText(create)}`,
		);
	}
}

async function setFolderPermissions() {
	const icacls = systemExe("icacls.exe");
	const res = await run(icacls, [
		DATA_DIR,
		"/inheritance:r",
		"/grant",
		`*${SID_ADMINS}:(OI)(CI)F`,
		`*${SID_SYSTEM}:(OI)(CI)F`,
		`*${SID_USERS}:(OI)(CI)RX`,
		"/Q",
	]);
	if (res.code !== 0) {
		throw new PanelError(
			`Nie udało się ustawić uprawnień folderu: ${outputText(res)}`,
		);
	}
	await run(icacls, [path.join(DATA_DIR, "*"), "/reset", "/T", "/Q"]);
}

async function prepareDataDir() {
	fs.mkdirSync(DATA_DIR, { recursive: true });
	await setFolderPermissions();
}

async function ensureSetup() {
	await prepareDataDir();
	if (!fs.existsSync(SCRIPT_PATH) || configExists()) {
		writeScript();
	}
	await ensureTask();
}

module.exports = { writeScript, ensureTask, prepareDataDir, ensureSetup };

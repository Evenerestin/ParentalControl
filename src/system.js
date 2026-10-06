const { execFile } = require("node:child_process");
const path = require("node:path");

function systemExe(...parts) {
	const root = process.env.SystemRoot || "C:\\Windows";
	return path.join(root, "System32", ...parts);
}

function run(file, args) {
	return new Promise((resolve) => {
		execFile(
			file,
			args,
			{ windowsHide: true, timeout: 60000, maxBuffer: 8 * 1024 * 1024 },
			(error, stdout, stderr) => {
				let code = 0;
				if (error) code = typeof error.code === "number" ? error.code : -1;
				resolve({
					code,
					stdout: String(stdout || ""),
					stderr: String(stderr || ""),
					error,
				});
			},
		);
	});
}

function runPowerShell(script) {
	const full = `[Console]::OutputEncoding = [Text.Encoding]::UTF8\n$ErrorActionPreference = 'Stop'\n${script}`;
	const encoded = Buffer.from(full, "utf16le").toString("base64");
	return run(systemExe("WindowsPowerShell", "v1.0", "powershell.exe"), [
		"-NoProfile",
		"-NonInteractive",
		"-ExecutionPolicy",
		"Bypass",
		"-EncodedCommand",
		encoded,
	]);
}

function outputText(res) {
	return `${res.stdout}\n${res.stderr}`.replace(/\s+/g, " ").trim();
}

function toArray(value) {
	if (Array.isArray(value)) return value;
	if (value === null || value === undefined || value === "") return [];
	return [value];
}

module.exports = { systemExe, run, runPowerShell, outputText, toArray };

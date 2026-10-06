const fs = require("node:fs");
const path = require("node:path");
const { DATA_DIR, BOM_PATTERN } = require("./constants");

function localDateString(date = new Date()) {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

function counterPath(user) {
	return path.join(DATA_DIR, `${user}-${localDateString()}.txt`);
}

function readCounter(user) {
	try {
		const first = fs
			.readFileSync(counterPath(user), "utf8")
			.replace(BOM_PATTERN, "")
			.split(/\r?\n/)[0];
		const n = Number.parseInt(first.trim(), 10);
		return Number.isFinite(n) ? n : 0;
	} catch {
		return 0;
	}
}

module.exports = { readCounter };

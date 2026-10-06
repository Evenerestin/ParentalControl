const fs = require("node:fs");
const { CONFIG_PATH, BOM_PATTERN } = require("./constants");
const { validateConfig } = require("./validation");

function defaultConfig() {
	return {
		User: "",
		Dni: [
			{ Wlaczony: true, Od: 10, Do: 20, LimitMin: 360 },
			{ Wlaczony: true, Od: 16, Do: 20, LimitMin: 240 },
			{ Wlaczony: true, Od: 16, Do: 20, LimitMin: 240 },
			{ Wlaczony: true, Od: 16, Do: 20, LimitMin: 240 },
			{ Wlaczony: true, Od: 16, Do: 20, LimitMin: 240 },
			{ Wlaczony: true, Od: 16, Do: 22, LimitMin: 240 },
			{ Wlaczony: true, Od: 10, Do: 22, LimitMin: 360 },
		],
	};
}

function readConfig() {
	try {
		const raw = fs.readFileSync(CONFIG_PATH, "utf8").replace(BOM_PATTERN, "");
		const check = validateConfig(JSON.parse(raw), null);
		return check.ok ? check.config : defaultConfig();
	} catch {
		return defaultConfig();
	}
}

function writeConfig(cfg) {
	fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), "utf8");
}

function configExists() {
	return fs.existsSync(CONFIG_PATH);
}

module.exports = { defaultConfig, readConfig, writeConfig, configExists };

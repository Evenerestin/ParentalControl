const path = require("node:path");

const IS_WIN = process.platform === "win32";
const WINDOW_TITLE = "Parental Control";

// Nazwy systemowe – NIE zmieniać
const DATA_DIR = "C:\\ProgramData\\LimitCzasu";
const CONFIG_PATH = path.join(DATA_DIR, "config.json");
const SCRIPT_PATH = path.join(DATA_DIR, "limit.ps1");
const TASK_NAME = "LimitCzasu";
const SCRIPT_TEMPLATE = path.join(__dirname, "..", "resources", "limit.ps1");

const SID_ADMINS = "S-1-5-32-544";
const SID_SYSTEM = "S-1-5-18";
const SID_USERS = "S-1-5-32-545";

const PREVIEW_NOTE =
	" (tryb podglądu – poza Windows nic nie zostało zmienione)";
const PREVIEW_USERS = ["Dziecko"];

const DAY_NAMES = [
	"Niedziela",
	"Poniedziałek",
	"Wtorek",
	"Środa",
	"Czwartek",
	"Piątek",
	"Sobota",
];
const NET_DAY_CODES = ["Su", "M", "T", "W", "Th", "F", "Sa"];

const BOM = String.fromCharCode(0xfeff);
const BOM_PATTERN = new RegExp(`^${BOM}`);

const FORBIDDEN_NAME_CHARS = /[\\/:*?"<>|[\];=,+\p{Cc}]/u;

module.exports = {
	IS_WIN,
	WINDOW_TITLE,
	DATA_DIR,
	CONFIG_PATH,
	SCRIPT_PATH,
	TASK_NAME,
	SCRIPT_TEMPLATE,
	SID_ADMINS,
	SID_SYSTEM,
	SID_USERS,
	PREVIEW_NOTE,
	PREVIEW_USERS,
	DAY_NAMES,
	NET_DAY_CODES,
	FORBIDDEN_NAME_CHARS,
	BOM,
	BOM_PATTERN,
};

const { IS_WIN, PREVIEW_NOTE, PREVIEW_USERS } = require("./constants");
const { PanelError } = require("./errors");
const { outputText } = require("./system");
const {
	checkAdmin,
	listAccounts,
	sameName,
	isAdminAccount,
	findAccount,
} = require("./accounts");
const { checkUserName, validateConfig } = require("./validation");
const { defaultConfig, readConfig, writeConfig } = require("./config");
const { readCounter } = require("./counter");
const { setLogonHours, clearLogonHours } = require("./logon-hours");
const {
	writeScript,
	ensureTask,
	prepareDataDir,
	ensureSetup,
} = require("./setup");

const preview = { config: defaultConfig() };

function loadPreview() {
	return {
		ok: true,
		isWin: false,
		isAdmin: false,
		users: PREVIEW_USERS,
		admins: [],
		config: structuredClone(preview.config),
	};
}

async function trySetup() {
	try {
		await ensureSetup();
		return null;
	} catch (err) {
		return err instanceof PanelError
			? err.message
			: `Nie udało się przygotować folderu i zadania: ${err?.message || err}`;
	}
}

async function loadPanel() {
	if (!IS_WIN) return loadPreview();

	const [isAdmin, accounts] = await Promise.all([checkAdmin(), listAccounts()]);
	const setupError = isAdmin ? await trySetup() : null;
	return {
		ok: true,
		isWin: true,
		isAdmin,
		setupError,
		users: accounts.users,
		admins: accounts.admins,
		config: readConfig(),
	};
}

function savePreview(input) {
	const check = validateConfig(input, PREVIEW_USERS);
	if (!check.ok) return check;
	preview.config = check.config;
	return { ok: true, message: `Zapisano.${PREVIEW_NOTE}` };
}

function validateSaveInput(input, accounts) {
	const nameError = checkUserName(input?.User);
	if (nameError) return { ok: false, message: nameError };
	if (isAdminAccount(accounts, input.User)) {
		return {
			ok: false,
			message: `Konto „${input.User}” ma uprawnienia administratora i nie może być kontem dziecka.`,
		};
	}
	return validateConfig(input, accounts.users);
}

async function releasePreviousUser(accounts, previousUser, currentUser) {
	const previous = findAccount(accounts, previousUser);
	if (!previous || sameName(previous, currentUser)) return null;
	const reset = await clearLogonHours(previous);
	if (reset.code === 0) return null;
	return `Zapisano, ale nie udało się zdjąć ograniczeń z poprzedniego konta „${previous}”.`;
}

async function savePanel(input) {
	if (!IS_WIN) return savePreview(input);

	if (!(await checkAdmin())) {
		return {
			ok: false,
			notAdmin: true,
			message:
				"Panel musi być uruchomiony jako administrator, żeby zapisać ustawienia.",
		};
	}

	const accounts = await listAccounts();
	const check = validateSaveInput(input, accounts);
	if (!check.ok) return check;
	const cfg = check.config;
	const previousUser = readConfig().User;

	await prepareDataDir();
	writeConfig(cfg);
	writeScript();

	const net = await setLogonHours(cfg.User, cfg.Dni);
	if (net.code !== 0) {
		return {
			ok: false,
			message: `Nie udało się ustawić godzin logowania: ${outputText(net)}`,
		};
	}

	await ensureTask();

	const releaseWarning = await releasePreviousUser(
		accounts,
		previousUser,
		cfg.User,
	);
	return {
		ok: true,
		message: releaseWarning || "Zapisano. Nowe ustawienia działają od razu.",
	};
}

async function getUsage(user) {
	const nameError = checkUserName(user);
	if (nameError) return { ok: false, message: nameError };
	if (!IS_WIN) return { ok: true, used: 0 };
	return { ok: true, used: readCounter(user) };
}

module.exports = { loadPanel, savePanel, getUsage };

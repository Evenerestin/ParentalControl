import { DAY_NAMES, FORBIDDEN_NAME_CHARS, ROW_ORDER } from "./constants.js";
import { parseNumber } from "./format.js";
import { state } from "./state.js";

function readRow(entry) {
	const od = parseNumber(entry.from);
	const doH = parseNumber(entry.to);
	const hours = parseNumber(entry.limit);
	return { od, doH, hours, limitMin: Math.round(hours * 60) };
}

function isRowValid({ od, doH, hours, limitMin }) {
	return (
		Number.isInteger(od) &&
		od >= 0 &&
		od <= 23 &&
		Number.isInteger(doH) &&
		doH >= 1 &&
		doH <= 23 &&
		Number.isFinite(hours) &&
		limitMin >= 30 &&
		limitMin <= 1440
	);
}

function rowError(entry, name, { od, doH, hours, limitMin }) {
	if (!Number.isInteger(od) || od < 0 || od > 23) {
		return {
			error: `${name}: godzina „od” musi być liczbą całkowitą od 0 do 23.`,
			input: entry.from,
		};
	}
	if (!Number.isInteger(doH) || doH < 1 || doH > 23) {
		return {
			error: `${name}: godzina „do” musi być liczbą całkowitą od 1 do 23.`,
			input: entry.to,
		};
	}
	if (!Number.isFinite(hours) || limitMin < 30 || limitMin > 1440) {
		return {
			error: `${name}: limit musi wynosić od 0,5 do 24 godzin.`,
			input: entry.limit,
		};
	}
	if (entry.enabled.checked && od >= doH) {
		return {
			error: `${name}: godzina „od” musi być wcześniejsza niż „do”.`,
			input: entry.from,
		};
	}
	return null;
}

function checkUser(user) {
	if (!user) return "Nie wybrano konta dziecka.";
	if (user.length > 64 || FORBIDDEN_NAME_CHARS.test(user)) {
		return "Nazwa konta zawiera niedozwolone znaki.";
	}
	return null;
}

export function readForm(user) {
	const userError = checkUser(user);
	if (userError) return { error: userError };

	const days = [];
	for (const i of ROW_ORDER) {
		const entry = state.rows[i];
		const values = readRow(entry);

		if (!entry.enabled.checked && !isRowValid(values) && state.savedDays[i]) {
			days[i] = { ...state.savedDays[i], Wlaczony: false };
			continue;
		}

		const error = rowError(entry, DAY_NAMES[i], values);
		if (error) return error;

		days[i] = {
			Wlaczony: entry.enabled.checked,
			Od: values.od,
			Do: values.doH,
			LimitMin: values.limitMin,
		};
	}
	return { config: { User: user, Dni: days } };
}

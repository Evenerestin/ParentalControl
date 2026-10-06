const { DAY_NAMES, FORBIDDEN_NAME_CHARS } = require("./constants");

function checkUserName(name) {
	if (typeof name !== "string" || name.length === 0)
		return "Nie wybrano konta dziecka.";
	if (name.length > 64) return "Nazwa konta jest za długa.";
	if (
		FORBIDDEN_NAME_CHARS.test(name) ||
		name.trim() !== name ||
		name === "." ||
		name === ".."
	) {
		return "Nazwa konta zawiera niedozwolone znaki.";
	}
	return null;
}

function isIntInRange(v, min, max) {
	return Number.isInteger(v) && v >= min && v <= max;
}

function validateDay(d, name) {
	if (!d || typeof d !== "object") return `${name}: niepoprawne dane.`;
	if (typeof d.Wlaczony !== "boolean")
		return `${name}: niepoprawna wartość „dostęp”.`;
	if (!isIntInRange(d.Od, 0, 23))
		return `${name}: godzina „od” musi być liczbą całkowitą od 0 do 23.`;
	if (!isIntInRange(d.Do, 1, 23))
		return `${name}: godzina „do” musi być liczbą całkowitą od 1 do 23.`;
	if (!isIntInRange(d.LimitMin, 30, 1440))
		return `${name}: limit musi wynosić od 0,5 do 24 godzin.`;
	if (d.Wlaczony && d.Od >= d.Do)
		return `${name}: godzina „od” musi być wcześniejsza niż „do”.`;
	return null;
}

function validateConfig(cfg, users) {
	if (!cfg || typeof cfg !== "object")
		return { ok: false, message: "Niepoprawne dane ustawień." };

	const nameError = checkUserName(cfg.User);
	if (nameError) return { ok: false, message: nameError };

	let user = cfg.User;
	if (users) {
		const match = users.find((u) => u.toLowerCase() === user.toLowerCase());
		if (!match)
			return {
				ok: false,
				message: `Konto „${user}” nie istnieje na tym komputerze.`,
			};
		user = match;
	}

	if (!Array.isArray(cfg.Dni) || cfg.Dni.length !== 7) {
		return { ok: false, message: "Ustawienia muszą zawierać dokładnie 7 dni." };
	}

	const days = [];
	for (let i = 0; i < 7; i++) {
		const d = cfg.Dni[i];
		const dayError = validateDay(d, DAY_NAMES[i]);
		if (dayError) return { ok: false, message: dayError };
		days.push({
			Wlaczony: d.Wlaczony,
			Od: d.Od,
			Do: d.Do,
			LimitMin: d.LimitMin,
		});
	}

	return { ok: true, config: { User: user, Dni: days } };
}

module.exports = { checkUserName, validateConfig };

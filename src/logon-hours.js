const { NET_DAY_CODES } = require("./constants");
const { systemExe, run } = require("./system");

function buildTimesArg(days) {
	const order = [1, 2, 3, 4, 5, 6, 0];
	const entries = [];
	for (const i of order) {
		const day = days[i];
		if (!day.Wlaczony) continue;
		const from = String(day.Od).padStart(2, "0");
		const to = String(day.Do).padStart(2, "0");
		entries.push(`${NET_DAY_CODES[i]},${from}:00-${to}:00`);
	}
	return `/times:${entries.join(";")}`;
}

function setLogonHours(user, days) {
	return run(systemExe("net.exe"), ["user", user, buildTimesArg(days)]);
}

function clearLogonHours(user) {
	return run(systemExe("net.exe"), ["user", user, "/times:all"]);
}

module.exports = { setLogonHours, clearLogonHours };

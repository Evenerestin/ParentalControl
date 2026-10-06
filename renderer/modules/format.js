export function formatDuration(minutes) {
	const m = Math.max(0, Math.round(minutes));
	return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")} min`;
}

export function hoursToText(minutes) {
	return String(Math.round((minutes / 60) * 100) / 100);
}

export function parseNumber(input) {
	const text = input.value.trim().replace(",", ".");
	if (text === "") return Number.NaN;
	return Number(text);
}

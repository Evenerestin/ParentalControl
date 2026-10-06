import { userPicker } from "./user-picker.js";

const same = (a, b) => a.toLowerCase() === b.toLowerCase();

export function fillUsers(users, admins, selected) {
	const isAdmin = (name) => admins.some((a) => same(a, name));
	const list = users.filter((u) => !isAdmin(u));
	userPicker.setItems(list, selected);

	if (list.length === 0) {
		return {
			kind: "error",
			text: "Brak zwykłych kont na tym komputerze. Utwórz konto dziecka jako „Użytkownik standardowy”.",
		};
	}
	if (!selected) {
		return {
			kind: null,
			text: "Wybierz konto dziecka, ustaw godziny i kliknij „Zapisz i zastosuj”.",
		};
	}
	if (list.some((u) => same(u, selected))) return null;
	if (isAdmin(selected)) {
		return {
			kind: "error",
			text: `Konto „${selected}” jest administratorem i nie może być kontem dziecka. Wybierz inne.`,
		};
	}
	return {
		kind: "error",
		text: `Konta „${selected}” nie ma już na tym komputerze. Wybierz konto dziecka z listy.`,
	};
}

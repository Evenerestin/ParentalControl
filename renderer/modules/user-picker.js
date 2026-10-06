export const userPicker = {
	root: document.getElementById("user-picker"),
	button: document.getElementById("user-button"),
	text: document.getElementById("user-button-text"),
	list: document.getElementById("user-list"),
	label: document.getElementById("user-label"),
	items: [],
	value: "",
	active: -1,
	onChange: null,

	setItems(items, selected) {
		this.items = items.slice();
		const index = selected
			? this.items.findIndex((u) => u.toLowerCase() === selected.toLowerCase())
			: -1;
		this.value = this.items[index >= 0 ? index : 0] || "";
		this.list.replaceChildren();
		this.items.forEach((item, i) => {
			this.list.appendChild(this.createOption(item, i));
		});
		this.render();
	},

	createOption(item, i) {
		const li = document.createElement("li");
		li.id = `user-option-${i}`;
		li.className = "picker-option";
		li.setAttribute("role", "option");
		li.textContent = item;
		li.title = item;
		li.addEventListener("mousemove", () => this.setActive(i));
		li.addEventListener("click", () => {
			this.select(i);
			this.close(true);
		});
		return li;
	},

	render() {
		this.text.textContent = this.value || "Brak kont do wyboru";
		this.button.disabled = this.items.length === 0;
		Array.from(this.list.children).forEach((li, i) => {
			li.setAttribute("aria-selected", String(this.items[i] === this.value));
		});
	},

	setActive(i) {
		if (i < 0 || i >= this.items.length) return;
		this.active = i;
		Array.from(this.list.children).forEach((li, j) => {
			li.classList.toggle("active", j === i);
		});
		const li = this.list.children[i];
		this.list.setAttribute("aria-activedescendant", li.id);
		li.scrollIntoView({ block: "nearest" });
	},

	select(i) {
		const item = this.items[i];
		if (item === undefined || item === this.value) return;
		this.value = item;
		this.render();
		if (this.onChange) this.onChange(item);
	},

	get isOpen() {
		return !this.list.hidden;
	},

	open() {
		if (this.isOpen || this.button.disabled) return;
		this.list.hidden = false;
		this.button.setAttribute("aria-expanded", "true");
		this.setActive(Math.max(0, this.items.indexOf(this.value)));
		this.list.focus();
	},

	close(returnFocus) {
		if (!this.isOpen) return;
		this.list.hidden = true;
		this.button.setAttribute("aria-expanded", "false");
		this.list.removeAttribute("aria-activedescendant");
		if (returnFocus) this.button.focus();
	},

	jumpToLetter(letter) {
		const key = letter.toLowerCase();
		const start = this.active + 1;
		for (let n = 0; n < this.items.length; n++) {
			const i = (start + n) % this.items.length;
			if (this.items[i].toLowerCase().startsWith(key)) {
				this.setActive(i);
				return;
			}
		}
	},

	onListKeydown(e) {
		const last = this.items.length - 1;
		switch (e.key) {
			case "ArrowDown":
				this.setActive(Math.min(last, this.active + 1));
				break;
			case "ArrowUp":
				this.setActive(Math.max(0, this.active - 1));
				break;
			case "Home":
				this.setActive(0);
				break;
			case "End":
				this.setActive(last);
				break;
			case "Enter":
			case " ":
				this.select(this.active);
				this.close(true);
				break;
			case "Escape":
				this.close(true);
				break;
			case "Tab":
				this.close(false);
				return;
			default:
				if (e.key.length !== 1) return;
				this.jumpToLetter(e.key);
		}
		e.preventDefault();
	},

	init() {
		this.button.addEventListener("click", () =>
			this.isOpen ? this.close(true) : this.open(),
		);
		this.label.addEventListener("click", () => this.button.focus());

		this.button.addEventListener("keydown", (e) => {
			if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
				e.preventDefault();
				this.open();
			}
		});
		this.list.addEventListener("keydown", (e) => this.onListKeydown(e));

		document.addEventListener("mousedown", (e) => {
			if (!this.root.contains(e.target)) this.close(false);
		});
		this.list.addEventListener("focusout", (e) => {
			if (!this.root.contains(e.relatedTarget)) this.close(false);
		});
		window.addEventListener("blur", () => this.close(false));
	},
};

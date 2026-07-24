import {
	getLeadingDays,
	getWeekStart,
	getDaysInMonth,
	getIntlMonth,
	getIntlWeekdays,
	isBetween,
	toDayString,
} from "./utils";
import Keyboard from "./keyboard";
import type { Current, Options, StateClasses } from "./types";

export type { Current, Options, StateClasses };
export { getWeekStart, toDayString, fromDayString } from "./utils";

const stateClasses: StateClasses = {
	active: "active",
	range: "range",
	start: "start",
	end: "end",
};

const button = (
	day: string,
	date: number,
	className: string,
	{ disabled, selected, current, tabIndex }: {
		disabled: boolean;
		selected: boolean;
		current: boolean;
		tabIndex: 0 | -1;
	}
) => `
	<button
		type="button"
		class="js-day${className ? ` ${className}` : ""}"
		data-day="${day}"
		tabindex="${tabIndex}"
		${disabled ? 'aria-disabled="true"' : ""}
		${selected ? 'aria-selected="true"' : ""}
		${current ? 'aria-current="date"' : ""}
	>
		${date}
	</button>
`;

const dispatchChangeEvent = (
	$element: HTMLElement,
	values: string[],
	name: string | undefined
) => {
	$element.dispatchEvent(
		new CustomEvent("Calendar.change", {
			detail: {
				values,
				name,
			},
		})
	);
};

const locale = document.documentElement.getAttribute("lang") || "en";

const optionsDefault: Options = {
	single: true,
	firstDay: getWeekStart(locale),
	stateClasses,
	locale,
	buttonClass: "",
	deselect: false,
	allowPast: false,
};

export default class Calendar {
	today: Date;
	day: string;
	options: Options = optionsDefault;
	current: Current;
	private keyboard: Keyboard;

	el: HTMLElement;
	$body: HTMLTableElement;

	$title: HTMLElement | null;
	$next: HTMLButtonElement | null;
	$previous: HTMLButtonElement | null;

	/** Selected days as `YYYY-MM-DD`. */
	picked: string[] = [];

	constructor(el: HTMLElement, options: Partial<Options> = {}) {
		this.el = el;
		const now = new Date();
		this.today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		this.day = toDayString(this.today);

		this.options = {
			...optionsDefault,
			...options,
			firstDay:
				options.firstDay ??
				getWeekStart(options.locale ?? optionsDefault.locale),
			stateClasses: {
				...optionsDefault.stateClasses,
				...options.stateClasses,
			},
		};

		this.current = {
			month: Number(
				this.el.getAttribute("data-month") ?? this.today.getMonth()
			),
			year: Number(
				this.el.getAttribute("data-year") ?? this.today.getFullYear()
			),
			day: null,
		};

		this.$title = this.el.querySelector(".js-title");
		this.$body = this.el.querySelector(".js-body") as HTMLTableElement;
		this.$next = this.el.querySelector(".js-next");
		this.$previous = this.el.querySelector(".js-previous");
		this.keyboard = new Keyboard(this);
	}

	init() {
		this.picked = JSON.parse(
			this.el.getAttribute("data-picked-dates") || "[]"
		);

		this.render();
		this.el.addEventListener("click", this.handleClick);
		this.$body.addEventListener("keydown", this.keyboard.handleKeydown, false);

		if (!this.options.single) {
			this.$body.addEventListener("mousemove", this.handleMousemove, false);
		}
	}

	destroy() {
		this.el.removeEventListener("click", this.handleClick);
		this.$body.removeEventListener("keydown", this.keyboard.handleKeydown, false);
		this.$body.removeEventListener("mousemove", this.handleMousemove, false);
		this.reset();
	}

	move(deltaMonths: number, { focus = true } = {}) {
		const date = new Date(this.current.year, this.current.month + deltaMonths, 1);
		this.current.year = date.getFullYear();
		this.current.month = date.getMonth();
		this.render({ focus });
	}

	persistPicked() {
		this.el.setAttribute(
			"data-picked-dates",
			JSON.stringify(this.picked)
		);
		dispatchChangeEvent(this.el, this.picked, this.options.name);
	}

	setDaySelected($el: HTMLElement, selected: boolean) {
		if (selected) {
			$el.classList.add(this.options.stateClasses.active);
			$el.setAttribute("aria-selected", "true");
			return;
		}

		$el.classList.remove(this.options.stateClasses.active);
		$el.removeAttribute("aria-selected");
	}

	handleClick = (event: MouseEvent) => {
		let $target: HTMLElement | null = event.target as HTMLElement;

		if ($target.closest(".js-next") || $target.closest(".js-title")) {
			return this.move(1, { focus: false });
		}

		if ($target.closest(".js-previous")) {
			return this.move(-1, { focus: false });
		}

		$target = $target.closest(".js-day");
		if (!$target || $target.getAttribute("aria-disabled") === "true") {
			return;
		}

		const day = $target.getAttribute("data-day") as string;
		this.keyboard.setFocusDay($target as HTMLButtonElement, { focus: false });

		if (this.options.single) {
			if (
				$target.classList.contains(this.options.stateClasses.active) &&
				this.options.deselect
			) {
				this.picked = [];
				this.setDaySelected($target, false);
				return this.persistPicked();
			}

			this.picked.forEach((pickedDay) => {
				const $el = this.$body.querySelector(`[data-day="${pickedDay}"]`);
				if ($el) {
					this.setDaySelected($el as HTMLElement, false);
				}
			});

			this.picked = [day];
			this.setDaySelected($target, true);
			return this.persistPicked();
		}

		if (1 < this.picked.length) {
			this.$body.querySelectorAll(".js-day").forEach(($el) => {
				$el.classList.remove(this.options.stateClasses.range);
				this.setDaySelected($el as HTMLElement, false);
			});
			this.picked = [];
			this.el.setAttribute(
				"data-picked-dates",
				JSON.stringify(this.picked)
			);
		}

		this.picked.push(day);
		this.picked.sort();
		this.setDaySelected($target, true);
		return this.persistPicked();
	};

	/** Paint in-between days while choosing the range end (mouse or keyboard). */
	previewRange(to: string) {
		if (this.options.single || 1 !== this.picked.length) {
			return;
		}

		const $target = this.$body.querySelector(
			`[data-day="${to}"]`
		) as HTMLElement | null;

		if (!$target || $target.getAttribute("aria-disabled") === "true") {
			return;
		}

		const items = this.$body.querySelectorAll(".js-day");
		const $start = this.$body.querySelector(
			`[data-day="${this.picked[0]}"]`
		);

		let isReversed = false;
		let from = this.picked[0];
		let end = to;

		if (from > end) {
			isReversed = true;
			end = this.picked[0];
			from = to;
		}

		items.forEach((item) => {
			const check = item.getAttribute("data-day") as string;
			item.classList.remove(
				this.options.stateClasses.range,
				this.options.stateClasses.end,
				this.options.stateClasses.start
			);

			if (isBetween(check, from, end)) {
				item.classList.add(this.options.stateClasses.range);
			}
		});

		$start?.classList.add(this.options.stateClasses.start);
		$target.classList.add(this.options.stateClasses.end);

		if (isReversed) {
			$start?.classList.add(this.options.stateClasses.end);
			$start?.classList.remove(this.options.stateClasses.start);
			$target.classList.add(this.options.stateClasses.start);
			$target.classList.remove(this.options.stateClasses.end);
		}
	}

	handleMousemove = (event: MouseEvent) => {
		const $target = (event.target as HTMLElement).closest(
			".js-day"
		) as HTMLElement | null;

		if (!$target) {
			return;
		}

		const day = $target.getAttribute("data-day");
		if (day) {
			this.previewRange(day);
		}
	};

	getMonthName(month: number): string {
		return (
			this.options.months?.[month] ??
			getIntlMonth(this.options.locale, month)
		);
	}

	getWeekdays(): string[] {
		return (
			this.options.days ?? getIntlWeekdays(this.options.locale, "short")
		);
	}

	renderDays() {
		const row = this.el.querySelector(".js-days") as HTMLTableRowElement;
		const labels = this.getWeekdays();
		const abbreviations = getIntlWeekdays(this.options.locale, "long");

		row.innerHTML = "";

		for (let i = 0; i < 7; i += 1) {
			const index = (this.options.firstDay + i) % 7;
			const th = document.createElement("th");

			th.scope = "col";
			th.abbr = abbreviations[index];
			th.textContent = labels[index];
			row.appendChild(th);
		}
	}

	renderHeader(month: number, year: number) {
		if (this.$title) {
			this.$title.textContent = new Date(
				year,
				month,
				1
			).toLocaleDateString(this.options.locale, {
				month: "long",
				year: "numeric",
			});
		}

		this.$previous?.setAttribute(
			"data-content",
			this.getMonthName(0 > month - 1 ? 11 : month - 1)
		);
		this.$next?.setAttribute(
			"data-content",
			this.getMonthName(11 < month + 1 ? 0 : month + 1)
		);
	}

	renderCalendar(month: number, year: number, { focus = false } = {}) {
		const buttonClass = this.options.buttonClass ?? "";
		let dayOfMonth = 1;

		for (let i = 0; 6 >= i; i += 1) {
			const row = document.createElement("tr");

			for (
				let j = this.options.firstDay;
				j < 7 + this.options.firstDay;
				j += 1
			) {
				const date = new Date(year, month, dayOfMonth);
				const cell = document.createElement("td");
				const inner = document.createElement("div");

				if (
					0 === i &&
					j <
						this.options.firstDay +
							getLeadingDays(month, year, this.options.firstDay)
				) {
					row.appendChild(cell);
				} else if (dayOfMonth > getDaysInMonth(year, month)) {
					break;
				} else {
					const day = toDayString(date);
					const isToday = day === this.day;
					const isSelectable =
						this.options.allowPast || day >= this.day;
					const isSelected = this.picked.includes(day);

					inner.innerHTML = button(day, dayOfMonth, buttonClass, {
						disabled: !isSelectable,
						selected: isSelected,
						current: isToday,
						tabIndex: -1,
					});

					const $button = inner.querySelector(
						"button"
					) as HTMLButtonElement;

					if (isSelected) {
						$button.classList.add(this.options.stateClasses.active);

						if (day === this.picked[0]) {
							$button.classList.add(
								this.options.stateClasses.start
							);
						}
						if (
							this.picked.length > 1 &&
							day === this.picked[this.picked.length - 1]
						) {
							$button.classList.add(this.options.stateClasses.end);
						}
					}

					if (
						!this.options.single &&
						2 === this.picked.length &&
						isBetween(day, this.picked[0], this.picked[1])
					) {
						$button.classList.add(this.options.stateClasses.range);
					}

					this.renderInner(inner, date);

					cell.appendChild(inner);
					row.appendChild(cell);

					dayOfMonth += 1;
				}
			}

			if (row.childNodes.length) {
				this.$body.appendChild(row);
			}
		}

		this.keyboard.sync({ focus });
	}

	reset() {
		this.$body.innerHTML = "";
	}

	render({ focus = false } = {}) {
		this.reset();
		this.renderDays();
		this.renderHeader(this.current.month, this.current.year);
		this.renderCalendar(this.current.month, this.current.year, { focus });
	}

	renderInner(_inner: HTMLElement, _date: Date) { }
}

import Keyboard from "./keyboard.js";
import type { Current, Detail, Mode, Options, StateClasses } from "./types.js";
import {
	getDaysInMonth,
	getIntlMonth,
	getIntlWeekdays,
	getLeadingDays,
	getWeekStart,
	isBetween,
	toDayString,
} from "./utils.js";

const stateClassesDefault: StateClasses = {
	active: "active",
	range: "range",
	start: "start",
	end: "end",
};

const MODES = ["single", "range", "multiple"] as const;

const parseBoolean = (value: string | null | undefined, fallback: boolean) => {
	if (value == null || value === "") {
		return fallback;
	}

	return value === "true" || value === "";
};

const parseNumber = (value: string | null, fallback: number) => {
	if (value == null || value === "") {
		return fallback;
	}

	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
};

const parseMode = (el: HTMLElement, options: Partial<Options>): Mode => {
	if (options.mode && (MODES as readonly string[]).includes(options.mode)) {
		return options.mode;
	}

	const mode = el.getAttribute("mode");

	if (mode && (MODES as readonly string[]).includes(mode)) {
		return mode as Mode;
	}

	return "single";
};

const readPicked = (el: HTMLElement): string[] =>
	JSON.parse(el.getAttribute("data-picked") || "[]") as string[];

const dayButton = (
	day: string,
	date: number,
	className: string,
	{
		disabled,
		selected,
		current,
		tabIndex,
	}: {
		disabled: boolean;
		selected: boolean;
		current: boolean;
		tabIndex: 0 | -1;
	},
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

/**
 * Date / range / multi-date picker.
 *
 * Markup and CSS are yours. The package fills the grid and handles selection.
 * Follows the WAI-ARIA APG date grid practices.
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/
 */
export default class Calendar {
	today: Date;
	day: string;
	options: Options;
	current: Current;

	el: HTMLElement;
	$body: HTMLTableSectionElement | null = null;
	$title: HTMLElement | null = null;
	$next: HTMLButtonElement | null = null;
	$previous: HTMLButtonElement | null = null;

	#keyboard: Keyboard | null = null;
	#dispatchChange = (): void => { };

	/** Selected days as `YYYY-MM-DD`. */
	picked: string[] = [];

	constructor(el: HTMLElement, options: Partial<Options> = {}) {
		this.el = el;
		const now = new Date();
		this.today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		this.day = toDayString(this.today);

		const locale =
			options.locale ||
			el.getAttribute("locale") ||
			el.getAttribute("data-locale") ||
			document.documentElement.getAttribute("lang") ||
			"en";

		const firstDayAttr = el.getAttribute("first-day");

		this.options = {
			mode: parseMode(el, options),
			firstDay:
				options.firstDay ??
				(firstDayAttr != null && firstDayAttr !== ""
					? parseNumber(firstDayAttr, getWeekStart(locale))
					: getWeekStart(locale)),
			stateClasses: {
				...stateClassesDefault,
				...options.stateClasses,
			},
			locale,
			buttonClass: options.buttonClass ?? el.getAttribute("button-class") ?? "",
			deselect:
				options.deselect ??
				parseBoolean(el.getAttribute("deselect"), false),
			allowPast:
				options.allowPast ??
				parseBoolean(el.getAttribute("allow-past"), false),
			name: options.name ?? el.getAttribute("name") ?? undefined,
			months: options.months,
			days: options.days,
		};

		this.current = {
			month: parseNumber(
				el.getAttribute("data-month"),
				this.today.getMonth(),
			),
			year: parseNumber(
				el.getAttribute("data-year"),
				this.today.getFullYear(),
			),
			day: null,
		};

		this.$title = this.el.querySelector(".js-title");
		this.$body = this.el.querySelector<HTMLTableSectionElement>(".js-body");
		this.$next = this.el.querySelector(".js-next");
		this.$previous = this.el.querySelector(".js-previous");
	}

	init(): void {
		if (!this.$body) {
			throw new Error("Calendar: .js-body element not found");
		}

		this.#keyboard = new Keyboard(this);
		this.picked = readPicked(this.el);

		this.render();
		this.el.addEventListener("click", this.#handleClick);
		this.#keyboard.attach();

		if (this.options.mode === "range") {
			this.$body.addEventListener("mousemove", this.#handleMousemove, false);
		}

		this.#dispatchChange = () => {
			const detail: Detail = {
				values: this.picked,
				name: this.options.name,
			};

			this.el.dispatchEvent(
				new CustomEvent("Calendar.change", {
					detail,
					bubbles: true,
				}),
			);
		};
	}

	destroy(): void {
		this.el.removeEventListener("click", this.#handleClick);

		if (this.#keyboard) {
			this.#keyboard.detach();
			this.$body?.removeEventListener(
				"mousemove",
				this.#handleMousemove,
				false,
			);
		}

		this.reset();
		this.#dispatchChange = () => { };
	}

	/** Navigate by `delta` months (negative = previous). */
	move(delta: number, { focus = true } = {}) {
		const { year, month } = this.current;
		const date = new Date(year, month + delta, 1);

		this.current.year = date.getFullYear();
		this.current.month = date.getMonth();

		this.render({ focus });
	}

	/** Assign selection, mirror `data-picked`, optionally emit `Calendar.change`. */
	setPicked(picked: string[], emit = true): void {
		this.picked = picked;
		this.el.setAttribute("data-picked", JSON.stringify(this.picked));

		if (emit) {
			this.#dispatchChange();
		}
	}

	setDaySelected($el: HTMLElement, selected: boolean): void {
		if (selected) {
			$el.classList.add(this.options.stateClasses.active);
			return $el.setAttribute("aria-selected", "true");
		}

		$el.classList.remove(this.options.stateClasses.active);
		return $el.removeAttribute("aria-selected");
	}

	#handleClick = (event: MouseEvent) => {
		const { target } = event;

		if (!(target instanceof HTMLElement)) {
			return;
		}

		if (target.closest(".js-next") || target.closest(".js-title")) {
			return this.move(1, { focus: false });
		}

		if (target.closest(".js-previous")) {
			return this.move(-1, { focus: false });
		}

		const $day = target.closest<HTMLElement>(".js-day");

		if (!$day || $day.getAttribute("aria-disabled") === "true") {
			return;
		}

		const day = $day.getAttribute("data-day") as string;
		this.#keyboard?.setFocusDay($day as HTMLButtonElement, { focus: false });

		if (this.options.mode === "multiple") {
			const index = this.picked.indexOf(day);

			if (index >= 0) {
				this.picked.splice(index, 1);
				this.setDaySelected($day, false);
			} else {
				this.picked.push(day);
				this.picked.sort();
				this.setDaySelected($day, true);
			}

			return this.setPicked(this.picked);
		}

		if (this.options.mode === "single") {
			if (
				$day.classList.contains(this.options.stateClasses.active) &&
				this.options.deselect
			) {
				this.picked = [];
				this.setDaySelected($day, false);
				return this.setPicked(this.picked);
			}

			this.picked.forEach((pickedDay) => {
				const $el = this.$body?.querySelector(`[data-day="${pickedDay}"]`);

				if ($el) {
					this.setDaySelected($el as HTMLElement, false);
				}
			});

			this.picked = [day];
			this.setDaySelected($day, true);
			return this.setPicked(this.picked);
		}

		if (1 < this.picked.length) {
			this.$body?.querySelectorAll(".js-day").forEach(($el) => {
				$el.classList.remove(this.options.stateClasses.range);
				this.setDaySelected($el as HTMLElement, false);
			});
			this.picked = [];
		}

		this.picked.push(day);
		this.picked.sort();
		this.setDaySelected($day, true);
		return this.setPicked(this.picked);
	};

	/** Paint in-between days while choosing the range end (mouse or keyboard). */
	previewRange(to: string) {
		if (
			this.options.mode !== "range" ||
			1 !== this.picked.length ||
			!this.$body
		) {
			return;
		}

		const $target = this.$body.querySelector(
			`[data-day="${to}"]`,
		) as HTMLElement | null;

		if (!$target || $target.getAttribute("aria-disabled") === "true") {
			return;
		}

		const items = this.$body.querySelectorAll(".js-day");
		const $start = this.$body.querySelector(
			`[data-day="${this.picked[0]}"]`,
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
				this.options.stateClasses.start,
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

	#handleMousemove = (event: MouseEvent) => {
		const $target = (event.target as HTMLElement).closest(
			".js-day",
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
		const row = this.el.querySelector(".js-days") as HTMLTableRowElement | null;

		if (!row) {
			return;
		}

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
			this.$title.textContent = new Date(year, month, 1).toLocaleDateString(
				this.options.locale,
				{
					month: "long",
					year: "numeric",
				},
			);
		}

		this.$previous?.setAttribute(
			"data-content",
			this.getMonthName(0 > month - 1 ? 11 : month - 1),
		);
		this.$next?.setAttribute(
			"data-content",
			this.getMonthName(11 < month + 1 ? 0 : month + 1),
		);
	}

	renderCalendar(month: number, year: number, { focus = false } = {}) {
		if (!this.$body) {
			return;
		}

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

					inner.innerHTML = dayButton(day, dayOfMonth, buttonClass, {
						disabled: !isSelectable,
						selected: isSelected,
						current: isToday,
						tabIndex: -1,
					});

					const $button = inner.querySelector(
						"button",
					) as HTMLButtonElement;

					if (isSelected) {
						$button.classList.add(this.options.stateClasses.active);

						if (this.options.mode === "range") {
							if (day === this.picked[0]) {
								$button.classList.add(this.options.stateClasses.start);
							}

							if (
								this.picked.length > 1 &&
								day === this.picked[this.picked.length - 1]
							) {
								$button.classList.add(this.options.stateClasses.end);
							}
						}
					}

					if (
						this.options.mode === "range" &&
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

		this.#keyboard?.sync({ focus });
	}

	reset() {
		if (this.$body) {
			this.$body.innerHTML = "";
		}
	}

	render({ focus = false } = {}) {
		this.reset();
		this.renderDays();
		this.renderHeader(this.current.month, this.current.year);
		this.renderCalendar(this.current.month, this.current.year, { focus });
	}

	/** Override to enrich or rebuild each day cell. Keep `.js-day` and `data-day`. */
	renderInner(_inner: HTMLElement, _date: Date) { }
}

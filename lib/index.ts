import getDaysInMonth from "./utils/getDaysInMonth";
import getFirstDay from "./utils/getFirstDay";
import isBetween from "./utils/isBetween";

import months from "./../languages/months.json";

const tableClasses = {
	ROW: "Calendar__row",
	CELL: "Calendar__cell",
	CELL_ACTIVE: "Calendar__cell--active",
	CELL_CURRENT: "Calendar__cell--current",
	CELL_INNER: "Calendar__cell__inner",
};

interface CalendarStateClasses {
	active: string;
	range: string;
	start: string;
	end: string;
	name: string;
}

const stateClasses = {
	active: "active",
	range: "range",
	start: "start",
	end: "end",
	name: "calendar",
};

const button = (time, date) => `
	<button class="btn btn-outline-primary js-button" data-date="${time}" type="button">
		${date}
	</button>
`;

const dispatchChangeEvent = (
	$element: HTMLElement,
	values: number[],
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

const lang = document.documentElement.getAttribute("lang") || "en";

const optionsDefault = {
	single: true,
	firstDay: 0,
	stateClasses,
	months: months[lang],
	deselect: false,
	allowPast: false,
};

interface CalendarOptions {
	single?: boolean;
	firstDay: number;
	stateClasses: CalendarStateClasses;
	months: string[];
	deselect?: boolean;
	name?: string;
	allowPast?: boolean;
}

interface CalendarCurrent {
	date: number;
	month: number;
	year: number;
}

/**
 *
 * @constructor
 * @param {HTMLElement} el
 */
export default class Calendar {
	today: Date;
	options: CalendarOptions = optionsDefault;
	current: CalendarCurrent;

	el: HTMLElement;
	$body: HTMLTableElement;

	$title: HTMLElement | null;
	$next: HTMLButtonElement | null;
	$previous: HTMLButtonElement | null;

	active: HTMLElement[] = [];
	picked: number[];

	constructor(el, options = {}) {
		this.el = el;
		this.today = new Date();

		this.options = { ...optionsDefault, ...options };

		this.current = {
			date: this.today.getDate(),
			month: JSON.parse(this.el.getAttribute('data-month') || this.today.getMonth().toString()),
			year: JSON.parse(this.el.getAttribute('data-year') || this.today.getFullYear().toString()),
		};

		// UI
		this.$title = this.el.querySelector(".js-title") as HTMLElement;
		this.$body = this.el.querySelector(".js-body") as HTMLTableElement;

		this.$next = this.el.querySelector(".js-next") as HTMLButtonElement;
		this.$previous = this.el.querySelector(
			".js-previous"
		) as HTMLButtonElement;
	}

	init() {
		this.active = [];
		this.picked = JSON.parse(this.el.getAttribute('data-picked-dates') || '[]' );

		this.onMousemove = this.onMousemove.bind(this);
		this.onKeydown = this.onKeydown.bind(this);

		this.render();
		this.initEvents();
	}

	initEvents() {
		// console.info('Calendar.initEvents');

		this.el.addEventListener("click", (event) => {
			const $target = event.target as HTMLElement;

			if ($target === null || $target === undefined) {
				return;
			}

			if ($target.matches(".js-next") || $target.matches(".js-title")) {
				return this.next();
			}

			if ($target.matches(".js-previous")) {
				return this.previous();
			}

			if (this.options.single) {
				if (
					$target.matches(".js-button") &&
					$target.classList.contains(
						this.options.stateClasses.active
					) &&
					this.options.deselect
				) {
					this.active = [];
					this.picked = [];
					$target.classList.remove(this.options.stateClasses.active);

					dispatchChangeEvent(
						this.el,
						this.picked,
						this.options.name
					);

					return this.el.setAttribute(
						"data-picked-dates",
						JSON.stringify(this.picked)
					);
				}

				if ($target.matches(".js-button")) {
					this.active.map(($el) =>
						$el.classList.remove(this.options.stateClasses.active)
					);

					this.active.push($target);
					this.picked = [
						parseInt($target.getAttribute("data-date") || "0", 10),
					];
					$target.classList.add(this.options.stateClasses.active);

					dispatchChangeEvent(
						this.el,
						this.picked,
						this.options.name
					);

					return this.el.setAttribute(
						"data-picked-dates",
						JSON.stringify(this.picked)
					);
				}
			}

			if (!this.options.single) {
				if ($target.matches(".js-button")) {
					const buttons = [
						...this.$body.querySelectorAll(".js-button"),
					];

					if (1 < this.picked.length) {
						buttons.map(($el) => {
							$el.classList.remove(
								this.options.stateClasses.active
							);
							$el.classList.remove(
								this.options.stateClasses.range
							);

							return true;
						});
						this.active = [];
						this.picked = [];

						this.el.setAttribute(
							"data-picked-dates",
							JSON.stringify(this.picked)
						);
					}

					this.active.push($target);
					this.picked.push(
						parseInt($target.getAttribute("data-date") || "0", 10)
					);
					this.picked.sort();
					$target.classList.add(this.options.stateClasses.active);

					dispatchChangeEvent(
						this.el,
						this.picked,
						this.options.name
					);

					return this.el.setAttribute(
						"data-picked-dates",
						JSON.stringify(this.picked)
					);
				}
			}

			return false;
		});

		this.$title &&
			this.$title.addEventListener("keydown", this.onKeydown, false);

		if (!this.options.single) {
			this.$body.addEventListener("mousemove", this.onMousemove, false);
		}
	}

	onKeydown(event: KeyboardEvent) {
		const { key, code } = event;

		const next = () => {
			event.preventDefault();
			this.next();
		};

		const previous = () => {
			event.preventDefault();
			this.previous();
		};

		const codes: any = {
			ArrowUp: previous,
			ArrowLeft: previous,
			ArrowDown: next,
			ArrowRight: next,
			default: () => false,
		};

		return (codes[key || code] || codes.default)();
	}

	onMousemove(event) {
		const { target: $target } = event;
		const items = this.$body.querySelectorAll(".js-button");
		let isReversed = false;

		if (!$target.matches(".js-button")) {
			return;
		}

		if (0 === this.picked.length || 2 === this.picked.length) {
			return;
		}

		const $start = this.$body.querySelector(
			`[data-date="${this.picked[0]}"]`
		);

		let from = parseInt(this.picked[0].toString(), 10);
		let to = parseInt($target.getAttribute("data-date"), 10);

		if (from > to) {
			isReversed = true;
			to = parseInt(this.picked[0].toString(), 10);
			from = parseInt($target.getAttribute("data-date"), 10);
		}

		items.forEach((item) => {
			const date = parseInt(item.getAttribute("data-date") || "0", 10);
			item.classList.remove(
				this.options.stateClasses.range,
				this.options.stateClasses.end,
				this.options.stateClasses.start
			);

			if (isBetween(date, from, to)) {
				item.classList.add(this.options.stateClasses.range);
			}
		});

		// Start and end classes
		if ($start) {
			$start.classList.add(this.options.stateClasses.start);
		}

		$target.classList.add(this.options.stateClasses.end);

		if (isReversed) {
			if ($start) {
				$start.classList.add(this.options.stateClasses.end);
				$start.classList.remove(this.options.stateClasses.start);
			}

			$target.classList.add(this.options.stateClasses.start);
			$target.classList.remove(this.options.stateClasses.end);
		}
	}

	// onMouseLeave() {}

	renderHeader(month, year) {
		if (this.$title) {
			this.$title.innerHTML = `${this.options.months[month]} ${year}`;
		}

		this.$previous &&
			this.$previous.setAttribute(
				"data-content",
				this.options.months[0 > month - 1 ? 11 : month - 1]
			);
		this.$next &&
			this.$next.setAttribute(
				"data-content",
				this.options.months[11 < month + 1 ? 0 : month + 1]
			);
	}

	renderCalendar(month, year) {
		// Creating all cells.
		let day = 1;
		for (let i = 0; 6 >= i; i += 1) {
			// Creates a table row.
			const row = document.createElement("tr");
			row.classList.add(tableClasses.ROW);

			// Creating individual cells, filing them up with data.
			for (
				let j = this.options.firstDay;
				j < 7 + this.options.firstDay;
				j += 1
			) {
				const date = new Date(year, month, day);
				const cell = document.createElement("td");
				const inner = document.createElement("div");

				if (
					0 === i &&
					j < getFirstDay(month, year, this.options.firstDay)
				) {
					// Empty cell
					row.appendChild(cell);
				} else if (day > getDaysInMonth(year, month)) {
					// Not a existing date
					break;
				} else {
					cell.classList.add(tableClasses.CELL);

					inner.innerHTML = day.toString();



					// Active future date (respect allowPast option)
					if (
						(this.options.allowPast && date.getTime() !== this.today.getTime()) ||
						date.getTime() > this.today.getTime()
					) {
						inner.innerHTML = button(date.getTime(), day);
						cell.classList.add(tableClasses.CELL_ACTIVE);
					}

					// Add class to current day
					if (
						day === this.today.getDate() &&
						year === this.today.getFullYear() &&
						month === this.today.getMonth()
					) {
						cell.classList.add(tableClasses.CELL_CURRENT);
					}

					// Active current date
					if (
						day === this.today.getDate() &&
						year === this.today.getFullYear() &&
						month === this.today.getMonth()
					) {
						inner.innerHTML = button(date.getTime(), day);
						cell.classList.add(tableClasses.CELL_ACTIVE);
					}

					// Picked date
					if (this.picked.includes(date.getTime())) {
						const $button = inner.querySelector("button");

						if ($button) {
							$button.classList.add(
								this.options.stateClasses.active
							);
							this.active.push($button);
						}
					}

					// Range dates
					if (
						!this.options.single &&
						0 !== this.picked.length &&
						isBetween(
							date,
							new Date(this.picked[0]),
							new Date(this.picked[1])
						)
					) {
						const $button = inner.querySelector("button");

						if ($button) {
							$button.classList.add(
								this.options.stateClasses.range
							);
						}
					}

					// Hook
					// Not sure about this, but it works
					this.renderInner(inner, date);

					inner.classList.add(tableClasses.CELL_INNER);

					cell.appendChild(inner);
					row.appendChild(cell);

					day += 1;
				}
			}

			if (0 !== row.innerHTML.length) {
				this.$body.appendChild(row);
				// Appending each row into calendar body.
			}
		}
	}

	/**
	 * Next month
	 */
	next() {
		this.current.year =
			11 === this.current.month
				? this.current.year + 1
				: this.current.year;
		this.current.month = (this.current.month + 1) % 12;

		this.render();
	}

	/**
	 * Previous month
	 */
	previous() {
		this.current.year =
			0 === this.current.month
				? this.current.year - 1
				: this.current.year;
		this.current.month =
			0 === this.current.month ? 11 : this.current.month - 1;

		this.render();
	}

	clear() {
		this.$body.innerHTML = "";
	}

	render() {
		this.clear();
		this.renderHeader(this.current.month, this.current.year);
		this.renderCalendar(this.current.month, this.current.year);
	}

	renderInner(inner, date) {} // eslint-disable-line
}

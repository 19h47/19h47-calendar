import { ARROW_UP, ARROW_RIGHT, ARROW_DOWN, ARROW_LEFT } from '@19h47/keycode';

import getFirstDay from 'utils/getFirstDay';
import getDaysInMonth from 'utils/getDaysInMonth';
// import getTheLastElementOfArray from 'utils/getTheLastElementOfArray';
// import formatDate from 'utils/formatDate';
import isBetween from 'utils/isBetween';

import { classes, months /* , common */ } from '@/config';

// import flights from '@/data/flights.json';

const tableClasses = {
	ROW: 'Calendar__row',
	CELL: 'Calendar__cell',
	CELL_ACTIVE: 'Calendar__cell--active',
	CELL_INNER: 'Calendar__cell__inner',
};

const button = (time, date) => `
	<button class="btn btn-outline-primary js-button" data-date="${time}" type="button">
		${date}
	</button>
`;

const dispatchChangeEvent = ($element, values) => {
	$element.dispatchEvent(
		new CustomEvent('Calendar.change', {
			detail: {
				values,
			},
		}),
	);
};

// const getFlight = date => flights.find(flight => flight.date.date.slice(0, 10) === date);

/**
 *
 * @constructor
 * @param {object} container
 */
export default class Calendar {
	constructor(container) {
		this.rootElement = container;
		this.today = new Date();

		this.current = {
			date: this.today.getDate(),
			month: this.today.getMonth(),
			year: this.today.getFullYear(),
		};
	}

	init() {
		// console.info('Calendar.init');

		// UI
		this.$title = this.rootElement.querySelector('.js-title');
		this.$next = this.rootElement.querySelector('.js-next');
		this.$previous = this.rootElement.querySelector('.js-previous');
		this.$body = this.rootElement.querySelector('.js-body');

		this.active = [];
		this.picked = [];

		// @TODO Make options
		this.single = true;
		this.firstDay = 0;

		// this.flightCount = JSON.parse(this.rootElement.getAttribute('data-flight-count'));

		this.onMouseMove = this.onMouseMove.bind(this);

		this.renderHeader(this.current.month, this.current.year);
		this.renderCalendar(this.current.month, this.current.year);

		this.initEvents();
	}

	initEvents() {
		// console.info('Calendar.initEvents');

		this.rootElement.addEventListener('click', event => {
			const { target: $target } = event;

			if ($target.matches('.js-next') || $target.matches('.js-title')) {
				return this.next();
			}

			if ($target.matches('.js-previous')) {
				return this.previous();
			}

			if (this.single) {
				if ($target.matches('.js-button') && $target.classList.contains(classes.active)) {
					this.active = [];
					this.picked = [];
					$target.classList.remove(classes.active);

					dispatchChangeEvent(this.rootElement, this.picked);

					return this.rootElement.setAttribute(
						'data-picked-dates',
						JSON.stringify(this.picked),
					);
				}

				if ($target.matches('.js-button')) {
					this.active.map($el => $el.classList.remove(classes.active));

					this.active.push($target);
					this.picked = [parseInt($target.getAttribute('data-date'), 10)];
					$target.classList.add(classes.active);

					dispatchChangeEvent(this.rootElement, this.picked);

					return this.rootElement.setAttribute(
						'data-picked-dates',
						JSON.stringify(this.picked),
					);
				}
			}

			if (!this.single) {
				if ($target.matches('.js-button')) {
					const buttons = [...this.$body.querySelectorAll('.js-button')];

					if (1 < this.picked.length) {
						buttons.map($el => {
							$el.classList.remove(classes.active);
							$el.classList.remove(classes.inrange);

							return true;
						});
						this.active = [];
						this.picked = [];

						this.rootElement.setAttribute(
							'data-picked-dates',
							JSON.stringify(this.picked),
						);
					}

					this.active.push($target);
					this.picked.push(parseInt($target.getAttribute('data-date'), 10));
					$target.classList.add(classes.active);

					dispatchChangeEvent(this.rootElement, this.picked);

					return this.rootElement.setAttribute(
						'data-picked-dates',
						JSON.stringify(this.picked),
					);
				}
			}

			return false;
		});

		this.$title.addEventListener('keydown', event => {
			switch (event.keyCode) {
				case ARROW_RIGHT:
				case ARROW_DOWN:
					event.preventDefault();
					this.next();

					break;

				case ARROW_LEFT:
				case ARROW_UP:
					event.preventDefault();
					this.previous();

					break;

				default:
			}
		});

		if (!this.single) {
			this.$body.addEventListener('mousemove', this.onMouseMove, false);
		}
	}

	onMouseMove(event) {
		const { target: $target } = event;

		if (!$target.matches('.js-button')) {
			return;
		}

		if (0 === this.picked.length || 2 === this.picked.length) {
			return;
		}

		const from = new Date(this.picked[0]);
		const to = new Date(parseInt($target.getAttribute('data-date'), 10));

		const items = this.$body.querySelectorAll('.js-button');

		items.forEach(item => {
			const date = new Date(parseInt(item.getAttribute('data-date'), 10));
			item.classList.remove(classes.inrange);

			if (isBetween(date, from, to)) {
				item.classList.add(classes.inrange);
			}
		});
	}

	// onMouseLeave() {}

	renderHeader(month, year) {
		this.$title.innerHTML = `${months[month]} ${year}`;
		this.$previous.setAttribute('data-content', months[0 > month - 1 ? 11 : month - 1]);
		this.$next.setAttribute('data-content', months[11 < month + 1 ? 0 : month + 1]);
	}

	renderCalendar(month, year) {
		// Creating all cells.
		let day = 1;
		for (let i = 0; 6 >= i; i += 1) {
			// Creates a table row.
			const row = document.createElement('tr');
			row.classList.add(tableClasses.ROW);

			// Creating individual cells, filing them up with data.
			for (let j = this.firstDay; 7 + this.firstDay > j; j += 1) {
				const date = new Date(year, month, day);
				const cell = document.createElement('td');
				const inner = document.createElement('div');

				if (0 === i && j < getFirstDay(month, year)) {
					// Empty cell
					row.appendChild(cell);
				} else if (day > getDaysInMonth(year, month)) {
					// Not a existing date
					break;
				} else {
					cell.classList.add(tableClasses.CELL);

					inner.innerHTML = day;

					// Active futur date
					if (date.getTime() > this.today.getTime()) {
						inner.innerHTML = button(date.getTime(), day);
						cell.classList.add(tableClasses.CELL_ACTIVE);
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
						const $button = inner.querySelector('button');

						$button.classList.add(classes.active);
						this.active.push($button);
					}

					// Range dates
					if (
						!this.single &&
						0 !== this.picked.length &&
						isBetween(date, new Date(this.picked[0]), new Date(this.picked[1]))
					) {
						const $button = inner.querySelector('button');

						$button.classList.add(classes.inrange);
					}

					// Flight count
					// if (this.flightCount && inner.querySelector('button')) {
					// 	const flight = getFlight(date.toISOString().slice(0, 10));

					// 	if (flight) {
					// 		const { count } = flight;
					// 		const $button = inner.querySelector('button');

					// 		$button.setAttribute(
					// 			'data-content',
					// 			`${count} ${1 < count ? common.flights : common.flight}`,
					// 		);
					// 		$button.classList.add('Calendar__tooltip');
					// 	}
					// }

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
		this.current.year = 11 === this.current.month ? this.current.year + 1 : this.current.year;
		this.current.month = (this.current.month + 1) % 12;

		this.clear();
		this.renderHeader(this.current.month, this.current.year);
		this.renderCalendar(this.current.month, this.current.year);
	}

	/**
	 * Previous month
	 */
	previous() {
		this.current.year = 0 === this.current.month ? this.current.year - 1 : this.current.year;
		this.current.month = 0 === this.current.month ? 11 : this.current.month - 1;

		this.clear();
		this.renderHeader(this.current.month, this.current.year);
		this.renderCalendar(this.current.month, this.current.year);
	}

	clear() {
		this.$body.innerHTML = '';
	}
}

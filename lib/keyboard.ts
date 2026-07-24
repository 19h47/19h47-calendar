import {
	fromDayString,
	getDaysInMonth,
	toDayString,
} from "./utils";
import type Calendar from "./index";

/** APG day-grid focus: roving tabindex + keyboard navigation. */
export default class Keyboard {
	host: Calendar;

	constructor(host: Calendar) {
		this.host = host;
	}

	setFocusDay($button: HTMLButtonElement, { focus = true } = {}) {
		this.host.$body.querySelectorAll(".js-day").forEach(($el) => {
			($el as HTMLButtonElement).tabIndex = -1;
		});

		$button.tabIndex = 0;
		this.host.current.day = $button.getAttribute("data-day");

		if (focus) {
			$button.focus();
		}

		if (this.host.current.day) {
			this.host.previewRange(this.host.current.day);
		}
	}

	/** Same day-of-month in the viewed month, or last day if it does not exist (APG). */
	dayInView(): string {
		const { current } = this.host;
		const dayOfMonth = current.day
			? fromDayString(current.day).getDate()
			: 1;
		const lastDay = getDaysInMonth(current.year, current.month);

		return toDayString(
			new Date(
				current.year,
				current.month,
				Math.min(dayOfMonth, lastDay)
			)
		);
	}

	focusDayByOffset(fromDay: string, dayDelta: number) {
		const date = fromDayString(fromDay);
		date.setDate(date.getDate() + dayDelta);

		const day = toDayString(date);
		this.host.current.day = day;
		this.host.current.year = date.getFullYear();
		this.host.current.month = date.getMonth();

		const $button = this.host.$body.querySelector(
			`[data-day="${day}"]`
		) as HTMLButtonElement | null;

		if ($button) {
			this.setFocusDay($button);
			return;
		}

		this.host.render({ focus: true });
	}

	sync({ focus = false } = {}) {
		const buttons = Array.from(
			this.host.$body.querySelectorAll(".js-day")
		) as HTMLButtonElement[];

		if (!buttons.length) {
			return;
		}

		const byDay = (day: string) =>
			buttons.find(($el) => $el.getAttribute("data-day") === day);

		const preferred =
			(this.host.current.day &&
				(byDay(this.host.current.day) || byDay(this.dayInView()))) ||
			buttons.find(($el) =>
				this.host.picked.includes($el.getAttribute("data-day") || "")
			) ||
			byDay(this.host.day) ||
			buttons[0];

		this.setFocusDay(preferred, { focus });
	}

	handleKeydown = (event: KeyboardEvent) => {
		const $target = (event.target as HTMLElement).closest(
			".js-day"
		) as HTMLButtonElement | null;

		if (!$target) {
			return;
		}

		const day = $target.getAttribute("data-day") as string;
		const dayOfWeek = fromDayString(day).getDay();
		const offset = (dayOfWeek - this.host.options.firstDay + 7) % 7;
		const { key, code } = event;

		const activate = () => {
			if ($target.getAttribute("aria-disabled") !== "true") {
				event.preventDefault();
				$target.click();
			}
		};

		const codes: any = {
			ArrowLeft: () => {
				event.preventDefault();
				this.focusDayByOffset(day, -1);
			},
			ArrowRight: () => {
				event.preventDefault();
				this.focusDayByOffset(day, 1);
			},
			ArrowUp: () => {
				event.preventDefault();
				this.focusDayByOffset(day, -7);
			},
			ArrowDown: () => {
				event.preventDefault();
				this.focusDayByOffset(day, 7);
			},
			Home: () => {
				event.preventDefault();
				this.focusDayByOffset(day, -offset);
			},
			End: () => {
				event.preventDefault();
				this.focusDayByOffset(day, 6 - offset);
			},
			PageUp: () => {
				event.preventDefault();
				this.host.move(event.shiftKey ? -12 : -1);
			},
			PageDown: () => {
				event.preventDefault();
				this.host.move(event.shiftKey ? 12 : 1);
			},
			Enter: activate,
			" ": activate,
			default: () => false,
		};

		return (codes[key || code] || codes.default)();
	};
}

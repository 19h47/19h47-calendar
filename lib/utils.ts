/** Local calendar day as `YYYY-MM-DD`. */
export function toDayString(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

/** Parse a local `YYYY-MM-DD` day into a Date at local midnight. */
export function fromDayString(day: string): Date {
	const [year, month, date] = day.split("-").map(Number);

	return new Date(year, month - 1, date);
}

/** Inclusive `YYYY-MM-DD` range check. */
export function isBetween(check: string, from: string, to: string): boolean {
	return check <= to && check >= from;
}

/** @see https://dzone.com/articles/determining-number-days-month */
export function getDaysInMonth(year: number, month: number): number {
	return 32 - new Date(year, month, 32).getDate();
}

/**
 * How many weekdays precede the 1st of the month, given a week start
 * (`0`=Sun … `6`=Sat).
 *
 * @see https://stackoverflow.com/a/33508649/5091221
 */
export function getLeadingDays(
	month: number,
	year: number,
	weekStart = 0
): number {
	const day = new Date(year, month).getDay();
	return (day - weekStart + 7) % 7;
}

/**
 * Week start for a locale as JS `getDay()` (0=Sun … 6=Sat).
 * Falls back to Sunday when `Intl.Locale.getWeekInfo` is unavailable.
 */
export function getWeekStart(locale: string): number {
	try {
		const intlLocale = new Intl.Locale(locale) as Intl.Locale & {
			getWeekInfo?: () => { firstDay: number };
		};
		const weekInfo = intlLocale.getWeekInfo?.();
		if (weekInfo) {
			return weekInfo.firstDay === 7 ? 0 : weekInfo.firstDay;
		}
	} catch {
		/* ignore */
	}

	return 0;
}

/** Sunday-first weekday labels (Jan 5, 2020 was a Sunday). */
export function getIntlWeekdays(
	locale: string,
	weekday: Intl.DateTimeFormatOptions["weekday"] = "short"
): string[] {
	return Array.from({ length: 7 }, (_, day) =>
		new Date(2020, 0, 5 + day).toLocaleDateString(locale, { weekday })
	);
}

export function getIntlMonth(locale: string, month: number): string {
	return new Date(2020, month, 1).toLocaleDateString(locale, {
		month: "long",
	});
}

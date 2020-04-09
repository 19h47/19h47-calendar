/**
 * First day
 *
 * @param  year
 * @param  month
 * @see https://stackoverflow.com/a/33508649/5091221
 * @return
 */
export default function (month, year, firstDay = 0) {
	const day = new Date(year, month).getDay();

	if (1 === firstDay) {
		return 0 === day ? 7 : day;
	}

	return day;
}

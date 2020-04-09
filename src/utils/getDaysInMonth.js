/**
 * Check how many days in a month
 *
 * @param  month
 * @param  year
 * @see https://dzone.com/articles/determining-number-days-month
 * @return
 */
export default function (year, month) {
	return 32 - new Date(year, month, 32).getDate();
}

/**
 * Check if date is between
 *
 * @param  check
 * @param  from
 * @param  to
 *
 * @see https://stackoverflow.com/a/16080438/5091221
 *
 * @return {bool}
 */
export default function (check, from, to) {
	return check <= to && check >= from;
}

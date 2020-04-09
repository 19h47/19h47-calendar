/**
 *
 *
 */
export default function (date) {
	const time = new Date(date);
	const year = time.getFullYear();

	let month = (time.getMonth() + 1).toString();
	let day = time.getDate().toString();

	if (2 > month.length) {
		month = `0${month}`;
	}

	if (2 > day.length) {
		day = `0${day}`;
	}

	return [year, month, day].join('-');
}

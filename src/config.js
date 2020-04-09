const elements = {
	body: document.body,
	html: document.documentElement,
};

const lang = elements.html.getAttribute('lang') || 'fr';

const months = require('@/../languages/months.json')[lang];
const days = require('@/../languages/days.json')[lang];

const classes = {
	active: 'active',
	inrange: 'active',
	inview: 'is-in-view',
	select: 'is-selected',
};

export { elements, lang, months, days, classes };

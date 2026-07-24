export interface StateClasses {
	active: string;
	range: string;
	start: string;
	end: string;
}

export interface Options {
	single?: boolean;
	firstDay: number;
	stateClasses: StateClasses;
	locale: string;
	buttonClass?: string;
	months?: string[];
	days?: string[];
	deselect?: boolean;
	name?: string;
	allowPast?: boolean;
}

export interface Current {
	month: number;
	year: number;
	/** Navigation day as `YYYY-MM-DD` (may be outside the viewed month until render). */
	day: string | null;
}

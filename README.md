# @19h47/calendar

Lightweight date / range / multi-date picker. Markup and CSS are yours. The package fills the grid and handles selection.

Follows the [WAI-ARIA APG date picker grid](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-datepicker/).

## Installation

```bash
pnpm add @19h47/calendar
```

## Markup

Required hooks:

| Selector | Role |
| -------- | ---- |
| Root element | Passed to `new Calendar(el, options)` |
| `.js-previous` / `.js-next` | Month navigation (optional) |
| `.js-title` | Month / year label. Click advances to the next month (same as `.js-next`) |
| `.js-days` | Weekday headers row |
| `.js-body` | Day cells |
| `.js-day` | Day button (generated) |

```html
<div class="Calendar js-calendar">
	<header>
		<button type="button" class="js-previous" aria-label="Previous month">Previous</button>
		<button type="button" class="js-title" id="calendar-label" aria-live="polite"></button>
		<button type="button" class="js-next" aria-label="Next month">Next</button>
	</header>
	<table role="grid" aria-labelledby="calendar-label">
		<thead>
			<tr class="js-days"></tr>
		</thead>
		<tbody class="js-body"></tbody>
	</table>
</div>
```

## Usage

```ts
import Calendar, { type Options } from "@19h47/calendar";

const el = document.querySelector(".js-calendar") as HTMLElement;
const options: Partial<Options> = {
	locale: "fr",
	mode: "single",
	deselect: true,
	buttonClass: "btn btn-outline-primary",
};

const calendar = new Calendar(el, options);
calendar.init();

el.addEventListener("Calendar.change", ({ detail }) => {
	console.log(detail.values);
});
```

`destroy()` detaches listeners and clears the grid.

### Single date

```html
<div class="js-calendar" mode="single" deselect data-picked="[]">...</div>
```

```js
new Calendar(el).init();
```

### Date range

```html
<div class="js-calendar" mode="range" data-picked="[]">...</div>
```

### Multiple dates

Toggle days on and off. Click a selected day again to remove it.

```html
<div class="js-calendar" mode="multiple" allow-past data-picked="[]">...</div>
```

### Locale and week start

`locale` drives labels via `Intl`. Week start defaults from the locale (`weekInfo`). Pass `firstDay` to override.

```js
new Calendar(el, { locale: "fr" }).init();
```

Update at runtime:

```js
import Calendar, { getWeekStart } from "@19h47/calendar";

calendar.options.locale = "ja";
calendar.options.firstDay = getWeekStart("ja");
calendar.render();
```

### Custom labels

```js
new Calendar(el, {
	locale: "fr",
	days: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
	months: [
		"Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
		"Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
	],
}).init();
```

### Cell hook

Override `renderInner` to enrich or rebuild each day cell. Keep `.js-day` and `data-day`.

```js
calendar.renderInner = (inner, date) => {
	const button = inner.querySelector(".js-day");
	if (!button) return;

	button.classList.add("MyDay");
	button.innerHTML = `<time datetime="${date.toISOString().slice(0, 10)}">${date.getDate()}</time>`;
};
```

### Advanced: event markers

The demo app includes a full example: wrap days in `<time>`, show dots on days with events, and disable days without events via `aria-disabled` in `renderInner`.

## Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `mode` | `"single"` / `"range"` / `"multiple"` | `"single"` | Selection behaviour |
| `locale` | `string` | `document.documentElement.lang` or `"en"` | BCP 47 locale for title and weekday/month labels |
| `buttonClass` | `string` | `""` | Extra classes on day buttons |
| `months` | `string[]` | - | Month names override (Jan to Dec). Defaults to `Intl` |
| `days` | `string[]` | - | Weekday labels override (Sun to Sat). Defaults to `Intl` |
| `firstDay` | `number` | from locale | Week start (`0`=Sun ... `6`=Sat) |
| `deselect` | `boolean` | `false` | Allow clearing the selection in single mode |
| `allowPast` | `boolean` | `false` | Allow selecting past dates |
| `name` | `string` | - | Forwarded in `Calendar.change` detail |
| `stateClasses` | `object` | see source | Selection classes (`active`, `range`, `start`, `end`) |

Exported types: `Options`, `Mode`, `StateClasses`, `Current`, `Detail`. Also exported: `getWeekStart`, `toDayString`, `fromDayString`.

## Attributes

| Attribute | Description |
| --------- | ----------- |
| `mode` | `single`, `range`, or `multiple` |
| `data-month` | Initial month (`0` to `11`) |
| `data-year` | Initial year |
| `data-picked` | JSON array of `YYYY-MM-DD` days to preselect |
| `deselect` | Allow deselect in single mode |
| `allow-past` | Allow past dates |
| `first-day` | Week start override |
| `locale` / `data-locale` | BCP 47 locale |

## Accessibility

The calendar grid follows the [WAI-ARIA APG date grid](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-datepicker/) practices.

**In your markup (source of truth):** `role="grid"`, `aria-labelledby`, `aria-live` on the title, `aria-label` on nav buttons, etc.

**Generated by the lib:**

- Roving `tabindex` (one focusable day at a time)
- `aria-selected` on selected days
- `aria-disabled` on unavailable days (still in the keyboard grid)
- `aria-current="date"` on today
- Weekday headers with `abbr` (full day name)

### Keyboard (focus in the grid)

| Key | Action |
| --- | --- |
| Arrow keys | Move by day / week (crosses months) |
| Home / End | First / last day of the week |
| Page Up / Page Down | Previous / next month (same day number, or last day of month) |
| Shift + Page Up / Down | Previous / next year |
| Enter / Space | Select the focused day |

## Events

`Calendar.change` on the root element (bubbles).

```ts
detail: {
	values: string[];
	name?: string;
}
```

## API

| Method / property | Description |
| ----------------- | ----------- |
| `options` | Runtime options object |
| `picked` | Selected days as `YYYY-MM-DD` |
| `current` | Viewed `{ month, year, day }` |
| `setPicked(values, emit?)` | Assign selection and mirror `data-picked` |
| `render()` | Rebuild the grid |
| `move(delta)` | Navigate by months (`-1` = previous, `1` = next) |
| `destroy()` | Detach listeners and clear the grid |
| `renderInner(inner, date)` | Per-cell hook (override) |

## Live demos

- [GitHub Pages](https://19h47.github.io/19h47-calendar/) (from `docs/`)
- Local: `pnpm dev` then open [http://localhost:5173/](http://localhost:5173/)

Refresh the Pages demo after lib changes:

```bash
pnpm run docs
```

## Acknowledgments

- [Litepicker](https://github.com/wakirin/Litepicker)
- [WAI-ARIA APG combobox datepicker](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-datepicker/)

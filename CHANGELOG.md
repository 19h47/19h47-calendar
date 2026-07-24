# Changelog

## 2.0.0

Breaking rewrite of the public day model and a cleanup of the API surface.

### Migration

| Before (1.x) | After (2.0) |
| ------------ | ----------- |
| `data-date` timestamps on day buttons | `data-day` as `YYYY-MM-DD` |
| `data-picked-dates` JSON number timestamps | JSON string days, e.g. `["2023-11-05","2023-11-07"]` |
| `Calendar.change` → `detail.values: number[]` | `detail.values: string[]` (`YYYY-MM-DD`) |
| `getFirstDayFromLocale(locale)` | `getWeekStart(locale)` |
| `tableClasses` option | removed — style via cascade / your markup |
| `stateClasses.name` | removed |
| `calendar.next()` / `previous()` | `calendar.move(1)` / `calendar.move(-1)` |
| `.js-days` on `<thead>` | `.js-days` on the weekday `<tr>` |
| `.js-button` | `.js-day` |

Helpers: `toDayString(date)` / `fromDayString(day)` for converting to/from local calendar days.

```js
// 1.x
el.dataset.pickedDates = JSON.stringify([1699138800000]);
el.addEventListener("Calendar.change", ({ detail }) => {
  detail.values.forEach((ts) => console.log(new Date(ts)));
});

// 2.0
el.dataset.pickedDates = JSON.stringify(["2023-11-05"]);
el.addEventListener("Calendar.change", ({ detail }) => {
  detail.values.forEach((day) => console.log(day)); // "2023-11-05"
});
```

### Added

- APG keyboard grid: roving tabindex, arrows (cross months), Home/End, Page Up/Down (±month / Shift ±year)
- `aria-selected`, `aria-disabled`, `aria-current="date"`
- Range preview while choosing the end date (mouse + keyboard)
- `locale` via `Intl` (optional `days` / `months` overrides)
- `buttonClass`, `destroy()`, `move()`, `renderInner` hook
- Package on pnpm; TypeScript declarations

### Changed

- Markup is the source of truth; the lib fills the grid and handles selection
- Clicking `.js-title` advances one month (same as `.js-next`)

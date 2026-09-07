# Changelog

## 3.0.0

Breaking release. Date grid keyboard and ARIA follow the WAI-ARIA APG date picker practices.

### Added

- `mode: "single" | "range" | "multiple"` (multiple toggles discrete days)
- `setPicked(values, emit?)` API
- Read `data-picked`, `mode`, `locale`, `first-day`, `deselect`, `allow-past` from markup

### Changed

- Source split: `lib/calendar.ts`, `lib/keyboard.ts`, `lib/types.ts`, `lib/utils.ts`
- Range preview and mousemove only in `mode: "range"`
- Range start/end CSS classes only in range mode
- Keyboard uses `attach()` / `detach()` (no public `handleKeydown`)

### Removed

- `{ single: false }` and `data-single` (use `mode: "range"` or `mode="range"`)
- `data-picked-dates` (use `data-picked`)
- `data-deselect` / `data-allow-past` (use `deselect` / `allow-past`)
- `persistPicked()` (use `setPicked()`)

### Migration from 2.x

| Before (2.x) | After (3.0) |
| ------------ | ----------- |
| `{ single: false }` | `mode="range"` or `{ mode: "range" }` |
| `data-picked-dates` | `data-picked` |
| `data-deselect="true"` | `deselect` |
| `data-allow-past="true"` | `allow-past` |
| `calendar.persistPicked()` | `calendar.setPicked(calendar.picked)` |

## 2.0.0

Breaking rewrite of the public day model and a cleanup of the API surface.

### Migration

| Before (1.x) | After (2.0) |
| ------------ | ----------- |
| `data-date` timestamps on day buttons | `data-day` as `YYYY-MM-DD` |
| `data-picked-dates` JSON number timestamps | JSON string days, e.g. `["2023-11-05","2023-11-07"]` |
| `Calendar.change` / `detail.values: number[]` | `detail.values: string[]` (`YYYY-MM-DD`) |
| `getFirstDayFromLocale(locale)` | `getWeekStart(locale)` |
| `tableClasses` option | removed, style via cascade / your markup |
| `stateClasses.name` | removed |
| `calendar.next()` / `previous()` | `calendar.move(1)` / `calendar.move(-1)` |
| `.js-days` on `<thead>` | `.js-days` on the weekday `<tr>` |
| `.js-button` | `.js-day` |

Helpers: `toDayString(date)` / `fromDayString(day)` for converting to/from local calendar days.

### Added

- APG keyboard grid: roving tabindex, arrows (cross months), Home/End, Page Up/Down (month / Shift year)
- `aria-selected`, `aria-disabled`, `aria-current="date"`
- Range preview while choosing the end date (mouse + keyboard)
- `locale` via `Intl` (optional `days` / `months` overrides)
- `buttonClass`, `destroy()`, `move()`, `renderInner` hook
- Package on pnpm. TypeScript declarations

### Changed

- Markup is the source of truth. The lib fills the grid and handles selection
- Clicking `.js-title` advances one month (same as `.js-next`)

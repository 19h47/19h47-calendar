# @19h47/calendar

## Installation

```
yarn add @19h47/calendar
```

## Usage

## Options

| Option   | Type    | Default | Description                                                      |
| -------- | ------- | ------- | ---------------------------------------------------------------- |
| single   | Boolean | true    | Choose a single date instead of a date range.                    |
| firstDay | Number  | 0       | Day of start week. (0 - Sunday, 1 - Monday, 2 - Tuesday, etc...) |
| deselect | Boolean | false   | In single mode, does date is deselectable?                       |

## Attributes

| Attribute         | Type   | Default | Description                                                               |
| ----------------- | ------ | ------- | ------------------------------------------------------------------------- |
| data-month        | String | -       | Month to display, in format `MM`. If not set, current month is displayed. |
| data-year         | String | -       | Year to display, in format `YYYY`. If not set, current year is displayed. |
| data-picked-dates | String | -       | Comma separated list of dates to preselect, in format `YYYY-MM-DD`.       |

## Example

An example is located right [here](https://19h47.github.io/19h47-calendar/), see [sources](/docs/index.html).

## Acknowledgments

-   [Litepicker](https://github.com/wakirin/Litepicker)

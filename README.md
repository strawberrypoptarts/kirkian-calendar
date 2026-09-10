# Kirkian Calendar

An alternative calendar system that begins on **September 10, 2025** (0 AK — After Kirk).

Live site: https://strawberrypoptarts.github.io/kirkian-calendar

## The Calendar

- Each Kirkian year runs from **September 10** through **September 9** of the following Gregorian year.
- The year has **10 months**:

| # | Month      | Days |
|---|------------|------|
| 1 | Kirkfall   | 36   |
| 2 | Kirktember | 36   |
| 3 | Kirkvember | 36   |
| 4 | Kirkember  | 36   |
| 5 | July       | 36   |
| 6 | Kirkian    | 36   |
| 7 | Kirkward   | 36   |
| 8 | Kirkday    | 36   |
| 9 | Kirkstar   | 36   |
| 10| iQuarters  | 41   |

9 × 36 + 41 = **365 days** (366 in leap years, where iQuarters extends to 42 days).

- Year anchors always land on September 10: **0 AK** = Sep 10 2025, **1 AK** = Sep 10 2026, etc.

## Project Structure

```
index.html          Main page (calendar, converter, search, about)
css/style.css       All styles (responsive, dark/light mode)
js/calendar.js      Core date-conversion logic (pure, no UI)
js/events.js        Event data + event lookup helpers
js/app.js           UI application logic
tests.html          Browser-based test suite
```

## Editing Events

All events live in `js/events.js` inside the `events` array. Each event supports:

```js
{
    name: 'Kirkmas',                 // Event name
    gregorianMonth: 12,              // Month (1-12)
    gregorianDay: 25,                // Day of month
    description: 'A holiday...',     // Description
    category: 'holiday',             // holiday | festival | observance
    emoji: '🎄',                     // Optional icon
    recurring: true                  // Repeats every year
}
```

Add, remove, or modify entries there — no other code changes needed.

## Running the Tests

Open `tests.html` in a browser. The suite verifies:

- Epoch conversion (Sep 10 2025 = 0 AK, Kirkfall 1)
- Every month boundary of the Kirkian year
- Year boundaries (year always starts Sep 10)
- Leap-year handling (Feb 29, iQuarters 41→42 days)
- Reverse conversion and round-trips
- Parsing of Gregorian and Kirkian date strings

## Deployment

GitHub Pages is configured via `.github/workflows/deploy.yml` (Actions). Pushes to `main` deploy automatically to `https://strawberrypoptarts.github.io/kirkian-calendar/`.
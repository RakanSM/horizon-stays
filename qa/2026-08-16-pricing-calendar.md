# Pricing calendar QA — 2026-08-16

## Local visual verification

- `Admin → Pricing Calendar` loaded successfully after admin authentication and listed all active units.
- The initial two-month calendar rendered the current effective base price for every day and marked a synced booked date distinctly.
- Selecting `2026-08-16` opened the date editor with the resolved price. Selecting `2026-08-18` then expanded the selection to a contiguous three-day range, shown in the editor as `2026-08-16 ← 2026-08-18 · 3 أيام`.
- The side controls for weekday price, weekend price, configurable weekend days, date price, closure, minimum stay, note, and reset-to-automatic were all present and enabled only when appropriate.

## Data-safety note

The local verification deliberately did not press a save action, so no test price or availability change was written to the production database.

## Property booking calendar verification

- A public unit page showed the compact `Show all photos` control, the Share control, and the Google Maps control where coordinates are available.
- Selecting 2026-08-17 as check-in and 2026-08-18 as check-out completed a one-night range successfully and displayed the calculated total of 1,600 SAR.
- The public page uses the `property_price_quote` contract when a stay is selected, so a future price rule set in Admin → Pricing becomes the displayed and shared total for the selected dates.

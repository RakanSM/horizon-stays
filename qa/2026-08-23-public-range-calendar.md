# Public range calendar verification — 2026-08-23

The local Horizon Stays preview renders a single public search control labelled `Check in / Check out` rather than two separate native date fields. Opening the control displays one month calendar and the prompt `Check in → Check out`, confirming that the restored interaction is presented as a two-click date range.

The date picker is connected to the existing public search module and remains separate from the protected administration calendar. In the browser, advancing the displayed month retained the picker state, and the first selectable date changed the trigger to `Check in: 1 September 2026 · Check out` while the picker stayed open. This confirms the first click is treated as check-in rather than submitting a partial range.

The second click on a later day completed the range, closed the calendar, rendered both selected dates in the search control, expanded the catalogue, and scrolled to the existing results area. The public search feedback remained intact. Automated tests pass with the new selection helper, and the production build completes successfully.

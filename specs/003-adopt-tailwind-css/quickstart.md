# Quickstart: Adopt Tailwind CSS

## Prerequisites

- Node.js (any current LTS) — already required for `scripts/serve.js`.
- No new prerequisite to just **run** the app: `src/styles.css` remains committed as a generated file (see [research.md](research.md)), so a fresh clone works exactly as before.
- Node.js is additionally needed (via `npm install`) only if you're **changing styles**.

## Run the app (unchanged)

```bash
npm start                    # serves src/ at http://localhost:8000
# or
open src/index.html          # macOS: opens directly, no server needed
```

## Change styling (new step)

```bash
npm install                          # first time only — installs tailwindcss + @tailwindcss/cli
npm run build:css                    # compiles src/tailwind.css -> src/styles.css (commit the result)
npm run watch:css                    # optional: rebuilds on save while iterating
```

Edit `src/tailwind.css` (theme tokens) or the utility classes in `src/index.html` / `src/lib/fretboard.js` — never hand-edit `src/styles.css`, it's generated output.

## Run the unit tests (unchanged)

```bash
node --test tests/
```

This feature adds no new pure logic, so no new automated tests — see Manual validation below for how visual parity is checked.

## Manual validation (maps to spec.md acceptance scenarios)

1. **Visual parity, light mode (User Story 2, Scenarios 1, 3, 4)**: With system appearance set to light, compare every screen/state — settings panel, fretboard table, each fret-cell state (default, selected, disabled), each result button (resting, hover, focus) — against the pre-migration app. Confirm layout, spacing, colors, borders, and sizing all match.
2. **Visual parity, dark mode (User Story 2, Scenario 2)**: Switch system appearance to dark and repeat check 1. Confirm the same automatic switch still happens with no in-app toggle.
3. **Touch targets (User Story 2, Scenario 4)**: Confirm fret cells, string-note inputs, the clear button, and result buttons all still measure at least 44×44px.
4. **New UI needs no custom CSS (User Story 1)**: Add a temporary test element (e.g. a button) styled only with Tailwind utility classes; confirm it renders correctly with zero additions to `src/tailwind.css` beyond existing theme tokens. Remove the test element afterward.
5. **Sticky layout / narrow screens (Edge Cases)**: Resize to a narrow (mobile) width and confirm the fretboard table still scrolls horizontally with the string-header column and result column staying stuck to their respective edges.
6. **Simple local run (User Story 3)**: On a clean clone (no `node_modules`), run `npm start` and confirm the app is fully styled with no manual setup — validates the zero-install path still works.

## Expected outcome

All 6 checks pass — this is the direct validation of SC-001 through SC-005 in `spec.md`.

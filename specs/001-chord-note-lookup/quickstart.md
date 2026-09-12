# Quickstart: Fretboard Chord Note Lookup

## Prerequisites

- A modern browser.
- Node.js (any current LTS) — used both to serve the app locally and to run the note-engine unit tests.

## Run the app

The app's JS is written as ES modules (`import`/`export`), which browsers refuse to load over `file://` — opening `src/index.html` by double-clicking it will show the static shell (tuning/capo controls) but not the fretboard or results. It must be served over `http://`:

```bash
npm start   # serves src/ at http://localhost:8000 (scripts/serve.js, zero dependencies)
```

Then open `http://localhost:8000` in a browser. (`PORT=8080 npm start` to use a different port.)

Any other static file server works too, e.g. `npx http-server src -p 8080`.

## Run the note-engine tests

```bash
npm test   # or: node --test
```

## Manual validation (maps to spec.md acceptance scenarios)

1. **Defaults (User Story 2, Scenario 1)**: Open the app. Confirm the tuning shows Drop D (D2, A2, D3, G3, B3, E4) and the capo shows fret 2.
2. **Fretted note (User Story 1, Scenario 1)**: Select string 6 (lowest) at fret 3 (per Drop D, D2 + 3 semitones = F2). Confirm the string-6 result shows `F2`.
3. **Open-with-capo note (User Story 1, Scenario 2)**: Leave string 5 unselected. Confirm its result shows the note for string 5's open pitch (A2) transposed by the capo (2 semitones) → `B2`.
4. **All 6 shown together (User Story 1, Scenario 3)**: Select a few different strings at different frets, leave the rest unselected. Confirm all 6 results are displayed at once, one per string, in string order.
5. **Replace on re-select (User Story 1, Scenario 4)**: Select string 1 at fret 2, then select string 1 at fret 5. Confirm only the fret-5 result is shown for string 1.
6. **Capo blocks earlier frets (Edge Case)**: With capo at fret 2, confirm fret 0 and fret 1 are not selectable on any string.
7. **Change tuning/capo mid-selection (User Story 2, Scenario 4)**: With some strings selected, change the capo from 2 to 0. Confirm every *unselected* string's result updates immediately to its true open note, and previously-selected strings' results are unaffected.
8. **Clear (User Story 3, Scenario 1–2)**: With selections and results showing, trigger Clear. Confirm the fretboard is empty and every string shows its open-with-capo note. Select a new chord and confirm no leftover state from the previous one.

## Expected outcome

All 8 checks pass without consulting any external fretboard reference — this is the direct validation of SC-001 and SC-004 in `spec.md`.

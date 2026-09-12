# Quickstart: Fretboard Chord Note Lookup

## Prerequisites

- A modern browser (no install needed for using the app).
- Node.js (any current LTS) only if you want to run the note-engine unit tests.

## Run the app

No build step. Once implemented (Phase 2), the app is a static page:

```bash
open src/index.html          # macOS: opens directly in the default browser
# or serve it (avoids any browser file:// restrictions):
npx http-server src -p 8080  # then visit http://localhost:8080
```

## Run the note-engine tests

```bash
node --test tests/
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

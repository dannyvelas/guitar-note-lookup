---

description: "Task list template for feature implementation"
---

# Tasks: Fretboard Chord Note Lookup

**Input**: Design documents from `/specs/001-chord-note-lookup/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/note-engine.md, quickstart.md

**Tests**: `plan.md` commits to unit-testing the pure note engine (`src/lib/notes.js`) via `node --test`; UI flows are validated manually via `quickstart.md` instead of automated tests. Test tasks below are limited to the note engine accordingly.

**Organization**: Tasks are grouped by user story (from spec.md) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Single static frontend project (per plan.md Structure Decision):

```text
src/
├── index.html
├── styles.css
└── lib/
    ├── notes.js
    ├── tuning.js
    ├── fretboard.js
    └── app.js
tests/
└── notes.test.js
```

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project scaffolding — no logic yet

- [X] T001 Create the project structure per plan.md: `src/`, `src/lib/`, `tests/` directories with empty placeholder files (`src/lib/notes.js`, `src/lib/tuning.js`, `src/lib/fretboard.js`, `src/lib/app.js`, `tests/notes.test.js`)
- [X] T002 [P] Create `src/index.html` page skeleton with three empty containers (settings panel, fretboard grid, results row) and a `<script type="module" src="lib/app.js">` tag
- [X] T003 [P] Create `src/styles.css` with a mobile-first baseline layout (single-column stack, touch-sized tap targets ≥44px) and link it from `src/index.html`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The pure note-calculation engine and default state that every user story depends on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Implement `Pitch` semitone conversion helpers in `src/lib/notes.js`: parse a note string (e.g., `"D2"`) into a semitone number and back into `{letter, accidental, octave}` using sharp-only spelling, per [data-model.md](data-model.md) and [research.md](research.md)
- [X] T005 [P] Implement `TuningPreset` data (Standard: E2 A2 D3 G3 B3 E4; Drop D: D2 A2 D3 G3 B3 E4) and a `getDefaultTuning()` helper returning Drop D in `src/lib/tuning.js`, per FR-001/FR-002
- [X] T006 Implement `pitchAtFret(openPitch, fret)` in `src/lib/notes.js` per [contracts/note-engine.md](contracts/note-engine.md) (depends on T004)
- [X] T007 Implement `resolveChord(tuning, capo, selections)` and `isFretSelectable(fret, capo)` in `src/lib/notes.js` per [contracts/note-engine.md](contracts/note-engine.md) (depends on T006)
- [X] T008 Initialize shared app state — current tuning (default Drop D via T005), capo (default fret 2, FR-004), and empty `FretboardSelection` — as a small state module in `src/lib/app.js` (depends on T005)

**Checkpoint**: Note engine and default state are complete and unit-testable; no UI exists yet.

---

## Phase 3: User Story 1 - Transcribe a chord's notes from fret positions (Priority: P1) 🎯 MVP

**Goal**: The user selects string/fret intersections on a fretboard (with default Drop D tuning + capo fret 2) and immediately sees all 6 resulting notes.

**Independent Test**: Select a known set of string/fret intersections (including strings left unselected) against the default tuning/capo and verify the 6 displayed notes are correct.

### Tests for User Story 1

- [X] T009 [P] [US1] Unit tests for `pitchAtFret` in `tests/notes.test.js` covering a plain fret offset, an accidental (sharp) result, and octave rollover (e.g., B2 + 2 frets → C#3)
- [X] T010 [P] [US1] Unit tests for `resolveChord` in `tests/notes.test.js` covering: a fretted string (FR-010), an unselected string resolving to open-with-capo (FR-011), and all 6 strings returned together ordered by string index (FR-012)

### Implementation for User Story 1

- [X] T011 [US1] Render the interactive fretboard grid (6 strings × frets 0–24) into its container in `src/lib/fretboard.js`
- [X] T012 [US1] Implement click/tap selection handling with single-selection-per-string replace semantics (FR-007, FR-008) in `src/lib/fretboard.js` (depends on T011)
- [X] T013 [US1] Disable/hide grid cells before the current capo using `isFretSelectable` (FR-009, edge case: capo blocks earlier frets) in `src/lib/fretboard.js` (depends on T007, T012)
- [X] T014 [US1] Render the 6-row results display, one row per string in string order, in `src/lib/app.js` (depends on T007)
- [X] T015 [US1] Wire fretboard selection changes to `resolveChord` and re-render the results row on every change (FR-013) in `src/lib/app.js` (depends on T012, T014)
- [X] T016 [US1] Bootstrap the fretboard and results row into `src/index.html` on page load, using the default state from T008, in `src/lib/app.js` (depends on T015)

**Checkpoint**: User Story 1 is fully functional and independently testable — a user can select fret positions against the default Drop D/capo-2 setup and see all 6 notes.

---

## Phase 4: User Story 2 - Configure tuning and capo before transcribing (Priority: P2)

**Goal**: The user can change the tuning (preset or per-string custom) and capo position, with results recomputing immediately.

**Independent Test**: Change the tuning and/or capo and confirm previously-displayed and newly-computed note results update to match the new settings.

### Tests for User Story 2

- [X] T017 [P] [US2] Unit tests for `resolveChord` in `tests/notes.test.js` covering a custom (non-preset) tuning and a `capo = 0` ("no capo") case, confirming unselected strings return their true open note

### Implementation for User Story 2

- [X] T018 [P] [US2] Add the settings panel markup to `src/index.html`: a tuning preset selector, 6 per-string custom note inputs, and a capo number input (including a "no capo" value)
- [X] T019 [US2] Implement preset selection (overwrites all 6 strings) and per-string custom overrides, updating the shared tuning state, in `src/lib/tuning.js` (depends on T005, T018)
- [X] T020 [US2] Implement capo input handling in `src/lib/app.js`, including removing/replacing any existing fret selection that the new capo makes invalid (fret < new capo), consistent with FR-009 (depends on T013, T018)
- [X] T021 [US2] Recompute and re-render results immediately whenever tuning or capo changes (FR-013) in `src/lib/app.js` (depends on T015, T019, T020)

**Checkpoint**: User Stories 1 AND 2 both work independently — tuning and capo are configurable and every change live-updates the results.

---

## Phase 5: User Story 3 - Clear and move to the next chord (Priority: P3)

**Goal**: The user clears all current selections in one action to start the next chord with no leftover state.

**Independent Test**: Make a selection, clear it, and confirm the fretboard and results both return to the empty/open-with-capo state, then select a new chord and confirm no leftover state remains.

### Implementation for User Story 3

- [X] T022 [US3] Add a Clear action control to `src/index.html`
- [X] T023 [US3] Implement the clear handler in `src/lib/app.js`: empty the `FretboardSelection`, reset the fretboard grid's visual state, and re-render results to all open-with-capo values (FR-014, FR-015) (depends on T015)

**Checkpoint**: All 3 user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T024 [P] Pass over `src/styles.css` for one-handed mobile usability on the fretboard grid and settings panel (per plan.md Constraints)
- [X] T025 [P] Add guard messaging in `src/lib/app.js` for out-of-range capo values or malformed custom tuning note entries
- [ ] T026 Run every step in `quickstart.md` end-to-end and fix any discrepancies found — **NOT completed by the agent**: no browser automation tool was available this session (Claude in Chrome was declined). Logic was traced by hand against every quickstart step and all `node --test` unit tests pass, but the UI itself has not been click-tested live. **Must be served over http, not opened as a `file://` URL** — the app's ES modules (`import`/`export`) are blocked by browsers when loaded from disk directly. Run `npm start` (serves `src/` at `http://localhost:8000`, see quickstart.md) and walk through quickstart.md yourself before considering this task done.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational only
- **User Story 2 (Phase 4)**: Depends on Foundational; reuses US1's fretboard/results wiring (T013, T015) but is independently testable against its own acceptance scenarios
- **User Story 3 (Phase 5)**: Depends on Foundational; reuses US1's wiring (T015) but is independently testable
- **Polish (Phase 6)**: Depends on all three user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on other stories
- **User Story 2 (P2)**: Builds on US1's fretboard/results plumbing but does not require US2-specific work to exist for US1 to be tested
- **User Story 3 (P3)**: Builds on US1's plumbing; independent of US2

### Parallel Opportunities

- T002, T003 (Setup) in parallel
- T004, T005 (Foundational) in parallel
- T009, T010 (US1 tests) in parallel
- T017 (US2 test) can run alongside US1 implementation once T007 exists
- T018 (US2 markup) in parallel with other US2 work until T019/T020 need it
- T024, T025 (Polish) in parallel

---

## Parallel Example: User Story 1

```bash
# Launch both note-engine test tasks together:
Task: "Unit tests for pitchAtFret in tests/notes.test.js"
Task: "Unit tests for resolveChord in tests/notes.test.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (note engine + default state)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run quickstart.md checks 1–6 (defaults, fretted note, open-with-capo note, all-6-shown, replace-on-reselect, capo blocking)
5. This is a usable tool: fixed Drop D / capo 2, select and read notes, refresh page to reset

### Incremental Delivery

1. Setup + Foundational → note engine ready, unit-tested
2. Add User Story 1 → validate independently → usable MVP
3. Add User Story 2 → validate independently → tuning/capo now configurable
4. Add User Story 3 → validate independently → Clear button replaces "refresh the page"
5. Polish → mobile usability pass, full quickstart.md run

---

## Notes

- [P] tasks touch different files or independent parts of the same not-yet-shared file, with no ordering dependency between them
- [Story] label maps each task to its user story for traceability
- Every user story is independently completable and testable per its own acceptance scenarios in spec.md
- Commit after each task or logical group
- Stop at any checkpoint to validate a story independently before moving on

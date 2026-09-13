---

description: "Task list template for feature implementation"
---

# Tasks: Click-to-Hear String Preview

**Input**: Design documents from `/specs/002-pluck-string-preview/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/string-sound.md, quickstart.md

**Tests**: `plan.md` commits to unit-testing the two pure functions (`frequencyForPitch`, `generatePluckedStringBuffer`) via `node --test`; the actual audio playback and visual cue are validated manually via `quickstart.md` instead of automated tests. Test tasks below are limited to those two pure functions accordingly.

**Organization**: Tasks are grouped by user story (from spec.md) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Single static frontend project, extending 001-chord-note-lookup (per plan.md Structure Decision):

```text
src/
├── index.html
├── styles.css
└── lib/
    ├── notes.js         # + frequencyForPitch
    ├── tuning.js
    ├── fretboard.js     # + clickable result button, visual cue
    ├── string-sound.js   # new
    └── app.js            # + wires string-sound player into fretboard
tests/
├── notes.test.js         # + frequencyForPitch cases
└── string-sound.test.js  # new
```

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffolding for the one new module — no logic yet

- [X] T001 Create empty placeholder files `src/lib/string-sound.js` and `tests/string-sound.test.js` per plan.md Project Structure

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared markup change both stories build on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 In `src/lib/fretboard.js`, change each row's result `<td>` (currently plain text, per `resultFor`) to contain a `<button type="button" class="fretboard__result-button">` showing the same note text — a real interactive element (focusable, keyboard-activatable) that US1 will wire to sound and US2 will style with a visual cue, with no click behavior or styling added yet

**Checkpoint**: Every result cell is now a real button; neither sound nor visual cue exists yet.

---

## Phase 3: User Story 1 - Hear a string's resulting note (Priority: P1) 🎯 MVP

**Goal**: Clicking a string's result button plays a guitar-pluck sound at that string's currently displayed pitch.

**Independent Test**: Select a fret on a string (or leave it open), click that string's result button, and confirm the sound heard matches the pitch shown and sounds like a plucked guitar string, including when clicking other strings' buttons before it finishes, clicking the same button again mid-playback, and clicking after changing tuning/capo/selection.

### Tests for User Story 1

- [X] T003 [P] [US1] Unit tests for `frequencyForPitch` in `tests/notes.test.js` covering `A4` → `440`, `A3` → `220`, and `C4` → `~261.63`, per [contracts/string-sound.md](contracts/string-sound.md)
- [X] T004 [P] [US1] Unit tests for `generatePluckedStringBuffer` in `tests/string-sound.test.js` covering: output length equals `sampleRate * durationSeconds`, peak amplitude occurs near the start of the buffer, and overall amplitude trends toward silence by the end (not a flat sustained level), per [contracts/string-sound.md](contracts/string-sound.md)

### Implementation for User Story 1

- [X] T005 [P] [US1] Implement `frequencyForPitch(pitch)` in `src/lib/notes.js` (equal temperament, A4 = 440Hz), per [contracts/string-sound.md](contracts/string-sound.md) (depends on T003)
- [X] T006 [P] [US1] Implement `generatePluckedStringBuffer(frequencyHz, sampleRate, durationSeconds)` in `src/lib/string-sound.js` using a Karplus-Strong noise-burst-through-a-feedback-delay-line, per [research.md](research.md) and [contracts/string-sound.md](contracts/string-sound.md) (depends on T004)
- [X] T007 [US1] Implement `createStringSoundPlayer()` in `src/lib/string-sound.js`: lazily create/resume one shared `AudioContext` on first call (so the very first click needs no separate "enable audio" step), and expose `play(pitch)` that calls `frequencyForPitch` (T005) and `generatePluckedStringBuffer` (T006), wraps the samples in an `AudioBuffer`, and starts a fresh `AudioBufferSourceNode` per call so overlapping strings (FR-005) and same-string retriggers (FR-006) each play independently (depends on T005, T006)
- [X] T008 [P] [US1] In `src/lib/fretboard.js`, wire each row's result button (T002) to call an injected `onStringSoundRequest(pitch)` callback on click, passing that string's currently-displayed pitch at the moment of the click (FR-002, FR-004, FR-007); skip the call entirely if the string's current pitch is invalid/indeterminate (FR-008) (depends on T002)
- [X] T009 [US1] In `src/lib/app.js`, instantiate `createStringSoundPlayer()` once and pass its `play` function as `onStringSoundRequest` into `createFretboard` (depends on T007, T008)

**Checkpoint**: User Story 1 is fully functional and independently testable — clicking any string's result button plays that string's currently displayed note as a guitar pluck, with no visual cue required yet.

---

## Phase 4: User Story 2 - Discover that a string's note can be played (Priority: P2)

**Goal**: Every result button visibly invites the click, before the user ever clicks anything.

**Independent Test**: Show the fretboard to someone unfamiliar with the feature and confirm they can identify, unprompted, that the result notes are clickable, and that the cue appears on all 6 rows, reinforced on hover/focus.

### Implementation for User Story 2

- [X] T010 [US2] In `src/lib/fretboard.js`, add a static clickability cue (e.g., a small icon alongside the note text) to the result button's markup (T002), present on every one of the 6 rows at rest (FR-009) (depends on T002; touches the same button element as T008, so implement after US1's T008 lands to avoid overlapping edits)
- [X] T011 [P] [US2] In `src/styles.css`, add hover/focus styling for `.fretboard__result-button` that visibly reinforces interactivity beyond the resting cue (FR-010) (depends on T002)

**Checkpoint**: Both user stories are independently functional — sound plays on click (US1), and every result note visibly invites the click before it happens (US2).

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect both user stories

- [X] T012 [P] Pass over `src/styles.css` for consistent affordance styling and touch-sized tap targets (≥44px) across all 6 result buttons (per plan.md, consistent with the existing mobile-usability pass in feature 001) — done as part of T011's styling (`.fretboard__result-button` has `min-height: 44px; min-width: 64px`)
- [ ] T013 Run every step in `quickstart.md` end-to-end (audio and visual-cue checks) and fix any discrepancies found — **NOT completed by the agent**: no browser automation tool was available this session (Claude in Chrome was declined). All `node --test` unit tests pass (18/18, covering `frequencyForPitch` and `generatePluckedStringBuffer`'s decay/envelope shape) and the UI wiring was traced by hand against every quickstart step, but audio/visual behavior itself has not been click-tested live. A dev server is running at http://localhost:8000 (`node scripts/serve.js`) — open it and walk through quickstart.md yourself before considering this task done.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS both user stories
- **User Story 1 (Phase 3)**: Depends on Foundational only
- **User Story 2 (Phase 4)**: Depends on Foundational; touches the same button element US1 adds behavior to (T002/T008), so is independently testable but best implemented after US1 to avoid merge conflicts on the same lines
- **Polish (Phase 5)**: Depends on both user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on User Story 2
- **User Story 2 (P2)**: No functional dependency on User Story 1's sound behavior (the cue is static markup/CSS), but shares the same file/element, so sequencing after US1 is recommended

### Parallel Opportunities

- T003, T004 (US1 tests) in parallel
- T005, T006 (US1 implementation, different files) in parallel
- T008 (US1 wiring) can proceed in parallel with T005/T006/T007 since it only depends on T002
- T011 (US2 styling) in parallel with T010 (US2 markup) since different files
- T012 (Polish) in parallel with T013

---

## Parallel Example: User Story 1

```bash
# Launch both pure-function test tasks together:
Task: "Unit tests for frequencyForPitch in tests/notes.test.js"
Task: "Unit tests for generatePluckedStringBuffer in tests/string-sound.test.js"

# Launch both pure-function implementations together:
Task: "Implement frequencyForPitch in src/lib/notes.js"
Task: "Implement generatePluckedStringBuffer in src/lib/string-sound.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (result button conversion)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run quickstart.md checks 4–9 (fretted/open note sound, overlap, retrigger, stale-note guard, first-click autoplay)
5. This is a usable feature: every string's note is audibly checkable by click, even without a visible hint that it's clickable

### Incremental Delivery

1. Setup + Foundational → shared button element ready
2. Add User Story 1 → validate independently → sound works on click
3. Add User Story 2 → validate independently → clickability is now discoverable at a glance
4. Polish → consistent styling pass, full quickstart.md run

---

## Notes

- [P] tasks touch different files, with no ordering dependency between them
- [Story] label maps each task to its user story for traceability
- Every user story is independently completable and testable per its own acceptance scenarios in spec.md
- Commit after each task or logical group
- Stop at any checkpoint to validate a story independently before moving on

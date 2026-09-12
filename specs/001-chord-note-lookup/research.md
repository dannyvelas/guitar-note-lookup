# Phase 0 Research: Fretboard Chord Note Lookup

## Decision: Plain HTML/CSS/JavaScript, no framework, no build step

**Rationale**: This is a single-user personal utility with no backend, no persistence, and a UI small enough (one fretboard grid, a settings panel, a results row) that component-framework overhead (state management, routing, build tooling) buys nothing. A static page opened directly in a browser (or hosted via a simple static host) satisfies every requirement in the spec. This matches the project's implicit simplicity/YAGNI expectation for a scoped personal tool.

**Alternatives considered**:
- React/Vite SPA — rejected: no client-side routing, no server data, no component reuse complexity that would justify a framework and bundler.
- A small backend (e.g., Flask/Express) — rejected: there is no server-side computation, storage, or multi-user concern; all logic (note math) can run in the browser.

## Decision: Semitone-arithmetic note engine, not per-tuning lookup tables

**Rationale**: Every string's pitch at any fret is just its open pitch transposed up by the fret number in semitones. Modeling each open note as a semitone value (relative to a fixed reference, e.g., C0) lets one function compute "note at fret f" for *any* tuning (preset or custom) and any capo position, without hardcoding a table per tuning. This directly generalizes FR-001 (custom per-string tuning) and FR-010/FR-011 (fretted vs. open-with-capo note) with one formula.

**Alternatives considered**:
- Precomputed note-per-fret tables per known tuning (mirroring the external site `w` the user described) — rejected: doesn't generalize to a user-entered custom tuning, and duplicates information already derivable from the open note.

## Decision: Default to sharp spelling for accidentals

**Rationale**: The spec's success criteria only require that the correct pitch (letter + accidental + octave) is identified, not that it be spelled according to a song's key signature. Guitar reference charts (including the kind of site `w` the user already uses) conventionally show sharps. Consistently spelling accidentals as sharps (e.g., C#, not Db) keeps the note engine simple and matches user expectation from the existing manual workflow.

**Alternatives considered**:
- Key-aware enharmonic spelling (flats vs. sharps depending on the song's key) — rejected as out of scope: the spec does not ask for key-signature awareness, and it would require the user to input a key for no stated benefit.

## Decision: Frets are absolute (as numbered on the real neck); capo blocks frets below it

**Rationale**: This mirrors the user's described manual process exactly: they read an absolute fret number off the guitarist's hand and, for unpressed strings, use the absolute capo fret. Modeling frets any other way (e.g., "fret 1 above the capo") would require a mental translation step the user doesn't currently do, reintroducing friction the tool is meant to remove.

**Alternatives considered**:
- Capo-relative fret numbering (fret 1 = first fret above the capo) — rejected: doesn't match the source of truth (what the user visually reads off the real fretboard).

## Decision: Test the note-calculation logic with Node's built-in test runner; verify UI flows manually via `quickstart.md`

**Rationale**: The only logic with meaningful edge cases (accidentals, octave rollover, capo shifting, tuning presets) is the pure note-calculation module, which is trivial to unit test without any added dependency (`node --test`). The UI itself is a handful of click/tap interactions on a small page, best validated by hand against the acceptance scenarios already written in `spec.md`, which is proportionate for a personal-scale tool.

**Alternatives considered**:
- Full test framework (Vitest/Jest) — rejected: adds a dependency and config for a project with no other build tooling.
- Browser automation (Playwright/Cypress) — rejected as disproportionate overhead for a small static personal tool; can be revisited if the app grows in scope.

## Output

All unknowns from the Technical Context are resolved above; no `NEEDS CLARIFICATION` markers remain.

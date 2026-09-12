# Implementation Plan: Fretboard Chord Note Lookup

**Branch**: `001-chord-note-lookup` | **Date**: 2026-09-11 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-chord-note-lookup/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

A single-page web app that replaces a slow, manual per-string fretboard lookup: the user sets a tuning (default Drop D) and capo (default fret 2), taps string/fret intersections for the chord they're watching, and immediately sees all 6 resulting notes — with unpressed strings automatically resolved to their open-with-capo note. Implemented as a pure semitone-arithmetic note engine (see [research.md](research.md)) driving a plain HTML/CSS/JS UI, with no backend, no persistence, and no build step.

## Technical Context

**Language/Version**: JavaScript (ES2020+), no transpilation

**Primary Dependencies**: None — vanilla DOM APIs only

**Storage**: N/A (no persistence; all state is in-memory for the current session, per spec Assumptions)

**Testing**: Node.js built-in test runner (`node --test`) for the note-engine module; manual browser walkthrough via [quickstart.md](quickstart.md) for UI flows

**Target Platform**: Any modern desktop or mobile browser (static page, opened locally or hosted as static files)

**Project Type**: Single-page web application (frontend only, no backend)

**Performance Goals**: Note results recompute and render in well under 100ms after any selection/setting change (pure in-memory arithmetic over 6 strings — not a meaningful constraint in practice, stated for completeness)

**Constraints**: Must run entirely client-side with no server component; must be usable one-handed on a phone while watching a video, per the tool's real usage context

**Scale/Scope**: Single user, one session at a time; a 6-string × 25-fret grid and a 6-row result display — negligible data volume

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled template (all placeholder tokens, no ratified principles) — there are no project-specific gates to evaluate against. Proceeding under general engineering defaults already reflected in the Technical Context above: no dependencies or infrastructure beyond what the feature requires (no framework, no backend, no persistence layer), and behavior verified by tests (note engine) plus a documented manual walkthrough (UI). No violations to record in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-chord-note-lookup/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── note-engine.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── index.html          # Page shell: settings panel, fretboard grid, results row
├── styles.css
└── lib/
    ├── notes.js         # Pure note engine: pitchAtFret, resolveChord, isFretSelectable
    ├── tuning.js         # Tuning presets (Standard, Drop D) + StringTuning model
    ├── fretboard.js       # Fretboard grid rendering + selection state + click handling
    └── app.js            # Wires settings panel + fretboard + results row together

tests/
└── notes.test.js        # Unit tests for lib/notes.js (SC-004 accuracy)
```

**Structure Decision**: Single static frontend project (Option 1, web-app variant collapsed to frontend-only since there is no backend). `src/lib/notes.js` is the module the [note-engine contract](contracts/note-engine.md) describes and is the only part covered by automated tests; the rest of `src/` is UI wiring validated manually via [quickstart.md](quickstart.md).

## Complexity Tracking

*No constitution gates were violated — see Constitution Check above. Table intentionally omitted.*

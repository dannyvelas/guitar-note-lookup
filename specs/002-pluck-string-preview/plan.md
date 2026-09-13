# Implementation Plan: Click-to-Hear String Preview

**Branch**: `002-pluck-string-preview` | **Date**: 2026-09-12 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-pluck-string-preview/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Clicking a string's result note (the note shown at the far right of that string's fretboard row) plays a guitar-pluck sound at that exact pitch, and every result note carries a visible cue showing it's clickable. Implemented with the native Web Audio API only: a Karplus-Strong plucked-string synthesizer (see [research.md](research.md)) generates a short decaying waveform from the pitch already computed by the existing note engine, played through a fresh audio source node per click so overlapping strings and re-triggers just work. No new dependencies, no audio assets, no backend.

## Technical Context

**Language/Version**: JavaScript (ES2020+), no transpilation — unchanged from [001-chord-note-lookup](../001-chord-note-lookup/plan.md)

**Primary Dependencies**: None — vanilla DOM APIs plus the native Web Audio API (`AudioContext`, `AudioBuffer`, `AudioBufferSourceNode`); no external library, no pre-recorded audio files

**Storage**: N/A (no persistence; sounds are generated and discarded per click)

**Testing**: Node.js built-in test runner (`node --test`) for the pure pitch→frequency and waveform-synthesis functions; manual browser walkthrough via [quickstart.md](quickstart.md) for actual audible playback and the visual cue, since Web Audio output isn't observable under Node's test runner

**Target Platform**: Same modern desktop/mobile browsers as feature 001; requires Web Audio API support (present in all evergreen browsers)

**Project Type**: Single-page web application (frontend only) — extends the existing app, no new project

**Performance Goals**: Sound begins within 100ms of the click (SC-002); generating a ~1–2 second buffer of samples synchronously per click is well within that budget

**Constraints**: The shared `AudioContext` must be created/resumed inside a user-gesture (click) handler so the very first click plays sound with no separate "enable audio" step (per spec Edge Cases); no pre-recorded audio assets (per spec Assumptions)

**Scale/Scope**: One new small pure-synthesis module plus a UI wiring change to the existing fretboard rows; no new pages, no persistence, no backend

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled template — no project-specific gates to evaluate against, same as feature 001. Proceeding under the same general engineering defaults: no new dependencies or infrastructure beyond what the feature needs (native Web Audio API only, no libraries or assets), pure logic covered by automated tests, UI/audio behavior covered by a documented manual walkthrough. No violations to record in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/002-pluck-string-preview/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── string-sound.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── index.html
├── styles.css          # + visual cue styling for .fretboard__result (FR-009/FR-010)
└── lib/
    ├── notes.js         # + frequencyForPitch (pure; pitch → Hz)
    ├── tuning.js
    ├── fretboard.js     # + clickable result cells, wired to string-sound playback
    ├── string-sound.js   # NEW: generatePluckedStringBuffer (pure) + createStringSoundPlayer (Web Audio playback)
    └── app.js            # + instantiates the string-sound player and passes it to the fretboard

tests/
├── notes.test.js         # + frequencyForPitch cases
└── string-sound.test.js  # NEW: generatePluckedStringBuffer envelope/shape tests
```

**Structure Decision**: Extends the existing single static frontend project from feature 001 (no new project, no backend). The one new pure, testable module is `src/lib/string-sound.js`'s `generatePluckedStringBuffer` (alongside `notes.js`'s new `frequencyForPitch`), covered by `tests/`, per the [string-sound contract](contracts/string-sound.md); `createStringSoundPlayer`'s actual `AudioContext` wiring and the fretboard's clickable-cell/visual-cue changes are UI/browser behavior validated manually via [quickstart.md](quickstart.md), matching how feature 001 separated its tested note engine from its manually-validated UI.

## Complexity Tracking

*No constitution gates were violated — see Constitution Check above. Table intentionally omitted.*

# Phase 1 Data Model: Adopt Tailwind CSS

This feature introduces no new runtime data — it does not touch `Pitch`, `StringTuning`, `Capo`, `FretboardSelection`, or `StringNoteResult` from [001-chord-note-lookup/data-model.md](../001-chord-note-lookup/data-model.md), and adds no new entity of its own. It is a build-time/presentation-only change: hand-written CSS rules become Tailwind utility classes, compiled ahead of time into the same `src/styles.css` the browser already loads.

The one thing worth documenting as a "model" here is the design-token mapping the migration must preserve exactly, which lives in [contracts/theme-tokens.md](contracts/theme-tokens.md) rather than here, since it is a styling contract, not a data structure.

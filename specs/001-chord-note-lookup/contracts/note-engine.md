# Contract: Note Engine

The app has no external API — it's a static page. The one interface worth contracting explicitly is the pure calculation module the UI depends on, since it's what the note-accuracy success criterion (SC-004) is actually testable against, and what `tests/` in Phase 2 will exercise directly (no DOM needed).

## `pitchAtFret(openPitch, fret) -> Pitch`

Computes the note produced by a string with a given open pitch, pressed at a given absolute fret.

- **Input**: `openPitch` (a `Pitch`, per [data-model.md](../data-model.md)), `fret` (non-negative integer).
- **Output**: a `Pitch`, `fret` semitones above `openPitch`, with octave rollover handled (e.g., `B2` at fret 2 → `C#3`, not `C#2`).
- **Errors**: `fret < 0` is invalid input (rejected, not clamped) — the UI never produces this since frets are constrained at selection time.

## `resolveChord(tuning, capo, selections) -> ChordResult`

Computes the 6 `StringNoteResult`s for the current state.

- **Input**:
  - `tuning`: `StringTuning[6]` (one open `Pitch` per string 1–6)
  - `capo`: integer `>= 0`
  - `selections`: map of `stringIndex -> fret`, entries only for pressed strings
- **Output**: `ChordResult` — array of 6 `{ stringIndex, effectiveFret, pitch }`, ordered by `stringIndex`.
- **Behavior**:
  - For a string present in `selections`: `effectiveFret = selections[stringIndex]`.
  - For a string absent from `selections`: `effectiveFret = capo`.
  - `pitch = pitchAtFret(tuning[stringIndex].openPitch, effectiveFret)`.
- **Errors**: none — a missing tuning entry or an out-of-range capo is prevented upstream by the settings UI, not handled here.

## `isFretSelectable(fret, capo) -> boolean`

Guards the UI-level rule that a string can't be pressed behind the capo.

- **Input**: `fret` (integer, the grid cell being considered), `capo` (integer `>= 0`).
- **Output**: `true` iff `fret >= capo`.
- Used by the fretboard grid to disable/hide cells before the capo (FR-009), and by any programmatic selection to reject invalid input rather than silently clamping it.

## Consumers

The UI layer (fretboard rendering, settings panel, results row) calls these three functions and holds no note-math logic of its own; this keeps `tests/notes.test.js` (Phase 2) able to fully verify SC-004 without a DOM.

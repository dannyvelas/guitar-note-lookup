# Phase 1 Data Model: Fretboard Chord Note Lookup

All entities are in-memory client-side state; nothing is persisted (see spec Assumptions).

## Pitch

The atomic value produced by the note engine and shown to the user.

| Field | Type | Notes |
|---|---|---|
| `letter` | one of `A,B,C,D,E,F,G` | Natural letter name |
| `accidental` | one of `"", "#"` | Sharps only, per [research.md](research.md) |
| `octave` | integer | Scientific pitch notation octave (e.g., `2` in `D2`) |

Derived display form: `${letter}${accidental}${octave}` (e.g., `"D#3"`).

Internally, a `Pitch` is interchangeable with a single semitone number relative to a fixed reference point (e.g., `C0 = 0`), which is what fret-offset arithmetic operates on; `letter`/`accidental`/`octave` is the display projection of that number.

## StringTuning

The open pitch for one of the 6 strings.

| Field | Type | Notes |
|---|---|---|
| `stringIndex` | integer 1–6 | 1 = lowest-numbered string as shown on the fretboard (order fixed by the UI, e.g., low-to-high) |
| `openPitch` | Pitch | The note produced by this string played open, no capo |

**Validation**: exactly one `StringTuning` per `stringIndex` 1–6 at all times; a tuning is only valid (usable for computation) when all 6 are set.

## TuningPreset

A named, ready-made set of 6 `StringTuning` values.

| Field | Type | Notes |
|---|---|---|
| `name` | string | e.g., `"Standard"`, `"Drop D"` |
| `openPitches` | Pitch[6] | One per string, in `stringIndex` order |

**Built-in presets** (FR-001, FR-002):
- `Standard`: E2, A2, D3, G3, B3, E4
- `Drop D`: D2, A2, D3, G3, B3, E4 (default, per FR-002)

Selecting a preset overwrites all 6 `StringTuning` entries; editing an individual string afterward is a custom override (the active tuning is just "the current 6 `StringTuning` values," regardless of whether they still match a named preset).

## Capo

Single global setting.

| Field | Type | Notes |
|---|---|---|
| `fret` | integer, 0–12 | `0` = no capo (FR-003); default `2` (FR-004) |

**Validation**: `fret >= 0`. Upper bound (12) reflects the practical range of a physical capo; not a hard spec requirement but keeps the fretboard UI sane.

## FretboardSelection

The in-progress chord: at most one selected fret per string.

| Field | Type | Notes |
|---|---|---|
| `selections` | map of `stringIndex (1–6)` → `fret (integer)` | A string absent from the map means "not pressed" |

**Validation** (FR-008, FR-009):
- At most one entry per `stringIndex` — setting a new fret for a string already in the map replaces its value.
- Every `fret` value MUST be `>= capo.fret` and `<= 24` (max playable fret, per spec Assumptions). Attempting to select a fret `< capo.fret` is rejected by the UI (the cell is not selectable).
- `Clear` (FR-014) empties the map entirely.

## StringNoteResult (derived, not stored)

The computed output shown to the user for one string; recomputed on every change (FR-013), never persisted.

| Field | Type | Notes |
|---|---|---|
| `stringIndex` | integer 1–6 | |
| `effectiveFret` | integer | `selections[stringIndex]` if present, else `capo.fret` (FR-010, FR-011) |
| `pitch` | Pitch | `openPitch(stringIndex)` transposed up by `effectiveFret` semitones |

`ChordResult` = the ordered list of all 6 `StringNoteResult`s, i.e. what User Story 1's acceptance scenarios call "the 6 notes."

## Relationships

```
TuningPreset ──(applies)──▶ StringTuning[6] ──┐
Capo ──────────────────────────────────────────┼─▶ StringNoteResult[6] = ChordResult
FretboardSelection ─────────────────────────────┘
```

`StringNoteResult` has no independent existence — it is a pure function of the current `StringTuning[6]`, `Capo`, and `FretboardSelection` at the moment it is displayed.

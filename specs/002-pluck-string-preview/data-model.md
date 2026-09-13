# Phase 1 Data Model: Click-to-Hear String Preview

This feature adds one new derived, ephemeral value on top of the existing entities in [001-chord-note-lookup/data-model.md](../001-chord-note-lookup/data-model.md) (`Pitch`, `StringTuning`, `Capo`, `FretboardSelection`, `StringNoteResult`). Nothing here is persisted; see spec Assumptions.

## PluckedStringSound (derived, ephemeral)

Produced fresh on each click of a string's result note; discarded once playback finishes.

| Field | Type | Notes |
|---|---|---|
| `pitch` | Pitch | The clicked string's `StringNoteResult.pitch` **at the moment of the click** (FR-002, FR-007) — always the currently displayed note, fretted or open-with-capo. |
| `frequencyHz` | number | `pitch` converted to Hz via equal temperament (A4 = 440Hz); see [contracts/string-sound.md](contracts/string-sound.md). |
| `samples` | Float32Array | One buffer's worth of Karplus-Strong output for `frequencyHz`, long enough to contain the full attack-and-decay (FR-003). |

**Behavior**:
- Each click independently creates its own `PluckedStringSound` and its own audio source node — clicking a different string while one is still playing does not affect it (FR-005), and re-clicking the same string's note restarts that string's sound from a new `PluckedStringSound` rather than modifying the one already playing (FR-006).
- If the clicked string's currently displayed `pitch` is invalid or indeterminate (FR-008 — not expected in practice since `notes.js` never allows an invalid tuning to reach `StringNoteResult`), no `PluckedStringSound` is created and nothing plays.

## ClickabilityCue

Purely presentational — a static visual state on each of the 6 result cells (FR-009), reinforced by a hover/focus state (FR-010). It has no fields or stored state of its own: it is always present on every result cell whenever the fretboard is rendered, independent of `PluckedStringSound` or any other entity.

## Relationships

```
StringNoteResult.pitch ──(read at click time)──▶ PluckedStringSound ──▶ (played once, then discarded)
```

`PluckedStringSound` has no independent existence between clicks — it is created, played, and discarded per click, and never stored alongside `StringNoteResult`.

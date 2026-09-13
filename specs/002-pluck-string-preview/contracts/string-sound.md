# Contract: String Sound

As with [note-engine.md](../../001-chord-note-lookup/contracts/note-engine.md), the app has no external API. The parts of this feature worth contracting are its two pure functions — the only parts `tests/` can exercise directly without a browser's Web Audio implementation. The actual playback wrapper (creating/resuming an `AudioContext` and starting an `AudioBufferSourceNode`) is a thin, side-effecting shell around them, validated manually via [quickstart.md](../quickstart.md), the same way UI wiring was left uncontracted in feature 001.

## `frequencyForPitch(pitch) -> number`

Converts a `Pitch` (per [data-model.md](../../001-chord-note-lookup/data-model.md)) into a frequency in Hz.

- **Input**: `pitch` — a `Pitch`, or anything `notes.js` already accepts as a pitch/semitone value.
- **Output**: a positive number of Hz, using equal temperament with A4 = 440Hz as the reference.
- **Behavior**: matches standard scientific pitch notation — e.g. `A4` → `440`, `A3` → `220`, `C4` (middle C) → `~261.63`.
- **Errors**: an invalid `pitch` throws, same as `parseNote` does today — this function never receives one in practice, since it's only ever called with an already-valid `StringNoteResult.pitch`.

## `generatePluckedStringBuffer(frequencyHz, sampleRate, durationSeconds) -> Float32Array`

Renders one Karplus-Strong plucked-string waveform as raw samples.

- **Input**:
  - `frequencyHz`: positive number, the target pitch.
  - `sampleRate`: positive integer, samples per second (matches the `AudioContext`'s own rate).
  - `durationSeconds`: positive number, long enough to contain the full attack-and-decay (FR-003) — the buffer does not loop or extend itself.
- **Output**: a `Float32Array` of length `sampleRate * durationSeconds`, whose amplitude starts at its loudest near sample 0 and decays toward silence by the end of the buffer (never a flat, sustained level).
- **Behavior**: deterministic in shape (sharp onset, monotonically-trending decay) even though the underlying noise burst is randomized, so no two plucks are bit-for-bit identical — tests assert the decay/envelope shape, not exact sample values.
- **Errors**: none — this is pure math over its numeric inputs; it does not validate them beyond what `Float32Array`'s own constructor would reject.

## Consumers

`createStringSoundPlayer()` (browser-only, not directly tested) calls `frequencyForPitch` then `generatePluckedStringBuffer` on every click, wraps the result in an `AudioBuffer`, and starts it on a fresh `AudioBufferSourceNode` — one full round-trip per click, so FR-005 (overlap) and FR-006 (retrigger) fall out of each click getting its own independent node rather than any explicit state tracking.

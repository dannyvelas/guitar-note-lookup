# Phase 0 Research: Click-to-Hear String Preview

## Decision: Synthesize sound with the native Web Audio API, no samples or libraries

**Rationale**: The project has no dependencies and no build step (per [plan.md](../001-chord-note-lookup/plan.md) precedent); the spec's Assumptions explicitly rule out a pre-recorded sample library. The Web Audio API (`AudioContext`, `AudioBuffer`, `AudioBufferSourceNode`) is available in all evergreen browsers and needs no bundling.

**Alternatives considered**:
- Pre-recorded audio files per note/string — rejected: would need many samples across octaves and custom tunings, adds binary assets to a project that currently has none, and contradicts the spec's Assumptions.
- A third-party audio/synth library — rejected: introduces the project's first external dependency for a feature that native browser APIs already cover.

## Decision: Karplus-Strong plucked-string synthesis for the sound itself

**Rationale**: FR-003 requires a sharp attack followed by a decaying sustain that reads as a plucked string, not a flat tone. Karplus-Strong is the standard lightweight algorithm for exactly this: it feeds a short burst of noise through a feedback delay line sized to the target pitch's period, producing a naturally decaying, harmonically rich pluck with only array math — no external assets, and cheap enough to render well within the SC-002 100ms budget.

**Alternatives considered**:
- A plain `OscillatorNode` with an ADSR gain envelope — rejected: simpler, but reads as a synth tone rather than a string per FR-003/SC-004; the existing app has no other audio precedent to match instead.
- Additive synthesis of guitar harmonics — rejected: more tunable in theory but requires hand-picking harmonic weights per string/register to sound convincing; Karplus-Strong gets string-like decay "for free" from the algorithm's structure.

## Decision: One shared `AudioContext`, created/resumed on first click; one fresh buffer + source node per trigger

**Rationale**: Browsers require an `AudioContext` to be created or resumed inside a user-gesture handler (a click qualifies), which is exactly the edge case the spec calls out — no separate "enable audio" step is needed if the context is (re)created lazily on the first click itself. Reusing one context across all subsequent clicks avoids per-click setup cost and browser limits on concurrent contexts. Giving every click its own `AudioBufferSourceNode` (Web Audio source nodes are single-use by design) is what makes overlapping strings (FR-005) and same-string retriggering (FR-006) work for free — each node plays independently and is discarded when it ends.

**Alternatives considered**:
- One long-lived, reused source node — rejected: `AudioBufferSourceNode` can only be started once; reuse would require recreating it anyway, so there's no simplification to gain, and it would block overlap/retrigger.

## Decision: Compute playback pitch from the same semitone arithmetic already in `notes.js`

**Rationale**: The note engine already represents every pitch as a semitone offset (see [data-model.md](../001-chord-note-lookup/data-model.md)); adding a single pure `frequencyForPitch` conversion (equal temperament, A4 = 440Hz) keeps pitch computation in one place, so the sound always matches the currently displayed note (FR-002, FR-007) by construction rather than by a second, independently-maintained mapping.

**Alternatives considered**:
- A hardcoded note-name → frequency lookup table — rejected: duplicates logic already in `notes.js`, and would need manual extension for pitches outside the table (e.g., unusual custom tunings), risking silent drift from the displayed note.

## Decision: Visual cue is plain CSS/markup on the existing result cell — no icon library

**Rationale**: The project has no dependencies and the existing fretboard already signals interactivity the same way (`fret-cell` uses `cursor: pointer`); reusing that pattern (pointer cursor + a small always-visible cue + a hover/focus state) on `.fretboard__result` satisfies FR-009/FR-010 without introducing an icon font or SVG library.

**Alternatives considered**:
- A tooltip shown only after some delay or first interaction — rejected: SC-003 requires the cue to be visible on first look, before any interaction; a delayed or interaction-gated cue would fail that outright.

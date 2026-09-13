# Feature Specification: Click-to-Hear String Preview

**Feature Branch**: `002-pluck-string-preview`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "could you add a feature so that when someone clicks the note at the far-right next to string `s`, it plays the note that would play if `s` were strummed? it should sound like a guitar string. also there should be some visual indication that should let users know that they can click that to hear what string `s` sounds like"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Hear a string's resulting note (Priority: P1)

While looking at the fretboard's result column, the transcriber clicks the note shown at the end of a string's row and hears that exact note played back with the sound of a plucked guitar string, so they can confirm by ear that the pitch they're about to write down is the one they expect.

**Why this priority**: This is the entire feature — an audible check against the visual note. Without playback there is nothing to test or ship.

**Independent Test**: Can be fully tested by selecting a fret on a string (or leaving it open), clicking that string's result note, and confirming the sound heard matches the pitch shown, and that it sounds like a plucked guitar string rather than a generic tone.

**Acceptance Scenarios**:

1. **Given** a string's row is showing a resulting note, **When** the user clicks that note, **Then** a sound plays at the pitch of the displayed note, with the timbre of a plucked guitar string (a quick attack followed by a decaying sustain), not a flat, sustained artificial tone.
2. **Given** a string has a fret selected, **When** the user clicks that string's result note, **Then** the sound played matches the fretted note currently shown, not the string's open note.
3. **Given** a string has no fret selected, **When** the user clicks that string's result note, **Then** the sound played matches the open-with-capo note currently shown for that string.
4. **Given** the user clicks one string's result note and then, before the sound finishes, clicks a different string's result note, **When** both sounds are triggered, **Then** each string's sound plays for the string that was clicked, and the two sounds are audible together rather than one cutting the other off.
5. **Given** the user clicks the same string's result note again while its previous sound is still playing, **When** the second click registers, **Then** the string's sound plays again from the start.
6. **Given** the user changes the tuning, capo, or fret selection for a string after previously clicking its result note, **When** the user clicks that string's result note again, **Then** the newly played sound matches the newly displayed note, not the earlier one.

---

### User Story 2 - Discover that a string's note can be played (Priority: P2)

Before ever clicking a result note, a transcriber looking at the fretboard can tell, just by looking, that the note next to each string is something they can click to hear — without needing to be told or to stumble onto it by accident.

**Why this priority**: The playback in User Story 1 only delivers value if people know it exists; without a visible cue most users will never discover or use it. It is ranked below playback itself because the sound is the feature and the cue only supports finding it.

**Independent Test**: Can be fully tested by showing the fretboard to someone unfamiliar with the feature and confirming they can identify, unprompted, that the result notes are clickable, and that the cue is present on every string's row, not just one.

**Acceptance Scenarios**:

1. **Given** the fretboard is displayed with its 6 result notes, **When** the user looks at any one of them without interacting yet, **Then** a visible cue on or around that note indicates it can be clicked to hear a sound.
2. **Given** the user points at or hovers over a result note, **When** they do so, **Then** the note responds in a way (beyond the static cue) that confirms it is an interactive control.
3. **Given** the result note for one string looks and behaves this way, **When** the user looks at the other 5 strings' result notes, **Then** each shows the same clickable cue.

---

### Edge Cases

- What happens when the user clicks a result note for a string whose tuning input is currently invalid (e.g., a rejected custom note edit)? The click MUST NOT play a sound for an invalid or indeterminate pitch; the row's existing input-validation behavior is unaffected by this feature.
- What happens when the user clicks several different strings' result notes in quick succession (simulating a strum)? Each click MUST independently trigger that string's own current sound, and sounds MAY overlap.
- What happens if the browser or device has audio muted, blocked, or unavailable? The visual cue and click behavior MUST still work as specified; the feature is not responsible for the user's audio output being audible.
- What happens when a custom tuning produces a very low or very high pitch? The sound MUST still play at that pitch as a best effort, using the same guitar-string timbre as any other note.
- What happens the very first time the user clicks anywhere on the page? The click that triggers the first sound MUST be sufficient on its own to produce audio, with no separate "enable sound" step required first.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST make each string's displayed result note a clickable control.
- **FR-002**: When a string's result note is clicked, System MUST play a sound at the exact pitch currently displayed for that string.
- **FR-003**: The played sound MUST have the character of a plucked guitar string — a sharp onset followed by a decaying sustain — rather than a flat, indefinitely sustained artificial tone.
- **FR-004**: System MUST play the fretted note's pitch when the clicked string currently has a fret selected, and the open-with-capo pitch when it does not, matching whichever note is currently shown for that string.
- **FR-005**: System MUST support triggering a string's sound independently of any other string, including while another string's sound is still playing.
- **FR-006**: System MUST allow a string's result note to be clicked again while its own previous sound is still playing, restarting that string's sound.
- **FR-007**: System MUST use the string's currently displayed note at the moment of the click, so that a click made after a tuning, capo, or selection change plays the newly displayed note rather than a stale one.
- **FR-008**: System MUST NOT play any sound when a string's currently displayed note is invalid or indeterminate (e.g., during a rejected tuning edit).
- **FR-009**: System MUST display a visual cue on every one of the 6 result notes indicating it can be clicked to hear that string's sound, visible before the user has clicked anything.
- **FR-010**: System MUST provide an additional interactive response (beyond the static visual cue) when the user points at or hovers over a result note, reinforcing that it is clickable.

### Key Entities

- **String Sound Trigger**: The click action on a string's result note; produces a guitar-string-like sound at that string's currently displayed pitch.
- **Clickability Cue**: The visual indication on each result note that signals it can be clicked, shown at rest and reinforced on hover/pointer interaction.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Clicking any of the 6 result notes plays a sound at the correct pitch 100% of the time, verified against the note currently displayed for that string.
- **SC-002**: The sound begins within 100ms of the click, so it feels like an immediate response to the click rather than a delayed effect.
- **SC-003**: In an unprompted first look at the fretboard, a new user can correctly identify that the result notes are clickable without being told, on their first attempt.
- **SC-004**: When played back, listeners identify the sound as resembling a plucked guitar string rather than a generic electronic beep.
- **SC-005**: A user can click through all 6 strings' result notes in sequence to audibly check a full chord in under 10 seconds.

## Assumptions

- "The note at the far-right next to string `s`" refers to the existing result note shown at the end of each string's row on the fretboard (the note produced by that string given its current fret selection, tuning, and capo) — not a separate, newly introduced element.
- Only one sound plays per string per click; clicking a result note does not also play the other 5 strings' notes (that would be a "strum all strings" feature, out of scope here).
- Audio playback is synthesized in the browser at the moment of the click; no pre-recorded sample library or audio files are assumed to exist elsewhere in the project.
- A single click, being a direct user interaction, is sufficient to satisfy standard browser autoplay/audio-permission restrictions; no separate "enable audio" affordance is required.
- The visual clickability cue is a static indicator (e.g., icon, styling, or label) present on every string's row at all times, reinforced by a hover/pointer state; it does not require a tutorial, tooltip text, or onboarding flow.
- Keyboard-only or assistive-technology operation of this control is not addressed by this feature; the request describes a click/tap interaction only.
- This feature only affects the result notes; the existing fretboard grid, tuning, capo, and clear behaviors from the prior chord-lookup feature are unchanged.

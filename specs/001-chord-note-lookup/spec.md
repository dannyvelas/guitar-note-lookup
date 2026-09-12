# Feature Specification: Fretboard Chord Note Lookup

**Feature Branch**: `001-chord-note-lookup`

**Created**: 2026-09-11

**Status**: Draft

**Input**: User description: "i'm trying to transcribe a guitar song to sheet music. i know the guitar is tuned \"drop D\", i know that the song is played with a capo on the second fret, for each chord, i know exactly the fret at which the guitarist is pressing a given string. also for context, i have this website `w` which shows me a guitar fretboard in drop D tuning. at the intersection of each string `s` and each fret `f`, it shows me the note that would be play if string `s` was played while it is pressed at fret `f`. here's the problem. it is a royal pain for me to transcribe this to sheet music right now. right now once i see the guitarist play a chord, i: go through all 6 strings, for each string `s`: if `s` is pressed at a given fret `f`, then go to `w` and check the note that would be played when `s` is pressed at `f`. write down that note; if `s` is not pressed, then go to `w` and check the note that would be played when is is pressed at the second fret (because of the capo). but this is slow and tedious. could you make a website that i could use where i could: specify the tuning of the guitar; specify where a capo is; on a guitar fretboard, select an intersection of a guitar string `s` and a fret `f`. i should be allowed to select multiple intersections. after i'm done selecting intersections, the app should show me 6 notes: the note that would be played when string1 is strummed, the note that would be played when string2 is strummed, etc. once i'm done, i should be able to clear the guitar fretboard and select another set of intersections."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Transcribe a chord's notes from fret positions (Priority: P1)

While watching a guitarist play a chord, the transcriber sees which fret each string is pressed at (or that a string isn't pressed at all). They select those string/fret positions on an on-screen fretboard and immediately see the resulting note for each of the 6 strings, so they can write the chord down as sheet music.

**Why this priority**: This is the entire reason for the tool — it replaces the slow, error-prone process of manually looking up one note at a time on an external reference site. Without this, there is no product.

**Independent Test**: Can be fully tested by selecting a known set of string/fret intersections (including strings left unselected) and verifying the 6 displayed notes match the notes a manual lookup would have produced.

**Acceptance Scenarios**:

1. **Given** a fretboard with a tuning and capo position already set, **When** the user selects a fret on a string, **Then** the note shown for that string reflects the pitch produced by that string at that fret.
2. **Given** a fretboard where the user has not selected any fret for a particular string, **When** the results are shown, **Then** the note displayed for that string is the note produced by that string played open with the capo in place.
3. **Given** the user has selected fret positions on several different strings, **When** they view the results, **Then** all 6 strings' notes are shown together, one per string, in string order.
4. **Given** the user has already selected a fret on a string, **When** they select a different fret on that same string, **Then** the earlier selection for that string is replaced and only the new fret is used for that string's note.

---

### User Story 2 - Configure tuning and capo before transcribing (Priority: P2)

Before transcribing a song, the transcriber sets up the fretboard to match how the guitar is actually strung and capoed: they choose the tuning (e.g., Drop D) and set the capo to the fret the guitarist is using (e.g., fret 2).

**Why this priority**: Correct results depend entirely on correct tuning and capo settings, but this is a one-time setup step per song rather than something repeated for every chord, so it ranks below the core chord-lookup flow.

**Independent Test**: Can be fully tested by changing the tuning and/or capo position and confirming that previously displayed and newly computed note results update to match the new settings.

**Acceptance Scenarios**:

1. **Given** the user has not changed any settings, **When** they open the app, **Then** the tuning is set to Drop D and the capo is set to fret 2 by default.
2. **Given** the default tuning, **When** the user selects a different tuning or edits an individual string's open note, **Then** subsequent note results reflect the new tuning.
3. **Given** a capo already set, **When** the user changes the capo fret (including removing the capo), **Then** subsequent note results for unselected strings reflect the new capo position.
4. **Given** the user changes the tuning or capo after already selecting some fret positions, **When** the change is made, **Then** the displayed notes recompute automatically to match the new settings.

---

### User Story 3 - Clear and move to the next chord (Priority: P3)

After writing down the notes for one chord, the transcriber clears the fretboard in one action and selects the fret positions for the next chord in the song, repeating this for every chord until the song is fully transcribed.

**Why this priority**: This makes the tool usable across an entire song rather than a single chord, but it is a simple reset action layered on top of the core lookup capability.

**Independent Test**: Can be fully tested by making a selection, clearing it, and confirming the fretboard and displayed notes both return to their empty/default state and are ready for a new selection.

**Acceptance Scenarios**:

1. **Given** the user has selected one or more fret positions and viewed results, **When** they trigger the clear action, **Then** all selections are removed and every string's displayed note reverts to its open-with-capo value.
2. **Given** the fretboard was just cleared, **When** the user selects a new set of fret positions, **Then** the results reflect only the new selections, with no leftover state from the previous chord.

---

### Edge Cases

- What happens when the user selects a fret at a position before (closer to the headstock than) the current capo — since a capo makes those positions physically unplayable, the fretboard MUST NOT allow selecting them.
- What happens when a string's selected fret is exactly at the capo position? It is treated as a normal fretted note, which is the same pitch as that string's open-with-capo note.
- What happens when the capo is removed (set to "no capo")? Unselected strings show their true open-string note from the tuning.
- What happens if the user selects two different frets on the same string in succession? Only the most recent selection for that string is kept; the earlier one is replaced.
- What happens when the user changes tuning or capo mid-way through selecting a chord? All displayed notes recompute immediately using the new settings and the existing selections.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow the user to specify the guitar's tuning by choosing a preset (including at least Standard and Drop D) or by setting a custom open note for each of the 6 strings individually.
- **FR-002**: System MUST default the tuning to Drop D when the user has not changed it.
- **FR-003**: System MUST allow the user to specify a capo position as a fret number, including a "no capo" option.
- **FR-004**: System MUST default the capo position to fret 2 when the user has not changed it.
- **FR-005**: System MUST display an interactive fretboard showing all 6 strings across a range of frets.
- **FR-006**: System MUST allow the user to select any string/fret intersection on the fretboard to indicate that string is being pressed at that fret.
- **FR-007**: System MUST allow the user to select intersections on multiple different strings as part of building one chord, before reading the results.
- **FR-008**: System MUST limit each string to at most one selected fret at a time; selecting a new fret on a string that already has a selection replaces the previous one for that string.
- **FR-009**: System MUST prevent selecting a fret positioned before the current capo, since a capo makes those positions unplayable.
- **FR-010**: For each string with a selected fret, System MUST compute and display the note produced by that string at that fret, based on the current tuning.
- **FR-011**: For each string without a selected fret, System MUST compute and display the note produced by that string played open with the current capo in place.
- **FR-012**: System MUST display the resulting notes for all 6 strings together, ordered by string, reflecting the current selections at all times.
- **FR-013**: System MUST recompute and update the displayed notes automatically whenever a selection is added, replaced, or cleared, or whenever the tuning or capo setting changes.
- **FR-014**: System MUST provide a single action that clears all current fret selections and returns every string's displayed note to its open-with-capo value.
- **FR-015**: System MUST allow the user to begin a new set of selections immediately after clearing, with no leftover selections from the prior chord.

### Key Entities

- **Tuning**: The open (unfretted) note for each of the 6 strings; configurable via a named preset or per-string custom values.
- **Capo**: A single fret position that, when set, defines the note produced by any string that has no fret selected; "no capo" is a valid state.
- **Fretboard Selection**: The current in-progress chord, represented as at most one selected fret per string; empty after a clear action.
- **String Note Result**: The note computed for each of the 6 strings from the current Tuning, Capo, and Fretboard Selection, shown together as the outcome of a chord lookup.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can go from seeing a guitarist's hand position to having all 6 notes of that chord identified in under 15 seconds, without consulting any external reference.
- **SC-002**: A user can transcribe an entire song's worth of chords (dozens of chords in sequence) using only this tool, without switching to or cross-referencing a separate fretboard note chart.
- **SC-003**: A first-time user can correctly set up their tuning and capo and identify the notes for their first chord within 2 minutes, without external instructions.
- **SC-004**: Given a known tuning, capo, and set of fret selections, the notes produced match manually-verified music-theory results with 100% accuracy.

## Assumptions

- The tool targets a standard 6-string guitar; other string counts (7-string, bass, etc.) are out of scope for this feature.
- Notes are represented with both pitch class and octave (e.g., "D3"), since accurate sheet-music transcription depends on the specific pitch, not just the pitch class.
- The fretboard covers a typical playable fret range (frets 0 through 24); frets beyond a standard neck are out of scope.
- This is a single-user tool for personal transcription use in one sitting; no accounts, saved sessions, or history of past chords across a song are required.
- The user manually records each chord's results into their sheet music after viewing them; exporting or saving a sequence of transcribed chords is out of scope for this feature.
- Fret selection is per string/fret cell (a simple toggle/click), not a drag or multi-touch gesture.

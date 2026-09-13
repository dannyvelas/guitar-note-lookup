# Quickstart: Click-to-Hear String Preview

## Prerequisites

- A modern browser with audio output (no install needed for using the app).
- Node.js (any current LTS) only if you want to run the unit tests.

## Run the app

No build step — same as [001-chord-note-lookup](../001-chord-note-lookup/quickstart.md):

```bash
open src/index.html          # macOS: opens directly in the default browser
# or serve it (avoids any browser file:// restrictions):
npx http-server src -p 8080  # then visit http://localhost:8080
```

## Run the unit tests

```bash
node --test tests/
```

Covers `frequencyForPitch` and `generatePluckedStringBuffer` per [contracts/string-sound.md](contracts/string-sound.md) — the parts of this feature checkable without a browser's Web Audio implementation.

## Manual validation (maps to spec.md acceptance scenarios)

1. **Visual cue before any click (User Story 2, Scenario 1)**: Open the app without clicking anything. Confirm each of the 6 result cells shows a visible cue (e.g., an icon or styling) indicating it can be clicked, not just plain text.
2. **Hover/focus reinforcement (User Story 2, Scenario 2)**: Point at (or tab to) a result cell without clicking. Confirm it visibly responds (e.g., a hover/focus state) beyond its resting appearance.
3. **Same cue on every string (User Story 2, Scenario 3)**: Check all 6 result cells show the same cue, not just one or two.
4. **Fretted note sound (User Story 1, Scenarios 1–2)**: Select a fret on string 6. Click that string's result note. Confirm you hear a plucked-string-like sound (sharp attack, decaying sustain — not a flat beep) at the pitch shown.
5. **Open-with-capo note sound (User Story 1, Scenario 3)**: Leave a string unselected. Click its result note. Confirm the sound matches that string's currently displayed open-with-capo note.
6. **Overlap (User Story 1, Scenario 4)**: Click one string's result note, then quickly click a different string's result note before the first sound ends. Confirm both are audible together, not one cutting off the other.
7. **Retrigger (User Story 1, Scenario 5)**: Click the same string's result note twice in quick succession. Confirm the second click restarts that string's sound rather than being ignored.
8. **Stale-note guard (User Story 1, Scenario 6)**: Click a string's result note, then change the tuning, capo, or that string's fret selection, then click the same result note again. Confirm the second sound matches the newly displayed note, not the first one.
9. **First-click autoplay (Edge Case)**: Reload the app fresh and, as your very first interaction with the page, click a result note. Confirm a sound plays immediately, with no separate "enable audio" step or prior click required.

## Expected outcome

All 9 checks pass by ear and by eye — this is the direct validation of SC-001 through SC-005 in `spec.md`.

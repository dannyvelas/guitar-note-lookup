const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const LETTER_BASE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/**
 * Parses a note string (e.g. "D2", "C#4") into a semitone number, where
 * octave boundaries fall at C (matching scientific pitch notation, and the
 * same convention used to write standard/Drop D open-string notes).
 */
export function parseNote(note) {
  const match = /^([A-G])(#?)(-?\d+)$/.exec(String(note).trim());
  if (!match) {
    throw new Error(`Invalid note: "${note}"`);
  }
  const [, letter, sharp, octaveStr] = match;
  const offset = LETTER_BASE[letter] + (sharp ? 1 : 0);
  return Number(octaveStr) * 12 + offset;
}

/** Converts a semitone number back into a displayable Pitch (sharp spelling only). */
export function formatPitch(semitone) {
  const octave = Math.floor(semitone / 12);
  const index = ((semitone % 12) + 12) % 12;
  const name = NOTE_NAMES[index];
  const letter = name[0];
  const accidental = name.length > 1 ? name[1] : '';
  return {
    letter,
    accidental,
    octave,
    toString() {
      return `${letter}${accidental}${octave}`;
    },
  };
}

/** Note produced by a string with the given open pitch, pressed at `fret`. */
export function pitchAtFret(openNote, fret) {
  if (!Number.isInteger(fret) || fret < 0) {
    throw new Error(`Invalid fret: ${fret}`);
  }
  const openSemitone = typeof openNote === 'string' ? parseNote(openNote) : openNote;
  return formatPitch(openSemitone + fret);
}

/**
 * A fret is only selectable strictly above the capo: fretting behind the
 * capo is physically impossible, and fretting exactly at the capo's fret is
 * redundant — the capo already stops the string there, producing the same
 * pitch as leaving it unselected.
 */
export function isFretSelectable(fret, capo) {
  return fret > capo;
}

/**
 * Computes the resulting note for all 6 strings given a tuning, a capo
 * position, and the current fret selections (absent = string not pressed).
 */
export function resolveChord(tuning, capo, selections) {
  return tuning.map(({ stringIndex, openNote }) => {
    const selectedFret = selections[stringIndex];
    const effectiveFret = selectedFret === undefined || selectedFret === null ? capo : selectedFret;
    return {
      stringIndex,
      effectiveFret,
      pitch: pitchAtFret(openNote, effectiveFret),
    };
  });
}

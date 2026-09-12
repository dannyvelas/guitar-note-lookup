import { parseNote } from './notes.js';

// String 1 = highest-pitched/thinnest string, String 6 = lowest-pitched/thickest —
// standard guitar string numbering.
export const PRESETS = {
  Standard: ['E4', 'B3', 'G3', 'D3', 'A2', 'E2'],
  'Drop D': ['E4', 'B3', 'G3', 'D3', 'A2', 'D2'],
};

/** Builds a StringTuning[6] array from a named preset (see data-model.md). */
export function presetToTuning(presetName) {
  const notes = PRESETS[presetName];
  if (!notes) {
    throw new Error(`Unknown tuning preset: "${presetName}"`);
  }
  return notes.map((openNote, i) => ({ stringIndex: i + 1, openNote }));
}

/** Drop D is the required default tuning (FR-002). */
export function getDefaultTuning() {
  return presetToTuning('Drop D');
}

/** Returns a new tuning with one string's open note overridden (FR-001). */
export function setStringOpenNote(tuning, stringIndex, openNote) {
  parseNote(openNote); // throws on invalid input; caller decides how to surface it
  return tuning.map((entry) => (entry.stringIndex === stringIndex ? { ...entry, openNote } : entry));
}

import { getDefaultTuning, presetToTuning, setStringOpenNote } from './tuning.js';
import { createFretboard } from './fretboard.js';

const DEFAULT_CAPO = 2; // FR-004
const MAX_CAPO = 12;

let tuning = getDefaultTuning(); // FR-002
let capo = DEFAULT_CAPO;

const fretboardContainer = document.getElementById('fretboard');
const tuningPresetSelect = document.getElementById('tuning-preset');
const capoInput = document.getElementById('capo-input');
const clearButton = document.getElementById('clear-button');
const errorEl = document.getElementById('settings-error');

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function clearError() {
  errorEl.hidden = true;
  errorEl.textContent = '';
}

const fretboard = createFretboard(fretboardContainer, {
  capo,
  tuning,
  onTuningChange: (stringIndex, openNoteText) => {
    try {
      tuning = setStringOpenNote(tuning, stringIndex, openNoteText);
      tuningPresetSelect.value = 'custom';
      clearError();
    } catch (err) {
      showError(err.message);
    }
    fretboard.setTuning(tuning); // re-renders the row inputs and results, reverting a rejected edit
  },
});

tuningPresetSelect.addEventListener('change', () => {
  const value = tuningPresetSelect.value;
  if (value === 'custom') {
    return;
  }
  tuning = presetToTuning(value);
  fretboard.setTuning(tuning);
  clearError();
});

capoInput.addEventListener('change', () => {
  const value = Number(capoInput.value);
  if (!Number.isInteger(value) || value < 0 || value > MAX_CAPO) {
    showError(`Capo must be a whole number between 0 and ${MAX_CAPO}.`);
    capoInput.value = String(capo);
    return;
  }
  clearError();
  capo = value; // FR-003
  fretboard.setCapo(capo); // drops now-unplayable selections (FR-009) and recomputes (FR-013)
});

clearButton.addEventListener('click', () => {
  fretboard.clear(); // FR-014, FR-015
});

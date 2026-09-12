import { resolveChord } from './notes.js';
import { getDefaultTuning, presetToTuning, setStringOpenNote } from './tuning.js';
import { createFretboard } from './fretboard.js';

const DEFAULT_CAPO = 2; // FR-004
const MAX_CAPO = 12;

let tuning = getDefaultTuning(); // FR-002
let capo = DEFAULT_CAPO;

const fretboardContainer = document.getElementById('fretboard');
const resultsContainer = document.getElementById('results');
const tuningPresetSelect = document.getElementById('tuning-preset');
const tuningStringsContainer = document.getElementById('tuning-strings');
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

function renderResults(selections) {
  const chord = resolveChord(tuning, capo, selections);
  resultsContainer.innerHTML = '';
  const list = document.createElement('ul');
  list.className = 'results-list';
  for (const { stringIndex, effectiveFret, pitch } of chord) {
    const item = document.createElement('li');
    const label = document.createElement('span');
    label.textContent = `String ${stringIndex} (fret ${effectiveFret})`;
    const value = document.createElement('strong');
    value.textContent = String(pitch);
    item.append(label, value);
    list.appendChild(item);
  }
  resultsContainer.appendChild(list);
}

function renderTuningInputs() {
  tuningStringsContainer.innerHTML = '';
  for (const { stringIndex, openNote } of tuning) {
    const wrapper = document.createElement('div');
    wrapper.className = 'tuning-string';

    const label = document.createElement('label');
    label.htmlFor = `string-${stringIndex}`;
    label.textContent = `String ${stringIndex}`;

    const input = document.createElement('input');
    input.id = `string-${stringIndex}`;
    input.type = 'text';
    input.value = openNote;
    input.addEventListener('change', () => {
      try {
        tuning = setStringOpenNote(tuning, stringIndex, input.value.trim());
        tuningPresetSelect.value = 'custom';
        clearError();
        renderResults(fretboard.getSelections());
      } catch (err) {
        showError(err.message);
        input.value = openNote;
      }
    });

    wrapper.append(label, input);
    tuningStringsContainer.appendChild(wrapper);
  }
}

const fretboard = createFretboard(fretboardContainer, {
  capo,
  onSelectionChange: renderResults,
});

tuningPresetSelect.addEventListener('change', () => {
  const value = tuningPresetSelect.value;
  if (value === 'custom') {
    return;
  }
  tuning = presetToTuning(value);
  renderTuningInputs();
  clearError();
  renderResults(fretboard.getSelections());
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

renderTuningInputs();
renderResults(fretboard.getSelections());

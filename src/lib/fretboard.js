import { isFretSelectable, pitchAtFret } from './notes.js';

const STRING_COUNT = 6;
const MAX_FRET = 24;

/**
 * Renders an interactive 6-string fretboard grid into `container` and owns
 * the current FretboardSelection (at most one fret per string).
 *
 * Each row's header doubles as that string's tuning input, and each row ends
 * with that string's resulting note (FR-010/FR-011), computed live from the
 * row's own tuning + capo + selection — no separate list to cross-reference.
 *
 * `onTuningChange(stringIndex, openNoteText)` fires when a row's note input
 * is edited; the caller validates/applies it and calls `setTuning` back with
 * the resulting tuning (whether the edit was accepted or rejected).
 *
 * `onStringSoundRequest(pitch)` fires when a row's result note is clicked,
 * with that string's currently displayed pitch at the moment of the click
 * (not a stale value captured at render time) — the caller is responsible
 * for actually playing a sound.
 */
export function createFretboard(container, { capo, tuning, onTuningChange, onStringSoundRequest }) {
  let currentCapo = capo;
  let currentTuning = tuning;
  let selections = {};

  function selectFret(stringIndex, fret) {
    if (selections[stringIndex] === fret) {
      const { [stringIndex]: _removed, ...rest } = selections;
      selections = rest;
    } else {
      selections = { ...selections, [stringIndex]: fret };
    }
    render();
  }

  function openNoteFor(stringIndex) {
    return currentTuning.find((entry) => entry.stringIndex === stringIndex).openNote;
  }

  function resultFor(stringIndex) {
    const selectedFret = selections[stringIndex];
    const effectiveFret = selectedFret === undefined ? currentCapo : selectedFret;
    return pitchAtFret(openNoteFor(stringIndex), effectiveFret);
  }

  function render() {
    container.innerHTML = '';
    const table = document.createElement('table');
    table.className = 'fretboard';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `<th></th><th colspan="${MAX_FRET + 1}"></th><th>Note</th>`;
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    // String 1 (highest-pitched) on top, String 6 (lowest-pitched) on bottom —
    // standard guitar string numbering and tab layout.
    for (let stringIndex = 1; stringIndex <= STRING_COUNT; stringIndex += 1) {
      const row = document.createElement('tr');

      const headerCell = document.createElement('th');
      headerCell.scope = 'row';

      // A `<th>` needs to stay a table-cell to line up with the row's other
      // cells, so the flex layout for its contents lives on this inner div.
      const headerContent = document.createElement('div');
      headerContent.className = 'fretboard__string-header';

      const numberLabel = document.createElement('span');
      numberLabel.className = 'fretboard__string-number';
      numberLabel.textContent = `S${stringIndex}`;

      const noteInput = document.createElement('input');
      noteInput.type = 'text';
      noteInput.className = 'fretboard__string-note';
      noteInput.value = openNoteFor(stringIndex);
      noteInput.setAttribute('aria-label', `String ${stringIndex} open note`);
      noteInput.addEventListener('change', () => {
        onTuningChange(stringIndex, noteInput.value.trim());
      });

      headerContent.append(numberLabel, noteInput);
      headerCell.appendChild(headerContent);
      row.appendChild(headerCell);

      for (let fret = 0; fret <= MAX_FRET; fret += 1) {
        const cell = document.createElement('td');
        cell.className = 'fret-cell';
        cell.textContent = String(fret);

        const selectable = isFretSelectable(fret, currentCapo);
        if (!selectable) {
          cell.classList.add('fret-cell--disabled');
          cell.setAttribute('aria-disabled', 'true');
        }
        if (selections[stringIndex] === fret) {
          cell.classList.add('fret-cell--selected');
        }
        if (selectable) {
          cell.addEventListener('click', () => selectFret(stringIndex, fret));
        }

        row.appendChild(cell);
      }

      const resultCell = document.createElement('td');
      resultCell.className = 'fretboard__result';

      const resultButton = document.createElement('button');
      resultButton.type = 'button';
      resultButton.className = 'fretboard__result-button';
      resultButton.setAttribute('aria-label', `Play string ${stringIndex}'s current note`);

      const resultText = document.createElement('span');
      resultText.className = 'fretboard__result-text';
      resultText.textContent = String(resultFor(stringIndex));

      const resultCue = document.createElement('span');
      resultCue.className = 'fretboard__result-cue';
      resultCue.setAttribute('aria-hidden', 'true');
      resultCue.textContent = '🔊';

      resultButton.append(resultText, resultCue);
      resultButton.addEventListener('click', () => {
        if (typeof onStringSoundRequest !== 'function') {
          return;
        }
        let pitch;
        try {
          pitch = resultFor(stringIndex);
        } catch {
          return; // invalid/indeterminate note — no sound (FR-008)
        }
        onStringSoundRequest(pitch);
      });

      resultCell.appendChild(resultButton);
      row.appendChild(resultCell);

      tbody.appendChild(row);
    }
    table.appendChild(tbody);
    container.appendChild(table);
  }

  function getSelections() {
    return { ...selections };
  }

  /** Applies a new capo, dropping any selection the new capo makes unplayable (FR-009). */
  function setCapo(newCapo) {
    currentCapo = newCapo;
    const kept = {};
    for (const [stringIndex, fret] of Object.entries(selections)) {
      if (isFretSelectable(fret, newCapo)) {
        kept[stringIndex] = fret;
      }
    }
    selections = kept;
    render();
  }

  function clear() {
    selections = {};
    render();
  }

  /** Replaces the tuning shown in each row's note input (e.g. after a preset change or an edit). */
  function setTuning(newTuning) {
    currentTuning = newTuning;
    render();
  }

  render();

  return { setCapo, setTuning, clear, getSelections };
}

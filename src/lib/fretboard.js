import { isFretSelectable } from './notes.js';

const STRING_COUNT = 6;
const MAX_FRET = 24;

/**
 * Renders an interactive 6-string fretboard grid into `container` and owns
 * the current FretboardSelection (at most one fret per string).
 *
 * Each row's header doubles as that string's tuning input, so there's no
 * separate list to visually cross-reference against which row is which
 * string — editing a string's open note happens right on its own row.
 *
 * `onSelectionChange(selections)` fires after every selection, capo change,
 * or clear, with a plain { stringIndex: fret } map (FR-013).
 * `onTuningChange(stringIndex, openNoteText)` fires when a row's note input
 * is edited; the caller validates/applies it and calls `setTuning` back with
 * the resulting tuning (whether the edit was accepted or rejected).
 */
export function createFretboard(container, { capo, tuning, onSelectionChange, onTuningChange }) {
  let currentCapo = capo;
  let currentTuning = tuning;
  let selections = {};

  function selectFret(stringIndex, fret) {
    selections = { ...selections, [stringIndex]: fret };
    render();
    onSelectionChange(getSelections());
  }

  function openNoteFor(stringIndex) {
    return currentTuning.find((entry) => entry.stringIndex === stringIndex).openNote;
  }

  function render() {
    container.innerHTML = '';
    const table = document.createElement('table');
    table.className = 'fretboard';

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
      table.appendChild(row);
    }
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
    onSelectionChange(getSelections());
  }

  function clear() {
    selections = {};
    render();
    onSelectionChange(getSelections());
  }

  /** Replaces the tuning shown in each row's note input (e.g. after a preset change or an edit). */
  function setTuning(newTuning) {
    currentTuning = newTuning;
    render();
  }

  render();

  return { setCapo, setTuning, clear, getSelections };
}

import { isFretSelectable } from './notes.js';

const STRING_COUNT = 6;
const MAX_FRET = 24;

/**
 * Renders an interactive 6-string fretboard grid into `container` and owns
 * the current FretboardSelection (at most one fret per string).
 *
 * `onSelectionChange(selections)` fires after every selection, capo change,
 * or clear, with a plain { stringIndex: fret } map (FR-013).
 */
export function createFretboard(container, { capo, onSelectionChange }) {
  let currentCapo = capo;
  let selections = {};

  function selectFret(stringIndex, fret) {
    selections = { ...selections, [stringIndex]: fret };
    render();
    onSelectionChange(getSelections());
  }

  function render() {
    container.innerHTML = '';
    const table = document.createElement('table');
    table.className = 'fretboard';

    // String 1 (highest-pitched) on top, String 6 (lowest-pitched) on bottom —
    // standard guitar string numbering and tab layout.
    for (let stringIndex = 1; stringIndex <= STRING_COUNT; stringIndex += 1) {
      const row = document.createElement('tr');

      const label = document.createElement('th');
      label.scope = 'row';
      label.textContent = `S${stringIndex}`;
      row.appendChild(label);

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

  render();

  return { setCapo, clear, getSelections };
}

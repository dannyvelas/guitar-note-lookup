import { isFretSelectable, pitchAtFret } from './notes.js';

const STRING_COUNT = 6;
const MAX_FRET = 24;

// Shared with every <th> in the fretboard table (both the thead row and
// each string row's own header cell) — reproduces the old
// `table.fretboard th` rule, including its sticky-header override of the
// shared border rule's min-width/padding (T010).
const TH_CLASSES =
  'border border-app-border h-11 text-center text-[0.85rem] sticky left-0 bg-app-bg min-w-[110px] px-2 py-1';

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
    table.className = 'border-collapse touch-manipulation';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `<th class="${TH_CLASSES}"></th><th colspan="${MAX_FRET + 1}" class="${TH_CLASSES}"></th><th class="${TH_CLASSES}">Note</th>`;
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    // String 1 (highest-pitched) on top, String 6 (lowest-pitched) on bottom —
    // standard guitar string numbering and tab layout.
    for (let stringIndex = 1; stringIndex <= STRING_COUNT; stringIndex += 1) {
      const row = document.createElement('tr');

      const headerCell = document.createElement('th');
      headerCell.scope = 'row';
      headerCell.className = TH_CLASSES;

      // A `<th>` needs to stay a table-cell to line up with the row's other
      // cells, so the flex layout for its contents lives on this inner div.
      const headerContent = document.createElement('div');
      headerContent.className = 'flex items-center justify-start gap-1.5 whitespace-nowrap';

      const numberLabel = document.createElement('span');
      numberLabel.className = 'font-bold text-[0.8rem] shrink-0';
      numberLabel.textContent = `S${stringIndex}`;

      const noteInput = document.createElement('input');
      noteInput.type = 'text';
      noteInput.className = 'w-[3.5em] min-h-8 text-[0.85rem] py-0.5 px-1 text-center';
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
        const selectable = isFretSelectable(fret, currentCapo);
        const isSelected = selections[stringIndex] === fret;
        // Selected implies selectable in practice (setCapo prunes any
        // selection the new capo makes unselectable), so these two states
        // never actually overlap — but selected is checked first to match
        // the old CSS's cascade order (`.fret-cell--selected` came after
        // `.fret-cell--disabled` in src/styles.css) in case that ever changes.
        const stateClasses = isSelected
          ? 'bg-app-accent text-white font-bold'
          : selectable
            ? ''
            : 'bg-app-disabled-bg text-app-disabled-fg';
        const cursorClass = !selectable && !isSelected ? 'cursor-not-allowed' : 'cursor-pointer';
        cell.className =
          `border border-app-border min-w-11 h-11 text-center p-1 text-[0.85rem] select-none ${cursorClass}${stateClasses ? ` ${stateClasses}` : ''}`;
        cell.textContent = String(fret);

        if (!selectable) {
          cell.setAttribute('aria-disabled', 'true');
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

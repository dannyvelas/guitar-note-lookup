import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pitchAtFret, resolveChord, isFretSelectable } from '../src/lib/notes.js';

test('pitchAtFret: plain fret offset', () => {
  assert.equal(String(pitchAtFret('D2', 3)), 'F2');
});

test('pitchAtFret: produces a sharp accidental', () => {
  assert.equal(String(pitchAtFret('D2', 1)), 'D#2');
});

test('pitchAtFret: rolls over into the next octave', () => {
  assert.equal(String(pitchAtFret('B2', 2)), 'C#3');
});

test('resolveChord: fretted string uses the selected fret (FR-010)', () => {
  const tuning = [{ stringIndex: 6, openNote: 'D2' }];
  const [result] = resolveChord(tuning, 2, { 6: 3 });
  assert.equal(result.effectiveFret, 3);
  assert.equal(String(result.pitch), 'F2');
});

test('resolveChord: unselected string resolves to open-with-capo (FR-011)', () => {
  const tuning = [{ stringIndex: 5, openNote: 'A2' }];
  const [result] = resolveChord(tuning, 2, {});
  assert.equal(result.effectiveFret, 2);
  assert.equal(String(result.pitch), 'B2');
});

test('resolveChord: returns every string ordered by string index (FR-012)', () => {
  const tuning = [
    { stringIndex: 1, openNote: 'E4' },
    { stringIndex: 2, openNote: 'B3' },
  ];
  const chord = resolveChord(tuning, 0, {});
  assert.deepEqual(chord.map((c) => c.stringIndex), [1, 2]);
});

test('resolveChord: supports a custom (non-preset) tuning', () => {
  const tuning = [{ stringIndex: 6, openNote: 'C2' }];
  const [result] = resolveChord(tuning, 0, { 6: 5 });
  assert.equal(String(result.pitch), 'F2');
});

test('resolveChord: capo = 0 ("no capo") uses the true open note', () => {
  const tuning = [{ stringIndex: 6, openNote: 'D2' }];
  const [result] = resolveChord(tuning, 0, {});
  assert.equal(result.effectiveFret, 0);
  assert.equal(String(result.pitch), 'D2');
});

test('isFretSelectable: rejects frets before the capo', () => {
  assert.equal(isFretSelectable(1, 2), false);
  assert.equal(isFretSelectable(2, 2), true);
  assert.equal(isFretSelectable(5, 2), true);
});

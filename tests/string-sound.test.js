import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generatePluckedStringBuffer } from '../src/lib/string-sound.js';

function maxAbs(samples) {
  let max = 0;
  for (const value of samples) {
    max = Math.max(max, Math.abs(value));
  }
  return max;
}

function rms(samples) {
  let sumSquares = 0;
  for (const value of samples) {
    sumSquares += value * value;
  }
  return Math.sqrt(sumSquares / samples.length);
}

test('generatePluckedStringBuffer: output length equals sampleRate * durationSeconds', () => {
  const buffer = generatePluckedStringBuffer(200, 8000, 1);
  assert.equal(buffer.length, 8000);
});

test('generatePluckedStringBuffer: peak amplitude occurs near the start, not the end', () => {
  const buffer = generatePluckedStringBuffer(200, 8000, 1.5);
  const firstTenth = buffer.slice(0, Math.floor(buffer.length * 0.1));
  const lastTenth = buffer.slice(-Math.floor(buffer.length * 0.1));
  assert.ok(
    maxAbs(firstTenth) > maxAbs(lastTenth),
    `expected the first tenth's peak (${maxAbs(firstTenth)}) to exceed the last tenth's (${maxAbs(lastTenth)})`,
  );
});

test('generatePluckedStringBuffer: amplitude decays toward silence by the end (not a flat sustained tone)', () => {
  const buffer = generatePluckedStringBuffer(200, 8000, 1.5);
  const lastTenth = buffer.slice(-Math.floor(buffer.length * 0.1));
  assert.ok(rms(lastTenth) < 0.05, `expected near-silence by the end, got rms=${rms(lastTenth)}`);
});

import { frequencyForPitch } from './notes.js';

const PLUCK_DURATION_SECONDS = 1.5;
const DECAY_FACTOR = 0.996;

/**
 * Renders one Karplus-Strong plucked-string waveform as raw samples: a short
 * burst of noise is fed through a feedback delay line sized to the target
 * pitch's period, and averaging each adjacent pair of samples on every loop
 * (plus a small extra decay factor) is what gives the naturally decaying,
 * string-like timbre described in research.md — not a flat, sustained tone.
 */
export function generatePluckedStringBuffer(frequencyHz, sampleRate, durationSeconds) {
  const totalSamples = Math.round(sampleRate * durationSeconds);
  const delayLineLength = Math.max(2, Math.round(sampleRate / frequencyHz));

  const delayLine = new Float32Array(delayLineLength);
  for (let i = 0; i < delayLineLength; i += 1) {
    delayLine[i] = Math.random() * 2 - 1;
  }

  const output = new Float32Array(totalSamples);
  let writeIndex = 0;
  for (let i = 0; i < totalSamples; i += 1) {
    const current = delayLine[writeIndex];
    const next = delayLine[(writeIndex + 1) % delayLineLength];
    output[i] = current;
    delayLine[writeIndex] = 0.5 * (current + next) * DECAY_FACTOR;
    writeIndex = (writeIndex + 1) % delayLineLength;
  }

  return output;
}

/**
 * Lazily creates (and resumes) one shared `AudioContext` on first use — so
 * the very first click plays sound with no separate "enable audio" step,
 * since creating/resuming it inside the click handler satisfies the browser's
 * user-gesture requirement for autoplay. Every `play` call renders a fresh
 * buffer and starts it on its own source node, so overlapping strings and
 * same-string retriggers each play independently (FR-005, FR-006).
 */
export function createStringSoundPlayer() {
  let audioContext = null;

  function ensureContext() {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContextClass();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    return audioContext;
  }

  function play(pitch) {
    const context = ensureContext();
    const frequencyHz = frequencyForPitch(pitch);
    const samples = generatePluckedStringBuffer(frequencyHz, context.sampleRate, PLUCK_DURATION_SECONDS);

    const buffer = context.createBuffer(1, samples.length, context.sampleRate);
    buffer.copyToChannel(samples, 0);

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start();
  }

  return { play };
}

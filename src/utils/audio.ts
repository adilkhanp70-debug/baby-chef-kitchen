/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
};

export const playNote = (freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.2) => {
  initAudio();
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
};

export const playCollect = () => {
  playNote(600, 0.1, 'sine', 0.1);
  setTimeout(() => playNote(800, 0.1, 'sine', 0.1), 50);
};

export const playError = () => {
  playNote(200, 0.3, 'sawtooth', 0.1);
};

export const playMatch = () => {
  playNote(500, 0.1, 'sine', 0.1);
  setTimeout(() => playNote(700, 0.1, 'sine', 0.1), 100);
  setTimeout(() => playNote(1000, 0.2, 'sine', 0.15), 200);
};

export const playTap = () => {
  playNote(400, 0.05, 'triangle', 0.1);
};

"use client";

// Two tiny synthesized UI sounds for the Guardia Parent phone preview — no
// audio files to ship, just short Web Audio oscillator blips triggered
// directly from click handlers (so they satisfy the browser's
// user-gesture requirement for audio).

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function blip(freq: number, offset: number, duration: number, type: OscillatorType, gainLevel: number) {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const start = audioCtx.currentTime + offset;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(gainLevel, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(start);
  osc.stop(start + duration);
}

/** Soft tap — app icon opens, tab switches, home/back presses. */
export function playTapSound() {
  blip(880, 0, 0.05, "sine", 0.05);
}

/** Two-tone click — locking descends in pitch, unlocking rises. */
export function playLockSound(locking: boolean) {
  const [f1, f2] = locking ? [700, 420] : [420, 700];
  blip(f1, 0, 0.06, "square", 0.045);
  blip(f2, 0.07, 0.06, "square", 0.045);
}

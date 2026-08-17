// Audio feedback utility using Web Audio API for rewarding, pleasant tactile sounds
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch (e) {
    console.error('AudioContext init error:', e);
    return null;
  }
}

/**
 * Plays a pleasant, harmonic, uplifting completion chime for checking off a task.
 * Designed with a warm acoustic kalimba/crystal chime aesthetic (F#5 -> B5 harmonic chime).
 */
export function playTaskCompleteSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Master gain node for gentle volume control
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.28, now);
    masterGain.connect(ctx.destination);

    // 1. Subtle tactile pop transient (soft organic click)
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'sine';
    clickOsc.frequency.setValueAtTime(320, now);
    clickOsc.frequency.exponentialRampToValueAtTime(80, now + 0.04);
    clickGain.gain.setValueAtTime(0.3, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    clickOsc.connect(clickGain);
    clickGain.connect(masterGain);
    clickOsc.start(now);
    clickOsc.stop(now + 0.05);

    // 2. Primary crystal harmonic chime (Tone 1: E5 ~659 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now + 0.01); // E5
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.4, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start(now + 0.01);
    osc1.stop(now + 0.36);

    // 3. Bright uplifting resolution overtone (Tone 2: B5 ~987.77 Hz - perfect fifth above)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.06); // B5
    gain2.gain.setValueAtTime(0.001, now + 0.05);
    gain2.gain.linearRampToValueAtTime(0.45, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    // Subtle warm overtone with triangle wave
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(1318.5, now + 0.06); // E6 (sparkle harmonic)
    gain3.gain.setValueAtTime(0.001, now + 0.05);
    gain3.gain.linearRampToValueAtTime(0.08, now + 0.08);
    gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.46);

    osc3.connect(gain3);
    gain3.connect(masterGain);
    osc3.start(now + 0.05);
    osc3.stop(now + 0.35);
  } catch (e) {
    console.error('Error playing complete sound:', e);
  }
}

/**
 * Plays a soft, subtle low tone when unchecking a task.
 */
export function playTaskUncheckSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.18, now);
    masterGain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.13);
  } catch (e) {
    console.error('Error playing uncheck sound:', e);
  }
}

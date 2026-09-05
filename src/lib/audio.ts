// Gentle Web Audio Synthesizer for 432Hz ambient mindfulness attunement chime
let audioCtx: AudioContext | null = null;

export function playMindfulChime(volumeMultiplier = 0.3): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    // Harmonic meditative chord based around 432Hz (432Hz, 540Hz, 648Hz, 864Hz)
    const frequencies = [432, 540, 648, 864];

    frequencies.forEach((freq, idx) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      // Soft envelope: slow attack, long serene exponential decay
      const startTime = now + idx * 0.08;
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.08 * volumeMultiplier, startTime + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.00001, startTime + 2.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + 3.0);
    });
  } catch (err) {
    console.debug('Audio chime unable to play:', err);
  }
}

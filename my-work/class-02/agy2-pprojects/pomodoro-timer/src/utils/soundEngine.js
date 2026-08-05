// Web Audio API Procedural Audio Synthesizer
let audioCtx = null;
let ambientSourceNode = null;
let ambientGainNode = null;
let ambientFilterNode = null;
let ambientModulator = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play completion chime synthesized via Web Audio API
 */
export function playChime(type = 'singing-bowl', volume = 0.7) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume * 0.8, ctx.currentTime);
  masterGain.connect(ctx.destination);

  if (type === 'singing-bowl') {
    // Tibetan Singing Bowl: Fundamental + rich overtones
    const freqs = [216, 432, 648, 864];
    const gains = [0.6, 0.3, 0.15, 0.08];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Micro detune for warm beating effect
      if (idx > 0) osc.detune.setValueAtTime(idx * 2.5, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(gains[idx], ctx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 4.5);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start();
      osc.stop(ctx.currentTime + 4.5);
    });
  } else if (type === 'gentle-chime') {
    // 3-note ascending crystalline chime (C5 - E5 - G5)
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + i * 0.15;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.4, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.5);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(startTime);
      osc.stop(startTime + 2.5);
    });
  } else if (type === 'warm-gong') {
    // Warm Gong
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 3);

    gain.gain.setValueAtTime(0.7, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.5);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start();
    osc.stop(ctx.currentTime + 3.5);
  }
}

/**
 * Play a subtle tick click sound
 */
export function playTick(volume = 0.2) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.015);

  gain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.015);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.015);
}

/**
 * Helper to generate white/pink/brown noise audio buffer
 */
function createNoiseBuffer(ctx, type = 'pink') {
  const bufferSize = 5 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (type === 'brown' || type === 'ocean') {
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Gain compensation
    }
  } else if (type === 'pink' || type === 'rain') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11;
      b6 = white * 0.115926;
    }
  } else {
    // Standard white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }
  return buffer;
}

/**
 * Start or stop procedural ambient soundscape
 */
export function setAmbientSound(type = 'none', volume = 0.5) {
  stopAmbientSound();

  if (type === 'none') return;

  const ctx = getAudioContext();
  if (!ctx) return;

  ambientGainNode = ctx.createGain();
  ambientGainNode.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
  ambientGainNode.connect(ctx.destination);

  if (type === 'zen') {
    // Deep Zen Binaural Drone (108Hz + 112Hz)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const merger = ctx.createChannelMerger(2);

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(108, ctx.currentTime);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(112, ctx.currentTime);

    osc1.connect(merger, 0, 0);
    osc2.connect(merger, 0, 1);
    merger.connect(ambientGainNode);

    osc1.start();
    osc2.start();

    ambientSourceNode = {
      stop: () => {
        try {
          osc1.stop();
          osc2.stop();
        } catch (e) {}
      }
    };
  } else {
    // Noise-based soundscape (Rain, Ocean, Pink Noise)
    const noiseBuffer = createNoiseBuffer(ctx, type);
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    ambientFilterNode = ctx.createBiquadFilter();

    if (type === 'ocean') {
      // Ocean wave modulation filter
      ambientFilterNode.type = 'lowpass';
      ambientFilterNode.frequency.setValueAtTime(350, ctx.currentTime);

      // Create LFO for wave swells (0.1 Hz)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.08, ctx.currentTime);
      lfoGain.gain.setValueAtTime(250, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(ambientFilterNode.frequency);
      lfo.start();
      ambientModulator = lfo;
    } else if (type === 'rain') {
      ambientFilterNode.type = 'lowpass';
      ambientFilterNode.frequency.setValueAtTime(1200, ctx.currentTime);
    } else {
      // Pink / Soft noise
      ambientFilterNode.type = 'lowpass';
      ambientFilterNode.frequency.setValueAtTime(2200, ctx.currentTime);
    }

    source.connect(ambientFilterNode);
    ambientFilterNode.connect(ambientGainNode);
    source.start();
    ambientSourceNode = source;
  }
}

export function updateAmbientVolume(volume) {
  if (ambientGainNode && audioCtx) {
    ambientGainNode.gain.setValueAtTime(volume * 0.4, audioCtx.currentTime);
  }
}

export function stopAmbientSound() {
  if (ambientSourceNode) {
    try {
      ambientSourceNode.stop();
    } catch (e) {}
    ambientSourceNode = null;
  }
  if (ambientModulator) {
    try {
      ambientModulator.stop();
    } catch (e) {}
    ambientModulator = null;
  }
  ambientGainNode = null;
  ambientFilterNode = null;
}

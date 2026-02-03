class SoundSystem {
   constructor() {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3; // volume
      this.masterGain.connect(this.ctx.destination);
      this.enabled = true;
   }

   playTone(freq, type, duration, startTime = 0) {
      if (!this.enabled) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.value = freq;
      osc.type = type;
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(this.ctx.currentTime + startTime);

      // Envelope
      gain.gain.setValueAtTime(0, this.ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startTime + duration);

      osc.stop(this.ctx.currentTime + startTime + duration);
   }

   playUnlock() {
      if (this.ctx.state === "suspended") this.ctx.resume();
      // High tech chirp
      this.playTone(1200, "sine", 0.1, 0);
      this.playTone(2000, "sine", 0.1, 0.05);
   }

   playLevelComplete() {
      if (this.ctx.state === "suspended") this.ctx.resume();
      // Success chord
      this.playTone(440, "sine", 0.3, 0);
      this.playTone(554, "sine", 0.3, 0.05);
      this.playTone(659, "sine", 0.5, 0.1);
   }

   playMissionComplete() {
      if (this.ctx.state === "suspended") this.ctx.resume();
      // Grand victory
      this.playTone(523.25, "triangle", 0.4, 0); // C5
      this.playTone(659.25, "triangle", 0.4, 0.15); // E5
      this.playTone(783.99, "triangle", 0.4, 0.3); // G5
      this.playTone(1046.5, "square", 0.8, 0.45); // C6
   }

   playFail() {
      if (this.ctx.state === "suspended") this.ctx.resume();
      // Digital Failure
      this.playTone(150, "sawtooth", 0.4, 0);
      this.playTone(120, "sawtooth", 0.4, 0.2);
      this.playTone(80, "sawtooth", 0.6, 0.4);
   }

   playBeep() {
      if (this.ctx.state === "suspended") this.ctx.resume();
      this.playTone(800, "square", 0.05, 0);
   }

   playAlert() {
      if (this.ctx.state === "suspended") this.ctx.resume();
      // Rapid siren
      for (let i = 0; i < 5; i++) {
         this.playTone(800, "sawtooth", 0.1, i * 0.15);
         this.playTone(600, "sawtooth", 0.1, i * 0.15 + 0.07);
      }
   }

   playTypingSound() {
      if (this.ctx.state === "suspended") this.ctx.resume();
      // Short click using noise buffer
      if (!this.noiseBuffer) {
         const bufferSize = this.ctx.sampleRate * 0.05; // 0.05s buffer
         this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
         const data = this.noiseBuffer.getChannelData(0);
         for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
         }
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.05, this.ctx.currentTime); // Low volume
      noiseGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

      noise.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noise.start();
   }

   playClick() {
      if (this.ctx.state === "suspended") this.ctx.resume();
      // Heavy mechanical latch sound
      this.playTone(150, "square", 0.05, 0);
      this.playTone(600, "sine", 0.02, 0); // sharp transient
   }

   startAmbient() {
      if (this.ctx.state === "suspended") this.ctx.resume();
      if (this.ambientStarted) return;
      this.ambientStarted = true;

      // Low hum drone
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(40, this.ctx.currentTime);
      g.gain.setValueAtTime(0.05, this.ctx.currentTime);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start();

      // Subtle data wave
      const lfo = this.ctx.createOscillator();
      const lfoG = this.ctx.createGain();
      lfo.type = "triangle";
      lfo.frequency.setValueAtTime(0.5, this.ctx.currentTime);
      lfoG.gain.setValueAtTime(0.02, this.ctx.currentTime);
      lfo.connect(lfoG);
      lfoG.connect(this.masterGain);
      lfo.start();
   }

   playGlitchSound() {
      if (this.ctx.state === "suspended") this.ctx.resume();
      for (let i = 0; i < 10; i++) {
         this.playTone(100 + Math.random() * 500, "square", 0.05, i * 0.02);
      }
   }
}

const SFX = new SoundSystem();

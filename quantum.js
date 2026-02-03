/**
 * SPECTRAL DECODER // QUANTUM GHOST ENGINE
 * Waveform synchronization protocol.
 */

class QuantumGhost {
   constructor() {
      this.canvas = document.getElementById("spectralCanvas");
      this.ctx = this.canvas.getContext("2d");
      this.resize();
      window.addEventListener("resize", () => this.resize());

      this.celebrationCanvas = document.getElementById("celebration-canvas");
      this.cctx = this.celebrationCanvas.getContext("2d");
      this.resizeCelebration();
      window.addEventListener("resize", () => this.resizeCelebration());

      this.currentPhase = 1;
      this.totalPhases = 5;
      this.isMissionStarted = false;
      this.isPaused = true;
      this.particles = [];
      this.isVictory = false;

      this.initPhase();

      this.keys = {};
      this.timer = 480; // 8 minutes total
      this.syncLevel = 0;
      this.isFinished = false;

      this.bindEvents();
      this.loop();
   }

   initPhase() {
      // Reset player matching params
      this.player = {
         amp: 0.5,
         freq: 0.02,
         phase: 0,
      };

      // Increase difficulty based on phase
      const difficultyMult = 1 + (this.currentPhase - 1) * 0.2;

      this.target = {
         amp: 0.2 + Math.random() * 0.6,
         freq: 0.01 + Math.random() * 0.05,
         phase: Math.random() * Math.PI * 2,
         drift: 0.005 * difficultyMult,
      };

      // Force initial distance
      if (Math.abs(this.target.amp - this.player.amp) < 0.2) this.target.amp += 0.3;
      if (Math.abs(this.target.freq - this.player.freq) < 0.015) this.target.freq += 0.02;

      document.getElementById("phase-val").innerText = `PHASE 0${this.currentPhase} / 05`;
      document.getElementById("breach-status").innerText = "INITIALIZING SYNC...";
      document.getElementById("breach-status").style.color = "#fff";
      this.isFinished = false;
   }

   resize() {
      this.canvas.width = this.canvas.offsetWidth * 2;
      this.canvas.height = this.canvas.offsetHeight * 2;
   }

   bindEvents() {
      window.addEventListener("keydown", (e) => (this.keys[e.code] = true));
      window.addEventListener("keyup", (e) => (this.keys[e.code] = false));

      document.getElementById("accept-mission-btn").addEventListener("click", () => {
         this.isMissionStarted = true;
         this.isPaused = false;
         document.getElementById("mission-briefing").classList.remove("active");
      });

      document.getElementById("modal-btn").addEventListener("click", () => {
         if (this.currentPhase < this.totalPhases) {
            this.currentPhase++;
            this.initPhase();
            this.isPaused = false;
            document.getElementById("overlay").classList.remove("active");
         } else {
            window.location.href = "index.html"; // Final Victory
         }
      });
   }

   update() {
      if (this.isFinished || this.isPaused || !this.isMissionStarted) return;

      const delta = 0.016;
      this.timer -= delta;

      // Controls
      if (this.keys["KeyW"]) this.player.amp = Math.min(1.0, this.player.amp + 0.01);
      if (this.keys["KeyS"]) this.player.amp = Math.max(0.0, this.player.amp - 0.01);
      if (this.keys["KeyD"]) this.player.freq = Math.min(0.08, this.player.freq + 0.0005);
      if (this.keys["KeyA"]) this.player.freq = Math.max(0.005, this.player.freq - 0.0005);
      if (this.keys["KeyE"]) this.player.phase += 0.05;
      if (this.keys["KeyQ"]) this.player.phase -= 0.05;

      // Auto-Shift Target Phase for difficulty
      this.target.phase += this.target.drift;

      // Calculate Sync (Weighted & Circular)
      const aDiff = Math.abs(this.player.amp - this.target.amp);
      const fDiff = Math.min(1.0, Math.abs(this.player.freq - this.target.freq) / 0.05);

      let pDiff = Math.abs((this.player.phase % (Math.PI * 2)) - (this.target.phase % (Math.PI * 2)));
      if (pDiff > Math.PI) pDiff = Math.PI * 2 - pDiff;
      const pDiffNorm = pDiff / Math.PI;

      const totalScore = aDiff * 0.2 + fDiff * 0.5 + pDiffNorm * 0.3;
      this.syncLevel = Math.max(0, (1.0 - totalScore) * 100);

      // UI Update
      document.getElementById("amp-meter").style.width = `${this.player.amp * 100}%`;
      const freqPct = ((this.player.freq - 0.005) / (0.08 - 0.005)) * 100;
      document.getElementById("freq-meter").style.width = `${freqPct}%`;
      document.getElementById("phase-meter").style.width = `${((this.player.phase % (Math.PI * 2)) / (Math.PI * 2)) * 100}%`;
      document.getElementById("sync-val").innerText = `${Math.floor(this.syncLevel)}%`;

      if (this.syncLevel > 95) {
         this.complete();
      }

      // Timer Display
      const m = Math.floor(this.timer / 60);
      const s = Math.floor(this.timer % 60);
      document.getElementById("timer-val").innerText = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
   }

   complete() {
      this.isFinished = true;
      this.isPaused = true;

      const modal = document.getElementById("overlay");
      const title = document.getElementById("modal-title");
      const msg = document.getElementById("modal-msg");
      const btn = document.getElementById("modal-btn");
      const loot = document.getElementById("loot-status");

      if (this.currentPhase < this.totalPhases) {
         title.innerText = "PHASE STABILIZED";
         msg.innerText = `Quantum Layer 0${this.currentPhase} decrypted. Proceeding to deeper encryption.`;
         btn.innerText = "NEXT PHASE";
         loot.classList.remove("active");
      } else {
         this.isVictory = true;
         localStorage.setItem("m2_cleared", "true"); // Persist Mission 2 Completion
         title.innerText = "MISSION ACCOMPLISHED";
         msg.innerText = "SILICON VALLEY QUANTUM CORE BREACHED. ALL SPECTRAL KEYS COLLECTED.";
         loot.innerText = "LOOTED: QUANTUM ENCRYPTION KEY";
         loot.classList.add("active");
         btn.innerText = "RE-INITIALIZE TOTAL HUB";

         // Spawn Quantum Fireworks
         for (let i = 0; i < 15; i++) {
            setTimeout(() => this.spawnFirework(), i * 400);
         }
      }

      setTimeout(() => modal.classList.add("active"), 1000);
      document.getElementById("breach-status").innerText = "SYNC COMPLETE";
      document.getElementById("breach-status").style.color = "#00f2ff";
   }

   draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      const w = this.canvas.width;
      const h = this.canvas.height;
      const cy = h / 2;

      // Draw Grid
      this.ctx.strokeStyle = "rgba(0, 242, 255, 0.05)";
      this.ctx.lineWidth = 1;
      for (let i = 0; i < w; i += 100) {
         this.ctx.beginPath();
         this.ctx.moveTo(i, 0);
         this.ctx.lineTo(i, h);
         this.ctx.stroke();
      }

      // Draw Target Wave (Ghostly Pink)
      this.ctx.beginPath();
      this.ctx.strokeStyle = "#ff00ea";
      this.ctx.lineWidth = 3;
      this.ctx.setLineDash([5, 15]);
      for (let x = 0; x < w; x += 5) {
         const y = cy + Math.sin(x * this.target.freq + this.target.phase) * ((this.target.amp * h) / 3);
         if (x === 0) this.ctx.moveTo(x, y);
         else this.ctx.lineTo(x, y);
      }
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      // Draw Player Wave (Neon Cyan)
      this.ctx.beginPath();
      this.ctx.strokeStyle = "#00f2ff";
      this.ctx.lineWidth = 4;
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = "#00f2ff";
      for (let x = 0; x < w; x += 2) {
         const y = cy + Math.sin(x * this.player.freq + this.player.phase) * ((this.player.amp * h) / 3);
         if (x === 0) this.ctx.moveTo(x, y);
         else this.ctx.lineTo(x, y);
      }
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;

      // Particle Glow on Sync
      if (this.syncLevel > 50) {
         const syncFactor = (this.syncLevel - 50) / 100;
         this.ctx.fillStyle = `rgba(255, 255, 255, ${syncFactor})`;
         for (let i = 0; i < 20; i++) {
            const px = Math.random() * w;
            const py = cy + Math.sin(px * this.player.freq + this.player.phase) * ((this.player.amp * h) / 3);
            this.ctx.beginPath();
            this.ctx.arc(px, py, Math.random() * 3, 0, Math.PI * 2);
            this.ctx.fill();
         }
      }
   }

   spawnFirework() {
      const x = Math.random() * this.celebrationCanvas.width;
      const y = Math.random() * this.celebrationCanvas.height;
      const colors = ["#00f2ff", "#ff00ea", "#ffffff"];
      for (let i = 0; i < 40; i++) {
         this.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            size: Math.random() * 4 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1.0,
            decay: 0.01 + Math.random() * 0.02,
         });
      }
   }

   updateParticles() {
      for (let i = this.particles.length - 1; i >= 0; i--) {
         const p = this.particles[i];
         p.x += p.vx;
         p.y += p.vy;
         p.vy += 0.1; // Gravity
         p.life -= p.decay;
         if (p.life <= 0) this.particles.splice(i, 1);
      }
   }

   drawCelebration() {
      this.cctx.clearRect(0, 0, this.celebrationCanvas.width, this.celebrationCanvas.height);
      this.particles.forEach((p) => {
         this.cctx.globalAlpha = p.life;
         this.cctx.fillStyle = p.color;
         this.cctx.shadowBlur = 10;
         this.cctx.shadowColor = p.color;
         this.cctx.beginPath();
         this.cctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
         this.cctx.fill();
      });
      this.cctx.globalAlpha = 1.0;
      this.cctx.shadowBlur = 0;
   }

   resizeCelebration() {
      this.celebrationCanvas.width = window.innerWidth * 2;
      this.celebrationCanvas.height = window.innerHeight * 2;
   }

   loop() {
      this.update();
      this.draw();
      this.updateParticles();
      this.drawCelebration();
      requestAnimationFrame(() => this.loop());
   }
}

window.onload = () => new QuantumGhost();

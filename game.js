/**
 * SECURE BREAK // ADVANCED DECRYPTION CORE
 * Multi-layer security dismantling protocol.
 */

class LockGame {
   constructor() {
      this.canvas = document.getElementById("lockCanvas");
      this.ctx = this.canvas.getContext("2d");
      this.canvas.width = 1000;
      this.canvas.height = 1000;

      this.celebrationCanvas = document.getElementById("celebration-canvas");
      this.cctx = this.celebrationCanvas.getContext("2d");
      this.resizeCelebration();
      window.addEventListener("resize", () => this.resizeCelebration());

      this.globalTimer = 300; // 5 minutes (Increased Urgency)
      this.particles = [];
      this.isVictory = false;

      // Multi-Layer Security Definitions (REORDERED FOR TESTING)
      // 🔐 FINAL OMEGA DECRYPTION PROTOCOL (8 LAYERS)
      this.levels = [
         {
            name: "LAYER 01: INITIAL BYPASS",
            mode: "TIMING",
            numCount: 3,
            baseSpeed: 1.8,
            variableSpeed: false,
            successWindow: 45,
            directionSwap: false,
            dialRotation: 0,
            timer: null,
            activePulse: false,
            flicker: false,
         },
         {
            name: "LAYER 02: MEMORY BURST",
            mode: "MEMORY_BURST",
            numCount: 4,
            timer: 40,
         },
         {
            name: "LAYER 03: LOGIC GATE",
            mode: "LOGIC_GATE",
            timer: 35,
            numToFind: 3,
         },
         {
            name: "LAYER 04: POSITION RECALL",
            mode: "POSITION_RECALL",
            numCount: 5,
            timer: 40,
         },
         {
            name: "LAYER 05: RESONANCE",
            mode: "TIMING",
            numCount: 5,
            baseSpeed: 2.2,
            variableSpeed: true,
            successWindow: 30,
            directionSwap: true,
            dialRotation: 0.3,
            timer: 30,
            activePulse: true,
            flicker: true,
         },
         {
            name: "LAYER 06: PHANTOM DATA",
            mode: "TIMING",
            numCount: 6,
            baseSpeed: 3.0,
            variableSpeed: false,
            successWindow: 20,
            directionSwap: true,
            dialRotation: -0.5,
            timer: 25,
            activePulse: true,
            flicker: true,
         },
         {
            name: "LAYER 07: IDENTITY RECALL",
            mode: "SECURE_RECALL",
            timer: 40,
         },
         {
            name: "LAYER 08: SINGULARITY",
            mode: "TIMING",
            numCount: 7,
            baseSpeed: 3.8,
            variableSpeed: true,
            successWindow: 16,
            directionSwap: true,
            dialRotation: 0.8,
            timer: 20,
            activePulse: true,
            flicker: true,
         },
         {
            name: "LAYER 09: SIGNAL SYNC",
            mode: "SIGNAL_SYNC",
            timer: 120, // Extended so global timer is the main constraint
            targetSyncTime: 3.0, // Faster sync success
         },
      ];

      this.currentLevelIdx = 0;

      // Extended Game States
      this.memoryMode = "IDLE";
      this.memorySequence = [];
      this.userInput = [];

      this.syncTargetAngle = 0;
      this.syncProgress = 0;
      this.syncDir = 1;
      this.lives = 3;

      this.isMissionStarted = false;
      this.isPaused = true;
      this.logicRule = "";
      this.logicCorrectAnswers = [];

      this.flashIdx = -1;
      this.flashTimer = 0;
      this.lastInputTime = 0;
      this.lastInputNum = -1;
      this.lastCrackedSequence = [];

      this.resetToLevel1();

      this.bindEvents();
      this.loop();
   }

   resetToLevel1() {
      // Check for saved checkpoint
      const savedLevel = localStorage.getItem("m1_level_checkpoint");
      this.currentLevelIdx = savedLevel ? parseInt(savedLevel) : 0;

      this.globalTimer = 300; // 5 minutes (Synced)
      this.isVictory = false;
      this.lives = 3;
      this.particles = [];
      document.body.classList.remove("critical-failure", "exposed");
      document.getElementById("overlay").classList.remove("active");
      document.getElementById("loot-status").classList.remove("active");
      this.updateTimerDisplay();
      this.startLevel(this.currentLevelIdx);
   }

   startLevel(idx) {
      const level = this.levels[idx];
      this.currentLevel = level;
      this.isPaused = false;
      this.isLevelCompelete = false;

      this.activeIdx = 0;
      this.rotation = Math.random() * 360;
      this.dialRotation = 0;
      this.rotationDirection = 1;
      this.timeElapsed = 0;
      this.remainingSeconds = level.timer;
      this.lastTime = performance.now();

      // Mode Specific Init
      if (level.mode === "TIMING") {
         this.targetNumbers = this.generateTargetSequence(level.numCount);
         this.lastCrackedSequence = [...this.targetNumbers];
         document.getElementById("instruction").innerText = "BYPASS LOCK ROTATION.";
      } else if (level.mode === "SECURE_RECALL") {
         this.targetNumbers = [...this.lastCrackedSequence];
         level.numCount = this.targetNumbers.length;
         this.memoryMode = "INPUTTING";
         document.getElementById("instruction").innerText = "RE-ENTER PREVIOUS SECURITY SEQUENCE (LAYER 06).";
      } else if (level.mode === "MEMORY_BURST") {
         this.targetNumbers = this.generateTargetSequence(level.numCount);
         this.memoryMode = "SHOWING";
         this.memorySequence = this.targetNumbers;
         this.userInput = [];
         this.flashIdx = -1;
         this.flashTimer = 0;
      } else if (level.mode === "POSITION_RECALL") {
         this.targetNumbers = this.generateTargetSequence(level.numCount);
         this.memoryMode = "SHOWING";
         this.targetNumbers.sort((a, b) => a - b);
         this.flashIdx = -1;
         this.flashTimer = 0;
         this.userInput = [];
      } else if (level.mode === "SIGNAL_SYNC") {
         this.syncTargetAngle = Math.random() * 360;
         this.syncProgress = 0;
         this.syncDir = 1;
         this.targetNumbers = [];
      } else if (level.mode === "LOGIC_GATE") {
         const rules = ["EVEN", "ODD", "PRIME", "HIGH (>4)"];
         this.logicRule = rules[Math.floor(Math.random() * rules.length)];
         this.logicCorrectAnswers = [];
         for (let i = 0; i <= 9; i++) {
            if (this.logicRule === "EVEN" && i % 2 === 0) this.logicCorrectAnswers.push(i);
            if (this.logicRule === "ODD" && i % 2 !== 0) this.logicCorrectAnswers.push(i);
            if (this.logicRule === "PRIME" && [2, 3, 5, 7].includes(i)) this.logicCorrectAnswers.push(i);
            if (this.logicRule === "HIGH (>4)" && i > 4) this.logicCorrectAnswers.push(i);
         }
         this.userInput = [];
         this.targetNumbers = [];
         this.activeIdx = 0;
      } else {
         this.targetNumbers = this.generateTargetSequence(level.numCount);
      }

      // UI Updates
      document.getElementById("level-val").innerText = idx + 1;
      document.getElementById("lives-val").innerText = this.lives;
      const inst = document.getElementById("instruction");
      if (level.mode === "MEMORY_BURST") inst.innerText = "MEMORIZE THE SEQUENCE SIGNAL.";
      else if (level.mode === "POSITION_RECALL") inst.innerText = "TRACK DATA NODE LOCATIONS (0-9).";
      else if (level.mode === "SIGNAL_SYNC") inst.innerText = "FOLLOW THE SIGNAL. [A / D] TO ROTATE OVERLAY.";
      else if (level.mode === "LOGIC_GATE") inst.innerText = `IDENTIFY ALL [ ${this.logicRule} ] NODES.`;
      else if (level.mode === "SECURE_RECALL") inst.innerText = "RE-ENTER INITIAL IDENTITY SEQUENCE.";
      else inst.innerText = "HOLD STEADY. PRESS [ SPACE ] AT INTERSECTION.";

      document.getElementById("lock-state").innerText = "LOCKED";
      document.getElementById("dial-frame").className = "";
      this.renderProgressSlots();
      document.getElementById("overlay").classList.remove("active");
   }

   generateTargetSequence(count) {
      const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      for (let i = pool.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1));
         [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      return pool.slice(0, count);
   }

   renderProgressSlots() {
      const track = document.getElementById("progress-track");
      track.innerHTML = "";
      const count = this.currentLevel.numCount || this.currentLevel.numToFind || 0;
      for (let i = 0; i < count; i++) {
         const slot = document.createElement("div");
         slot.className = "p-slot";
         slot.id = `slot-${i}`;
         track.appendChild(slot);
      }
   }

   bindEvents() {
      this.keys = {};

      document.getElementById("accept-mission-btn").addEventListener("click", () => {
         this.isMissionStarted = true;
         this.isPaused = false;
         document.getElementById("mission-briefing").classList.remove("active");
         this.lastTime = performance.now(); // Reset time to now
      });

      window.addEventListener("keydown", (e) => {
         this.keys[e.code] = true;
         // Space for Timing
         if (e.code === "Space") {
            e.preventDefault();
            if (!this.isPaused && !this.isLevelCompelete && this.currentLevel.mode === "TIMING") {
               this.attemptCrack();
            }
         }

         // Numbers 0-9 for Memory/Recall
         if (/^[0-9]$/.test(e.key)) {
            if (!this.isPaused && !this.isLevelCompelete) {
               const mode = this.currentLevel.mode;
               if (this.memoryMode === "INPUTTING" || mode === "SECURE_RECALL") {
                  this.processMemoryInput(parseInt(e.key));
               }
               if (mode === "LOGIC_GATE") this.processLogicInput(parseInt(e.key));
            }
         }
      });

      window.addEventListener("keyup", (e) => {
         this.keys[e.code] = false;
      });

      this.canvas.addEventListener("mousedown", (e) => {
         if (this.isPaused || this.isLevelCompelete) return;
         const mode = this.currentLevel.mode;
         if (mode === "MEMORY_BURST" || mode === "POSITION_RECALL" || mode === "LOGIC_GATE" || mode === "SECURE_RECALL") {
            if (mode === "LOGIC_GATE" || mode === "SECURE_RECALL" || this.memoryMode === "INPUTTING") {
               this.handleDialClick(e);
            }
         }
      });

      document.getElementById("modal-btn").addEventListener("click", () => {
         if (this.currentLevelIdx < this.levels.length - 1) {
            this.currentLevelIdx++;
            this.startLevel(this.currentLevelIdx);
         } else {
            this.resetToLevel1();
         }
      });

      document.getElementById("pause-btn").addEventListener("click", () => this.togglePause());
      document.getElementById("restart-btn").addEventListener("click", () => this.startLevel(this.currentLevelIdx));
      document.getElementById("reset-all-btn").addEventListener("click", () => this.resetToLevel1());
   }

   handleDialClick(e) {
      const rect = this.canvas.getBoundingClientRect();
      const sc = this.canvas.width / rect.width;
      const mx = (e.clientX - rect.left) * sc - 500;
      const my = (e.clientY - rect.top) * sc - 500;

      const dist = Math.sqrt(mx * mx + my * my);
      if (dist < 320 || dist > 480) return; // Only click on the number ring

      const angle = ((Math.atan2(my, mx) * 180) / Math.PI + 450) % 360;
      const clickedNum = Math.round(angle / 36) % 10;

      this.processMemoryInput(clickedNum);
   }

   processMemoryInput(num) {
      // Feedback: Flash the number on the dial
      this.lastInputTime = performance.now();
      this.lastInputNum = num;

      if (this.currentLevel.mode === "MEMORY_BURST" || this.currentLevel.mode === "SECURE_RECALL") {
         const expectedNum = this.targetNumbers[this.activeIdx];
         if (num === expectedNum) {
            this.handleSuccess();
         } else {
            this.fail();
         }
      } else if (this.currentLevel.mode === "POSITION_RECALL") {
         if (this.targetNumbers.includes(num) && !this.userInput.includes(num)) {
            this.userInput.push(num);
            this.handleSuccess();
         } else if (!this.targetNumbers.includes(num)) {
            this.fail();
         }
      }
   }

   processLogicInput(num) {
      if (this.logicCorrectAnswers.includes(num) && !this.userInput.includes(num)) {
         this.userInput.push(num);
         this.lastInputTime = performance.now();
         this.lastInputNum = num;

         const slot = document.getElementById(`slot-${this.activeIdx}`);
         if (slot) slot.classList.add("cracked");
         this.activeIdx++;

         if (this.activeIdx >= this.currentLevel.numToFind) {
            this.completeLevel();
         }
      } else if (!this.logicCorrectAnswers.includes(num)) {
         this.fail();
      }
   }

   togglePause() {
      this.isPaused = !this.isPaused;
      document.getElementById("pause-btn").innerText = this.isPaused ? "RESUME" : "PAUSE";
      document.getElementById("lock-state").innerText = this.isPaused ? "SUSPENDED" : "LOCKED";
   }

   attemptCrack() {
      const overlayAngle = ((this.rotation % 360) + 360) % 360;
      const targetNumber = this.targetNumbers[this.activeIdx];
      const targetNumberAngle = targetNumber * 36;
      const actualTargetAngle = (targetNumberAngle + this.dialRotation) % 360;

      let diff = Math.abs(overlayAngle - actualTargetAngle);
      if (diff > 180) diff = 360 - diff;

      if (diff < this.currentLevel.successWindow / 2) {
         this.handleSuccess();
      } else {
         this.fail();
      }
   }

   handleSuccess() {
      if (typeof SFX !== "undefined") SFX.playUnlock();
      document.getElementById(`slot-${this.activeIdx}`).classList.add("cracked");
      this.activeIdx++;

      if (this.activeIdx >= this.currentLevel.numCount) {
         this.completeLevel();
      } else {
         if (this.currentLevel.directionSwap) {
            this.rotationDirection *= -1;
         }
      }
   }

   fail() {
      if (typeof SFX !== "undefined") {
         SFX.playFail();
         SFX.playGlitchSound();
      }
      document.body.classList.add("screen-shake");
      setTimeout(() => document.body.classList.remove("screen-shake"), 400);

      this.isPaused = true;
      this.lives--;
      document.getElementById("lives-val").innerText = this.lives;

      if (this.lives <= 0) {
         this.triggerExposedState();
      } else {
         document.getElementById("lock-state").innerText = "FAILED";
         document.getElementById("dial-frame").className = "failed";
         setTimeout(() => this.startLevel(this.currentLevelIdx), 1200);
      }
   }

   triggerExposedState() {
      if (typeof SFX !== "undefined") SFX.playAlert(); // Continuous alarm handled in CSS/SFX? Just one trigger here.
      document.body.classList.add("critical-failure", "exposed");
      document.getElementById("lock-state").innerText = "FAILURE";
      document.getElementById("dial-frame").className = "failed";

      setTimeout(() => {
         const modal = document.getElementById("overlay");
         const title = document.getElementById("modal-title");
         const msg = document.getElementById("modal-msg");
         const btn = document.getElementById("modal-btn");

         modal.classList.add("active");
         title.innerText = "MISSION COMPROMISED";
         title.style.color = "#ff3b30";
         msg.innerHTML = `ALARM TRIGGERED. YOUR IP: <span class="highlight" style="color:#ff3b30">192.168.1.104</span> HAS BEEN BROADCAST TO AUTHORITIES.<br><br>ACCESS TO FEDERAL RESERVE SERVERS IS PERMANENTLY BLOCKED.`;
         btn.innerText = "EXIT PROTOCOL";
         btn.style.background = "#ff3b30";
         btn.onclick = () => location.reload();
      }, 1000);
   }

   completeLevel() {
      if (typeof SFX !== "undefined") SFX.playLevelComplete();
      this.isLevelCompelete = true;
      this.isPaused = true;
      document.getElementById("lock-state").innerText = "UNLOCKED";
      document.getElementById("dial-frame").className = "success";

      if (this.currentLevelIdx >= this.levels.length - 1) {
         localStorage.removeItem("m1_level_checkpoint");
         this.triggerCelebration();
      } else {
         // Save intermediate progress
         localStorage.setItem("m1_level_checkpoint", this.currentLevelIdx + 1);

         setTimeout(() => {
            const modal = document.getElementById("overlay");
            const title = document.getElementById("modal-title");
            const msg = document.getElementById("modal-msg");
            const btn = document.getElementById("modal-btn");

            modal.classList.add("active");
            title.innerText = "CORE PENETRATED";
            msg.innerText = `Layer ${this.currentLevelIdx + 1} dismantled. Diving deeper into the stack.`;
            btn.innerText = "PENETRATE NEXT";
         }, 800);
      }
   }

   triggerCelebration() {
      if (typeof SFX !== "undefined") SFX.playMissionComplete();
      this.isVictory = true;
      localStorage.setItem("m1_cleared", "true"); // Persist Mission 1 Completion
      const modal = document.getElementById("overlay");
      const title = document.getElementById("modal-title");
      const msg = document.getElementById("modal-msg");
      const btn = document.getElementById("modal-btn");
      const loot = document.getElementById("loot-status");

      title.innerText = "SYSTEM BREACHED";
      msg.innerText = "9-LAYER SECURITY SHATTERED. ALL ENCRYPTED ASSETS LIQUIDATED.";
      loot.innerText = "LOOTED: FEDERAL RESERVE MAINFRAME";
      loot.classList.add("active");
      btn.innerText = "INITIALIZE NEW BREACH";

      setTimeout(() => modal.classList.add("active"), 1000);

      // Spawn Firecrackers
      for (let i = 0; i < 15; i++) {
         setTimeout(() => this.spawnFirework(), i * 400);
      }
   }

   resizeCelebration() {
      this.celebrationCanvas.width = window.innerWidth;
      this.celebrationCanvas.height = window.innerHeight;
   }

   spawnFirework() {
      const x = Math.random() * this.celebrationCanvas.width;
      const y = Math.random() * this.celebrationCanvas.height;
      const colors = ["#00d1ff", "#ffffff", "#ffcc00", "#ff00ff"];
      const color = colors[Math.floor(Math.random() * colors.length)];

      for (let i = 0; i < 60; i++) {
         const angle = Math.random() * Math.PI * 2;
         const speed = 2 + Math.random() * 8;
         this.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            color,
            size: 2 + Math.random() * 3,
         });
      }
   }

   updateParticles() {
      const dt = 0.016;
      for (let i = this.particles.length - 1; i >= 0; i--) {
         const p = this.particles[i];
         p.x += p.vx;
         p.y += p.vy;
         p.vy += 0.15; // Gravity
         p.life -= 0.015;
         if (p.life <= 0) this.particles.splice(i, 1);
      }
   }

   drawCelebration() {
      this.cctx.clearRect(0, 0, this.celebrationCanvas.width, this.celebrationCanvas.height);
      this.particles.forEach((p) => {
         this.cctx.globalAlpha = p.life;
         this.cctx.fillStyle = p.color;
         this.cctx.beginPath();
         this.cctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
         this.cctx.fill();
         this.cctx.shadowBlur = 10;
         this.cctx.shadowColor = p.color;
      });
      this.cctx.globalAlpha = 1;
      this.cctx.shadowBlur = 0;
   }

   update() {
      const now = performance.now();
      const dt = (now - (this.lastTime || now)) / 1000;
      this.lastTime = now;

      if (!this.isMissionStarted || this.isPaused || this.isVictory) return;

      // Global Mission Timer
      this.globalTimer -= dt;
      if (this.globalTimer <= 0) {
         this.globalTimer = 0;
         this.fail();
      }
      this.updateTimerDisplay();

      if (this.isVictory) this.updateParticles();

      // Mode Logic
      const frameMult = dt * 60; // Normalize to 60fps for speed values

      if (this.currentLevel.mode === "TIMING") {
         let speed = this.currentLevel.baseSpeed;
         if (this.currentLevel.variableSpeed) {
            speed *= 1 + Math.sin(performance.now() / 400) * 0.7;
         }
         this.rotation += speed * this.rotationDirection * frameMult;
         if (this.currentLevel.dialRotation !== 0) {
            this.dialRotation += this.currentLevel.dialRotation * frameMult;
         }
      } else if (this.currentLevel.mode === "SIGNAL_SYNC") {
         // Active Keyboard Rotation (A / D)
         const rotSpeed = 3.5 * frameMult;
         if (this.keys["KeyA"]) this.rotation -= rotSpeed;
         if (this.keys["KeyD"]) this.rotation += rotSpeed;

         // Drift the target
         this.syncTargetAngle += 1.5 * this.syncDir * frameMult;
         if (Math.random() < 0.02) this.syncDir *= -1;

         // Check for alignment
         const diff = Math.abs((((this.rotation % 360) + 360) % 360) - (((this.syncTargetAngle % 360) + 360) % 360));
         const isAligned = diff < 25 || diff > 335; // Loosened from 15 to 25

         if (isAligned) {
            this.syncProgress += dt;
            if (this.syncProgress >= this.currentLevel.targetSyncTime) {
               this.completeLevel();
            }
         } else {
            this.syncProgress = Math.max(0, this.syncProgress - dt * 0.5);
         }
      } else if (this.currentLevel.mode === "MEMORY_BURST") {
         if (this.memoryMode === "SHOWING") {
            this.flashTimer -= dt;
            if (this.flashTimer <= 0) {
               this.flashIdx++;
               if (this.flashIdx >= this.memorySequence.length) {
                  this.memoryMode = "INPUTTING";
                  document.getElementById("instruction").innerText = "REPLICATE DATA BURST.";
               } else {
                  this.flashTimer = 0.8;
               }
            }
         }
      } else if (this.currentLevel.mode === "POSITION_RECALL") {
         if (this.memoryMode === "SHOWING") {
            this.flashTimer -= dt;
            if (this.flashTimer <= 0) {
               this.flashIdx++;
               if (this.flashIdx > 9) {
                  this.memoryMode = "INPUTTING";
                  document.getElementById("instruction").innerText = "RESTORE REGISTERED NODES (0-9).";
               } else {
                  this.flashTimer = 0.4; // Faster scan for positions
               }
            }
         }
      }
   }

   updateTimerDisplay() {
      const display = document.getElementById("timer-val");
      const val = Math.ceil(this.globalTimer);
      const m = String(Math.floor(val / 60)).padStart(2, "0");
      const s = String(val % 60).padStart(2, "0");
      display.innerText = `${m}:${s}`;
   }

   draw() {
      const center = 500;
      const radius = 380;
      this.ctx.clearRect(0, 0, 1000, 1000);

      // 1. Rotating Overlay (Black Arc) - TIMING and SIGNAL_SYNC
      if (this.currentLevel.mode === "TIMING" || this.currentLevel.mode === "SIGNAL_SYNC") {
         let opacity = 0.85;
         if (this.currentLevel.flicker && Math.random() < 0.05) opacity = 0.4;

         if (!this.isPaused) {
            this.ctx.save();
            this.ctx.translate(center, center);
            this.ctx.rotate(((this.rotation - 90) * Math.PI) / 180);
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            const windowHalf = this.currentLevel.mode === "SIGNAL_SYNC" ? 20 : this.currentLevel.successWindow / 2;
            this.ctx.arc(0, 0, 480, (-windowHalf * Math.PI) / 180, (windowHalf * Math.PI) / 180);
            this.ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
            this.ctx.fill();
            this.ctx.restore();
         }
      }

      // SPECIAL: Signal Sync Target and Progress
      if (this.currentLevel.mode === "SIGNAL_SYNC") {
         // Target Node
         const trad = ((this.syncTargetAngle - 90) * Math.PI) / 180;
         this.ctx.beginPath();
         this.ctx.arc(center + Math.cos(trad) * radius, center + Math.sin(trad) * radius, 15, 0, Math.PI * 2);
         this.ctx.fillStyle = "#00D1FF";
         this.ctx.shadowBlur = 20 + Math.sin(performance.now() / 100) * 10;
         this.ctx.shadowColor = "#00D1FF";
         this.ctx.fill();
         this.ctx.shadowBlur = 0;

         // Sync Progress Ring
         this.ctx.beginPath();
         this.ctx.arc(
            center,
            center,
            490,
            -Math.PI / 2,
            -Math.PI / 2 + (this.syncProgress / this.currentLevel.targetSyncTime) * Math.PI * 2,
         );
         this.ctx.strokeStyle = "#00D1FF";
         this.ctx.lineWidth = 10;
         this.ctx.stroke();
      }

      // 2. Numbers and Indicators
      this.ctx.save();
      this.ctx.translate(center, center);
      this.ctx.rotate((this.dialRotation * Math.PI) / 180);

      for (let i = 0; i < 10; i++) {
         const angle = i * 36;
         const rad = ((angle - 90) * Math.PI) / 180;
         const x = Math.cos(rad) * radius;
         const y = Math.sin(rad) * radius;

         const isTarget = this.targetNumbers.includes(i);
         const isLogicCorrect = this.currentLevel.mode === "LOGIC_GATE" && this.userInput.includes(i);
         const isCracked =
            this.currentLevel.mode === "TIMING"
               ? isTarget && this.targetNumbers.indexOf(i) < this.activeIdx
               : this.currentLevel.mode === "POSITION_RECALL"
                 ? this.userInput.includes(i)
                 : isTarget && this.targetNumbers.indexOf(i) < this.activeIdx;

         const isActive = this.currentLevel.mode === "TIMING" && isTarget && this.targetNumbers.indexOf(i) === this.activeIdx;

         // SPECIAL: Memory Burst Flash
         const isFlashing =
            this.currentLevel.mode === "MEMORY_BURST" && this.memoryMode === "SHOWING" && this.memorySequence[this.flashIdx] === i;

         // SPECIAL: Position Recall Sequential Scan
         const isRevealedNode =
            this.currentLevel.mode === "POSITION_RECALL" &&
            ((this.memoryMode === "SHOWING" && this.flashIdx === i && isTarget) || isCracked);

         const isUserFocus = this.lastInputNum === i && performance.now() - this.lastInputTime < 250;

         // Indicator Dot
         this.ctx.beginPath();
         const dotRadius = radius - 60;
         this.ctx.arc(Math.cos(rad) * dotRadius, Math.sin(rad) * dotRadius, 6, 0, Math.PI * 2);

         if (isCracked || isFlashing || isRevealedNode || isUserFocus || isLogicCorrect) {
            this.ctx.fillStyle = isUserFocus ? "#FFFFFF" : "#00D1FF";
            this.ctx.shadowBlur = isUserFocus ? 25 : 12;
            this.ctx.shadowColor = isUserFocus ? "#FFFFFF" : "#00D1FF";
         } else if (isActive) {
            const pulse = this.currentLevel.activePulse ? Math.abs(Math.sin(performance.now() / 200)) * 12 : 0;
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.shadowBlur = 15 + pulse;
            this.ctx.shadowColor = "#FFFFFF";
         } else {
            this.ctx.fillStyle = "#2C2C2E";
            this.ctx.shadowBlur = 0;
         }
         this.ctx.fill();
         this.ctx.shadowBlur = 0;

         // Number
         this.ctx.save();
         this.ctx.translate(x, y);
         this.ctx.rotate((-this.dialRotation * Math.PI) / 180);
         this.ctx.font = `300 44px Outfit`;
         this.ctx.textAlign = "center";
         this.ctx.textBaseline = "middle";

         if (isCracked || isFlashing || isUserFocus || isRevealedNode || isLogicCorrect)
            this.ctx.fillStyle = isUserFocus ? "#FFFFFF" : "#00D1FF";
         else if (isActive) this.ctx.fillStyle = "#FFFFFF";
         else this.ctx.fillStyle = "#1C1C1E";

         this.ctx.fillText(i, 0, 0);
         this.ctx.restore();
      }
      this.ctx.restore();
   }

   loop() {
      this.update();
      this.draw();
      if (this.isVictory) this.drawCelebration();
      requestAnimationFrame(() => this.loop());
   }
}

window.onload = () => new LockGame();

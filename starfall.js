/**
 * PROJECT STARFALL // ORBITAL LATTICE ENGINE
 */

class ProjectStarfall {
   constructor() {
      this.canvas = document.getElementById("starfallCanvas");
      this.ctx = this.canvas.getContext("2d");
      this.canvas.width = 1000;
      this.canvas.height = 1000;

      this.celebrationCanvas = document.getElementById("celebration-canvas");
      this.cctx = this.celebrationCanvas.getContext("2d");
      this.resizeCelebration();
      window.addEventListener("resize", () => this.resizeCelebration());

      // Game Configuration
      this.rings = [
         { radius: 150, angle: Math.random() * 360, segments: this.generateSegments(1), speed: 0, targetAngle: 0 },
         { radius: 210, angle: Math.random() * 360, segments: this.generateSegments(2), speed: 0, targetAngle: 0 },
         { radius: 270, angle: Math.random() * 360, segments: this.generateSegments(3), speed: 0, targetAngle: 0 },
         { radius: 330, angle: Math.random() * 360, segments: this.generateSegments(4), speed: 0, targetAngle: 0 },
         { radius: 390, angle: Math.random() * 360, segments: this.generateSegments(5), speed: 0, targetAngle: 0 },
      ];

      this.selectedRing = 0; // 0 to 4
      this.isPaused = true;
      this.isFinished = false;
      this.isVictory = false;
      this.timer = 300; // 5 minutes (Synced with HUD)
      this.alignmentScore = 0;
      this.particles = [];

      // Solar Storm Mechanics
      this.stormActive = false;
      this.stormTimer = 0;
      this.stormInterval = 15; // Time between storms
      this.stormDuration = 14; // Time to survive/align
      this.stormTargetAngle = 0; // The angle we must align to
      this.stormDirectionName = "";
      this.stormHealth = 100; // Shield integrity

      this.bindEvents();
      this.loop();
   }

   generateSegments(complexity) {
      // Create an "alignment arc" for each ring.
      // We want all rings to have a segment at angle 270 (top) for success.
      const width = 60 - complexity * 5;
      return { start: 270 - width / 2, end: 270 + width / 2, width: width };
   }

   resizeCelebration() {
      this.celebrationCanvas.width = window.innerWidth;
      this.celebrationCanvas.height = window.innerHeight;
   }

   bindEvents() {
      this.keys = {};
      window.addEventListener("keydown", (e) => {
         this.keys[e.code] = true;
         if (e.key >= "1" && e.key <= "5") {
            this.selectedRing = parseInt(e.key) - 1;
         }
      });
      window.addEventListener("keyup", (e) => (this.keys[e.code] = false));

      document.getElementById("accept-mission-btn").addEventListener("click", () => {
         document.getElementById("mission-briefing").classList.remove("active");
         this.isPaused = false;
         this.lastTime = performance.now();
      });

      document.getElementById("modal-btn").addEventListener("click", () => {
         if (this.isVictory) window.location.href = "index.html";
         else location.reload();
      });
   }

   update(dt) {
      if (this.isPaused || this.isFinished) return;

      // Global Timer
      this.timer -= dt;
      if (this.timer <= 0) {
         this.timer = 0;
         this.fail("CONNECTION LOST");
      }

      // Storm Logic
      if (!this.stormActive) {
         this.stormInterval -= dt;
         if (this.stormInterval <= 0) {
            this.triggerStorm();
         }
      } else {
         this.stormDuration -= dt;

         // Check if player is aligned with the storm shield
         const isProtected = this.checkStormProtection();

         if (isProtected) {
            // If protected, we are good. Maybe give visual feedback?
            document.getElementById("flare-warning").style.borderColor = "#00ff00";
            document.getElementById("flare-warning").style.color = "#00ff00";
            document.getElementById("flare-warning").innerText = `SHIELD ALIGNED // HOLD POSITION: ${Math.ceil(this.stormDuration)}s`;
         } else {
            // If not protected, take damage or just countdown to death?
            // Calculated urgency
            document.getElementById("flare-warning").style.borderColor = "var(--starfall-red)";
            document.getElementById("flare-warning").style.color = "#000";
            document.getElementById("flare-warning").innerText =
               `⚠️ RED WAVE INCOMING [${this.stormDirectionName}] // ALIGN RINGS: ${Math.ceil(this.stormDuration)}s`;
         }

         if (this.stormDuration <= 0) {
            if (isProtected) {
               this.surviveStorm();
            } else {
               this.fail("SATELLITE DESTROYED BY SOLAR STORM");
            }
         }
      }

      // Handle Ring Rotation
      const rotSpeed = 180 * dt; // Faster rotation for better reaction (was 120)

      if (this.keys["KeyA"] || this.keys["ArrowLeft"]) {
         this.rings[this.selectedRing].angle -= rotSpeed;
      }
      if (this.keys["KeyD"] || this.keys["ArrowRight"]) {
         this.rings[this.selectedRing].angle += rotSpeed;
      }

      // HUD & Logic
      this.checkAlignment();
      this.updateHUD();
      if (this.isVictory) this.updateParticles();
   }

   triggerStorm() {
      this.stormActive = true;
      this.stormDuration = 12; // 12 seconds to react

      // Pick a random cardinal direction
      const directions = [
         { ang: 0, name: "Right Sector" },
         { ang: 90, name: "Bottom Sector" },
         { ang: 180, name: "Left Sector" },
      ];
      const threat = directions[Math.floor(Math.random() * directions.length)];

      this.stormTargetAngle = threat.ang;
      this.stormDirectionName = threat.name;

      const warning = document.getElementById("flare-warning");
      warning.style.display = "block";
      warning.innerText = `⚠️ SOLAR FLARE INCOMING`;

      const instruction = document.getElementById("instruction");
      instruction.innerText = `CRITICAL: ROTATE ALL RINGS TO FACE THE [${threat.name.toUpperCase()}] DRONE!`;
      instruction.style.color = "var(--starfall-red)";

      document.body.classList.add("storm-active");
   }

   surviveStorm() {
      this.stormActive = false;
      this.stormInterval = Math.random() * 5 + 10;
      document.getElementById("flare-warning").style.display = "none";
      document.body.classList.remove("storm-active");

      // Reset colors
      document.getElementById("instruction").innerText = "STORM PASSED. REALIGN RINGS TO TOP [270°].";
      document.getElementById("instruction").style.color = "var(--starfall-gold)";
   }

   checkStormProtection() {
      let protectedRings = 0;
      this.rings.forEach((ring) => {
         const normalizedAngle = ((ring.angle % 360) + 360) % 360;
         const diff = Math.abs(normalizedAngle - this.stormTargetAngle);
         if (diff < 40 || diff > 320) {
            protectedRings++;
         }
      });
      return protectedRings === this.rings.length;
   }

   checkAlignment() {
      if (this.stormActive) {
         this.alignmentScore = 0;
         return;
      }

      let totalAligned = 0;
      this.rings.forEach((ring) => {
         const normalizedAngle = ((ring.angle % 360) + 360) % 360;
         const diff = Math.abs(normalizedAngle - 270); // 270 is TOP
         const tolerance = ring.segments.width / 2;

         if (diff < tolerance || diff > 360 - tolerance) {
            totalAligned++;
         }
      });

      this.alignmentScore = (totalAligned / this.rings.length) * 100;

      if (this.alignmentScore === 100) {
         this.isFinished = true;
         this.complete();
      }
   }

   updateHUD() {
      document.getElementById("sync-val").innerText = `${Math.round(this.alignmentScore)}%`;
      const m = Math.floor(this.timer / 60);
      const s = Math.floor(this.timer % 60);
      document.getElementById("timer-val").innerText = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

      const status = document.getElementById("alignment-status");
      if (this.stormActive) {
         status.innerText = "DEFENSE MODE ACTIVE";
         status.style.color = "var(--starfall-red)";
      } else if (this.alignmentScore < 40) {
         status.innerText = "LATTICE: DISCONNECTED";
         status.style.color = "var(--text-dim)";
      } else if (this.alignmentScore < 100) {
         status.innerText = "LATTICE: SYNCING...";
         status.style.color = "var(--starfall-orange)";
      } else {
         status.innerText = "LATTICE: STABILIZED";
         status.style.color = "var(--starfall-gold)";
      }
   }

   draw() {
      this.ctx.clearRect(0, 0, 1000, 1000);
      const center = { x: 500, y: 500 };

      // Draw Solar Core
      const gradient = this.ctx.createRadialGradient(center.x, center.y, 10, center.x, center.y, 80);
      gradient.addColorStop(0, "#fff");
      if (this.stormActive) {
         gradient.addColorStop(0.2, "#ff0000");
         gradient.addColorStop(1, "rgba(255, 0, 0, 0)");
      } else {
         gradient.addColorStop(0.2, "#ffb400");
         gradient.addColorStop(1, "rgba(255, 94, 0, 0)");
      }

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(center.x, center.y, 80, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw Drone & Threat Lines
      if (this.stormActive) {
         this.drawStormDrone(center, this.stormTargetAngle);
      } else {
         // Draw Goal Indicator (Top)
         this.drawGoalIndicator(center);
      }

      // Draw Rings
      this.rings.forEach((ring, idx) => {
         const isSelected = this.selectedRing === idx;

         // 1. Draw Orbit Track
         this.ctx.beginPath();
         this.ctx.arc(center.x, center.y, ring.radius, 0, Math.PI * 2);
         this.ctx.strokeStyle = isSelected ? "rgba(255, 180, 0, 0.4)" : "rgba(255, 255, 255, 0.05)";

         if (this.stormActive) {
            // Red track if not safe, Green if safe
            const normalizedAngle = ((ring.angle % 360) + 360) % 360;
            const diff = Math.abs(normalizedAngle - this.stormTargetAngle);
            const isSafe = diff < 40 || diff > 320;
            this.ctx.strokeStyle = isSafe ? "rgba(0, 255, 0, 0.2)" : "rgba(255, 0, 0, 0.2)";
         }

         this.ctx.lineWidth = 2;
         this.ctx.stroke();

         // 2. Draw The "Gap" / Segment
         // This is the active part the user controls
         const startRad = (ring.angle - ring.segments.width / 2) * (Math.PI / 180);
         const endRad = (ring.angle + ring.segments.width / 2) * (Math.PI / 180);

         this.ctx.beginPath();
         this.ctx.arc(center.x, center.y, ring.radius, startRad, endRad);

         // Determine Color based on State
         const normalizedAngle = ((ring.angle % 360) + 360) % 360;
         let isAligned = false;
         let segmentColor = "var(--starfall-gold)";
         let glowColor = "var(--starfall-gold)";

         if (this.stormActive) {
            // Storm Logic: Must align to Drone
            const diff = Math.abs(normalizedAngle - this.stormTargetAngle);
            isAligned = diff < 40 || diff > 320;
            segmentColor = isAligned ? "#00ff00" : "#ff0000"; // Green safe, Red danger
            glowColor = isAligned ? "#00ff00" : "#ff0000";
         } else {
            // Normal Logic: Must align to Top (270)
            const diff = Math.abs(normalizedAngle - 270);
            isAligned = diff < ring.segments.width / 2 || diff > 360 - ring.segments.width / 2;
            segmentColor = isAligned ? "#fff" : "var(--starfall-gold)";
            glowColor = "var(--starfall-gold)";
         }

         this.ctx.strokeStyle = segmentColor;
         this.ctx.lineWidth = isSelected ? 14 : 8; // Thicker for better visibility
         this.ctx.shadowBlur = isAligned ? 25 : 0;
         this.ctx.shadowColor = glowColor;
         this.ctx.stroke();
         this.ctx.shadowBlur = 0;

         // Draw Label
         this.ctx.fillStyle = isSelected ? "#fff" : "var(--text-dim)";
         this.ctx.font = "700 14px Outfit";
         this.ctx.fillText(`R-0${idx + 1}`, center.x + ring.radius + 15, center.y);
      });
   }

   drawStormDrone(center, angle) {
      const droneDist = 450;
      const rad = angle * (Math.PI / 180);
      const droneX = center.x + Math.cos(rad) * droneDist;
      const droneY = center.y + Math.sin(rad) * droneDist;

      // 1. Draw Laser Guide to Center
      this.ctx.beginPath();
      this.ctx.moveTo(center.x, center.y);
      this.ctx.lineTo(droneX, droneY);
      this.ctx.strokeStyle = "rgba(255, 0, 0, 0.5)"; // Visible red laser
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      // 2. Draw Drone Icon (Hexagon)
      this.ctx.save();
      this.ctx.translate(droneX, droneY);
      this.ctx.rotate(rad + Math.PI / 2); // Face center

      this.ctx.beginPath();
      this.ctx.fillStyle = "#000";
      this.ctx.strokeStyle = "#ff0000";
      this.ctx.lineWidth = 4;
      this.ctx.moveTo(0, -20);
      this.ctx.lineTo(15, -10);
      this.ctx.lineTo(15, 10);
      this.ctx.lineTo(0, 20);
      this.ctx.lineTo(-15, 10);
      this.ctx.lineTo(-15, -10);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      // Drone Glow
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = "#ff0000";
      this.ctx.fillStyle = "#ff0000";
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      this.ctx.restore();

      // 3. Danger Text
      this.ctx.save();
      this.ctx.translate(center.x, center.y);
      this.ctx.rotate(rad);
      this.ctx.fillStyle = "#ff0000";
      this.ctx.font = "800 16px Outfit";
      this.ctx.fillText("SHIELD DRONE", 470, 5);
      this.ctx.restore();
   }

   drawGoalIndicator(center) {
      // Draw standard alignment line to top
      this.ctx.beginPath();
      this.ctx.moveTo(center.x, center.y - 80);
      this.ctx.lineTo(center.x, center.y - 450);
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      this.ctx.setLineDash([10, 10]);
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      // Draw "Target" icon at top
      this.ctx.fillStyle = "rgba(255, 180, 0, 0.2)";
      this.ctx.beginPath();
      this.ctx.arc(center.x, center.y - 450, 10, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = "var(--starfall-gold)";
      this.ctx.font = "700 12px Outfit";
      this.ctx.fillText("TARGET LATTICE", center.x - 45, center.y - 470);
   }

   complete() {
      if (typeof SFX !== "undefined") SFX.playMissionComplete();
      this.isVictory = true;
      localStorage.setItem("m3_cleared", "true");
      const modal = document.getElementById("overlay");
      const title = document.getElementById("modal-title");
      const loot = document.getElementById("loot-status");

      title.innerText = "CONSTELLATION HIJACKED";
      loot.innerText = "ACCESS GRANTED: GLOBAL SURVEILLANCE NODE";
      loot.style.color = "var(--starfall-gold)";

      setTimeout(() => modal.classList.add("active"), 1000);

      for (let i = 0; i < 20; i++) {
         setTimeout(() => this.spawnFirework(), i * 300);
      }
   }

   fail(reason) {
      if (typeof SFX !== "undefined") SFX.playFail();
      this.isFinished = true;
      const modal = document.getElementById("overlay");
      const title = document.getElementById("modal-title");
      title.innerText = "SHIELD BREACHED";
      title.style.color = "var(--starfall-red)";

      const msg = reason || "Satellite destroyed. Rings were not aligned to the Defense Drone in time.";
      document.getElementById("modal-msg").innerText = msg;

      document.getElementById("loot-status").innerText = "MISSION FAILED";
      document.getElementById("loot-status").style.color = "var(--starfall-red)";
      modal.classList.add("active");
   }

   spawnFirework() {
      const x = Math.random() * this.celebrationCanvas.width;
      const y = Math.random() * this.celebrationCanvas.height;
      for (let i = 0; i < 60; i++) {
         this.particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            life: 1.0,
            color: Math.random() > 0.5 ? "var(--starfall-gold)" : "var(--starfall-orange)",
         });
      }
   }

   updateParticles() {
      this.particles.forEach((p, i) => {
         p.x += p.vx;
         p.y += p.vy;
         p.vy += 0.2;
         p.life -= 0.015;
         if (p.life <= 0) this.particles.splice(i, 1);
      });
   }

   drawCelebration() {
      this.cctx.clearRect(0, 0, this.celebrationCanvas.width, this.celebrationCanvas.height);
      this.particles.forEach((p) => {
         this.cctx.globalAlpha = p.life;
         this.cctx.fillStyle = p.color;
         this.cctx.beginPath();
         this.cctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
         this.cctx.fill();
      });
      this.cctx.globalAlpha = 1;
   }

   loop() {
      const now = performance.now();
      const dt = (now - (this.lastTime || now)) / 1000;
      this.lastTime = now;

      this.update(dt);
      this.draw();
      if (this.isVictory) this.drawCelebration();
      requestAnimationFrame(() => this.loop());
   }
}

window.onload = () => new ProjectStarfall();

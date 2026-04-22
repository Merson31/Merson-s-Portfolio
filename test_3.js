
    /* ============================================================
       ULTRA 3D FUTURE EFFECTS — Website Masa Depan
       ============================================================ */

    /* ---- HOLOGRAPHIC SCAN CSS ---- */
    (function() {
      const s = document.createElement('style');
      s.textContent = `
        .holo-scan {
          position: absolute; inset: 0;
          pointer-events: none; z-index: 10;
          overflow: hidden;
        }
        .holo-scan::before {
          content: '';
          position: absolute;
          left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg,
            transparent 0%, rgba(0,245,255,0.8) 40%,
            rgba(0,245,255,1) 50%, rgba(0,245,255,0.8) 60%,
            transparent 100%);
          box-shadow: 0 0 12px rgba(0,245,255,0.9), 0 0 30px rgba(0,245,255,0.4);
          animation: holoSweep 2.8s linear infinite;
        }
        @keyframes holoSweep {
          0%   { top: -4px; opacity: 1; }
          85%  { opacity: 1; }
          100% { top: calc(100% + 4px); opacity: 0; }
        }
        .holo-scan::after {
          content: '';
          position: absolute; inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent 3px,
            rgba(0,245,255,0.025) 3px,
            rgba(0,245,255,0.025) 4px
          );
          pointer-events: none;
        }
        /* Holographic border flicker */
        .about-photo-frame {
          position: relative;
        }
        .about-photo-frame::before {
          content: '';
          position: absolute; inset: -1px;
          background: linear-gradient(45deg,
            var(--cyan), transparent 40%,
            transparent 60%, var(--pink));
          z-index: -1;
          animation: holoBorderFlicker 4s ease-in-out infinite;
        }
        @keyframes holoBorderFlicker {
          0%,100% { opacity: 0.6; }
          25%     { opacity: 0.1; }
          50%     { opacity: 0.9; }
          75%     { opacity: 0.3; }
        }
      `;
      document.head.appendChild(s);
    })();

    /* ---- DNA DOUBLE HELIX 3D ---- */
    (function() {
      const dna = document.getElementById('canvas-dna');
      if (!dna) return;
      const dc  = dna.getContext('2d');
      function rDNA() {
        dna.width  = dna.offsetWidth  || 220;
        dna.height = dna.offsetHeight || 600;
      }
      rDNA();
      window.addEventListener('resize', rDNA);

      const RUNGS = 26;
      let dnaT = 0;
      const COLORS_A = 'rgba(0,245,255,'; // cyan
      const COLORS_B = 'rgba(255,0,110,'; // pink

      function drawDNA() {
        dc.clearRect(0, 0, dna.width, dna.height);
        dnaT += 0.018;
        const CX = dna.width * 0.5;
        const H  = dna.height;
        const RADIUS = dna.width * 0.32;

        for (let i = 0; i <= RUNGS; i++) {
          const t = (i / RUNGS) * Math.PI * 5 + dnaT;
          const y  = (i / RUNGS) * H;
          const x1 = CX + Math.cos(t) * RADIUS;
          const x2 = CX + Math.cos(t + Math.PI) * RADIUS;
          const depth1 = (Math.sin(t) + 1) * 0.5;   // 0..1
          const depth2 = (Math.sin(t + Math.PI) + 1) * 0.5;

          /* Strand 1 dot */
          dc.beginPath();
          dc.arc(x1, y, 3.5 * (0.4 + depth1 * 0.6), 0, Math.PI * 2);
          dc.fillStyle = COLORS_A + (0.5 + depth1 * 0.5) + ')';
          dc.fill();

          /* Strand 2 dot */
          dc.beginPath();
          dc.arc(x2, y, 3.5 * (0.4 + depth2 * 0.6), 0, Math.PI * 2);
          dc.fillStyle = COLORS_B + (0.5 + depth2 * 0.5) + ')';
          dc.fill();

          /* Crossbar rung every 2 */
          if (i % 2 === 0 && i < RUNGS) {
            const avgDepth = (depth1 + depth2) * 0.5;
            dc.beginPath();
            dc.moveTo(x1, y);
            dc.lineTo(x2, y);
            dc.strokeStyle = `rgba(180,255,255,${avgDepth * 0.22})`;
            dc.lineWidth = 0.8;
            dc.stroke();
          }

          /* Strand 1 line segment to next */
          if (i < RUNGS) {
            const t2   = ((i + 1) / RUNGS) * Math.PI * 5 + dnaT;
            const y2   = ((i + 1) / RUNGS) * H;
            const nx1  = CX + Math.cos(t2) * RADIUS;
            const nx2  = CX + Math.cos(t2 + Math.PI) * RADIUS;
            const d1n  = (Math.sin(t2) + 1) * 0.5;
            const d2n  = (Math.sin(t2 + Math.PI) + 1) * 0.5;

            dc.beginPath();
            dc.moveTo(x1, y); dc.lineTo(nx1, y2);
            dc.strokeStyle = COLORS_A + (0.2 + depth1 * 0.3) + ')';
            dc.lineWidth = 1.2;
            dc.stroke();

            dc.beginPath();
            dc.moveTo(x2, y); dc.lineTo(nx2, y2);
            dc.strokeStyle = COLORS_B + (0.2 + depth2 * 0.3) + ')';
            dc.lineWidth = 1.2;
            dc.stroke();
          }
        }
        requestAnimationFrame(drawDNA);
      }
      drawDNA();
    })();

    /* ---- 3D TERRAIN MESH (contact section) ---- */
    (function() {
      const tc = document.getElementById('canvas-terrain');
      if (!tc) return;
      const ctx = tc.getContext('2d');
      let TW, TH;
      function rTerrain() {
        TW = tc.width  = tc.offsetWidth  || window.innerWidth;
        TH = tc.height = tc.offsetHeight || 400;
      }
      rTerrain();
      window.addEventListener('resize', () => setTimeout(rTerrain, 100));

      const COLS = 22, ROWS = 14;
      let tTime = 0;

      function yNoise(x, z, t) {
        return Math.sin(x * 1.4 + t) * 0.09
             + Math.sin(z * 2.1 + t * 0.7) * 0.12
             + Math.sin((x + z) * 0.8 + t * 1.1) * 0.06
             + Math.cos(x * 2.8 - t * 0.5) * 0.04;
      }

      function project(x, y, z) {
        const camZ = -1.6;
        const fov  = TH * 0.85;
        const rz   = z - camZ;
        return {
          sx: TW / 2 + (x / rz) * fov,
          sy: TH * 0.72 + (y / rz) * fov,
          a:  Math.min(1, (z + 0.1) / ROWS * 0.7 + 0.02)
        };
      }

      function drawTerrain() {
        ctx.clearRect(0, 0, TW, TH);
        tTime += 0.007;

        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            const x0 = (c / COLS - 0.5) * 4;
            const x1 = ((c + 1) / COLS - 0.5) * 4;
            const z0 = r / ROWS * 2.2 + 0.1;
            const z1 = (r + 1) / ROWS * 2.2 + 0.1;

            const tl = project(x0, yNoise(x0, z0, tTime), z0);
            const tr = project(x1, yNoise(x1, z0, tTime), z0);
            const bl = project(x0, yNoise(x0, z1, tTime), z1);
            const br = project(x1, yNoise(x1, z1, tTime), z1);

            const alpha = ((r / ROWS) * 0.18 + 0.02);
            ctx.beginPath();
            ctx.moveTo(tl.sx, tl.sy);
            ctx.lineTo(tr.sx, tr.sy);
            ctx.lineTo(br.sx, br.sy);
            ctx.lineTo(bl.sx, bl.sy);
            ctx.closePath();

            /* Slight fill for depth */
            const bright = yNoise(x0, z0, tTime) + 0.2;
            ctx.fillStyle = `rgba(0,${Math.floor(bright*120+40)},${Math.floor(bright*180+80)},${alpha * 0.3})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(0,245,255,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
        requestAnimationFrame(drawTerrain);
      }
      drawTerrain();
    })();

    /* ---- MATRIX RAIN (injected between Skills & Services) ---- */
    (function() {
      const skillsSec = document.getElementById('skills');
      if (!skillsSec) return;

      const wrap = document.createElement('div');
      wrap.style.cssText = 'position:relative;height:80px;overflow:hidden;width:100%;pointer-events:none';
      const mc = document.createElement('canvas');
      mc.style.cssText = 'width:100%;height:80px;display:block';
      wrap.appendChild(mc);
      skillsSec.after(wrap);

      const mctx = mc.getContext('2d');
      let MW;
      function rMatrix() {
        MW = mc.width = wrap.offsetWidth || window.innerWidth;
        mc.height = 80;
      }
      rMatrix();
      window.addEventListener('resize', rMatrix);

      const FONT = 12;
      const COLS_M = Math.floor(window.innerWidth / FONT);
      const drops  = Array.from({ length: COLS_M }, () => Math.random() * -50);
      const chars  = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ01001101ABCDEF<>/{}[]';

      function drawMatrix() {
        mctx.fillStyle = 'rgba(2,4,8,0.25)';
        mctx.fillRect(0, 0, MW, 80);
        mctx.font = `${FONT}px monospace`;

        drops.forEach((y, i) => {
          const ch = chars[Math.floor(Math.random() * chars.length)];
          const x  = i * FONT;
          const brightness = Math.random();
          mctx.fillStyle = brightness > 0.9
            ? `rgba(255,255,255,0.9)`
            : `rgba(0,${Math.floor(200 + brightness * 55)},${Math.floor(200 + brightness * 55)},${0.4 + brightness * 0.4})`;
          mctx.fillText(ch, x, y);
          if (y > 80 && Math.random() > 0.97) drops[i] = 0;
          drops[i] += FONT * 0.6;
        });
        requestAnimationFrame(drawMatrix);
      }
      drawMatrix();
    })();

    /* ---- CURSOR PLASMA TRAIL ---- */
    (function() {
      const trail = [];
      const MAX_TRAIL = 32;
      let pmx = 0, pmy = 0;

      const pc = document.createElement('canvas');
      pc.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9993;';
      document.body.appendChild(pc);
      const pctx = pc.getContext('2d');

      function rPlasma() {
        pc.width  = window.innerWidth;
        pc.height = window.innerHeight;
      }
      rPlasma();
      window.addEventListener('resize', rPlasma);

      document.addEventListener('mousemove', e => {
        trail.push({ x: e.clientX, y: e.clientY, t: Date.now() });
        if (trail.length > MAX_TRAIL) trail.shift();
        pmx = e.clientX; pmy = e.clientY;
      });

      const PLASMA_HUES = [185, 185, 330, 90, 215];

      function drawPlasma() {
        pctx.clearRect(0, 0, pc.width, pc.height);
        if (trail.length < 2) { requestAnimationFrame(drawPlasma); return; }

        const now = Date.now();
        for (let i = 1; i < trail.length; i++) {
          const p0   = trail[i - 1];
          const p1   = trail[i];
          const age  = (now - p1.t) / 500;
          const frac = i / trail.length;
          if (age > 1) continue;

          const alpha  = (1 - age) * frac * 0.55;
          const width  = (1 - age) * frac * 4 + 0.5;
          const hue    = PLASMA_HUES[i % PLASMA_HUES.length];

          pctx.beginPath();
          pctx.moveTo(p0.x, p0.y);
          pctx.lineTo(p1.x, p1.y);
          pctx.strokeStyle = `hsla(${hue},100%,70%,${alpha})`;
          pctx.lineWidth   = width;
          pctx.lineCap     = 'round';
          pctx.stroke();

          /* Glow layer */
          pctx.beginPath();
          pctx.moveTo(p0.x, p0.y);
          pctx.lineTo(p1.x, p1.y);
          pctx.strokeStyle = `hsla(${hue},100%,90%,${alpha * 0.35})`;
          pctx.lineWidth   = width * 3;
          pctx.stroke();
        }
        requestAnimationFrame(drawPlasma);
      }
      drawPlasma();
    })();

    /* ---- ORBIT PLANET SYSTEM (on sphere canvas) ---- */
    (function() {
      /* We add orbiting elements on top of the sphere canvas */
      const orbitCanvas = document.getElementById('canvas-sphere');
      if (!orbitCanvas) return;

      /* We just inject a separate canvas overlay */
      const oc = document.createElement('canvas');
      oc.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2;';
      document.body.appendChild(oc);
      const octx = oc.getContext('2d');

      function rOrbit() {
        oc.width  = window.innerWidth;
        oc.height = window.innerHeight;
      }
      rOrbit();
      window.addEventListener('resize', rOrbit);

      let scrollFracO = 0;
      window.addEventListener('scroll', () => {
        scrollFracO = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      });

      const ORBITS = [
        { radius: 1.12, speed: 0.6,  size: 4, hue: 185, inclination: 0.3,  phase: 0 },
        { radius: 1.35, speed: 0.38, size: 6, hue: 90,  inclination: -0.5, phase: 2.1 },
        { radius: 1.55, speed: 0.22, size: 5, hue: 330, inclination: 0.7,  phase: 4.2 },
        { radius: 0.85, speed: 1.1,  size: 3, hue: 215, inclination: -0.2, phase: 1.0 },
      ];

      let orbitT = 0;
      function drawOrbits() {
        octx.clearRect(0, 0, oc.width, oc.height);

        const alpha0 = Math.max(0, 1 - scrollFracO * 8);
        if (alpha0 <= 0) { requestAnimationFrame(drawOrbits); return; }

        orbitT = performance.now() * 0.001;
        const scale   = Math.min(oc.width, oc.height) * 0.22;
        const originX = oc.width  * 0.70;
        const originY = oc.height * 0.44;

        ORBITS.forEach(orb => {
          const angle  = orbitT * orb.speed + orb.phase;
          const cosInc = Math.cos(orb.inclination);
          const sinInc = Math.sin(orb.inclination);
          /* 3D orbit point */
          const px3 = Math.cos(angle) * orb.radius;
          const pz3 = Math.sin(angle) * orb.radius;
          const py3 = pz3 * sinInc;
          const pz2 = pz3 * cosInc;
          const depth = 1 / (1 + pz2 * 0.3);
          const sx = originX + px3 * scale * depth;
          const sy = originY + py3 * scale * depth;
          const depthAlpha = (pz2 + 1) * 0.5; /* front=1, back=0 */

          /* Trail arc */
          const trailPoints = 24;
          octx.beginPath();
          for (let i = 0; i <= trailPoints; i++) {
            const a  = angle - (i / trailPoints) * Math.PI * 0.7;
            const tx3 = Math.cos(a) * orb.radius;
            const tz3 = Math.sin(a) * orb.radius;
            const ty3 = tz3 * sinInc;
            const tz2 = tz3 * cosInc;
            const td  = 1 / (1 + tz2 * 0.3);
            const tsx = originX + tx3 * scale * td;
            const tsy = originY + ty3 * scale * td;
            const ta  = (1 - i / trailPoints) * depthAlpha * 0.18 * alpha0;
            if (i === 0) {
              octx.moveTo(tsx, tsy);
            } else {
              octx.lineTo(tsx, tsy);
            }
          }
          octx.strokeStyle = `hsla(${orb.hue},100%,70%,${depthAlpha * 0.12 * alpha0})`;
          octx.lineWidth = 0.8;
          octx.stroke();

          /* Planet dot */
          octx.beginPath();
          octx.arc(sx, sy, orb.size * depth, 0, Math.PI * 2);
          octx.fillStyle = `hsla(${orb.hue},100%,75%,${depthAlpha * 0.85 * alpha0})`;
          octx.fill();
          /* Planet glow */
          octx.beginPath();
          octx.arc(sx, sy, orb.size * depth * 3, 0, Math.PI * 2);
          octx.fillStyle = `hsla(${orb.hue},100%,70%,${depthAlpha * 0.08 * alpha0})`;
          octx.fill();
        });

        requestAnimationFrame(drawOrbits);
      }
      drawOrbits();
    })();

    /* ---- NEBULA CLUSTER BACKGROUND ---- */
    (function() {
      const clusters = [
        { w:600, h:300, bg:'radial-gradient(ellipse,rgba(0,245,255,0.08),transparent 70%)',   top:'8%',  left:'-5%', base:0.5, dx:'30px', dy:'-20px', delay:0 },
        { w:500, h:500, bg:'radial-gradient(circle,rgba(255,0,110,0.07),transparent 70%)',    top:'40%', right:'-8%', base:0.4, dx:'-25px', dy:'30px', delay:'-3s' },
        { w:400, h:400, bg:'radial-gradient(circle,rgba(128,255,68,0.05),transparent 70%)',   bottom:'5%',left:'25%', base:0.35, dx:'20px', dy:'20px',delay:'-5s' },
        { w:350, h:350, bg:'radial-gradient(circle,rgba(100,120,255,0.06),transparent 70%)',  top:'60%', left:'10%', base:0.3, dx:'-15px', dy:'-25px', delay:'-7s' },
        { w:280, h:280, bg:'radial-gradient(circle,rgba(0,245,255,0.05),transparent 70%)',    top:'20%', right:'20%',base:0.25, dx:'10px', dy:'15px', delay:'-2s' },
      ];

      clusters.forEach(cl => {
        const el = document.createElement('div');
        el.className = 'nebula';
        el.style.cssText = [
          `width:${cl.w}px`, `height:${cl.h}px`,
          `background:${cl.bg}`,
          cl.top    ? `top:${cl.top}`    : '',
          cl.bottom ? `bottom:${cl.bottom}` : '',
          cl.left   ? `left:${cl.left}`  : '',
          cl.right  ? `right:${cl.right}` : '',
          `--nbase:${cl.base}`,
          `--ndx:${cl.dx}`, `--ndy:${cl.ndy||cl.dy}`,
          `animation-delay:${cl.delay||0}`,
        ].filter(Boolean).join(';');
        document.body.appendChild(el);
      });
    })();

    /* ---- SKILL BAR LASER SCAN ---- */
    (function() {
      const skillBars = document.querySelectorAll('.skill-bar');
      skillBars.forEach((bar, i) => {
        bar.style.setProperty('--ls-delay', `${(i * 0.18) % 2}s`);
      });
    })();

    /* ---- HUD CORNER DECORATION on each section ---- */
    (function() {
      document.querySelectorAll('section').forEach(sec => {
        const tl = document.createElement('div');
        tl.className = 'hud-corner-tl';
        const br = document.createElement('div');
        br.className = 'hud-corner-br';
        sec.appendChild(tl);
        sec.appendChild(br);
      });
    })();

    (function() {
      const flashObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting && !e.target.dataset.flashed) {
            e.target.classList.add('flash-in');
            e.target.dataset.flashed = '1';
            setTimeout(() => e.target.classList.remove('flash-in'), 1300);
          }
        });
      }, { threshold: 0.25 });
      document.querySelectorAll('section').forEach(s => flashObs.observe(s));
    })();

    /* ---- 3D TORUS RING (hero bottom left corner) ---- */
    (function() {
      const tc = document.createElement('canvas');
      tc.style.cssText = 'position:fixed;bottom:80px;left:20px;width:120px;height:120px;pointer-events:none;z-index:2;opacity:0.35';
      document.body.appendChild(tc);
      const tctx = tc.getContext('2d');
      tc.width = tc.height = 240;

      let scrollF2 = 0;
      window.addEventListener('scroll', () => {
        scrollF2 = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      });

      let torusT = 0;
      function drawTorus() {
        tctx.clearRect(0, 0, 240, 240);
        const alpha2 = Math.max(0, 1 - scrollF2 * 6);
        if (alpha2 <= 0) { requestAnimationFrame(drawTorus); return; }

        torusT += 0.022;
        const CX = 120, CY = 120;
        const R = 72, r = 22;
        const STEPS_T = 40, STEPS_P = 20;

        const points = [];
        for (let i = 0; i < STEPS_T; i++) {
          const theta = (i / STEPS_T) * Math.PI * 2;
          for (let j = 0; j < STEPS_P; j++) {
            const phi = (j / STEPS_P) * Math.PI * 2;
            const x3 = (R + r * Math.cos(phi)) * Math.cos(theta);
            const y3 = (R + r * Math.cos(phi)) * Math.sin(theta);
            const z3 = r * Math.sin(phi);
            /* Rotate Y */
            const cosT = Math.cos(torusT), sinT = Math.sin(torusT);
            const cosX = Math.cos(torusT * 0.4), sinX = Math.sin(torusT * 0.4);
            const rx = x3 * cosT - z3 * sinT;
            const rz = x3 * sinT + z3 * cosT;
            const ry = y3 * cosX - rz * sinX;
            const rz2 = y3 * sinX + rz * cosX;
            const fov = 400;
            const d  = fov / (fov + rz2);
            points.push({ sx: CX + rx * d, sy: CY + ry * d, depth: rz2 });
          }
        }

        /* Draw edges between adjacent points */
        for (let i = 0; i < STEPS_T; i++) {
          for (let j = 0; j < STEPS_P; j++) {
            const a = points[i * STEPS_P + j];
            const b = points[i * STEPS_P + (j + 1) % STEPS_P];
            const c = points[((i + 1) % STEPS_T) * STEPS_P + j];
            const depA = (a.depth + 100) / 200;
            tctx.beginPath(); tctx.moveTo(a.sx, a.sy); tctx.lineTo(b.sx, b.sy);
            tctx.strokeStyle = `rgba(128,255,68,${depA * 0.28 * alpha2})`;
            tctx.lineWidth = 0.7; tctx.stroke();
            tctx.beginPath(); tctx.moveTo(a.sx, a.sy); tctx.lineTo(c.sx, c.sy);
            tctx.strokeStyle = `rgba(0,245,255,${depA * 0.22 * alpha2})`;
            tctx.lineWidth = 0.7; tctx.stroke();
          }
        }
        requestAnimationFrame(drawTorus);
      }
      drawTorus();
    })();

    
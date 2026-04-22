
    /* ============================================================
       3D WIREFRAME SPHERE — Separate canvas
       ============================================================ */
    (function() {
      const sc = document.getElementById('canvas-sphere');
      const cx = sc.getContext('2d');
      let SW, SH;
      function resizeSphere() {
        SW = sc.width  = window.innerWidth;
        SH = sc.height = window.innerHeight;
      }
      resizeSphere();
      window.addEventListener('resize', resizeSphere);

      /* Build lat-long sphere */
      const STACKS = 9, SLICES = 14;
      const verts = [];
      for (let i = 0; i <= STACKS; i++) {
        const phi = Math.PI * i / STACKS;
        for (let j = 0; j < SLICES; j++) {
          const theta = 2 * Math.PI * j / SLICES;
          verts.push({
            x: Math.sin(phi) * Math.cos(theta),
            y: Math.cos(phi),
            z: Math.sin(phi) * Math.sin(theta),
          });
        }
      }
      const edges = [];
      for (let i = 0; i < STACKS; i++) {
        for (let j = 0; j < SLICES; j++) {
          const a = i * SLICES + j;
          const b = i * SLICES + (j + 1) % SLICES;
          const c = (i + 1) * SLICES + j;
          edges.push([a, b], [a, c]);
        }
      }

      let rotY = 0, rotX = 0;
      let tRotY = 0, tRotX = 0;
      document.addEventListener('mousemove', e => {
        tRotY = (e.clientX / window.innerWidth  - 0.5) * 0.4;
        tRotX = (e.clientY / window.innerHeight - 0.5) * 0.2;
      });

      let scrollFrac = 0;
      window.addEventListener('scroll', () => {
        scrollFrac = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      });

      function drawSphere() {
        cx.clearRect(0, 0, SW, SH);

        /* Sphere visible only when near hero (top 30% of page scroll) */
        const heroAlpha = Math.max(0, 1 - scrollFrac * 8);
        if (heroAlpha <= 0) { requestAnimationFrame(drawSphere); return; }

        rotY += (tRotY * 2 - rotY) * 0.04;
        rotX += (tRotX * 1.5 - rotX) * 0.04;
        const autoRot = performance.now() * 0.0003;

        const cosY = Math.cos(rotY + autoRot), sinY = Math.sin(rotY + autoRot);
        const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

        const scale = Math.min(SW, SH) * 0.22;
        /* Position sphere: right side of hero */
        const originX = SW * 0.70;
        const originY = SH * 0.44;

        const proj = verts.map(v => {
          /* Rotate Y */
          const x1 = v.x * cosY - v.z * sinY;
          const z1 = v.x * sinY + v.z * cosY;
          /* Rotate X */
          const y1 = v.y * cosX - z1 * sinX;
          const z2 = v.y * sinX + z1 * cosX;
          const fov = 600;
          const depth = fov / (fov + z2 * scale * 0.3);
          return {
            sx: originX + x1 * scale * depth,
            sy: originY + y1 * scale * depth,
            z: z2,
          };
        });

        /* Draw edges */
        edges.forEach(([ai, bi]) => {
          const a = proj[ai], b = proj[bi];
          const avgZ = (a.z + b.z) * 0.5;
          const edgeAlpha = ((avgZ + 1) * 0.5 * 0.22) * heroAlpha;
          cx.beginPath();
          cx.moveTo(a.sx, a.sy);
          cx.lineTo(b.sx, b.sy);
          cx.strokeStyle = `rgba(0,245,255,${Math.max(0.01, edgeAlpha)})`;
          cx.lineWidth = 0.7;
          cx.stroke();
        });

        /* Draw vertices */
        proj.forEach(p => {
          const vAlpha = ((p.z + 1) * 0.5 * 0.7) * heroAlpha;
          cx.beginPath();
          cx.arc(p.sx, p.sy, 1.4, 0, Math.PI * 2);
          cx.fillStyle = `rgba(0,245,255,${Math.max(0.04, vAlpha)})`;
          cx.fill();
        });

        /* Inner energy rings */
        for (let ring = 1; ring <= 3; ring++) {
          const rScale = scale * (0.4 + ring * 0.18);
          const rAlpha = (0.04 - ring * 0.01) * heroAlpha;
          const phase   = (performance.now() * 0.0005 * ring) % (Math.PI * 2);
          cx.beginPath();
          const points = 48;
          for (let p = 0; p < points; p++) {
            const ang = (p / points) * Math.PI * 2 + phase;
            const px = originX + Math.cos(ang) * rScale;
            const py = originY + Math.sin(ang) * rScale * 0.35;
            p === 0 ? cx.moveTo(px, py) : cx.lineTo(px, py);
          }
          cx.closePath();
          cx.strokeStyle = `rgba(0,245,255,${rAlpha})`;
          cx.lineWidth = 0.6;
          cx.stroke();
        }

        requestAnimationFrame(drawSphere);
      }
      drawSphere();
    })();

    /* ============================================================
       SIDE NAVIGATION DOTS
       ============================================================ */
    (function() {
      const dots = document.querySelectorAll('.side-dot');
      const secIds = ['home','about','skills','services','portfolio','contact'];
      const secs   = secIds.map(id => document.getElementById(id)).filter(Boolean);

      function updateDots() {
        const mid = window.scrollY + window.innerHeight * 0.5;
        let active = secs[0];
        secs.forEach(s => { if (s.offsetTop <= mid) active = s; });
        dots.forEach(d => {
          const href = d.getAttribute('href').replace('#', '');
          d.classList.toggle('dot-active', href === active.id);
        });
      }
      window.addEventListener('scroll', updateDots);
      updateDots();
    })();

    /* ============================================================
       3D TEXT EXTRUSION HERO TITLE
       ============================================================ */
    (function() {
      const glitch = document.querySelector('.glitch');
      if (!glitch) return;
      /* Build multi-layer text shadow to simulate 3D depth */
      const layers = [];
      for (let i = 1; i <= 12; i++) {
        const alpha = 0.06 - i * 0.004;
        layers.push(`${i}px ${i * 0.5}px 0px rgba(0,245,255,${Math.max(0,alpha)})`);
      }
      /* Hot pink deep shadow */
      for (let i = 1; i <= 6; i++) {
        layers.push(`${-i}px ${i}px 0px rgba(255,0,110,${0.03})`);
      }
      glitch.style.textShadow = layers.join(', ');

      /* Mouse-reactive extrusion shift */
      document.addEventListener('mousemove', e => {
        const nx = (e.clientX / window.innerWidth  - 0.5) * 2;
        const ny = (e.clientY / window.innerHeight - 0.5) * 2;
        const extrudeX = nx * 8, extrudeY = ny * 4;
        const shadows = [];
        for (let i = 1; i <= 12; i++) {
          const alpha = 0.06 - i * 0.004;
          shadows.push(`${extrudeX * (i/12)}px ${extrudeY * (i/12)}px 0px rgba(0,245,255,${Math.max(0,alpha)})`);
        }
        shadows.push(`0 0 40px rgba(0,245,255,0.15)`, `0 0 80px rgba(0,245,255,0.06)`);
        glitch.style.textShadow = shadows.join(', ');
      });
    })();

    /* ============================================================
       CANVAS WAVE SEPARATOR
       ============================================================ */
    (function() {
      /* Inject wave canvases between big sections */
      const insertPoints = ['#about', '#skills', '#portfolio'];
      insertPoints.forEach(sel => {
        const sec = document.querySelector(sel);
        if (!sec) return;
        const wc = document.createElement('canvas');
        wc.className = 'wave-canvas';
        wc.style.cssText = 'position:absolute;bottom:-1px;left:0;right:0;width:100%;height:80px;pointer-events:none;z-index:3;';
        sec.style.position = 'relative';
        sec.appendChild(wc);

        const wctx = wc.getContext('2d');
        let WW = 0;
        function resizeWave() { WW = wc.width = wc.offsetWidth; wc.height = 80; }
        resizeWave();
        window.addEventListener('resize', resizeWave);

        let t = 0;
        function drawWave() {
          wctx.clearRect(0, 0, WW, 80);
          wctx.beginPath();
          wctx.moveTo(0, 80);
          for (let x = 0; x <= WW; x++) {
            const y = 40 + Math.sin((x / WW) * Math.PI * 3 + t) * 12
                       + Math.sin((x / WW) * Math.PI * 6 + t * 1.5) * 6;
            wctx.lineTo(x, y);
          }
          wctx.lineTo(WW, 80); wctx.closePath();
          wctx.fillStyle = 'rgba(0,245,255,0.02)';
          wctx.fill();
          wctx.beginPath();
          for (let x = 0; x <= WW; x++) {
            const y = 44 + Math.sin((x / WW) * Math.PI * 3 + t + 1) * 10
                       + Math.cos((x / WW) * Math.PI * 5 + t * 1.2) * 6;
            x === 0 ? wctx.moveTo(x, y) : wctx.lineTo(x, y);
          }
          wctx.strokeStyle = 'rgba(0,245,255,0.07)';
          wctx.lineWidth = 1.5;
          wctx.stroke();
          t += 0.018;
          requestAnimationFrame(drawWave);
        }
        drawWave();
      });
    })();

    /* ============================================================
       FLOATING DIAMONDS ANIMATION
       ============================================================ */
    (function() {
      const style = document.createElement('style');
      style.textContent = `
        .float-diamond {
          position: absolute;
          color: rgba(0,245,255,0.12);
          font-size: 14px;
          pointer-events: none;
          z-index: 0;
          animation: diamondFloat 8s ease-in-out infinite alternate;
          user-select: none;
        }
        @keyframes diamondFloat {
          0%   { transform: translateY(0)   rotate(0deg)   scale(1); }
          33%  { transform: translateY(-20px) rotate(60deg)  scale(1.1); }
          66%  { transform: translateY(-8px)  rotate(120deg) scale(0.9); }
          100% { transform: translateY(-30px) rotate(180deg) scale(1.05); }
        }
      `;
      document.head.appendChild(style);
    })();

    /* ============================================================
       SIDE DOTS CSS INJECTION
       ============================================================ */
    (function() {
      const style = document.createElement('style');
      style.textContent = `
        #side-dots {
          position: fixed;
          right: 24px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 14px;
          z-index: 450;
        }
        .side-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          border: 1px solid rgba(0,245,255,0.4);
          background: transparent;
          display: block;
          position: relative;
          transition: all 0.35s cubic-bezier(0.23,1,0.32,1);
        }
        .side-dot::before {
          content: attr(data-label);
          position: absolute;
          right: 20px; top: 50%;
          transform: translateY(-50%);
          font-family: var(--font-mono);
          font-size: 10px; letter-spacing: 2px;
          color: var(--cyan);
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
        }
        .side-dot:hover::before, .side-dot.dot-active::before { opacity: 1; }
        .side-dot.dot-active {
          background: var(--cyan);
          box-shadow: 0 0 10px var(--cyan), 0 0 20px rgba(0,245,255,0.3);
          transform: scale(1.5);
          border-color: var(--cyan);
        }
        .side-dot:hover {
          background: rgba(0,245,255,0.3);
          transform: scale(1.3);
        }
        @media (max-width: 900px) { #side-dots { display: none; } }
      `;
      document.head.appendChild(style);
    })();

    /* ============================================================
       FLIP CARD CSS INJECTION
       ============================================================ */
    (function() {
      const style = document.createElement('style');
      style.textContent = `
        .flip-card {
          perspective: 1000px;
          cursor: pointer;
        }
        .flip-inner {
          position: relative;
          width: 100%; height: 100%;
          min-height: 340px;
          transform-style: preserve-3d;
          transition: transform 0.7s cubic-bezier(0.23,1,0.32,1);
        }
        .flip-card:hover .flip-inner {
          transform: rotateY(180deg);
        }
        .flip-front, .flip-back {
          position: absolute; inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border: 1px solid var(--border);
          display: flex; flex-direction: column;
        }
        .flip-front {
          background: var(--bg2);
        }
        .flip-back {
          transform: rotateY(180deg);
          background: linear-gradient(135deg, #060c16 0%, #020810 100%);
          border-color: rgba(0,245,255,0.25);
          box-shadow: inset 0 0 40px rgba(0,245,255,0.04);
          padding: 28px;
          justify-content: center;
          gap: 14px;
        }
        .flip-hint {
          font-family: var(--font-mono);
          font-size: 9px; letter-spacing: 2px;
          color: var(--muted);
          padding: 8px 16px;
          text-align: right;
          border-top: 1px solid var(--border);
          transition: color 0.3s;
        }
        .flip-card:hover .flip-hint { color: var(--cyan); }
        .flip-back-tag {
          font-family: var(--font-mono);
          font-size: 10px; letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--cyan);
        }
        .flip-back-title {
          font-family: var(--font-display);
          font-size: 20px; font-weight: 800;
          line-height: 1.2;
          color: var(--white);
        }
        .flip-back-desc {
          font-size: 13px; color: var(--muted);
          line-height: 1.7; flex: 1;
        }
        .flip-back-tech {
          display: flex; flex-wrap: wrap; gap: 6px;
        }
        .flip-back-tech span {
          font-family: var(--font-mono);
          font-size: 10px; letter-spacing: 1px;
          padding: 4px 10px;
          border: 1px solid rgba(0,245,255,0.2);
          color: var(--cyan);
        }
        .flip-back-btn {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: var(--font-mono);
          font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
          color: var(--bg);
          background: var(--cyan);
          padding: 10px 20px; text-decoration: none;
          transition: box-shadow 0.3s;
          width: fit-content;
        }
        .flip-back-btn:hover {
          box-shadow: 0 0 20px rgba(0,245,255,0.5);
        }
      `;
      document.head.appendChild(style);
    })();

    

    /* ============================================================
       ADVANCED ANIMATIONS — Active Theory Inspired
       ============================================================ */

    /* ---- SCROLL PROGRESS BAR ---- */
    const scrollProg = document.getElementById('scroll-progress');
    window.addEventListener('scroll', () => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
      scrollProg.style.width = pct + '%';
    });

    /* ---- AMBIENT GLOW FOLLOWS CURSOR ---- */
    const ambientGlow = document.getElementById('ambient-glow');
    let agx = 0, agy = 0, tagx = 0, tagy = 0;
    document.addEventListener('mousemove', e => { tagx = e.clientX; tagy = e.clientY; });
    (function ambientLoop() {
      agx += (tagx - agx) * 0.04;
      agy += (tagy - agy) * 0.04;
      ambientGlow.style.left = agx + 'px';
      ambientGlow.style.top  = agy + 'px';
      requestAnimationFrame(ambientLoop);
    })();

    /* ---- HERO MOUSE PARALLAX ---- */
    const heroSection  = document.getElementById('home');
    const heroContent  = document.querySelector('.hero-content');
    const heroHud      = document.querySelector('.hero-hud');
    let plx = 0, ply = 0, tplx = 0, tply = 0;
    heroSection.addEventListener('mousemove', e => {
      const rect = heroSection.getBoundingClientRect();
      tplx = ((e.clientX - rect.left) / rect.width  - 0.5) * 24;
      tply = ((e.clientY - rect.top)  / rect.height - 0.5) * 16;
    });
    heroSection.addEventListener('mouseleave', () => { tplx = 0; tply = 0; });
    (function parallaxLoop() {
      plx += (tplx - plx) * 0.06;
      ply += (tply - ply) * 0.06;
      if (heroContent)
        heroContent.style.transform = `translate(${plx * 0.4}px, ${ply * 0.3}px)`;
      if (heroHud)
        heroHud.style.transform = `translate(${-plx * 0.6}px, ${-ply * 0.4}px)`;
      requestAnimationFrame(parallaxLoop);
    })();

    /* ---- MAGNETIC BUTTONS ---- */
    function initMagnetic() {
      document.querySelectorAll('.btn-primary, .btn-outline, .nav-cta').forEach(btn => {
        btn.addEventListener('mousemove', e => {
          const r = btn.getBoundingClientRect();
          const cx = r.left + r.width  / 2;
          const cy = r.top  + r.height / 2;
          const dx = (e.clientX - cx) * 0.3;
          const dy = (e.clientY - cy) * 0.3;
          btn.style.transform = `translate(${dx}px, ${dy}px)`;
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = 'translate(0,0)';
        });
      });
    }
    initMagnetic();

    /* ---- 3D CARD TILT ---- */
    function initTilt() {
      document.querySelectorAll('.project-card, .service-card, .skill-card').forEach(card => {
        // Add shine element if not present
        if (!card.querySelector('.tilt-shine')) {
          const shine = document.createElement('div');
          shine.className = 'tilt-shine';
          card.style.position = 'relative';
          card.appendChild(shine);
        }
        card.addEventListener('mousemove', e => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width;
          const y = (e.clientY - r.top)  / r.height;
          const rx =  (y - 0.5) * -12;
          const ry =  (x - 0.5) *  12;
          card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
          const shine = card.querySelector('.tilt-shine');
          if (shine) {
            shine.style.background = `radial-gradient(circle at ${x*100}% ${y*100}%, rgba(0,245,255,0.1) 0%, transparent 60%)`;
            shine.style.opacity = '1';
          }
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) scale(1)';
          const shine = card.querySelector('.tilt-shine');
          if (shine) shine.style.opacity = '0';
        });
        card.addEventListener('mouseenter', () => {
          card.style.transition = 'transform 0.1s ease, box-shadow 0.3s';
        });
        card.addEventListener('mouseleave', () => {
          card.style.transition = 'transform 0.5s var(--ease-out-expo), box-shadow 0.3s';
        });
      });
    }
    initTilt();

    /* ---- CHAR SPLIT REVEAL ---- */
    function splitChars(el) {
      const txt = el.textContent;
      el.textContent = '';
      el.classList.add('char-reveal');
      [...txt].forEach((ch, i) => {
        if (ch === ' ') {
          const sp = document.createElement('span');
          sp.className = 'space';
          el.appendChild(sp);
        } else {
          const span = document.createElement('span');
          span.className = 'char';
          span.textContent = ch;
          span.style.transitionDelay = (i * 0.03) + 's';
          el.appendChild(span);
        }
      });
    }
    // Apply to section titles
    document.querySelectorAll('.section-title').forEach(el => {
      // Skip if has nested HTML (sub-spans with colors)
      if (el.children.length === 0) splitChars(el);
    });
    // Observe char reveals
    const charObs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.2 }
    );
    document.querySelectorAll('.char-reveal').forEach(el => charObs.observe(el));

    /* ---- NUMBER SCRAMBLE ON COUNTERS ---- */
    const CHARS = '0123456789';
    function scrambleNum(el, target, duration) {
      const start = performance.now();
      el.classList.add('scrambling');
      function frame(now) {
        const elapsed = now - start;
        const prog    = Math.min(elapsed / duration, 1);
        if (prog < 1) {
          el.textContent = CHARS[Math.floor(Math.random() * CHARS.length)] + '+';
          requestAnimationFrame(frame);
        } else {
          el.textContent = target + '+';
          el.classList.remove('scrambling');
        }
      }
      requestAnimationFrame(frame);
    }
    // Override counter animation with scramble
    const scrambleObs = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          document.querySelectorAll('[data-count]').forEach((el, i) => {
            const t = +el.dataset.count;
            setTimeout(() => scrambleNum(el, t, 800 + i * 200), i * 150);
          });
          scrambleObs.disconnect();
        }
      }, { threshold: 0.3 }
    );
    scrambleObs.observe(document.getElementById('home'));

    /* ---- NAV ACTIVE SECTION HIGHLIGHT ---- */
    const navLinks = document.querySelectorAll('nav a:not(.nav-cta)');
    const sections = ['home','about','skills','services','portfolio','ai-section','contact']
      .map(id => document.getElementById(id)).filter(Boolean);
    function updateNavActive() {
      const scrollMid = window.scrollY + window.innerHeight * 0.4;
      let active = sections[0];
      sections.forEach(sec => {
        if (sec.offsetTop <= scrollMid) active = sec;
      });
      navLinks.forEach(a => {
        const href = a.getAttribute('href').replace('#','');
        a.classList.toggle('nav-active', href === active.id);
      });
    }
    window.addEventListener('scroll', updateNavActive);
    updateNavActive();

    /* ---- STAGGER CHILDREN OBSERVER ---- */
    // Add stagger class to grids
    document.querySelectorAll('.skills-grid, .services-grid, .portfolio-grid').forEach(el => {
      el.classList.add('stagger-children');
    });
    const staggerObs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.06 }
    );
    document.querySelectorAll('.stagger-children').forEach(el => staggerObs.observe(el));

    /* ---- SECTION DIVIDERS ---- */
    document.querySelectorAll('section').forEach(sec => {
      if (!sec.querySelector('.section-divider')) {
        const div = document.createElement('div');
        div.className = 'section-divider';
        sec.appendChild(div);
      }
    });

    /* ---- SMOOTH SCROLL LERP (override native anchor clicks) ---- */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const start   = window.scrollY;
        const end     = target.getBoundingClientRect().top + window.scrollY - 80;
        const dist    = end - start;
        const t0      = performance.now();
        const dur     = Math.min(800, Math.abs(dist) * 0.5); // Faster overall duration
        function easeOutExpo(t) {
          return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }
        function step(now) {
          const elapsed = Math.min((now - t0) / dur, 1);
          window.scrollTo(0, start + dist * easeOutExpo(elapsed));
          if (elapsed < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    });

    /* ---- PAGE ENTER ANIMATION (after loader) ---- */
    document.getElementById('loader').addEventListener('transitionend', () => {
      document.body.style.overflow = 'auto';
    });
    document.body.style.overflow = 'hidden';
    setTimeout(() => { document.body.style.overflow = 'auto'; }, 2500);



    /* ============================================================
       3D EFFECTS — Extra Layer
       ============================================================ */

    /* ---- SCROLL VELOCITY SKEW (Removed for better UX) ---- */

    /* ---- CLICK RIPPLE ON CURSOR ---- */
    const cursorDot = document.getElementById('cursor-dot');
    document.addEventListener('mousedown', () => {
      cursorDot.classList.add('clicking');
    });
    document.addEventListener('mouseup', () => {
      cursorDot.classList.remove('clicking');
    });
    document.addEventListener('click', e => {
      // Canvas ripple at click point
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position:fixed; left:${e.clientX}px; top:${e.clientY}px;
        width:0; height:0;
        border-radius:50%;
        border:1px solid rgba(0,245,255,0.6);
        transform:translate(-50%,-50%);
        pointer-events:none; z-index:9997;
        animation: rippleOut 0.6s ease-out forwards;
      `;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
    // Inject ripple keyframes once
    if (!document.getElementById('ripple-style')) {
      const rs = document.createElement('style');
      rs.id = 'ripple-style';
      rs.textContent = `
        @keyframes rippleOut {
          from { width:0; height:0; opacity:0.8; }
          to   { width:120px; height:120px; opacity:0; }
        }
      `;
      document.head.appendChild(rs);
    }

    /* ---- 3D REVEAL OBSERVER ---- */
    // Apply reveal-3d to section headings and major blocks
    document.querySelectorAll('.section-header, .about-grid, .about-right, .contact-grid').forEach((el, i) => {
      el.classList.add('reveal-3d');
      if (i % 3 === 1) el.classList.add('reveal-delay-1');
      if (i % 3 === 2) el.classList.add('reveal-delay-2');
    });
    const obs3d = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal-3d').forEach(el => obs3d.observe(el));

    /* ---- SECTION TAG LINE-DRAW REVEAL ---- */
    const tagObs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.5 }
    );
    document.querySelectorAll('.section-tag').forEach(el => tagObs.observe(el));

    /* ---- ABOUT PHOTO 3D PARALLAX ON MOUSEMOVE ---- */
    const photoWrap = document.querySelector('.about-photo-wrap');
    const photoFrame = document.querySelector('.about-photo-frame');
    if (photoWrap && photoFrame) {
      photoWrap.addEventListener('mousemove', e => {
        const r  = photoWrap.getBoundingClientRect();
        const x  = (e.clientX - r.left) / r.width;
        const y  = (e.clientY - r.top)  / r.height;
        const ry = (x - 0.5) * 18;
        const rx = (y - 0.5) * -12;
        photoFrame.style.transition = 'transform 0.08s ease';
        photoFrame.style.transform  = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
      });
      photoWrap.addEventListener('mouseleave', () => {
        photoFrame.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1)';
        photoFrame.style.transform  = 'perspective(900px) rotateX(0) rotateY(0) scale(1)';
      });
    }

    /* ---- DEEP HERO PARALLAX (multi-layer depth) ---- */
    const heroSec2 = document.getElementById('home');
    const layers = [
      { el: document.querySelector('.hero-badge'),    dx: 0.15, dy: 0.10 },
      { el: document.querySelector('.hero-title'),    dx: 0.25, dy: 0.18 },
      { el: document.querySelector('.hero-subtitle'), dx: 0.18, dy: 0.12 },
      { el: document.querySelector('.hero-desc'),     dx: 0.12, dy: 0.08 },
      { el: document.querySelector('.hero-actions'),  dx: 0.08, dy: 0.05 },
      { el: document.querySelector('.hero-stats'),    dx: 0.05, dy: 0.03 },
      { el: document.querySelector('.hero-grid-floor'), dx:-0.06, dy:-0.04 },
    ].filter(l => l.el);

    let dpx = 0, dpy = 0, tdpx = 0, tdpy = 0;
    heroSec2 && heroSec2.addEventListener('mousemove', e => {
      const r = heroSec2.getBoundingClientRect();
      tdpx = (e.clientX - r.left - r.width  / 2);
      tdpy = (e.clientY - r.top  - r.height / 2);
    });
    heroSec2 && heroSec2.addEventListener('mouseleave', () => { tdpx = 0; tdpy = 0; });

    (function deepParallax() {
      dpx += (tdpx - dpx) * 0.06;
      dpy += (tdpy - dpy) * 0.06;
      layers.forEach(l => {
        l.el.style.transform = `translate(${dpx * l.dx}px, ${dpy * l.dy}px)`;
      });
      requestAnimationFrame(deepParallax);
    })();

    /* ---- HERO GRID FLOOR MOUSE WARP ---- */
    const gridFloor = document.querySelector('.hero-grid-floor');
    if (gridFloor && heroSec2) {
      heroSec2.addEventListener('mousemove', e => {
        const r  = heroSec2.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width  - 0.5;
        const ny = (e.clientY - r.top)  / r.height - 0.5;
        gridFloor.style.transform =
          `perspective(500px) rotateX(${72 + ny * 6}deg) rotateY(${nx * 4}deg)`;
      });
      heroSec2.addEventListener('mouseleave', () => {
        gridFloor.style.transform = 'perspective(500px) rotateX(72deg)';
      });
    }

    /* ---- NEON BORDER ANIMATION (services) ---- */
    // Already done via CSS @property --angle + spinBorder
    // Extra: add CSS variable on each card to stagger start angle
    document.querySelectorAll('.service-card').forEach((card, i) => {
      card.style.setProperty('--angle', `${i * 90}deg`);
    });

    /* ---- STAT GLOW PULSE LOOP ---- */
    setInterval(() => {
      document.querySelectorAll('.stat-num').forEach(el => {
        el.style.textShadow = '0 0 40px rgba(0,245,255,0.7)';
        setTimeout(() => { el.style.textShadow = ''; }, 200);
      });
    }, 3000);

    
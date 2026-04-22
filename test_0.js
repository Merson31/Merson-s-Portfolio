
    /* ============================================================
       LOADER
       ============================================================ */
    const loader = document.getElementById('loader');
    const loaderBar = document.getElementById('loaderBar');
    const loaderPct = document.getElementById('loaderPct');
    let pct = 0;
    const loaderInterval = setInterval(() => {
      pct += Math.random() * 8 + 2;
      if (pct >= 100) {
        pct = 100;
        clearInterval(loaderInterval);
        setTimeout(() => loader.classList.add('hidden'), 400);
      }
      loaderBar.style.width = pct + '%';
      loaderPct.textContent = String(Math.floor(pct)).padStart(3, '0') + '%';
    }, 60);

    /* ============================================================
       CURSOR
       ============================================================ */
    const dot   = document.getElementById('cursor-dot');
    const ring  = document.getElementById('cursor-ring');
    const trail = document.getElementById('cursor-trail');
    let mx = 0, my = 0, rx = 0, ry = 0, tx = 0, ty = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    });
    (function loopCursor() {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      tx += (mx - tx) * 0.06;
      ty += (my - ty) * 0.06;
      trail.style.left = tx + 'px';
      trail.style.top  = ty + 'px';
      requestAnimationFrame(loopCursor);
    })();

    document.querySelectorAll('a, button, .project-card, .service-card, .skill-card, input, textarea').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    /* ============================================================
       3D HYPERSPACE CANVAS PARTICLE SYSTEM
       ============================================================ */
    const canvas = document.getElementById('canvas-bg');
    const ctx    = canvas.getContext('2d');
    let W, H;
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;

    document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    /* 3D constants */
    const FOCAL = 350;
    const FAR   = 18;
    const NEAR  = 0.6;
    const SPEED = 0.055;

    class Star {
      constructor(init) { this.reset(init); }
      reset(init) {
        this.x   = (Math.random() - 0.5) * 7;
        this.y   = (Math.random() - 0.5) * 5;
        this.z   = init ? Math.random() * FAR + NEAR : FAR;
        this.pz  = this.z;
        // Thin ring nebula
        const angle = Math.random() * Math.PI * 2;
        const ring  = Math.random() > 0.4;
        if (ring) {
          const r = 1.5 + Math.random() * 2;
          this.x = Math.cos(angle) * r;
          this.y = Math.sin(angle) * r * 0.5;
        }
        this.hue   = [185, 185, 330, 90][Math.floor(Math.random() * 4)];
        this.size  = Math.random() * 1.3 + 0.2;
      }
      update() {
        this.pz = this.z;
        // Mouse drift in 3D space
        const mx = (mouseX / W - 0.5) * 0.01;
        const my = (mouseY / H - 0.5) * 0.008;
        this.x += mx;
        this.y += my;
        this.z -= SPEED;
        if (this.z <= NEAR) this.reset(false);
      }
      draw() {
        const sx  = (this.x  / this.z)  * FOCAL + W / 2;
        const sy  = (this.y  / this.z)  * FOCAL + H / 2;
        const spx = (this.x  / this.pz) * FOCAL + W / 2;
        const spy = (this.y  / this.pz) * FOCAL + H / 2;

        if (sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) return;

        const depth = 1 - this.z / FAR;
        const alpha = Math.min(1, depth * 1.4 + 0.05);
        const r     = Math.max(0.15, this.size * depth * 2.5);

        // Streak trail
        const dx = sx - spx, dy = sy - spy;
        const trailLen = Math.sqrt(dx * dx + dy * dy);
        if (trailLen > 0.3) {
          ctx.beginPath();
          ctx.moveTo(spx, spy);
          ctx.lineTo(sx, sy);
          ctx.strokeStyle = `hsla(${this.hue},100%,75%,${alpha * 0.45})`;
          ctx.lineWidth = r * 0.8;
          ctx.stroke();
        }
        // Bright dot tip
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue},100%,90%,${alpha})`;
        ctx.fill();
        // Micro glow
        if (depth > 0.75) {
          ctx.beginPath();
          ctx.arc(sx, sy, r * 3, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${this.hue},100%,70%,${(depth - 0.75) * 0.08})`;
          ctx.fill();
        }
      }
    }

    let stars = [];
    function initStars() {
      stars = [];
      const count = Math.min(220, Math.floor(W * H / 5500));
      for (let i = 0; i < count; i++) stars.push(new Star(true));
    }
    initStars();
    window.addEventListener('resize', initStars);

    /* Mouse aura on canvas */
    function drawMouseGlow() {
      if (mouseX < 0) return;
      const g = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 180);
      g.addColorStop(0, 'rgba(0,245,255,0.022)');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    function animateCanvas() {
      /* Faint fade — creates the trail effect */
      ctx.fillStyle = 'rgba(2,4,8,0.18)';
      ctx.fillRect(0, 0, W, H);
      drawMouseGlow();
      stars.forEach(s => { s.update(); s.draw(); });
      requestAnimationFrame(animateCanvas);
    }
    animateCanvas();

    /* ============================================================
       HEADER SCROLL
       ============================================================ */
    const header = document.getElementById('header');
    const scrollTopBtn = document.getElementById('scroll-top');
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 60);
      scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
    });

    /* ============================================================
       MOBILE NAV
       ============================================================ */
    const menuBtn   = document.getElementById('menuBtn');
    const mobileNav = document.getElementById('mobileNav');
    menuBtn.addEventListener('click', () => mobileNav.classList.toggle('open'));
    function closeMobileNav() { mobileNav.classList.remove('open'); }

    /* ============================================================
       INTERSECTION REVEAL
       ============================================================ */
    const revealObs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

    /* ============================================================
       COUNTER ANIMATION
       ============================================================ */
    function animateCounters() {
      document.querySelectorAll('[data-count]').forEach(el => {
        const target = +el.dataset.count;
        let cur = 0;
        const tickMs = 40;
        const step = target / 40;
        const t = setInterval(() => {
          cur = Math.min(cur + step, target);
          el.textContent = Math.floor(cur) + '+';
          if (cur >= target) clearInterval(t);
        }, tickMs);
      });
    }
    const counterObs = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) { animateCounters(); counterObs.disconnect(); } },
      { threshold: 0.3 }
    );
    counterObs.observe(document.getElementById('home'));

    /* ============================================================
       TYPED NAME EFFECT
       ============================================================ */
    const names = ['Full-Stack Developer', 'UI/UX Designer', 'Web Craftsman', 'Creative Coder'];
    let ni = 0, ci = 0, deleting = false;
    const typedEl = document.getElementById('typed-name');

    function typeEffect() {
      const curr = names[ni];
      if (!deleting) {
        typedEl.textContent = curr.substring(0, ci + 1);
        ci++;
        if (ci === curr.length) { deleting = true; setTimeout(typeEffect, 2200); return; }
        setTimeout(typeEffect, 65);
      } else {
        typedEl.textContent = curr.substring(0, ci - 1);
        ci--;
        if (ci === 0) { deleting = false; ni = (ni + 1) % names.length; setTimeout(typeEffect, 400); return; }
        setTimeout(typeEffect, 35);
      }
    }
    typeEffect();

    /* ============================================================
       HUD CLOCK
       ============================================================ */
    const hudTime = document.getElementById('hud-time');
    setInterval(() => {
      const d = new Date();
      hudTime.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()]
        .map(n => String(n).padStart(2, '0')).join(':');
    }, 1000);

    /* ============================================================
       FORM SETUP
       ============================================================ */
    document.getElementById('returnUrlInput').value = window.location.href;

    /* ============================================================
       AI CHAT
       ============================================================ */
    const chatArea  = document.getElementById('chatArea');
    const chatInput = document.getElementById('chatInput');
    const chatSend  = document.getElementById('chatSend');

    const responses = {
      skills:      "Merson is proficient in HTML5, CSS3, JavaScript, PHP, Laravel, MySQL, Tailwind CSS, Bootstrap, and Figma. He's a versatile full-stack developer! 💻",
      project:     "He has built 7+ projects including an Instagram Unfollowers Checker, E-Kuesioner system, Tourism Info System, and several web design projects. View the Portfolio section!",
      contact:     "You can reach Merson via the contact form below, or through his social media (Facebook, Instagram, X, YouTube). He's based in Rantepao, South Sulawesi.",
      hire:        "Merson is currently available for freelance work! Click the 'Hire Me' button or use the contact form to get in touch. He responds quickly! ⚡",
      experience:  "Merson has 2+ years of professional experience in full-stack development and UI/UX design with 3 certifications to his name.",
      laravel:     "Yes! Laravel is one of Merson's core technologies. He uses it for building scalable backend systems with MySQL.",
      hello:       "Hello! 👋 How can I help you today? Ask me about Merson's skills, projects, availability, or anything else!",
      default:     "That's a great question! For specific inquiries, please use the contact form to reach Merson directly. He'll get back to you promptly. 🚀"
    };

    function getBotReply(msg) {
      const m = msg.toLowerCase();
      if (m.match(/skill|tech|know|language|stack/)) return responses.skills;
      if (m.match(/project|work|portfolio|built|build/)) return responses.project;
      if (m.match(/contact|reach|email|phone|location/)) return responses.contact;
      if (m.match(/hire|freelanc|available|price|cost/)) return responses.hire;
      if (m.match(/experience|year|certif/)) return responses.experience;
      if (m.match(/laravel|php|mysql|backend/)) return responses.laravel;
      if (m.match(/hello|hi|hey|halo|hey/)) return responses.hello;
      return responses.default;
    }

    function addMsg(text, who) {
      const d = document.createElement('div');
      d.className = 'msg ' + who;
      d.textContent = text;
      chatArea.appendChild(d);
      chatArea.scrollTop = chatArea.scrollHeight;
    }

    function sendChat() {
      const v = chatInput.value.trim();
      if (!v) return;
      addMsg(v, 'user');
      chatInput.value = '';
      setTimeout(() => addMsg(getBotReply(v), 'bot'), 600);
    }

    chatSend.addEventListener('click', sendChat);
    chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });
    
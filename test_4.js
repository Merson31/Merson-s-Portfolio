
  /* ============================================================
     ENGAGEMENT SYSTEM — all wrapped in IIFE to avoid scope conflicts
     ============================================================ */
  (function() {

  /* ---- DATA ---- */
  const ACH_LIST = [
    {id:'welcome',  icon:'👋', name:'Welcome Explorer',  desc:'Visited the portfolio'},
    {id:'scroller', icon:'📜', name:'Curious Mind',      desc:'Scrolled through all sections'},
    {id:'flipper',  icon:'🎴', name:'Card Flipper',      desc:'Flipped all 6 project cards'},
    {id:'chatter',  icon:'💬', name:'Communicator',      desc:'Used the AI chat assistant'},
    {id:'player',   icon:'🎮', name:'Player One',        desc:'Launched Neon Catch'},
    {id:'winner',   icon:'🏆', name:'High Scorer',       desc:'Scored 10+ in Neon Catch'},
    {id:'reader',   icon:'⏱️', name:'Deep Reader',       desc:'Spent 2+ minutes here'},
    {id:'nightowl', icon:'🦉', name:'Night Owl',         desc:'Visiting after midnight'},
    {id:'konami',   icon:'🕹️', name:'Old School Gamer',  desc:'Found the secret button combo'},
    {id:'hirer',    icon:'💼', name:'Potential Client',  desc:'Clicked "Hire Me"'},
  ];

  const PROJ_DATA = [
    {img:'img/sc2.png',   type:'Web Development', title:'Instagram Unfollowers Checker',
     desc:'A Laravel-powered tool to detect Instagram users who don\'t follow back. Built with OAuth authentication, real-time data sync, and a clean cyberpunk UI.',
     techs:['Laravel','PHP','MySQL','OAuth','Railway'],
     link:'https://laravel-unfollowers-checker-production.up.railway.app/'},
    {img:'img/sc1.png',   type:'Web Development', title:'E-Kuesioner UKI Toraja',
     desc:'A digital questionnaire system for UKI University Toraja. Supports multi-question types, real-time analytics dashboard, and PDF export for administrators.',
     techs:['Laravel','MySQL','Bootstrap','Chart.js'],
     link:'maintenance.html'},
    {img:'img/sc4.png',   type:'Web Development', title:'North Toraja Tourism System',
     desc:'Integrated tourism platform for North Toraja regency. Features destination listings, ticket booking system, and interactive maps integration.',
     techs:['Laravel','MySQL','Maps API','Bootstrap'],
     link:'maintenance.html'},
    {img:'img/sc3.png',   type:'Web Development', title:'Junior High School Zoning System',
     desc:'A zone-based school admissions system managing student enrollment with geographic filtering and automated placement scoring for new academic year registration.',
     techs:['PHP','MySQL','JavaScript','CSS'],
     link:'maintenance.html'},
    {img:'img/img100.JPG',type:'Web Design', title:'PM Wedding Website',
     desc:'An elegant wedding invitation website with animated countdown timer, RSVP form, photo gallery, and event schedule. Designed with a dark romantic theme.',
     techs:['HTML','CSS','JavaScript','Firebase'],
     link:'https://merson31.github.io/pm_wedding/'},
    {img:'img/img101.JPG',type:'Web Design', title:'Toraja Wanderlust Tourism Website',
     desc:'A visual tourism website showcasing South Sulawesi\'s natural beauty and cultural heritage. Responsive design with parallax hero and destination gallery.',
     techs:['HTML','CSS','Figma','JavaScript'],
     link:'maintenance.html'},
  ];

  /* ---- ACHIEVEMENT ENGINE ---- */
  const engUnlocked = new Set(JSON.parse(localStorage.getItem('merson_ach') || '[]'));
  let   engQueue    = [];
  let   engShowing  = false;

  function showNextEngAch() {
    if (!engQueue.length) { engShowing = false; return; }
    engShowing = true;
    const a = engQueue.shift();
    const t = document.getElementById('achievement-toast');
    if (!t) return;
    document.getElementById('ach-icon').textContent = a.icon;
    document.getElementById('ach-name').textContent = a.name;
    document.getElementById('ach-desc').textContent = a.desc;
    t.classList.add('show');
    setTimeout(() => { t.classList.remove('show'); setTimeout(showNextEngAch, 600); }, 3600);
  }

  function unlockAch(id) {
    if (engUnlocked.has(id)) return;
    engUnlocked.add(id);
    localStorage.setItem('merson_ach', JSON.stringify([...engUnlocked]));
    const a = ACH_LIST.find(x => x.id === id);
    if (!a) return;
    engQueue.push(a);
    if (!engShowing) showNextEngAch();
    refreshAchPanel();
  }
  /* Expose globally so game / konami IIFEs can call it */
  window.unlockAch = unlockAch;

  function refreshAchPanel() {
    const cnt = engUnlocked.size;
    const cntEl = document.getElementById('ach-count');
    const pcntEl = document.getElementById('ach-panel-count');
    const listEl = document.getElementById('ach-list');
    if (cntEl)  cntEl.textContent  = cnt;
    if (pcntEl) pcntEl.textContent = cnt + '/10';
    if (!listEl) return;
    listEl.innerHTML = '';
    ACH_LIST.forEach(a => {
      const got = engUnlocked.has(a.id);
      listEl.insertAdjacentHTML('beforeend', `
        <div class="ach-row ${got ? 'got' : ''}">
          <div class="ach-row-icon">${got ? a.icon : '🔒'}</div>
          <div>
            <div class="ach-row-name">${got ? a.name : '???'}</div>
            <div class="ach-row-desc">${got ? a.desc : 'Keep exploring...'}</div>
          </div>
        </div>`);
    });
  }
  refreshAchPanel();

  /* Panel toggle */
  const achToggleBtn = document.getElementById('ach-toggle');
  const achPanelEl   = document.getElementById('ach-panel');
  if (achToggleBtn && achPanelEl) {
    achToggleBtn.addEventListener('click', () => {
      achPanelEl.classList.toggle('open');
      refreshAchPanel();
    });
  }

  /* Auto achievements */
  setTimeout(() => unlockAch('welcome'), 2500);
  if (new Date().getHours() < 5) unlockAch('nightowl');

  /* Hire Me */
  document.querySelectorAll('a[href="#contact"]').forEach(el =>
    el.addEventListener('click', () => unlockAch('hirer')));

  /* Card Flip tracking */
  let flipEngCount = 0;
  document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      flipEngCount = Math.min(flipEngCount + 1, 99);
      if (flipEngCount >= 6) unlockAch('flipper');
    });
  });

  /* Chat */
  const chatSendBtn = document.getElementById('chatSend');
  if (chatSendBtn) chatSendBtn.addEventListener('click', () => unlockAch('chatter'));

  /* Scroller — all sections seen */
  const engSecObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.dataset.engSeen = '1'; });
    if ([...document.querySelectorAll('section')].every(s => s.dataset.engSeen))
      unlockAch('scroller');
  }, { threshold: 0.1 });
  document.querySelectorAll('section').forEach(s => engSecObs.observe(s));

  /* ---- TIME-ON-SITE HUD ---- */
  const engStartTime   = Date.now();
  let   deepReaderDone = false;
  const thTimeEl = document.getElementById('th-time');
  setInterval(() => {
    const totalSec = Math.floor((Date.now() - engStartTime) / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    if (thTimeEl) thTimeEl.textContent = m + ':' + String(s).padStart(2, '0');
    if (totalSec >= 120 && !deepReaderDone) {
      deepReaderDone = true;
      unlockAch('reader');
    }
  }, 1000);

  /* ---- NEON CATCH MINI-GAME ---- */
  (function() {
    const gameOverlay  = document.getElementById('game-overlay');
    const gameCanvas   = document.getElementById('game-canvas');
    if (!gameOverlay || !gameCanvas) return;
    const gctx         = gameCanvas.getContext('2d');
    const gScoreEl     = document.getElementById('g-score');
    const gComboEl     = document.getElementById('g-combo');
    const gBestEl      = document.getElementById('g-best');
    const gTimeEl      = document.getElementById('g-time');
    const gStartScr    = document.getElementById('game-start-screen');
    const gOverScr     = document.getElementById('game-over-screen');
    const gsBestVal    = document.getElementById('gs-best-val');
    const goScoreVal   = document.getElementById('go-score-val');
    const goBestMsg    = document.getElementById('go-best-msg');

    let gBest   = parseInt(localStorage.getItem('merson_best') || '0');
    let gScore  = 0, gCombo = 1, gTimeLeft = 30;
    let gOrbs   = [], gParticles = [], gRunning = false, gTimer = null;
    const ORB_HUES = [185, 330, 90, 260, 40];

    function resizeGame() {
      gameCanvas.width  = window.innerWidth;
      gameCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeGame);

    function spawnOrb() {
      if (!gRunning) return;
      const r    = 18 + Math.random() * 18;
      const x    = r + Math.random() * (gameCanvas.width  - r * 2);
      const y    = 80 + Math.random() * (gameCanvas.height - r * 2 - 80);
      const life = 2.5 + Math.random() * 1.5;
      const hue  = ORB_HUES[Math.floor(Math.random() * ORB_HUES.length)];
      gOrbs.push({ x, y, r, life, born: performance.now(), hue });
      setTimeout(spawnOrb, 650 + Math.random() * 550);
    }

    function spawnBurst(x, y, hue) {
      for (let i = 0; i < 14; i++) {
        const ang = (i / 14) * Math.PI * 2;
        const spd = 2 + Math.random() * 5;
        gParticles.push({
          x, y,
          vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
          life: 1, hue, r: 2 + Math.random() * 3
        });
      }
    }

    let gComboTimer;
    function addGScore() {
      gScore += gCombo;
      if (gScoreEl) gScoreEl.textContent = gScore;
      if (gComboEl) gComboEl.textContent = 'x' + gCombo;
      clearTimeout(gComboTimer);
      gCombo = Math.min(gCombo + 1, 8);
      gComboTimer = setTimeout(() => {
        gCombo = 1;
        if (gComboEl) gComboEl.textContent = 'x1';
      }, 1200);
      if (gScore >= 10) window.unlockAch('winner');
    }

    function gameLoop() {
      if (!gRunning) return;
      gctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

      /* Grid bg */
      gctx.strokeStyle = 'rgba(0,245,255,0.035)';
      gctx.lineWidth   = 0.5;
      for (let gx = 0; gx < gameCanvas.width;  gx += 60) {
        gctx.beginPath(); gctx.moveTo(gx, 0); gctx.lineTo(gx, gameCanvas.height); gctx.stroke();
      }
      for (let gy = 0; gy < gameCanvas.height; gy += 60) {
        gctx.beginPath(); gctx.moveTo(0, gy); gctx.lineTo(gameCanvas.width, gy); gctx.stroke();
      }

      const now = performance.now();

      /* Draw orbs */
      gOrbs = gOrbs.filter(o => {
        const age    = (now - o.born) / 1000;
        const frac   = age / o.life;
        if (frac >= 1) return false;

        const alpha    = 1 - frac;
        const pulse    = 1 + Math.sin(now * 0.006) * 0.12;
        const displayR = o.r * pulse * (1 - frac * 0.3);
        const col      = `hsl(${o.hue},100%,70%)`;

        const grad = gctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, displayR * 1.8);
        grad.addColorStop(0,   col);
        grad.addColorStop(0.4, col.replace('70%', '60%'));
        grad.addColorStop(1,   'transparent');
        gctx.beginPath();
        gctx.arc(o.x, o.y, displayR * 1.8, 0, Math.PI * 2);
        gctx.fillStyle   = grad;
        gctx.globalAlpha = alpha * 0.3;
        gctx.fill();

        /* Core circle */
        gctx.beginPath();
        gctx.arc(o.x, o.y, displayR, 0, Math.PI * 2);
        gctx.strokeStyle = col;
        gctx.lineWidth   = 2.5;
        gctx.globalAlpha = alpha;
        gctx.stroke();
        gctx.globalAlpha = 1;

        /* Countdown arc */
        gctx.beginPath();
        gctx.arc(o.x, o.y, displayR + 7, -Math.PI / 2, -Math.PI / 2 + (1 - frac) * Math.PI * 2);
        gctx.strokeStyle = col + '80';
        gctx.lineWidth   = 1.5;
        gctx.stroke();
        return true;
      });

      /* Draw burst particles */
      gParticles = gParticles.filter(p => {
        p.x  += p.vx; p.y += p.vy;
        p.vx *= 0.94; p.vy *= 0.94;
        p.life -= 0.028;
        if (p.life <= 0) return false;
        gctx.beginPath();
        gctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        gctx.fillStyle   = `hsl(${p.hue},100%,75%)`;
        gctx.globalAlpha = p.life * 0.85;
        gctx.fill();
        gctx.globalAlpha = 1;
        return true;
      });

      requestAnimationFrame(gameLoop);
    }

    function startGame() {
      gScore = 0; gCombo = 1; gTimeLeft = 30;
      gOrbs = []; gParticles = [];
      if (gScoreEl) gScoreEl.textContent = '0';
      if (gComboEl) gComboEl.textContent = 'x1';
      if (gBestEl)  gBestEl.textContent  = gBest;
      if (gTimeEl)  gTimeEl.textContent  = '30';
      if (gStartScr) gStartScr.style.display = 'none';
      if (gOverScr)  gOverScr.style.display  = 'none';
      resizeGame();
      gRunning = true;
      spawnOrb();
      requestAnimationFrame(gameLoop);
      gTimer = setInterval(() => {
        gTimeLeft--;
        if (gTimeEl) gTimeEl.textContent = gTimeLeft;
        if (gTimeLeft <= 0) endGame();
      }, 1000);
      window.unlockAch('player');
    }

    function endGame() {
      gRunning = false;
      clearInterval(gTimer);
      const isNewBest = gScore > gBest;
      if (isNewBest) {
        gBest = gScore;
        localStorage.setItem('merson_best', gBest);
        if (goBestMsg) goBestMsg.textContent = '🎉 NEW HIGH SCORE!';
      } else {
        if (goBestMsg) goBestMsg.textContent = 'Best: ' + gBest;
      }
      if (goScoreVal) goScoreVal.textContent = gScore;
      if (gsBestVal)  gsBestVal.textContent  = gBest;
      if (gOverScr)   gOverScr.style.display  = 'flex';
    }

    /* Click detection on orbs */
    gameCanvas.addEventListener('click', e => {
      if (!gRunning) return;
      const rect = gameCanvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      for (let i = gOrbs.length - 1; i >= 0; i--) {
        const o = gOrbs[i];
        if (Math.hypot(mx - o.x, my - o.y) < o.r * 1.8) {
          spawnBurst(o.x, o.y, o.hue);
          gOrbs.splice(i, 1);
          addGScore();
          break;
        }
      }
    });

    /* Button wiring */
    const gameBtnEl = document.getElementById('game-btn');
    if (gameBtnEl) {
      gameBtnEl.addEventListener('click', () => {
        gameOverlay.style.display = 'block';
        if (gsBestVal) gsBestVal.textContent = gBest;
        if (gStartScr) gStartScr.style.display = 'flex';
        if (gOverScr)  gOverScr.style.display  = 'none';
      });
    }
    const gStartBtn = document.getElementById('game-start-btn');
    if (gStartBtn) gStartBtn.addEventListener('click', startGame);

    const gRetryBtn = document.getElementById('go-retry');
    if (gRetryBtn) gRetryBtn.addEventListener('click', startGame);

    const gCloseBtn = document.getElementById('game-close-btn');
    if (gCloseBtn) gCloseBtn.addEventListener('click', () => {
      gRunning = false;
      clearInterval(gTimer);
      gameOverlay.style.display = 'none';
    });

    const goHireBtn = document.getElementById('go-hire');
    if (goHireBtn) goHireBtn.addEventListener('click', () => {
      gRunning = false;
      gameOverlay.style.display = 'none';
    });
  })();

  /* ---- PROJECT DETAIL MODAL ---- */
  (function() {
    let curProjIdx = 0;
    const projModal  = document.getElementById('project-modal');
    const projImg    = document.getElementById('modal-img');
    const projType   = document.getElementById('modal-type');
    const projTitle  = document.getElementById('modal-title');
    const projDesc   = document.getElementById('modal-desc');
    const projTech   = document.getElementById('modal-tech');
    const projLink   = document.getElementById('modal-link');
    if (!projModal) return;

    function openProjModal(idx) {
      curProjIdx = ((idx % PROJ_DATA.length) + PROJ_DATA.length) % PROJ_DATA.length;
      const p = PROJ_DATA[curProjIdx];
      if (projImg)   { projImg.src = p.img; projImg.alt = p.title; }
      if (projType)  projType.textContent  = p.type;
      if (projTitle) projTitle.textContent = p.title;
      if (projDesc)  projDesc.textContent  = p.desc;
      if (projTech)  projTech.innerHTML    = p.techs.map(t => `<span>${t}</span>`).join('');
      if (projLink)  projLink.href         = p.link;
      projModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeProjModal() {
      projModal.classList.remove('open');
      document.body.style.overflow = '';
    }

    const mClose = document.getElementById('modal-close');
    const mBack  = document.getElementById('modal-backdrop');
    const mPrev  = document.getElementById('modal-prev');
    const mNext  = document.getElementById('modal-next');
    if (mClose) mClose.addEventListener('click', closeProjModal);
    if (mBack)  mBack.addEventListener('click',  closeProjModal);
    if (mPrev)  mPrev.addEventListener('click',  () => openProjModal(curProjIdx - 1));
    if (mNext)  mNext.addEventListener('click',  () => openProjModal(curProjIdx + 1));

    document.addEventListener('keydown', e => {
      if (!projModal.classList.contains('open')) return;
      if (e.key === 'Escape')     closeProjModal();
      if (e.key === 'ArrowLeft')  openProjModal(curProjIdx - 1);
      if (e.key === 'ArrowRight') openProjModal(curProjIdx + 1);
    });

    /* Flip-back click → open detail modal */
    document.querySelectorAll('.flip-back').forEach((back, i) => {
      back.style.cursor = 'pointer';
      back.addEventListener('click', e => {
        if (e.target.closest('a')) return;
        openProjModal(i);
      });
    });
    document.querySelectorAll('.flip-back-btn').forEach((btn, i) => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        openProjModal(i);
      });
    });
  })();

  /* ---- KONAMI CODE EASTER EGG ---- */
  (function() {
    const KONAMI_SEQ = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
                        'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let kPos = 0;
    document.addEventListener('keydown', e => {
      if (e.key === KONAMI_SEQ[kPos]) { kPos++; } else { kPos = 0; return; }
      if (kPos < KONAMI_SEQ.length) return;
      kPos = 0;
      window.unlockAch('konami');
      doKonamiEffect();
    });

    function doKonamiEffect() {
      const kc  = document.getElementById('konami-canvas');
      if (!kc) return;
      kc.width  = window.innerWidth;
      kc.height = window.innerHeight;
      kc.style.display = 'block';
      const kctx = kc.getContext('2d');
      const kParts = [];
      const KHUES  = [185, 330, 90, 270, 40, 0];

      for (let i = 0; i < 280; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 4 + Math.random() * 12;
        kParts.push({
          x: window.innerWidth / 2, y: window.innerHeight / 2,
          vx: Math.cos(ang) * spd,  vy: Math.sin(ang) * spd,
          life: 1, r: 2 + Math.random() * 6,
          hue: KHUES[Math.floor(Math.random() * KHUES.length)]
        });
      }

      let kFrames = 0;
      (function animateKonami() {
        kctx.fillStyle = 'rgba(2,6,14,0.2)';
        kctx.fillRect(0, 0, kc.width, kc.height);
        kParts.forEach(p => {
          p.x  += p.vx; p.y += p.vy;
          p.vy += 0.15;
          p.vx *= 0.99;
          p.life -= 0.013;
          if (p.life <= 0) return;
          kctx.beginPath();
          kctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
          kctx.fillStyle   = `hsl(${p.hue},100%,70%)`;
          kctx.globalAlpha = p.life;
          kctx.fill();
          kctx.globalAlpha = 1;
        });
        kFrames++;
        if (kFrames < 180 && kParts.some(p => p.life > 0)) {
          requestAnimationFrame(animateKonami);
        } else {
          kctx.clearRect(0, 0, kc.width, kc.height);
          kc.style.display = 'none';
        }
      })();

      /* Popup message */
      const kmsg = document.createElement('div');
      kmsg.style.cssText = `
        position:fixed;top:50%;left:50%;
        transform:translate(-50%,-50%) scale(0);
        font-family:var(--font-display);font-size:48px;font-weight:900;
        color:#fff;text-align:center;z-index:99999;pointer-events:none;
        text-shadow:0 0 40px #00f5ff,0 0 80px #ff006e;
        animation:kPop .4s cubic-bezier(.23,1,.32,1) forwards;
      `;
      kmsg.innerHTML = '🕹️<br><span style="font-size:18px;letter-spacing:4px;font-family:monospace">KONAMI CODE ACTIVATED</span>';
      const kStyle = document.createElement('style');
      kStyle.textContent = '@keyframes kPop{from{opacity:0;transform:translate(-50%,-50%) scale(0.4)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}';
      document.head.appendChild(kStyle);
      document.body.appendChild(kmsg);
      setTimeout(() => { kmsg.remove(); kStyle.remove(); }, 2800);
    }
  })();

  })(); /* end IIFE */
  
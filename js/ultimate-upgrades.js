/* ============================================================
   ULTIMATE PORTFOLIO UPGRADES
   Features: Theme Switcher, Audio FX, Cyber Terminal, Glitch FX
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  /* ============================================================
     1. THEME SWITCHER
     ============================================================ */
  const themes = ['neon', 'matrix', 'wasteland'];
  let currentThemeIndex = 0;
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');

  // Load from local storage
  const savedTheme = localStorage.getItem('cyberTheme');
  if (savedTheme && themes.includes(savedTheme)) {
    currentThemeIndex = themes.indexOf(savedTheme);
    applyTheme(savedTheme);
  }

  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentThemeIndex = (currentThemeIndex + 1) % themes.length;
      const newTheme = themes[currentThemeIndex];
      applyTheme(newTheme);
      playClickSound(); // Audio feedback
    });
  });

  function applyTheme(theme) {
    if (theme === 'neon') {
      document.body.removeAttribute('data-theme');
    } else {
      document.body.setAttribute('data-theme', theme);
    }
    themeToggleBtns.forEach(btn => btn.textContent = `THEME: ${theme.toUpperCase()}`);
    localStorage.setItem('cyberTheme', theme);
  }


  /* ============================================================
     2. AUDIO FX (WEB AUDIO API)
     ============================================================ */
  const audioToggleBtns = document.querySelectorAll('.audio-toggle-btn');
  let audioEnabled = false;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  audioToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      audioEnabled = !audioEnabled;
      audioToggleBtns.forEach(b => b.textContent = audioEnabled ? 'AUDIO: ON' : 'AUDIO: OFF');
      if (audioEnabled) {
        initAudio();
        playClickSound();
      }
    });
  });

  function playHoverSound() {
    if (!audioEnabled || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05);
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.01);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  }

  function playClickSound() {
    if (!audioEnabled || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  }

  function playGlitchSound() {
    if (!audioEnabled || !audioCtx) return;
    const bufferSize = audioCtx.sampleRate * 0.2; // 200ms
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1; // White noise
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    noise.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
  }

  // Attach sounds to interactable elements
  document.querySelectorAll('a, button, .project-card').forEach(el => {
    el.addEventListener('mouseenter', playHoverSound);
    el.addEventListener('click', () => {
      if (!el.classList.contains('audio-toggle-btn') && !el.classList.contains('theme-toggle-btn')) {
        playClickSound();
      }
    });
  });


  /* ============================================================
     3. GLITCH TRANSITIONS ON MENU CLICKS
     ============================================================ */
  document.querySelectorAll('.mobile-nav a, nav a').forEach(a => {
    a.addEventListener('click', (e) => {
      // The native smooth scroll is attached to 'a[href^="#"]'.
      // We will add the glitch effect to the body for 300ms.
      document.body.classList.add('glitch-active');
      playGlitchSound();
      setTimeout(() => {
        document.body.classList.remove('glitch-active');
      }, 300);
    });
  });


  /* ============================================================
     4. CYBER TERMINAL EASTER EGG
     ============================================================ */
  const terminal = document.getElementById('cyber-terminal');
  const termInput = document.getElementById('terminal-input');
  const termOutput = document.getElementById('terminal-output');

  let terminalOpen = false;

  document.addEventListener('keydown', (e) => {
    // Open/Close on Backtick (`) or Ctrl+Alt+T
    if (e.key === '`' || (e.ctrlKey && e.altKey && e.key.toLowerCase() === 't')) {
      e.preventDefault();
      terminalOpen = !terminalOpen;
      if (terminalOpen) {
        terminal.classList.add('active');
        termInput.value = '';
        termInput.focus();
        if (termOutput.innerHTML === '') {
          typeTerminalLine('Merson-OS v1.0.4 loaded.', false);
          typeTerminalLine('Type "help" for a list of available commands.', false);
        }
      } else {
        terminal.classList.remove('active');
        termInput.blur();
      }
    }
  });

  // Keep focus on input when clicking inside terminal
  terminal.addEventListener('click', () => {
    termInput.focus();
  });

  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const command = termInput.value.trim();
      if (command) {
        typeTerminalLine(`guest@merson-os:~$ ${command}`, false);
        processCommand(command);
      }
      termInput.value = '';
    }
  });

  function processCommand(cmd) {
    const args = cmd.toLowerCase().split(' ');
    const mainCmd = args[0];

    switch (mainCmd) {
      case 'help':
        typeTerminalLine('Available commands: help, whoami, skills, clear, exit', false);
        break;
      case 'whoami':
        typeTerminalLine('Merson: Frontend Engineer / UI/UX Designer / Cyberpunk Enthusiast', false);
        break;
      case 'skills':
        typeTerminalLine('Loading core competencies...\nHTML5 [||||||||||]\nCSS/SCSS [||||||||| ]\nJavaScript [||||||||| ]\nReact [|||||||   ]\nUI/UX [||||||||||]', false);
        break;
      case 'clear':
        termOutput.innerHTML = '';
        break;
      case 'exit':
        terminalOpen = false;
        terminal.classList.remove('active');
        termInput.blur();
        break;
      case 'sudo':
        typeTerminalLine('Permission denied: You are not authorized to access mainframe controls.', true);
        break;
      default:
        typeTerminalLine(`Command not found: ${mainCmd}`, true);
        break;
    }
    // Auto scroll to bottom
    setTimeout(() => { terminal.scrollTop = terminal.scrollHeight; }, 50);
  }

  function typeTerminalLine(text, isError) {
    const line = document.createElement('div');
    line.className = 'terminal-line' + (isError ? ' error' : '');
    termOutput.appendChild(line);
    
    // Quick typing animation
    let i = 0;
    const speed = 15;
    function type() {
      if (i < text.length) {
        line.innerHTML += text.charAt(i) === '\n' ? '<br>' : text.charAt(i);
        i++;
        terminal.scrollTop = terminal.scrollHeight;
        setTimeout(type, speed);
      }
    }
    type();
  }

});

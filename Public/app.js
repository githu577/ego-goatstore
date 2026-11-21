// ==========================================
// 1. LOADING ANIMATION SEQUENCE
// ==========================================
const loadingScreen = document.getElementById('loading-screen');
const loaderBar = document.getElementById('loader-bar');

let progress = 0;
const loadInterval = setInterval(() => {
  progress += Math.floor(Math.random() * 24) + 14;
  if (progress >= 100) {
    progress = 100;
    loaderBar.style.width = '100%';
    clearInterval(loadInterval);
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
    }, 300);
  } else {
    loaderBar.style.width = `${progress}%`;
  }
}, 140);

// ==========================================
// 2. LIVE ANIME PETALS & WIND CANVAS
// ==========================================
const canvas = document.getElementById('anime-canvas');
const ctx = canvas.getContext('2d');

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);
let windMultiplier = 1;

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

class Petal {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    this.x = initial ? Math.random() * width : -30;
    this.y = initial ? Math.random() * height : Math.random() * height * 0.85;
    this.size = 5 + Math.random() * 8;
    this.speedX = 1.6 + Math.random() * 2.4;
    this.speedY = 0.4 + Math.random() * 1.3;
    this.angle = Math.random() * Math.PI * 2;
    this.spin = (Math.random() - 0.5) * 0.05;
    this.waveOffset = Math.random() * 100;
    this.glow = Math.random() > 0.35;
  }

  update(time) {
    this.x += this.speedX * windMultiplier;
    this.y += (this.speedY + Math.sin(time * 0.002 + this.waveOffset) * 0.65) * windMultiplier;
    this.angle += this.spin * windMultiplier;

    if (this.x > width + 40 || this.y > height + 40) {
      this.reset(false);
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    if (this.glow) {
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#d946ef';
    }

    const grad = ctx.createLinearGradient(-this.size, -this.size, this.size, this.size);
    grad.addColorStop(0, '#f5d0fe');
    grad.addColorStop(0.6, '#c084fc');
    grad.addColorStop(1, '#7e22ce');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -this.size);
    ctx.quadraticCurveTo(this.size, 0, 0, this.size);
    ctx.quadraticCurveTo(-this.size, 0, 0, -this.size);
    ctx.fill();
    ctx.restore();
  }
}

const petals = Array.from({ length: 48 }, () => new Petal());

function animateScene(time) {
  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(192, 132, 252, 0.09)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const streakY = (time * 0.05 + i * 210) % height;
    const streakX = ((time * 0.35 * windMultiplier + i * 320) % (width + 200)) - 100;
    ctx.beginPath();
    ctx.moveTo(streakX, streakY);
    ctx.lineTo(streakX + 110 * windMultiplier, streakY + 12);
    ctx.stroke();
  }

  petals.forEach((petal) => {
    petal.update(time);
    petal.draw();
  });

  requestAnimationFrame(animateScene);
}
requestAnimationFrame(animateScene);

// Wind Boost Toggle
const toggleWindBtn = document.getElementById('toggle-wind');
toggleWindBtn.addEventListener('click', () => {
  windMultiplier = windMultiplier === 1 ? 2.4 : 1;
  toggleWindBtn.textContent = `Wind Boost: ${windMultiplier > 1 ? 'ON' : 'OFF'}`;
  showToast(windMultiplier > 1 ? 'Wind & petal speed boosted!' : 'Calm breeze restored.');
});

// Cute Robot Pet Ping
const botSpeech = document.getElementById('bot-speech');
const robotPingBtn = document.getElementById('robot-ping-btn');
const companionBot = document.getElementById('companion-bot');

const botPhrases = [
  'CUTE PET: READY',
  '10/9 CMDS LOADED!',
  'LOVE / SAD / GORE OK',
  'EGO GOATSTORE LIVE'
];
let botIdx = 0;

function pingBot() {
  botIdx = (botIdx + 1) % botPhrases.length;
  botSpeech.textContent = botPhrases[botIdx];
  showToast(`Cute Robot Pet: "${botPhrases[botIdx]}"`);
}

robotPingBtn.addEventListener('click', pingBot);
companionBot.addEventListener('click', pingBot);

// ==========================================
// 3. GOAT BOT COMMANDS VAULT (WITH QUALITY 10/9, 10/7 ETC.)
// ==========================================
let commandsList = [
  {
    id: 1,
    name: '/love-aura',
    category: 'love',
    quality: '10/9',
    usage: '/love-aura @user',
    desc: 'Sends a romantic anime aura card & love meter reply for Goat Bot.',
    code: `goat.cmd('love-aura', (ctx) => ctx.reply('💖 Love Aura: 99% synced with ' + ctx.target));`
  },
  {
    id: 2,
    name: '/sad-rain',
    category: 'sad',
    quality: '10/9',
    usage: '/sad-rain [quote]',
    desc: 'Triggers moody midnight rain quote & sad anime vibe embed.',
    code: `goat.cmd('sad-rain', (ctx) => ctx.reply('🌧️ Midnight rain falls quietly... ' + ctx.args));`
  },
  {
    id: 3,
    name: '/baby-mode',
    category: 'baby',
    quality: '10/8',
    usage: '/baby-mode @user',
    desc: 'Cute baby-talk & adorable pet sticker response command.',
    code: `goat.cmd('baby-mode', (ctx) => ctx.reply('🍼 UwU! Tiny baby mode activated for ' + ctx.target));`
  },
  {
    id: 4,
    name: '/gore-slash',
    category: 'gore',
    quality: '10/7',
    usage: '/gore-slash @target',
    desc: 'Dark crimson battle slash effect command for RPG / dark rooms.',
    code: `goat.cmd('gore-slash', (ctx) => ctx.reply('🩸 Dark slash strike executed on ' + ctx.target));`
  },
  {
    id: 5,
    name: '/owner-crown',
    category: 'owner',
    quality: '10/10',
    usage: '/owner-crown',
    desc: 'Exclusive owner permission command with full crown privileges.',
    code: `goat.cmd('owner-crown', { ownerOnly: true }, (ctx) => ctx.reply('👑 Owner Crown Verified!'));`
  },
  {
    id: 6,
    name: '/sys-ping',
    category: 'system',
    quality: '10/9',
    usage: '/sys-ping',
    desc: 'Checks Goat Bot latency, uptime, memory, and shard health.',
    code: `goat.cmd('sys-ping', (ctx) => ctx.reply('⚙️ Goat Bot Latency: 18ms | Status: ONLINE'));`
  }
];

let savedCommands = [];
let activeCategory = 'all';
let searchTerm = '';

const commandsGrid = document.getElementById('commands-grid');
const catBtns = document.querySelectorAll('.cat-btn');
const cmdSearch = document.getElementById('cmd-search');

function renderCommands() {
  const filtered = commandsList.filter((cmd) => {
    const matchCat = activeCategory === 'all' || cmd.category === activeCategory;
    const matchSearch =
      cmd.name.toLowerCase().includes(searchTerm) ||
      cmd.category.toLowerCase().includes(searchTerm) ||
      cmd.desc.toLowerCase().includes(searchTerm) ||
      cmd.quality.toLowerCase().includes(searchTerm);
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    commandsGrid.innerHTML = `<p style="color:#c4b5fd;">No commands found in this category/search.</p>`;
    return;
  }

  commandsGrid.innerHTML = filtered
    .map(
      (cmd) => `
      <article class="cmd-card">
        <div class="cmd-top">
          <span class="cmd-cat-badge">${cmd.category}</span>
          <span class="quality-badge robotic-font">QUALITY: ${cmd.quality}</span>
        </div>

        <h3 class="cmd-name robotic-font">${cmd.name}</h3>
        <div class="cmd-usage">Syntax: ${cmd.usage}</div>
        <p class="cmd-desc">${cmd.desc}</p>
        <pre class="cmd-code-box">${escapeHtml(cmd.code)}</pre>

        <div class="cmd-actions">
          <button class="primary-btn" onclick="copyCommand(${cmd.id})">Copy Code</button>
          <button class="secondary-btn" onclick="saveCommand(${cmd.id})">Save</button>
        </div>
      </article>
    `
    )
    .join('');
}

catBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    catBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = btn.dataset.cat;
    renderCommands();
  });
});

cmdSearch.addEventListener('input', (e) => {
  searchTerm = e.target.value.trim().toLowerCase();
  renderCommands();
});

// ==========================================
// 4. UPLOAD NEW COMMAND TO CATEGORY
// ==========================================
const uploadForm = document.getElementById('upload-cmd-form');

uploadForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const rawName = document.getElementById('cmd-name').value.trim();
  const formattedName = rawName.startsWith('/') ? rawName : `/${rawName}`;
  const category = document.getElementById('cmd-category').value;
  const quality = document.getElementById('cmd-quality').value;
  const usage = document.getElementById('cmd-usage').value.trim();
  const desc = document.getElementById('cmd-desc').value.trim();
  const code = document.getElementById('cmd-code').value.trim();

  const newCmd = {
    id: Date.now(),
    name: formattedName,
    category,
    quality,
    usage,
    desc,
    code
  };

  commandsList.unshift(newCmd);
  activeCategory = category;
  catBtns.forEach((b) => b.classList.toggle('active', b.dataset.cat === category));
  renderCommands();
  uploadForm.reset();

  document.getElementById('commands-vault').scrollIntoView({ behavior: 'smooth' });
  showToast(`Uploaded ${formattedName} [${category.toUpperCase()}] • Quality ${quality}`);
});

// ==========================================
// 5. COPY & SAVE COMMANDS
// ==========================================
function copyCommand(id) {
  const cmd = commandsList.find((c) => c.id === id);
  if (!cmd) return;
  navigator.clipboard?.writeText(cmd.code).catch(() => {});
  showToast(`Copied ${cmd.name} (${cmd.quality})!`);
}

function saveCommand(id) {
  const cmd = commandsList.find((c) => c.id === id);
  if (!cmd) return;
  if (!savedCommands.some((s) => s.id === id)) {
    savedCommands.push(cmd);
    renderSaved();
    showToast(`Saved ${cmd.name} to your list!`);
  } else {
    showToast(`${cmd.name} is already saved.`);
  }
}

function removeSaved(id) {
  savedCommands = savedCommands.filter((s) => s.id !== id);
  renderSaved();
}

function renderSaved() {
  const savedListEl = document.getElementById('saved-list');
  const savedCountEl = document.getElementById('saved-count');
  savedCountEl.textContent = savedCommands.length;

  if (savedCommands.length === 0) {
    savedListEl.innerHTML = '<p class="empty-msg">No commands saved yet. Click "Save" on any command card above.</p>';
    return;
  }

  savedListEl.innerHTML = savedCommands
    .map(
      (cmd) => `
      <div class="saved-row">
        <div>
          <strong class="robotic-font" style="color:#22d3ee;">${cmd.name}</strong>
          <span style="margin-left:10px;color:#fbbf24;font-weight:700;">[${cmd.quality}]</span>
          <span style="margin-left:8px;color:#c084fc;font-size:0.82rem;">(${cmd.category})</span>
          <div style="font-size:0.86rem;color:#cbd5e1;margin-top:4px;">${cmd.desc}</div>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="primary-btn" onclick="copyCommand(${cmd.id})">Copy</button>
          <button class="ghost-btn" onclick="removeSaved(${cmd.id})">Remove</button>
        </div>
      </div>
    `
    )
    .join('');
}

function escapeHtml(str) {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

// Toast
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// Initial Render
renderCommands();
renderSaved();

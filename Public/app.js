/* =========================================================
   1. COLORFUL WIND-BLOWN PETALS & LEAVES ENGINE
   ========================================================= */
const canvas = document.getElementById("windPetalsCanvas");
const ctx = canvas.getContext("2d");

let width, height;
function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const petalColors = [
  "#00d4ff", // Cyber Cyan
  "#0066ff", // Electric Blue
  "#ff4da6", // Sakura Pink
  "#a855f7", // Neon Violet
  "#38bdf8", // Sky Glow
  "#ff9e00", // Golden Leaf
  "#10b981"  // Emerald Leaf
];

const petals = [];
const windLines = [];

for (let i = 0; i < 75; i++) {
  petals.push({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 7 + 4,
    speedX: Math.random() * 2.8 + 1.4,
    speedY: Math.random() * 1.4 + 0.5,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.06,
    swayOffset: Math.random() * Math.PI * 2,
    color: petalColors[Math.floor(Math.random() * petalColors.length)],
    alpha: Math.random() * 0.65 + 0.3
  });
}

for (let i = 0; i < 22; i++) {
  windLines.push({
    x: Math.random() * width,
    y: Math.random() * height,
    len: Math.random() * 130 + 70,
    speed: Math.random() * 7 + 5,
    alpha: Math.random() * 0.16 + 0.04
  });
}

function animateWindAndPetals(time) {
  ctx.clearRect(0, 0, width, height);

  // Subtle Blue Wind Streaks
  windLines.forEach((w) => {
    const grad = ctx.createLinearGradient(w.x, w.y, w.x + w.len, w.y + 16);
    grad.addColorStop(0, "rgba(0, 102, 255, 0)");
    grad.addColorStop(0.5, `rgba(0, 212, 255, ${w.alpha})`);
    grad.addColorStop(1, "rgba(0, 102, 255, 0)");

    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(w.x, w.y);
    ctx.lineTo(w.x + w.len, w.y + 16);
    ctx.stroke();

    w.x += w.speed;
    w.y += w.speed * 0.12;
    if (w.x > width + 150) {
      w.x = -150;
      w.y = Math.random() * height;
    }
  });

  // Colorful Flying Leaves & Petals
  petals.forEach((p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = p.color;

    // Draw organic leaf/petal shape
    ctx.beginPath();
    ctx.moveTo(0, -p.size);
    ctx.bezierCurveTo(p.size, -p.size * 0.4, p.size, p.size * 0.6, 0, p.size);
    ctx.bezierCurveTo(-p.size, p.size * 0.6, -p.size, -p.size * 0.4, 0, -p.size);
    ctx.fill();
    ctx.restore();

    p.x += p.speedX + Math.sin(time * 0.002 + p.swayOffset) * 0.9;
    p.y += p.speedY + Math.cos(time * 0.002 + p.swayOffset) * 0.4;
    p.angle += p.spin;

    if (p.x > width + 20) p.x = -20;
    if (p.y > height + 20) {
      p.y = -20;
      p.x = Math.random() * width;
    }
  });

  requestAnimationFrame(animateWindAndPetals);
}
requestAnimationFrame(animateWindAndPetals);

/* =========================================================
   2. STORE DATA (ORGANIZED INTO SCRIPT & SYSTEM)
   ========================================================= */
const defaultItems = [
  {
    id: "item-1",
    name: "ego.js",
    category: "script",
    author: "Ego Queen",
    uploadDate: "22 Nov 2026 • 02:40 PM",
    desc: "High-attitude flex & welcome command for GoatBot V2 groups.",
    code: `module.exports = {
  config: {
    name: "ego",
    version: "2.0",
    author: "Ego Goatstore",
    countDown: 5,
    role: 0,
    shortDescription: "Pure Ego Goatstore attitude reply",
    category: "fun",
    guide: "{pn}"
  },
  onStart: async function ({ message }) {
    return message.reply("💎 EGO GOATSTORE: Royalty only. Grab free scripts & rule your chat!");
  }
};`
  },
  {
    id: "item-2",
    name: "dp.js",
    category: "script",
    author: "MD Hamim",
    uploadDate: "18 Nov 2026 • 08:15 PM",
    desc: "Fetches high-resolution profile avatar of any mentioned or replied user.",
    code: `module.exports = {
  config: {
    name: "dp",
    version: "1.5",
    author: "MD Hamim",
    countDown: 4,
    role: 0,
    shortDescription: "Get user profile picture",
    category: "utility",
    guide: "{pn} [@mention]"
  },
  onStart: async function ({ event, message, usersData }) {
    const uid = Object.keys(event.mentions)[0] || event.messageReply?.senderID || event.senderID;
    const avatarUrl = await usersData.getAvatarUrl(uid);
    return message.reply({ body: "✨ User Avatar:", attachment: await global.utils.getStreamFromURL(avatarUrl) });
  }
};`
  },
  {
    id: "item-3",
    name: "adminonly.js",
    category: "system",
    author: "MD Hamim",
    uploadDate: "10 Nov 2026 • 06:30 PM",
    desc: "Core system lock restricting bot access strictly to bot administrators.",
    code: `module.exports = {
  config: {
    name: "adminonly",
    version: "1.2",
    author: "MD Hamim",
    countDown: 3,
    role: 2,
    shortDescription: "Toggle system admin-only mode",
    category: "system",
    guide: "{pn} [on/off]"
  },
  onStart: async function ({ args, message }) {
    const mode = args[0]?.toLowerCase();
    if (mode === "on") return message.reply("🔒 System Admin-Only Mode ENABLED.");
    if (mode === "off") return message.reply("🔓 System Admin-Only Mode DISABLED.");
    return message.reply("Usage: adminonly [on/off]");
  }
};`
  },
  {
    id: "item-4",
    name: "antilink.js",
    category: "system",
    author: "Ego Core",
    uploadDate: "05 Nov 2026 • 11:00 AM",
    desc: "Automated event system guard that blocks unauthorized external links.",
    code: `module.exports = {
  config: {
    name: "antilink",
    version: "1.0",
    author: "Ego Goatstore",
    category: "system"
  },
  onChat: async function ({ event, message }) {
    if (event.body && /https?:\\/\\//i.test(event.body)) {
      return message.reply("🛡️ Ego System Guard: External links are restricted in this chat.");
    }
  }
};`
  }
];

let storeItems = JSON.parse(localStorage.getItem("ego_goatstore_v2")) || defaultItems;
let activeCategory = "all";
let currentViewed = null;

function saveStore() {
  localStorage.setItem("ego_goatstore_v2", JSON.stringify(storeItems));
}

function nowFormatted() {
  const d = new Date();
  const dateStr = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${dateStr} • ${timeStr}`;
}

/* =========================================================
   3. RENDER 3-CATEGORY STORE (SCRIPT / SYSTEM / ALL)
   ========================================================= */
function renderStore() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const scriptGrid = document.getElementById("scriptGrid");
  const systemGrid = document.getElementById("systemGrid");

  scriptGrid.innerHTML = "";
  systemGrid.innerHTML = "";

  const scripts = storeItems.filter((i) => i.category === "script");
  const systems = storeItems.filter((i) => i.category === "system");

  // Update Hero & Tab Counters
  document.getElementById("allCount").textContent = storeItems.length;
  document.getElementById("scriptCount").textContent = scripts.length;
  document.getElementById("systemCount").textContent = systems.length;

  document.getElementById("tabAllBadge").textContent = storeItems.length;
  document.getElementById("tabScriptBadge").textContent = scripts.length;
  document.getElementById("tabSystemBadge").textContent = systems.length;

  // Toggle Section Visibility based on active category
  document.getElementById("scriptSection").style.display =
    activeCategory === "system" ? "none" : "block";
  document.getElementById("systemSection").style.display =
    activeCategory === "script" ? "none" : "block";

  storeItems.forEach((item) => {
    const match =
      item.name.toLowerCase().includes(query) ||
      item.author.toLowerCase().includes(query) ||
      item.desc.toLowerCase().includes(query);

    if (!match) return;

    const isScript = item.category === "script";
    const card = document.createElement("div");
    card.className = "cmd-card";
    card.innerHTML = `
      <div>
        <div class="card-top">
          <span class="cmd-title"><i class="anim-icon">${isScript ? "📜" : "⚙️"}</i> ${item.name}</span>
          <span class="${isScript ? "badge-script" : "badge-system"}">
            ${isScript ? "SCRIPT" : "SYSTEM"}
          </span>
        </div>
        <p class="cmd-desc">${item.desc}</p>
        <div class="cmd-meta">
          <div><i class="anim-icon">👤</i> Author: <strong>${item.author}</strong></div>
          <div><i class="anim-icon">📅</i> Added: <strong>${item.uploadDate}</strong></div>
        </div>
      </div>
      <div class="card-actions">
        <button class="card-btn" onclick="viewItem('${item.id}')"><i class="anim-icon">👁</i> View</button>
        <button class="card-btn" onclick="copyItem('${item.id}')"><i class="anim-icon">📋</i> Copy</button>
        <button class="card-btn" onclick="downloadItem('${item.id}')"><i class="anim-icon">⬇</i> .js</button>
      </div>
    `;

    if (isScript) {
      scriptGrid.appendChild(card);
    } else {
      systemGrid.appendChild(card);
    }
  });
}

function setCategory(cat, btn) {
  activeCategory = cat;
  document.querySelectorAll(".cat-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  renderStore();
}

/* =========================================================
   4. VIEW, COPY, DOWNLOAD & UPLOAD
   ========================================================= */
function viewItem(id) {
  const item = storeItems.find((i) => i.id === id);
  if (!item) return;
  currentViewed = item;
  document.getElementById("viewTitle").textContent = item.name;
  document.getElementById("viewMeta").textContent = `Category: ${item.category.toUpperCase()} | Author: ${item.author} | ${item.uploadDate}`;
  document.getElementById("viewCode").textContent = item.code;
  openModal("viewModal");
}

function copyCurrentCode() {
  if (currentViewed) copyText(currentViewed.code, `📋 Copied ${currentViewed.name}!`);
}

function downloadCurrentCode() {
  if (currentViewed) triggerDownload(currentViewed.name, currentViewed.code);
}

function copyItem(id) {
  const item = storeItems.find((i) => i.id === id);
  if (item) copyText(item.code, `📋 Copied ${item.name}!`);
}

function downloadItem(id) {
  const item = storeItems.find((i) => i.id === id);
  if (item) triggerDownload(item.name, item.code);
}

function loadJsFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  document.getElementById("upName").value = file.name;
  document.getElementById("fileLabelText").innerHTML = `✅ Loaded: <strong>${file.name}</strong>`;
  const reader = new FileReader();
  reader.onload = (ev) => {
    document.getElementById("upCode").value = ev.target.result;
  };
  reader.readAsText(file);
}

function handleUpload(e) {
  e.preventDefault();
  let fileName = document.getElementById("upName").value.trim();
  if (!fileName.endsWith(".js")) fileName += ".js";

  storeItems.unshift({
    id: "item-" + Date.now(),
    name: fileName,
    category: document.getElementById("upCategory").value,
    author: document.getElementById("upAuthor").value.trim(),
    uploadDate: nowFormatted(),
    desc: document.getElementById("upDesc").value.trim(),
    code: document.getElementById("upCode").value
  });

  saveStore();
  renderStore();
  closeModal("uploadModal");
  document.getElementById("uploadForm").reset();
  document.getElementById("fileLabelText").innerHTML = `Click here to choose a <strong>.js</strong> file (Auto-fills name & code)`;
  showToast(`💎 ${fileName} published to Ego Goatstore!`);
}

/* =========================================================
   5. INSTANT SCRIPT BUILDER
   ========================================================= */
function updateGeneratedCode() {
  const name = document.getElementById("genName").value.trim() || "custom";
  const category = document.getElementById("genCategory").value;
  const author = document.getElementById("genAuthor").value.trim() || "Ego Goatstore";
  const role = document.getElementById("genRole").value;
  const reply = document.getElementById("genReply").value.replace(/"/g, '\\"');

  const code = `module.exports = {
  config: {
    name: "${name}",
    version: "1.0",
    author: "${author}",
    countDown: 5,
    role: ${role},
    shortDescription: "${name} (${category}) from Ego Goatstore",
    category: "${category}",
    guide: "{pn}"
  },
  onStart: async function ({ message }) {
    return message.reply("${reply}");
  }
};`;

  document.getElementById("generatedPreview").textContent = code;
  return { name: `${name}.js`, category, author, code };
}

function copyGenerated() {
  const { name, code } = updateGeneratedCode();
  copyText(code, `📋 Copied ${name}!`);
}

function downloadGenerated() {
  const { name, code } = updateGeneratedCode();
  triggerDownload(name, code);
}

function publishGenerated() {
  const { name, category, author, code } = updateGeneratedCode();
  storeItems.unshift({
    id: "item-" + Date.now(),
    name,
    category,
    author,
    uploadDate: nowFormatted(),
    desc: `Generated ${category} file (${name}) via Ego Goatstore Builder.`,
    code
  });
  saveStore();
  renderStore();
  closeModal("createModal");
  showToast(`🚀 ${name} added to ${category.toUpperCase()}!`);
}

/* =========================================================
   6. UTILITIES
   ========================================================= */
function openModal(id) {
  if (id === "createModal") updateGeneratedCode();
  document.getElementById(id).classList.add("open");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

function copyText(text, msg) {
  navigator.clipboard.writeText(text).then(() => showToast(msg));
}

function triggerDownload(filename, content) {
  const blob = new Blob([content], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`⬇ Downloading ${filename}...`);
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

// Initial Render
renderStore();

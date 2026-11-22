/* =========================================================
   1. HELLFIRE & AGUN ER BATASH (FIRE WIND) PARTICLE ENGINE
   ========================================================= */
const canvas = document.getElementById("fireWindCanvas");
const ctx = canvas.getContext("2d");

let width, height;
function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const embers = [];
const windStreaks = [];

for (let i = 0; i < 110; i++) {
  embers.push({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 3.5 + 1,
    speedX: Math.random() * 3.5 + 1.8, // Strong wind blowing right
    speedY: -(Math.random() * 2.2 + 0.6), // Rising fire
    alpha: Math.random() * 0.8 + 0.2,
    color: Math.random() > 0.4 ? "#ff4500" : "#ffae00"
  });
}

for (let i = 0; i < 28; i++) {
  windStreaks.push({
    x: Math.random() * width,
    y: Math.random() * height,
    length: Math.random() * 140 + 60,
    speed: Math.random() * 10 + 7,
    alpha: Math.random() * 0.18 + 0.04
  });
}

function animateFireWind() {
  ctx.clearRect(0, 0, width, height);

  // Draw glowing fire wind streaks
  windStreaks.forEach((w) => {
    const grad = ctx.createLinearGradient(w.x, w.y, w.x + w.length, w.y - 18);
    grad.addColorStop(0, "rgba(255, 40, 0, 0)");
    grad.addColorStop(0.5, `rgba(255, 85, 0, ${w.alpha})`);
    grad.addColorStop(1, "rgba(255, 190, 0, 0)");

    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w.x, w.y);
    ctx.lineTo(w.x + w.length, w.y - 18);
    ctx.stroke();

    w.x += w.speed;
    w.y -= w.speed * 0.14;

    if (w.x > width + 150) {
      w.x = -150;
      w.y = Math.random() * height;
    }
  });

  // Draw blazing embers carried by wind
  embers.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha;
    ctx.shadowBlur = 12;
    ctx.shadowColor = "#ff3300";
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    p.x += p.speedX + Math.sin(p.y * 0.02) * 1.2;
    p.y += p.speedY;

    if (p.x > width + 10) p.x = -10;
    if (p.y < -10) {
      p.y = height + 10;
      p.x = Math.random() * width;
    }
  });

  requestAnimationFrame(animateFireWind);
}
animateFireWind();

/* =========================================================
   2. COMMAND DATABASE (OLD VAULT + NEW UPLOADS)
   ========================================================= */
const defaultCommands = [
  {
    id: "cmd-new-1",
    name: "ego.js",
    author: "Ego Overlord",
    category: "new",
    uploadDate: "22 Nov 2026 • 12:30 PM",
    desc: "Signature attitude welcome & flex command with custom user mention.",
    code: `module.exports = {
  config: {
    name: "ego",
    version: "1.0",
    author: "Ego Goatstore",
    countDown: 5,
    role: 0,
    shortDescription: "Show pure Ego Goatstore attitude",
    category: "fun",
    guide: "{pn}"
  },
  onStart: async function ({ message, event }) {
    return message.reply("🔥 EGO GOATSTORE: Bow down or step aside! Free scripts for legends only.");
  }
};`
  },
  {
    id: "cmd-old-1",
    name: "adminonly.js",
    author: "MD Hamim",
    category: "old",
    uploadDate: "15 Oct 2025 • 09:15 PM",
    desc: "Restricts bot command execution strictly to bot administrators.",
    code: `module.exports = {
  config: {
    name: "adminonly",
    version: "1.2",
    author: "MD Hamim",
    countDown: 3,
    role: 2,
    shortDescription: "Toggle admin-only mode",
    category: "admin",
    guide: "{pn} [on/off]"
  },
  onStart: async function ({ args, message }) {
    const mode = args[0]?.toLowerCase();
    if (mode === "on") return message.reply("🔒 Admin-Only Mode ENABLED.");
    if (mode === "off") return message.reply("🔓 Admin-Only Mode DISABLED.");
    return message.reply("Usage: adminonly [on/off]");
  }
};`
  },
  {
    id: "cmd-old-2",
    name: "kick.js",
    author: "GoatBot Core",
    category: "old",
    uploadDate: "02 Sep 2025 • 04:40 PM",
    desc: "Removes mentioned or replied troublemakers from the group chat.",
    code: `module.exports = {
  config: {
    name: "kick",
    version: "1.0",
    author: "GoatBot Core",
    countDown: 5,
    role: 1,
    shortDescription: "Kick user from group",
    category: "box chat",
    guide: "{pn} @mention"
  },
  onStart: async function ({ api, event, message }) {
    const targetID = Object.keys(event.mentions)[0] || event.messageReply?.senderID;
    if (!targetID) return message.reply("⚠️ Mention or reply to someone to kick.");
    await api.removeUserFromGroup(targetID, event.threadID);
  }
};`
  }
];

let commands = JSON.parse(localStorage.getItem("ego_goatstore_cmds")) || defaultCommands;
let activeFilter = "all";
let currentViewedCmd = null;

function saveCommands() {
  localStorage.setItem("ego_goatstore_cmds", JSON.stringify(commands));
}

function getFormattedDateTime() {
  const now = new Date();
  const datePart = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  const timePart = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
  return `${datePart} • ${timePart}`;
}

/* =========================================================
   3. RENDER VAULT CARDS & STATS
   ========================================================= */
function renderCommands() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const newGrid = document.getElementById("newGrid");
  const oldGrid = document.getElementById("oldGrid");

  newGrid.innerHTML = "";
  oldGrid.innerHTML = "";

  const newItems = commands.filter((c) => c.category === "new");
  const oldItems = commands.filter((c) => c.category === "old");

  document.getElementById("totalCount").textContent = commands.length;
  document.getElementById("newCount").textContent = newItems.length;
  document.getElementById("oldCount").textContent = oldItems.length;

  document.getElementById("newSection").style.display =
    activeFilter === "old" ? "none" : "block";
  document.getElementById("oldSection").style.display =
    activeFilter === "new" ? "none" : "block";

  commands.forEach((cmd) => {
    const matches =
      cmd.name.toLowerCase().includes(query) ||
      cmd.author.toLowerCase().includes(query) ||
      cmd.desc.toLowerCase().includes(query);

    if (!matches) return;

    const card = document.createElement("div");
    card.className = "cmd-card";
    card.innerHTML = `
      <div>
        <div class="card-top">
          <span class="cmd-title">${cmd.name}</span>
          <span class="${cmd.category === "new" ? "tag-new" : "tag-old"}">
            ${cmd.category === "new" ? "🔥 NEW" : "🏛 OLD"}
          </span>
        </div>
        <p class="cmd-desc">${cmd.desc}</p>
        <div class="cmd-dates">
          <div>👤 Author: <strong>${cmd.author}</strong></div>
          <div>📅 Date: <strong>${cmd.uploadDate}</strong></div>
        </div>
      </div>
      <div class="card-actions">
        <button class="card-btn" onclick="viewCommand('${cmd.id}')">👁 View</button>
        <button class="card-btn" onclick="copyById('${cmd.id}')">📋 Copy</button>
        <button class="card-btn" onclick="downloadById('${cmd.id}')">⬇ .js</button>
      </div>
    `;

    if (cmd.category === "new") {
      newGrid.appendChild(card);
    } else {
      oldGrid.appendChild(card);
    }
  });
}

function setFilter(filter, btn) {
  activeFilter = filter;
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  btn.classList.add("active");
  renderCommands();
}

/* =========================================================
   4. VIEW, COPY, DOWNLOAD & UPLOAD HANDLERS
   ========================================================= */
function viewCommand(id) {
  const cmd = commands.find((c) => c.id === id);
  if (!cmd) return;
  currentViewedCmd = cmd;
  document.getElementById("viewTitle").textContent = cmd.name;
  document.getElementById("viewMeta").textContent = `Author: ${cmd.author} | Uploaded: ${cmd.uploadDate}`;
  document.getElementById("viewCode").textContent = cmd.code;
  openModal("viewModal");
}

function copyCurrentCode() {
  if (!currentViewedCmd) return;
  copyText(currentViewedCmd.code, `${currentViewedCmd.name} copied to clipboard!`);
}

function downloadCurrentCode() {
  if (!currentViewedCmd) return;
  triggerDownload(currentViewedCmd.name, currentViewedCmd.code);
}

function copyById(id) {
  const cmd = commands.find((c) => c.id === id);
  if (cmd) copyText(cmd.code, `📋 Copied ${cmd.name}!`);
}

function downloadById(id) {
  const cmd = commands.find((c) => c.id === id);
  if (cmd) triggerDownload(cmd.name, cmd.code);
}

function loadJsFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  document.getElementById("upName").value = file.name;
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById("upCode").value = e.target.result;
  };
  reader.readAsText(file);
}

function handleUpload(event) {
  event.preventDefault();
  let fileName = document.getElementById("upName").value.trim();
  if (!fileName.endsWith(".js")) fileName += ".js";

  const newCmd = {
    id: "cmd-" + Date.now(),
    name: fileName,
    author: document.getElementById("upAuthor").value.trim(),
    category: document.getElementById("upCategory").value,
    uploadDate: getFormattedDateTime(),
    desc: document.getElementById("upDesc").value.trim(),
    code: document.getElementById("upCode").value
  };

  commands.unshift(newCmd);
  saveCommands();
  renderCommands();
  closeModal("uploadModal");
  document.getElementById("uploadForm").reset();
  showToast(`🔥 ${fileName} published to Ego Goatstore!`);
}

/* =========================================================
   5. LIVE COMMAND GENERATOR
   ========================================================= */
function updateGeneratedCode() {
  const name = document.getElementById("genName").value.trim() || "custom";
  const author = document.getElementById("genAuthor").value.trim() || "Ego Goatstore";
  const role = document.getElementById("genRole").value;
  const cooldown = document.getElementById("genCooldown").value || 5;
  const reply = document.getElementById("genReply").value.replace(/"/g, '\\"');

  const generated = `module.exports = {
  config: {
    name: "${name}",
    version: "1.0",
    author: "${author}",
    countDown: ${cooldown},
    role: ${role},
    shortDescription: "${name} command from Ego Goatstore",
    category: "custom",
    guide: "{pn}"
  },
  onStart: async function ({ message }) {
    return message.reply("${reply}");
  }
};`;

  document.getElementById("generatedPreview").textContent = generated;
  return { name: `${name}.js`, author, code: generated };
}

function copyGenerated() {
  const { name, code } = updateGeneratedCode();
  copyText(code, `📋 Copied generated ${name}!`);
}

function downloadGenerated() {
  const { name, code } = updateGeneratedCode();
  triggerDownload(name, code);
}

function publishGenerated() {
  const { name, author, code } = updateGeneratedCode();
  commands.unshift({
    id: "cmd-" + Date.now(),
    name,
    author,
    category: "new",
    uploadDate: getFormattedDateTime(),
    desc: `Custom generated GoatBot V2 command (${name}).`,
    code
  });
  saveCommands();
  renderCommands();
  closeModal("createModal");
  showToast(`🚀 ${name} created & added to New Uploads!`);
}

/* =========================================================
   6. UTILITIES (MODAL, CLIPBOARD, FILE DOWNLOAD, TOAST)
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
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}

// Initial render
renderCommands();

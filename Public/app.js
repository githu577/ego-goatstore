/* =========================================================
   1. ANIMATED JAPANESE NIGHT SCENE + FIRE SPARKS CANVAS
   ========================================================= */
const canvas = document.getElementById("jpWorldCanvas");
const ctx = canvas.getContext("2d");

let w, h;
function resizeWorld() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeWorld);
resizeWorld();

// Floating Japanese lanterns, sakura/sparks & fire embers
const particles = [];
const colors = ["#ff2a6d", "#00f0ff", "#ff7700", "#ffbe0b", "#ff70a6"];

for (let i = 0; i < 85; i++) {
  const isFireSpark = i % 2 === 0;
  particles.push({
    x: Math.random() * w,
    y: Math.random() * h,
    size: isFireSpark ? Math.random() * 3.2 + 1.2 : Math.random() * 6 + 3.5,
    vx: isFireSpark ? -(Math.random() * 4.5 + 2.2) : (Math.random() - 0.5) * 1.4,
    vy: isFireSpark ? (Math.random() - 0.5) * 1.6 : -(Math.random() * 1.2 + 0.4),
    alpha: Math.random() * 0.75 + 0.25,
    color: colors[Math.floor(Math.random() * colors.length)],
    isFireSpark
  });
}

function renderWorldParticles() {
  ctx.clearRect(0, 0, w, h);

  particles.forEach((p) => {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.shadowBlur = p.isFireSpark ? 14 : 9;
    ctx.shadowColor = p.color;

    if (p.isFireSpark) {
      // Streak spark shooting backward with speed
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size * 2.4, p.size * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Drifting sakura / lantern glow particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -30) p.x = w + 20;
    if (p.x > w + 30) p.x = -20;
    if (p.y < -20) p.y = h + 20;
    if (p.y > h + 20) p.y = -20;
  });

  requestAnimationFrame(renderWorldParticles);
}
renderWorldParticles();

/* =========================================================
   2. CLEAN NEW VAULT STATE (1. SCRIPT & 2. SYSTEM)
   ========================================================= */
const STORAGE_KEY = "ego_goatstore_v3_vault";
let vaultData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentCat = "all";
let inspectedItem = null;

function persistVault() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vaultData));
}

function stampNow() {
  const now = new Date();
  const d = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const t = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${d} • ${t}`;
}

/* =========================================================
   3. RENDER VAULT BY CATEGORY (1. SCRIPT | 2. SYSTEM | 3. ALL)
   ========================================================= */
function renderVault() {
  const query = document.getElementById("searchBox").value.toLowerCase();
  const scriptGrid = document.getElementById("scriptGrid");
  const systemGrid = document.getElementById("systemGrid");

  scriptGrid.innerHTML = "";
  systemGrid.innerHTML = "";

  const scripts = vaultData.filter((item) => item.category === "script");
  const systems = vaultData.filter((item) => item.category === "system");

  document.getElementById("countScript").textContent = scripts.length;
  document.getElementById("countSystem").textContent = systems.length;
  document.getElementById("countAll").textContent = vaultData.length;

  document.getElementById("scriptBlock").style.display =
    currentCat === "system" ? "none" : "block";
  document.getElementById("systemBlock").style.display =
    currentCat === "script" ? "none" : "block";

  vaultData.forEach((item) => {
    const matches =
      item.name.toLowerCase().includes(query) ||
      item.author.toLowerCase().includes(query) ||
      item.desc.toLowerCase().includes(query);

    if (!matches) return;

    const card = document.createElement("div");
    card.className = "vault-card";
    card.innerHTML = `
      <div>
        <div class="card-header-row">
          <span class="card-filename">
            <i class="anim-icon">${item.category === "script" ? "📜" : "⚙️"}</i> ${item.name}
          </span>
          <span class="card-cat-badge">${item.category.toUpperCase()}</span>
        </div>
        <p class="card-summary">${item.desc}</p>
        <div class="card-info-box">
          <div><i class="anim-icon">👤</i> Author: <strong>${item.author}</strong></div>
          <div><i class="anim-icon">🕒</i> Added: <strong>${item.addedAt}</strong></div>
        </div>
      </div>
      <div class="card-btns">
        <button class="mini-btn" onclick="openInspect('${item.id}')">
          <i class="anim-icon">👁</i> View
        </button>
        <button class="mini-btn" onclick="copyItemById('${item.id}')">
          <i class="anim-icon">📋</i> Copy
        </button>
        <button class="mini-btn" onclick="downloadItemById('${item.id}')">
          <i class="anim-icon">⬇</i> .js
        </button>
      </div>
    `;

    if (item.category === "script") {
      scriptGrid.appendChild(card);
    } else {
      systemGrid.appendChild(card);
    }
  });

  if (!scriptGrid.children.length && currentCat !== "system") {
    scriptGrid.innerHTML = `<p style="color:#9ab0d4;">No scripts added yet. Click <strong>Upload Command</strong> or <strong>Create & Copy</strong>.</p>`;
  }
  if (!systemGrid.children.length && currentCat !== "script") {
    systemGrid.innerHTML = `<p style="color:#9ab0d4;">No system files added yet. Upload a system file to populate this section.</p>`;
  }
}

function selectCategory(cat, btn) {
  currentCat = cat;
  document.querySelectorAll(".cat-pill").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  renderVault();
}

/* =========================================================
   4. INSPECT, COPY, DOWNLOAD & UPLOAD
   ========================================================= */
function openInspect(id) {
  const item = vaultData.find((x) => x.id === id);
  if (!item) return;
  inspectedItem = item;
  document.getElementById("modalFileTitle").textContent = item.name;
  document.getElementById("modalFileMeta").textContent =
    `Category: ${item.category.toUpperCase()} • Author: ${item.author} • ${item.addedAt}`;
  document.getElementById("modalFileCode").textContent = item.code;
  openModal("viewModal");
}

function copyViewed() {
  if (inspectedItem) copyToClipboard(inspectedItem.code, `Copied ${inspectedItem.name}!`);
}

function downloadViewed() {
  if (inspectedItem) saveJsFile(inspectedItem.name, inspectedItem.code);
}

function copyItemById(id) {
  const item = vaultData.find((x) => x.id === id);
  if (item) copyToClipboard(item.code, `Copied ${item.name}!`);
}

function downloadItemById(id) {
  const item = vaultData.find((x) => x.id === id);
  if (item) saveJsFile(item.name, item.code);
}

function readUploadedFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  document.getElementById("uName").value = file.name;
  document.getElementById("pickedFileLabel").innerHTML = `Selected: <strong>${file.name}</strong>`;
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById("uCode").value = e.target.result;
  };
  reader.readAsText(file);
}

function submitUpload(event) {
  event.preventDefault();
  let fileName = document.getElementById("uName").value.trim();
  if (!fileName.endsWith(".js")) fileName += ".js";

  vaultData.unshift({
    id: "v-" + Date.now(),
    name: fileName,
    category: document.getElementById("uCategory").value,
    author: document.getElementById("uAuthor").value.trim(),
    desc: document.getElementById("uDesc").value.trim(),
    addedAt: stampNow(),
    code: document.getElementById("uCode").value
  });

  persistVault();
  renderVault();
  closeModal("uploadModal");
  document.getElementById("uploadForm").reset();
  document.getElementById("pickedFileLabel").innerHTML = `Choose a <strong>.js</strong> file or paste code below`;
  notify(`Added ${fileName} to Ego Goatstore!`);
}

/* =========================================================
   5. CREATE & COPY-PASTE COMMAND BUILDER
   ========================================================= */
function buildLiveCode() {
  const name = (document.getElementById("cName").value.trim() || "cmd").replace(/\.js$/i, "");
  const category = document.getElementById("cCategory").value;
  const author = document.getElementById("cAuthor").value.trim() || "Ego Goatstore";
  const role = document.getElementById("cRole").value;
  const reply = document.getElementById("cReply").value.replace(/"/g, '\\"');

  const snippet = `module.exports = {
  config: {
    name: "${name}",
    version: "1.0",
    author: "${author}",
    countDown: 5,
    role: ${role},
    shortDescription: "${name} (${category})",
    category: "${category}",
    guide: "{pn}"
  },
  onStart: async function ({ message }) {
    return message.reply("${reply}");
  }
};`;

  document.getElementById("liveBuiltCode").textContent = snippet;
  return { fileName: `${name}.js`, category, author, snippet };
}

function copyBuilt() {
  const { fileName, snippet } = buildLiveCode();
  copyToClipboard(snippet, `Copied ${fileName}!`);
}

function downloadBuilt() {
  const { fileName, snippet } = buildLiveCode();
  saveJsFile(fileName, snippet);
}

function saveBuiltToVault() {
  const { fileName, category, author, snippet } = buildLiveCode();
  vaultData.unshift({
    id: "v-" + Date.now(),
    name: fileName,
    category,
    author,
    desc: `Created via Ego Goatstore Builder (${category}).`,
    addedAt: stampNow(),
    code: snippet
  });
  persistVault();
  renderVault();
  closeModal("createModal");
  notify(`Saved ${fileName} to ${category.toUpperCase()}!`);
}

/* =========================================================
   6. HELPERS
   ========================================================= */
function openModal(id) {
  if (id === "createModal") buildLiveCode();
  document.getElementById(id).classList.add("open");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

function copyToClipboard(text, message) {
  navigator.clipboard.writeText(text).then(() => notify(message));
}

function saveJsFile(name, content) {
  const blob = new Blob([content], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
  notify(`Downloading ${name}...`);
}

function notify(msg) {
  const box = document.getElementById("toastBox");
  box.textContent = msg;
  box.classList.add("show");
  setTimeout(() => box.classList.remove("show"), 2400);
}

// Start Vault
renderVault();

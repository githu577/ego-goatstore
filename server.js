const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || "";
const DATA_DIR = path.join(__dirname, "data");
const COMMANDS_DIR = path.join(DATA_DIR, "commands");
const DB_FILE = path.join(DATA_DIR, "store.json");
fs.mkdirSync(COMMANDS_DIR, { recursive: true });

function loadDb() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); }
  catch { return { commands: [] }; }
}
function saveDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}
function safeName(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 32);
}
function admin(req, res, next) {
  const key = req.get("x-admin-key") || req.query.adminKey || "";
  if (!ADMIN_KEY || !crypto.timingSafeEqual(Buffer.from(key.padEnd(ADMIN_KEY.length)), Buffer.from(ADMIN_KEY)) || key.length !== ADMIN_KEY.length) {
    return res.status(401).json({ error: "Admin key missing or invalid" });
  }
  next();
}
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== ".js") return cb(new Error("Only .js command files are allowed"));
    cb(null, true);
  }
});
app.use(express.json({ limit: "300kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => res.json({ status: "ok", name: "EGO GoatStore API" }));

app.get("/api/commands", (req, res) => {
  const db = loadDb();
  const q = String(req.query.q || "").toLowerCase();
  const category = String(req.query.category || "").toLowerCase();
  let items = db.commands.filter(c =>
    (!q || [c.name, c.description, c.author, c.category].join(" ").toLowerCase().includes(q)) &&
    (!category || category === "all" || c.category.toLowerCase() === category)
  );
  items.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  res.json(items.map(({fileName, ...safe}) => safe));
});

app.get("/api/commands/:name/download", (req, res) => {
  const name = safeName(req.params.name);
  const item = loadDb().commands.find(c => c.name === name);
  if (!item) return res.status(404).json({ error: "Command not found" });
  res.download(path.join(COMMANDS_DIR, item.fileName), `${name}.js`);
});

app.post("/api/commands", admin, upload.single("file"), (req, res) => {
  const name = safeName(req.body.name);
  const category = String(req.body.category || "utility").slice(0, 32);
  const description = String(req.body.description || "").slice(0, 180);
  const author = String(req.body.author || "Unknown").slice(0, 48);
  if (!name) return res.status(400).json({ error: "A valid command name is required" });
  if (!req.file) return res.status(400).json({ error: "Upload a .js file" });
  const db = loadDb();
  if (db.commands.some(c => c.name === name)) return res.status(409).json({ error: "Command name already exists" });
  const fileName = `${name}-${Date.now()}.js`;
  fs.writeFileSync(path.join(COMMANDS_DIR, fileName), req.file.buffer);
  const item = { id: crypto.randomUUID(), name, category, description, author, fileName, createdAt: new Date().toISOString(), downloads: 0 };
  db.commands.push(item); saveDb(db);
  const { fileName: hidden, ...safe } = item;
  res.status(201).json({ message: "Command published", command: safe });
});

app.post("/api/commands/:name/download-count", (req, res) => {
  const name = safeName(req.params.name);
  const db = loadDb();
  const item = db.commands.find(c => c.name === name);
  if (!item) return res.status(404).json({ error: "Command not found" });
  item.downloads = (item.downloads || 0) + 1;
  saveDb(db);
  res.json({ downloads: item.downloads });
});

app.delete("/api/commands/:name", admin, (req, res) => {
  const name = safeName(req.params.name);
  const db = loadDb();
  const index = db.commands.findIndex(c => c.name === name);
  if (index < 0) return res.status(404).json({ error: "Command not found" });
  const item = db.commands.splice(index, 1)[0];
  try { fs.unlinkSync(path.join(COMMANDS_DIR, item.fileName)); } catch {}
  saveDb(db);
  res.json({ message: "Deleted" });
});

app.use((err, req, res, next) => {
  res.status(400).json({ error: err.message || "Request error" });
});

app.listen(PORT, () => console.log(`EGO GoatStore running on port ${PORT}`));

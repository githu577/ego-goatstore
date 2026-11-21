const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || "CHANGE_THIS_ADMIN_KEY";

const ALLOWED_CATEGORIES = new Set([
  "utility", "fun", "media", "ai", "games", "moderation",
  "economy", "leveling", "anime", "music", "downloader", "image-gen",
  "image-edit", "canvas", "social", "group", "anti-spam", "nsfw-safe",
  "search", "weather", "crypto", "education", "translate", "quotes",
  "romantic", "stickers", "voice", "system", "owner", "vip",
  "tools", "misc"
]);

const ROOT = __dirname;
const DATA = path.join(ROOT, "data");
const COMMANDS = path.join(ROOT, "commands");
const DB = path.join(DATA, "commands.json");

for (const dir of [DATA, COMMANDS]) {
  fs.mkdirSync(dir, { recursive: true });
}

if (!fs.existsSync(DB)) {
  fs.writeFileSync(DB, "[]");
}

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(ROOT));

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB, "utf8"));
  } catch {
    return [];
  }
}

function saveDB(data) {
  fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}

function normalizeCategory(rawCat) {
  const cleaned = String(rawCat || "utility")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-");
  return ALLOWED_CATEGORIES.has(cleaned) ? cleaned : "misc";
}

function admin(req, res, next) {
  const key = req.headers["x-admin-key"] || (req.body && req.body.adminKey);

  if (!key || key !== ADMIN_KEY) {
    return res.status(401).json({
      success: false,
      message: "Invalid admin key"
    });
  }

  next();
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, COMMANDS),

  filename: (req, file, cb) => {
    const safeName = path.basename(file.originalname)
      .replace(/[^a-zA-Z0-9._-]/g, "_");

    cb(null, crypto.randomUUID() + "-" + safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.toLowerCase().endsWith(".js")) {
      return cb(new Error("Only .js command files are allowed"));
    }
    cb(null, true);
  }
});

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    name: "EGO GOATSTORE",
    status: "ONLINE",
    version: "3.0",
    categoriesCount: ALLOWED_CATEGORIES.size,
    categories: Array.from(ALLOWED_CATEGORIES)
  });
});

app.get("/api/commands", (req, res) => {
  const rawCommands = readDB();
  const q = String(req.query.q || "").toLowerCase().trim();
  const cat = String(req.query.category || "all").toLowerCase().trim();

  const commands = rawCommands
    .map(({ file, ...item }) => ({
      ...item,
      category: normalizeCategory(item.category)
    }))
    .filter(item => {
      const catMatch = cat === "all" || item.category === cat;
      if (!catMatch) return false;
      if (!q) return true;
      return (
        String(item.name || "").toLowerCase().includes(q) ||
        String(item.description || "").toLowerCase().includes(q) ||
        String(item.category || "").toLowerCase().includes(q) ||
        String(item.author || "").toLowerCase().includes(q)
      );
    });

  res.json({
    success: true,
    total: commands.length,
    categoriesCount: ALLOWED_CATEGORIES.size,
    commands
  });
});

app.get("/api/commands/:id", (req, res) => {
  const command = readDB().find(x => x.id === req.params.id);

  if (!command) {
    return res.status(404).json({
      success: false,
      message: "Command not found"
    });
  }

  const { file, ...safeCommand } = command;
  res.json({ success: true, command: safeCommand });
});

app.post("/api/upload", admin, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Select a JS file"
    });
  }

  const name = String(req.body.name || path.basename(req.file.originalname, ".js"))
    .trim()
    .slice(0, 60) || "command";

  const author = String(req.body.author || "EGO")
    .trim()
    .slice(0, 40) || "EGO";

  const command = {
    id: crypto.randomUUID(),
    name,
    description: String(req.body.description || "EGO GOATSTORE command").slice(0, 300),
    category: normalizeCategory(req.body.category),
    author,
    file: req.file.filename,
    downloads: 0,
    createdAt: new Date().toISOString()
  };

  const commands = readDB();
  commands.unshift(command);
  saveDB(commands);

  const { file, ...safeCommand } = command;

  res.json({
    success: true,
    message: `Command uploaded to [${command.category.toUpperCase()}] successfully`,
    command: safeCommand
  });
});

app.get("/api/install/:id", (req, res) => {
  const commands = readDB();
  const index = commands.findIndex(x => x.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Command not found"
    });
  }

  const command = commands[index];
  const filePath = path.join(COMMANDS, path.basename(command.file));

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: "Command file missing"
    });
  }

  command.downloads = (Number(command.downloads) || 0) + 1;
  saveDB(commands);

  res.download(filePath, path.basename(command.file).replace(/^[^-]+-/, ""));
});

app.delete("/api/commands/:id", admin, (req, res) => {
  const commands = readDB();
  const index = commands.findIndex(x => x.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Command not found"
    });
  }

  const command = commands[index];
  const filePath = path.join(COMMANDS, path.basename(command.file));

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  commands.splice(index, 1);
  saveDB(commands);

  res.json({
    success: true,
    message: "Command deleted"
  });
});

app.use((err, req, res, next) => {
  res.status(400).json({
    success: false,
    message: err.message || "Request failed"
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(ROOT, "index.html"));
});

app.listen(PORT, () => {
  console.log("========================================");
  console.log(" EGO GOATSTORE ONLINE (32 CATEGORIES)");
  console.log(" PORT: " + PORT);
  console.log("========================================");
});

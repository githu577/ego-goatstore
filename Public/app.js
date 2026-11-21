const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

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

function generateUnique4DigitUid(existingCommands, requestedUid) {
  const usedUids = new Set(existingCommands.map(item => String(item.uid || "")));

  if (requestedUid && /^\d{4}$/.test(requestedUid)) {
    if (!usedUids.has(requestedUid)) {
      return requestedUid;
    }
  }

  let uid = "";
  let guard = 0;
  do {
    uid = String(Math.floor(1000 + Math.random() * 9000));
    guard += 1;
  } while (usedUids.has(uid) && guard < 9000);

  return uid;
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
    mode: "FREE_OPEN_HUB",
    version: "4.0",
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
      uid: String(item.uid || "").padStart(4, "0").slice(0, 4),
      category: normalizeCategory(item.category)
    }))
    .filter(item => {
      const catMatch = cat === "all" || item.category === cat;
      if (!catMatch) return false;
      if (!q) return true;
      return (
        String(item.uid || "").toLowerCase().includes(q) ||
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

// Direct GoatBot JSON endpoint (returns code + metadata by UID or ID)
app.get("/api/bot/commands/:uidOrId", (req, res) => {
  const key = String(req.params.uidOrId || "").trim();
  const all = readDB();
  const command = all.find(x => String(x.uid) === key || x.id === key);

  if (!command) {
    return res.status(404).json({
      success: false,
      message: "Command not found for GoatBot"
    });
  }

  const filePath = path.join(COMMANDS, path.basename(command.file));
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: "Command script file missing"
    });
  }

  const code = fs.readFileSync(filePath, "utf8");
  const { file, ...safeCommand } = command;

  res.json({
    success: true,
    command: safeCommand,
    fileName: path.basename(command.file).replace(/^[^-]+-/, ""),
    code
  });
});

app.get("/api/commands/:id", (req, res) => {
  const command = readDB().find(x => x.id === req.params.id || String(x.uid) === req.params.id);

  if (!command) {
    return res.status(404).json({
      success: false,
      message: "Command not found"
    });
  }

  const { file, ...safeCommand } = command;
  res.json({ success: true, command: safeCommand });
});

// Free Open Command Upload with 4-digit UID
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Select a .js file"
    });
  }

  const commands = readDB();
  const requestedUid = String(req.body.uid || "").trim();
  const uid = generateUnique4DigitUid(commands, requestedUid);

  const name = String(req.body.name || path.basename(req.file.originalname, ".js"))
    .trim()
    .slice(0, 60) || "command";

  const author = String(req.body.author || "EGO")
    .trim()
    .slice(0, 40) || "EGO";

  const command = {
    id: crypto.randomUUID(),
    uid,
    name,
    description: String(req.body.description || "EGO GOATSTORE GoatBot command").slice(0, 300),
    category: normalizeCategory(req.body.category),
    author,
    file: req.file.filename,
    downloads: 0,
    createdAt: new Date().toISOString()
  };

  commands.unshift(command);
  saveDB(commands);

  const { file, ...safeCommand } = command;

  res.json({
    success: true,
    message: `Uploaded to [${command.category.toUpperCase()}] successfully`,
    command: safeCommand
  });
});

function serveCommandDownload(req, res, matcherFn) {
  const commands = readDB();
  const index = commands.findIndex(matcherFn);

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
}

app.get("/api/install/uid/:uid", (req, res) => {
  const targetUid = String(req.params.uid || "").trim();
  serveCommandDownload(req, res, x => String(x.uid) === targetUid);
});

app.get("/api/install/:id", (req, res) => {
  const targetId = String(req.params.id || "").trim();
  serveCommandDownload(req, res, x => x.id === targetId || String(x.uid) === targetId);
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
  console.log("=============================================");
  console.log(" EGO GOATSTORE ONLINE (FREE + 4-DIGIT UID)");
  console.log(" PORT: " + PORT);
  console.log("=============================================");
});

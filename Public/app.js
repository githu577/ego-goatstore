
(() => {
"use strict";

const $ = id => document.getElementById(id);
const API_DEFAULT = "";

let apiBase = localStorage.getItem("egoApiBase") || API_DEFAULT;
let items = [];
let category = "all";
let pageSize = 9;
let adminKey = sessionStorage.getItem("egoAdminKey") || "";
let toastTimer, fileText = "", selectedFileName = "";

const favorites = new Set(
  JSON.parse(localStorage.getItem("egoFavorites") || "[]")
);

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({
  "&":"&amp;",
  "<":"&lt;",
  ">":"&gt;",
  '"':"&quot;",
  "'":"&#39;"
}[c]));

const fmt = n => Number(n || 0).toLocaleString();

const api = path => (apiBase.replace(/\/+$/,"") + path);

function toast(msg) {
  $("toast").textContent = msg;
  $("toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(
    () => $("toast").classList.remove("show"),
    2600
  );
}

function versionCompare(a,b) {
  return String(a||"0").localeCompare(
    String(b||"0"),
    undefined,
    {numeric:true,sensitivity:"base"}
  );
}

function getCategory(c) {
  return String(c.category||"Other").trim()||"Other";
}

function setApiStatus(state) {
  const pill = $("apiStatus").parentElement;
  $("apiStatus").textContent = state;
  pill.classList.toggle("online",state==="ONLINE");
  pill.classList.toggle("offline",state==="OFFLINE");
}

function updateStats() {
  $("statCommands").textContent = fmt(items.length);
  $("heroCount").textContent = fmt(items.length);

  $("statDownloads").textContent = fmt(
    items.reduce(
      (s,c) => s + Number(c.downloads||c.downloadCount||0),
      0
    )
  );

  $("statAuthors").textContent = fmt(
    new Set(
      items.map(c => String(c.author||"unknown").toLowerCase())
    ).size
  );
}

function categories() {
  const cats = [
    ...new Set(items.map(getCategory))
  ].sort((a,b) => a.localeCompare(b));

  const bar = $("categoryBar");

  bar.innerHTML =
    '<button class="category '+(category==="all"?"active":"")+'" data-category="all">ALL MODULES</button>' +
    cats.map(c =>
      `<button class="category ${category.toLowerCase()===c.toLowerCase()?"active":""}" data-category="${esc(c)}">${esc(c.toUpperCase())}</button>`
    ).join('');

  bar.querySelectorAll("button").forEach(b => {
    b.onclick = () => {
      category = b.dataset.category;
      pageSize = 9;
      categories();
      render();
    };
  });
}

function filtered() {
  const q = $("search").value.trim().toLowerCase();

  let a = items.filter(c =>
    (category==="all" ||
      getCategory(c).toLowerCase()===category.toLowerCase()) &&
    (!q ||
      [c.name,c.description,c.author,c.category,c.version]
        .join(" ")
        .toLowerCase()
        .includes(q))
  );

  const sort = $("sort").value;

  if(sort==="az") {
    a.sort((x,y) => String(x.name).localeCompare(String(y.name)));
  }
  else if(sort==="version") {
    a.sort((x,y) => versionCompare(y.version,x.version));
  }
  else {
    a.sort((x,y) =>
      String(y.createdAt||"").localeCompare(String(x.createdAt||""))
    );
  }

  return a;
}

function card(c) {
  const id = String(c.id??c.name);

  return `
  <article class="command-card">
    <div class="card-top">
      <span class="cat-badge">${esc(getCategory(c))}</span>
      <span class="download-count">↓ ${fmt(c.downloads||c.downloadCount)}</span>
    </div>

    <h3>${esc(c.name||"Unnamed command")}</h3>

    <p class="description">
      ${esc(c.description||"Community GoatBot module.")}
    </p>

    <div class="card-meta">
      <span class="meta-pill">
        VERSION <strong>${esc(c.version||"1.0.0")}</strong>
      </span>

      <span class="meta-pill">
        BY <strong>${esc(c.author||"Unknown")}</strong>
      </span>
    </div>

    <div class="card-buttons">
      <button class="download" data-download="${esc(id)}">
        ↓ DOWNLOAD JS
      </button>

      <button class="copy" data-copy="${esc(id)}">
        ▣ COPY CODE
      </button>

      <button class="import" data-import="${esc(id)}">
        ⇥ IMPORT / COPY
      </button>
    </div>

    ${adminKey ? `
      <div class="admin-actions">
        <button data-update="${esc(id)}">UPDATE VERSION</button>
        <button data-delete="${esc(id)}">DELETE</button>
      </div>
    ` : ""}
  </article>`;
}

function render() {
  const a = filtered();

  $("resultCount").textContent =
    `${a.length} MODULE${a.length===1?"":"S"} FOUND`;

  $("commandGrid").innerHTML = a.length
    ? a.slice(0,pageSize).map(card).join("")
    : '<div class="empty">No commands found. Try a different category or search.</div>';

  $("loadMore").hidden = a.length<=pageSize;

  updateStats();

  $("commandGrid")
    .querySelectorAll("[data-download]")
    .forEach(b => b.onclick = () => download(b.dataset.download));

  $("commandGrid")
    .querySelectorAll("[data-copy]")
    .forEach(b => b.onclick = () => copyCode(b.dataset.copy));

  $("commandGrid")
    .querySelectorAll("[data-import]")
    .forEach(b => b.onclick = () => importCode(b.dataset.import));

  $("commandGrid")
    .querySelectorAll("[data-update]")
    .forEach(b => b.onclick = () => openUpdate(b.dataset.update));

  $("commandGrid")
    .querySelectorAll("[data-delete]")
    .forEach(b => b.onclick = () => deleteCommand(b.dataset.delete));
}

async function load() {
  $("commandGrid").innerHTML =
    '<div class="empty">Connecting to EGO command database…</div>';

  try {
    const r = await fetch(api("/api/gs/commands"), {
      cache:"no-store"
    });

    if(!r.ok) throw new Error("HTTP "+r.status);

    const d = await r.json();

    items = Array.isArray(d)
      ? d
      : (d.commands||d.items||[]);

    setApiStatus("ONLINE");
    categories();
    render();

  } catch(e) {
    setApiStatus("OFFLINE");

    $("commandGrid").innerHTML = `
      <div class="empty">
        Could not connect to API.<br>
        <small>${esc(e.message)} · Set API URL in Admin settings.</small>
      </div>`;
  }
}

function find(id) {
  return items.find(c => String(c.id??c.name)===String(id))
    || items.find(c => String(c.name)===String(id));
}

async function getCode(c) {
  const id = encodeURIComponent(c.id??c.name);

  const r = await fetch(
    api(`/api/gs/commands/${id}/raw`),
    {cache:"no-store"}
  );

  if(!r.ok) throw Error("Could not fetch command code");

  return await r.text();
}

async function copyCode(id) {
  const c = find(id);
  if(!c) return;

  try {
    const code = await getCode(c);
    await navigator.clipboard.writeText(code);
    toast("Copied command code to clipboard ✓");
  } catch(e) {
    toast("Copy failed. Try opening Details or Download.");
  }
}

async function importCode(id) {
  const c = find(id);
  if(!c) return;

  try {
    const code = await getCode(c);
    await navigator.clipboard.writeText(code);

    toast(
      `Copied ${c.name}. Paste it into your GoatBot commands folder.`
    );
  } catch(e) {
    toast("Import/copy failed. Download the file instead.");
  }
}

async function download(id) {
  const c = find(id);
  if(!c) return;

  try {
    const code = await getCode(c);

    const blob = new Blob([code], {
      type:"text/javascript"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = (c.name||"command")
      .replace(/[^a-z0-9_.-]/gi,"_") + ".js";

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);

    toast("Download started ✓");

  } catch(e) {
    toast(e.message);
  }
}

function openDetails(id) {
  const c = find(id);
  if(!c) return;

  getCode(c).then(code => {
    $("detailBody").innerHTML = `
      <div class="detail-content">
        <div class="dialog-kicker">/ MODULE DETAILS</div>
        <h2>${esc(c.name)}</h2>
        <p>${esc(c.description||"No description provided.")}</p>
        <p>
          Category: <b>${esc(getCategory(c))}</b> ·
          Version: <b>${esc(c.version||"1.0.0")}</b> ·
          Author: <b>${esc(c.author||"Unknown")}</b>
        </p>
        <pre class="detail-code">${esc(code)}</pre>
        <div class="detail-buttons">
          <button class="btn btn-main" id="detailDownload">DOWNLOAD JS</button>
          <button class="btn btn-ghost" id="detailCopy">COPY CODE</button>
        </div>
      </div>`;

    $("detailDialog").showModal();

    $("detailDownload").onclick = () => download(id);
    $("detailCopy").onclick = () => copyCode(id);

  }).catch(() => toast("Details couldn't load."));
}

function openUpload() {
  $("uploadDialog").showModal();
  $("uploadKey").value = adminKey;
}

function openUpdate(id) {
  const c = find(id);
  if(!c) return;

  toast(
    "Update endpoint needs backend PUT support. Use upload with the new version for now."
  );

  openUpload();

  $("uploadForm").elements.name.value = c.name;
  $("uploadForm").elements.category.value = c.category||"Other";
  $("uploadForm").elements.version.value = c.version||"1.0.0";
  $("uploadForm").elements.description.value = c.description||"";
  $("uploadForm").elements.author.value = c.author||"EGO";

  $("uploadMessage").textContent =
    "New version draft. Publishing currently adds a new entry; backend update route is not installed yet.";
}

async function deleteCommand(id) {
  const c = find(id);
  if(!c||!adminKey) return;

  if(!confirm(`Delete ${c.name}?`)) return;

  try {
    const r = await fetch(
      api(`/api/gs/commands/${encodeURIComponent(c.id)}`),
      {
        method:"DELETE",
        headers:{"x-admin-key":adminKey}
      }
    );

    const d = await r.json();

    if(!r.ok) throw Error(d.error||"Delete failed");

    toast("Command deleted");
    load();

  } catch(e) {
    toast(e.message);
  }
}

$("search").oninput = () => {
  pageSize = 9;
  render();
};

$("sort").onchange = render;

$("clearSearch").onclick = () => {
  $("search").value="";
  render();
};

$("refresh").onclick = load;

$("loadMore").onclick = () => {
  pageSize += 9;
  render();
};

$("year").textContent = new Date().getFullYear();

$("uploadOpen").onclick =
$("publishOpen").onclick = () => openUpload();

$("adminOpen").onclick = () => {
  $("adminKey").value = adminKey;
  $("apiInput").value = apiBase;
  $("adminUnlocked").hidden = !adminKey;
  $("adminDialog").showModal();
};

$("adminForm").onsubmit = e => {
  e.preventDefault();

  adminKey = $("adminKey").value;

  sessionStorage.setItem("egoAdminKey",adminKey);

  $("adminMessage").textContent =
    "Admin key saved for this browser session.";

  $("adminUnlocked").hidden = false;

  toast("Admin access unlocked");
};

$("adminLock").onclick = () => {
  adminKey = "";
  sessionStorage.removeItem("egoAdminKey");

  $("adminUnlocked").hidden = true;
  $("adminMessage").textContent = "Session locked.";

  toast("Admin locked");
};

$("saveApi").onclick = () => {
  apiBase = $("apiInput").value.trim().replace(/\/+$/,"");

  localStorage.setItem("egoApiBase",apiBase);

  $("adminDialog").close();

  load();

  toast("API address saved");
};

document.querySelectorAll("[data-close]").forEach(b => {
  b.onclick = () => $(b.dataset.close).close();
});

$("categorySelect").onchange = () => {
  $("customCategory").hidden =
    $("categorySelect").value!=="__custom";

  if(!$("customCategory").hidden)
    $("customCategory").focus();
};

$("commandFile").onchange = async e => {
  const f = e.target.files?.[0];

  selectedFileName = f?.name||"";

  $("fileLabel").textContent =
    selectedFileName||"＋ Choose command file";

  fileText = f ? await f.text() : "";
};

$("uploadForm").onsubmit = async e => {
  e.preventDefault();

  const form = e.currentTarget;
  const btn = $("submitUpload");

  const categoryValue =
    $("categorySelect").value==="__custom"
      ? $("customCategory").value.trim()
      : $("categorySelect").value;

  if(!categoryValue) {
    toast("Please enter a category.");
    return;
  }

  if(!fileText) {
    toast("Choose a .js file first.");
    return;
  }

  const name = form.elements.name.value.trim();
  const version = form.elements.version.value.trim()||"1.0.0";

  btn.disabled = true;

  $("uploadProgress").classList.add("show");
  $("uploadMessage").textContent = "Uploading…";

  try {
    const payload = {
      name,
      category:categoryValue,
      version,
      description:form.elements.description.value,
      author:form.elements.author.value||"EGO",
      code:fileText
    };

    const r = await fetch(api("/api/gs/commands"), {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "x-admin-key":$("uploadKey").value
      },
      body:JSON.stringify(payload)
    });

    const d = await r.json();

    if(!r.ok) throw Error(d.error||"Upload failed");

    adminKey = $("uploadKey").value;

    sessionStorage.setItem("egoAdminKey",adminKey);

    $("uploadMessage").textContent =
      "✓ Published successfully!";

    toast("Command published ✓");

    await load();

    setTimeout(() => {
      $("uploadDialog").close();

      form.reset();

      $("fileLabel").textContent = "＋ Choose command file";
      fileText = "";
      selectedFileName = "";

      $("customCategory").hidden = true;
      $("uploadProgress").classList.remove("show");
      btn.disabled = false;

    },700);

  } catch(err) {
    $("uploadMessage").textContent = "⚠ "+err.message;
    $("uploadProgress").classList.remove("show");
    btn.disabled = false;
  }
};

$("menuBtn").onclick = () => {
  const nav = $(".nav nav");

  nav.style.display =
    nav.style.display==="flex" ? "none" : "flex";

  nav.style.position = "absolute";
  nav.style.top = "66px";
  nav.style.right = "12px";
  nav.style.padding = "15px";
  nav.style.background = "#100d20";
  nav.style.border = "1px solid #39245b";
  nav.style.borderRadius = "12px";
  nav.style.flexDirection = "column";
};

window.addEventListener("load", () => {
  setTimeout(() => $("boot").classList.add("hide"),550);
});

load();

})();

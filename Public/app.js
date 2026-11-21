const API = "";

const $ = (id) => document.getElementById(id);

let commands = [];
let adminKey = localStorage.getItem("ego_admin_key") || "";
let isAdmin = false;
let toastTimer;

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

function openModal(id) {
  $(id).classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal(id) {
  $(id).classList.add("hidden");
  document.body.style.overflow = "";
}

function formatNumber(num) {
  return Number(num || 0).toLocaleString();
}

function categoryIcon(category) {
  const icons = {
    ai: "AI",
    fun: "FUN",
    games: "GG",
    economy: "$",
    moderation: "盾",
    utility: "UT",
    media: "MD",
    other: "EX"
  };

  return icons[String(category || "").toLowerCase()] || "JS";
}

function updateStats() {
  $("totalCommands").textContent = formatNumber(commands.length);

  const downloads = commands.reduce((sum, item) => {
    return sum + Number(item.downloads || 0);
  }, 0);

  $("totalDownloads").textContent = formatNumber(downloads);
}

function renderCommands() {
  const query = $("searchInput").value.trim().toLowerCase();
  const category = $("categorySelect").value.toLowerCase();

  const filtered = commands.filter((command) => {
    const searchable = [
      command.name,
      command.author,
      command.category,
      command.description
    ].join(" ").toLowerCase();

    const matchesSearch = !query || searchable.includes(query);

    const matchesCategory =
      category === "all" ||
      String(command.category || "").toLowerCase() === category;

    return matchesSearch && matchesCategory;
  });

  $("resultCount").textContent = filtered.length;

  const grid = $("commandsGrid");
  const empty = $("emptyState");

  if (!filtered.length) {
    grid.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");

  grid.innerHTML = filtered.map((command) => {
    const name = escapeHTML(command.name);
    const categoryName = escapeHTML(command.category || "other");
    const description = escapeHTML(command.description || "No description available.");
    const author = escapeHTML(command.author || "Unknown");
    const downloads = formatNumber(command.downloads);

    return `
      <article class="command-card">
        <div class="card-top">
          <div class="command-icon">${categoryIcon(command.category)}</div>
          <span class="category-badge">${categoryName.toUpperCase()}</span>
        </div>

        <h3>${name}</h3>
        <p>${description}</p>

        <div class="card-author">
          <span>AUTHOR</span>
          <span>${author}</span>
        </div>

        <div class="card-bottom">
          <span class="download-count">⇩ ${downloads} DOWNLOADS</span>

          <div style="display:flex;gap:8px">
            ${
              isAdmin
                ? `<button class="delete-btn" data-delete="${encodeURIComponent(command.name)}">DELETE</button>`
                : ""
            }

            <button class="download-btn" data-download="${encodeURIComponent(command.name)}">
              DOWNLOAD ↗
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

async function loadCommands() {
  $("commandsGrid").innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">⌁</div>
      <h3>CONNECTING TO DATABASE</h3>
      <p>Loading commands...</p>
    </div>
  `;

  try {
    const response = await fetch(`${API}/api/commands`);

    if (!response.ok) {
      throw new Error("Database connection failed");
    }

    commands = await response.json();

    if (!Array.isArray(commands)) {
      commands = [];
    }

    updateStats();
    renderCommands();

  } catch (error) {
    $("commandsGrid").innerHTML = "";
    $("emptyState").classList.remove("hidden");
    $("emptyState").querySelector("h3").textContent = "CONNECTION ERROR";
    $("emptyState").querySelector("p").textContent =
      "Unable to connect to the command database. Refresh the page.";
  }
}

// SEARCH
$("searchInput").addEventListener("input", renderCommands);

$("clearSearch").addEventListener("click", () => {
  $("searchInput").value = "";
  $("categorySelect").value = "all";
  renderCommands();
});

$("categorySelect").addEventListener("change", renderCommands);

// OPEN MODALS
$("adminOpen").addEventListener("click", () => {
  if (isAdmin) {
    showToast("Admin session is already active.");
    return;
  }

  openModal("adminModal");
});

[
  "uploadOpen",
  "bannerUpload",
  "emptyUpload"
].forEach((id) => {
  $(id).addEventListener("click", () => {
    openModal("uploadModal");
  });
});

$("exploreBtn").addEventListener("click", () => {
  $("library").scrollIntoView({
    behavior: "smooth"
  });
});

// CLOSE MODALS
document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => {
    closeModal(button.dataset.close);
  });
});

document.querySelectorAll(".modal-overlay").forEach((overlay) => {
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeModal(overlay.id);
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.querySelectorAll(".modal-overlay").forEach((modal) => {
      closeModal(modal.id);
    });
  }
});

// ADMIN LOGIN
$("adminForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const key = $("adminKeyInput").value.trim();

  if (!key) {
    showToast("Enter your admin key.");
    return;
  }

  adminKey = key;

  // Validate key by requesting a protected action is not performed.
  // Instead, use an intentionally invalid empty upload to verify auth.
  try {
    const formData = new FormData();

    const response = await fetch(`${API}/api/commands`, {
      method: "POST",
      headers: {
        "x-admin-key": key
      },
      body: formData
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      showToast("Invalid admin key.");
      return;
    }

    // Authenticated request, upload fields missing is expected.
    if (response.status === 400) {
      isAdmin = true;
      localStorage.setItem("ego_admin_key", key);

      closeModal("adminModal");
      $("adminKeyInput").value = "";

      renderCommands();
      showToast("ADMIN ACCESS ACTIVATED");
      return;
    }

    if (response.ok) {
      isAdmin = true;
      localStorage.setItem("ego_admin_key", key);
      closeModal("adminModal");
      renderCommands();
      showToast("Admin access activated.");
    } else {
      showToast(data.error || "Could not verify admin access.");
    }

  } catch {
    showToast("Server connection error.");
  }
});

// ADMIN DISCONNECT
$("adminDisconnect").addEventListener("click", () => {
  localStorage.removeItem("ego_admin_key");
  adminKey = "";
  isAdmin = false;
  closeModal("adminModal");
  renderCommands();
  showToast("Admin disconnected.");
});

// FILE SELECT
$("commandFile").addEventListener("change", () => {
  const file = $("commandFile").files[0];

  if (!file) {
    $("fileLabel").textContent = "SELECT YOUR .JS FILE";
    return;
  }

  $("fileLabel").textContent = file.name;
});

// UPLOAD
$("uploadForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!adminKey || !isAdmin) {
    showToast("Admin login required to upload.");
    closeModal("uploadModal");
    openModal("adminModal");
    return;
  }

  const file = $("commandFile").files[0];

  if (!file) {
    showNotice("Please select a JavaScript file.", "error");
    return;
  }

  if (!file.name.toLowerCase().endsWith(".js")) {
    showNotice("Only .js files are allowed.", "error");
    return;
  }

  if (file.size > 200 * 1024) {
    showNotice("File size must be below 200 KB.", "error");
    return;
  }

  const form = $("uploadForm");
  const formData = new FormData(form);
  formData.set("file", file);

  const button = $("publishBtn");
  button.disabled = true;
  button.textContent = "UPLOADING...";

  try {
    const response = await fetch(`${API}/api/commands`, {
      method: "POST",
      headers: {
        "x-admin-key": adminKey
      },
      body: formData
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Upload failed.");
    }

    showNotice("COMMAND PUBLISHED SUCCESSFULLY!", "success");
    showToast("Command uploaded!");

    form.reset();
    $("fileLabel").textContent = "SELECT YOUR .JS FILE";

    await loadCommands();

    setTimeout(() => {
      closeModal("uploadModal");
      $("uploadNotice").classList.add("hidden");
    }, 1200);

  } catch (error) {
    showNotice(error.message, "error");
  } finally {
    button.disabled = false;
    button.innerHTML = 'PUBLISH COMMAND <span>↗</span>';
  }
});

function showNotice(message, type) {
  const notice = $("uploadNotice");
  notice.textContent = message;
  notice.className = `notice ${type}`;
}

// DOWNLOAD
$("commandsGrid").addEventListener("click", async (event) => {
  const downloadButton = event.target.closest("[data-download]");
  const deleteButton = event.target.closest("[data-delete]");

  if (downloadButton) {
    const name = decodeURIComponent(downloadButton.dataset.download);

    downloadButton.disabled = true;
    downloadButton.textContent = "PLEASE WAIT...";

    try {
      await fetch(`${API}/api/commands/${encodeURIComponent(name)}/download-count`, {
        method: "POST"
      });

      const link = document.createElement("a");
      link.href = `${API}/api/commands/${encodeURIComponent(name)}/download`;
      link.download = `${name}.js`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      showToast(`Downloading ${name}.js`);

      setTimeout(loadCommands, 800);

    } catch {
      showToast("Download request failed.");
    } finally {
      downloadButton.disabled = false;
      downloadButton.textContent = "DOWNLOAD ↗";
    }
  }

  // DELETE
  if (deleteButton) {
    if (!isAdmin || !adminKey) {
      showToast("Admin access required.");
      return;
    }

    const name = decodeURIComponent(deleteButton.dataset.delete);

    if (!confirm(`Delete "${name}" command permanently?`)) {
      return;
    }

    deleteButton.disabled = true;

    try {
      const response = await fetch(
        `${API}/api/commands/${encodeURIComponent(name)}`,
        {
          method: "DELETE",
          headers: {
            "x-admin-key": adminKey
          }
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Delete failed");
      }

      showToast("Command deleted.");
      await loadCommands();

    } catch (error) {
      showToast(error.message);
      deleteButton.disabled = false;
    }
  }
});

// AUTO-RECONNECT ADMIN KEY
async function checkSavedAdmin() {
  if (!adminKey) return;

  try {
    const formData = new FormData();

    const response = await fetch(`${API}/api/commands`, {
      method: "POST",
      headers: {
        "x-admin-key": adminKey
      },
      body: formData
    });

    if (response.status === 400) {
      isAdmin = true;
      renderCommands();
    } else if (response.status === 401) {
      isAdmin = false;
      localStorage.removeItem("ego_admin_key");
      adminKey = "";
    }
  } catch {
    // Offline: don't disrupt the public site.
  }
}

// START
loadCommands();
checkSavedAdmin();

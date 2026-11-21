const grid = document.getElementById('grid');
const search = document.getElementById('search');
const count = document.getElementById('count');
const sort = document.getElementById('sort');
const cats = document.getElementById('filters');

let commands = [];
let activeCat = 'all';
let adminKey = sessionStorage.getItem('egoAdminKey') || '';
let pageSize = 9;
let toastTimer;

const favs = new Set(
  JSON.parse(localStorage.getItem('egoFavorites') || '[]')
);

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    t.classList.remove('show');
  }, 2600);
}

function formatNum(n) {
  return Number(n || 0).toLocaleString();
}

function updateStats() {
  document.getElementById('statCommands').textContent =
    formatNum(commands.length);

  document.getElementById('statDownloads').textContent =
    formatNum(
      commands.reduce((a, c) => a + Number(c.downloads || 0), 0)
    );

  document.getElementById('statAuthors').textContent =
    formatNum(
      new Set(
        commands.map(c => (c.author || 'Unknown').toLowerCase())
      ).size
    );
}

function setApi(on) {
  const s = document.getElementById('apiState');

  s.textContent = on ? 'ONLINE' : 'OFFLINE';
  s.style.color = on ? '#55eeb9' : '#ff879e';
}

function filtered() {
  let q = search.value.trim().toLowerCase();

  let arr = commands.filter(c =>
    (!q ||
      [c.name, c.description, c.author, c.category]
        .join(' ')
        .toLowerCase()
        .includes(q)
    ) &&
    (
      activeCat === 'all' ||
      (
        activeCat === 'favorites'
          ? favs.has(c.name)
          : String(c.category || 'Utility').toLowerCase() === activeCat.toLowerCase()
      )
    )
  );

  if (sort.value === 'popular') {
    arr.sort((a, b) =>
      Number(b.downloads || 0) - Number(a.downloads || 0)
    );
  } else if (sort.value === 'az') {
    arr.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    arr.sort((a, b) =>
      String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
    );
  }

  return arr;
}

function card(c) {
  let saved = favs.has(c.name);
  let date = c.createdAt
    ? new Date(c.createdAt).toLocaleDateString()
    : '';

  return `
    <article class="card">

      <div class="cardtop">
        <span class="tag">${esc(c.category || 'Utility')}</span>
        <span class="downloads">↓ ${formatNum(c.downloads)}</span>
      </div>

      <h3>${esc(c.name)}</h3>

      <p>${esc(c.description || 'No description provided.')}</p>

      <div class="meta">
        <span>BY ${esc(c.author || 'Unknown')}</span>
        <span>${esc(date)}</span>
      </div>

      <div class="card-actions">

        <button class="download-btn" data-download="${esc(c.name)}">
          ↓ DOWNLOAD JS
        </button>

        <button class="detail-btn" data-detail="${esc(c.name)}">
          DETAILS
        </button>

        <button class="detail-btn" data-fav="${esc(c.name)}" aria-label="Save">
          ${saved ? '♥' : '♡'}
        </button>

        ${
          adminKey
            ? `<button class="delete-btn" data-delete="${esc(c.name)}">×</button>`
            : ''
        }

      </div>
    </article>
  `;
}

function render() {
  let list = filtered();
  let visible = list.slice(0, pageSize);

  count.textContent =
    `${list.length} MODULE${list.length === 1 ? '' : 'S'} FOUND`;

  grid.innerHTML = visible.length
    ? visible.map(card).join('')
    : `
      <div class="empty">
        ${
          activeCat === 'favorites'
            ? 'No saved commands yet. Tap ♡ on a module to save it.'
            : 'No modules found. Try a different search or category.'
        }
      </div>
    `;

  document.getElementById('loadMore').hidden =
    list.length <= pageSize;

  updateStats();

  grid.querySelectorAll('[data-download]').forEach(b => {
    b.onclick = () => download(b.dataset.download, b);
  });

  grid.querySelectorAll('[data-detail]').forEach(b => {
    b.onclick = () => details(b.dataset.detail);
  });

  grid.querySelectorAll('[data-fav]').forEach(b => {
    b.onclick = () => toggleFav(b.dataset.fav);
  });

  grid.querySelectorAll('[data-delete]').forEach(b => {
    b.onclick = () => deleteCommand(b.dataset.delete);
  });
}

async function load() {
  grid.innerHTML = `
    <div class="skeleton"></div>
    <div class="skeleton"></div>
    <div class="skeleton"></div>
  `;

  try {
    const r = await fetch('/api/commands', {
      cache: 'no-store'
    });

    if (!r.ok) throw Error('API error');

    commands = await r.json();

    setApi(true);
    render();

  } catch (e) {
    setApi(false);

    count.textContent = 'API CONNECTION FAILED';

    grid.innerHTML = `
      <div class="empty">
        Store API is unavailable. Refresh the page in a moment.
      </div>
    `;
  }
}

async function download(name, button) {
  button.disabled = true;
  button.textContent = 'PREPARING…';

  try {
    await fetch(
      `/api/commands/${encodeURIComponent(name)}/download-count`,
      { method: 'POST' }
    );

    const a = document.createElement('a');

    a.href =
      `/api/commands/${encodeURIComponent(name)}/download`;

    a.download = `${name}.js`;

    document.body.appendChild(a);
    a.click();
    a.remove();

    const item = commands.find(c => c.name === name);

    if (item) {
      item.downloads = Number(item.downloads || 0) + 1;
    }

    toast(`${name}.js download started`);
    render();

  } catch {
    location.href =
      `/api/commands/${encodeURIComponent(name)}/download`;

  } finally {
    button.disabled = false;
  }
}

function toggleFav(name) {
  if (favs.has(name)) {
    favs.delete(name);
  } else {
    favs.add(name);
  }

  localStorage.setItem(
    'egoFavorites',
    JSON.stringify([...favs])
  );

  render();

  toast(
    favs.has(name)
      ? 'Module saved to favorites'
      : 'Removed from favorites'
  );
}

function details(name) {
  const c = commands.find(x => x.name === name);

  if (!c) return;

  const box = document.getElementById('detailContent');

  box.innerHTML = `
    <div class="section-tag">/ MODULE INFORMATION</div>

    <h2>${esc(c.name)}</h2>

    <p>${esc(c.description || 'No description provided.')}</p>

    <div class="detail-stats">
      <span>▣ ${esc(c.category || 'Utility')}</span>
      <span>↓ ${formatNum(c.downloads)} downloads</span>
      <span>By ${esc(c.author || 'Unknown')}</span>
    </div>

    <button class="primary full" id="detailDownload">
      DOWNLOAD MODULE ↓
    </button>
  `;

  document.getElementById('detailDownload').onclick = () => {
    document.getElementById('detailDialog').close();

    const b = grid.querySelector(
      `[data-download="${CSS.escape(name)}"]`
    );

    if (b) {
      download(name, b);
    } else {
      download(name, {
        disabled: false,
        textContent: ''
      });
    }
  };

  document.getElementById('detailDialog').showModal();
}

async function deleteCommand(name) {
  if (!confirm(`Remove “${name}” from the store?`)) return;

  try {
    const r = await fetch(
      `/api/commands/${encodeURIComponent(name)}`,
      {
        method: 'DELETE',
        headers: {
          'x-admin-key': adminKey
        }
      }
    );

    const d = await r.json();

    if (!r.ok) throw Error(d.error || 'Delete failed');

    toast('Command deleted');
    await load();

  } catch (e) {
    toast(e.message);
  }
}

search.addEventListener('input', () => {
  pageSize = 9;
  render();
});

sort.addEventListener('change', render);

document.getElementById('clearSearch').onclick = () => {
  search.value = '';
  render();
};

cats.querySelectorAll('[data-cat]').forEach(b => {
  b.onclick = () => {
    activeCat = b.dataset.cat;

    cats.querySelectorAll('.filter').forEach(x => {
      x.classList.toggle('active', x === b);
    });

    pageSize = 9;
    render();
  };
});

document.getElementById('loadMore').onclick = () => {
  pageSize += 9;
  render();
};

document.getElementById('year').textContent =
  new Date().getFullYear();

const uploadDialog = document.getElementById('uploadDialog');
const adminDialog = document.getElementById('adminDialog');

document.getElementById('openUpload').onclick =
document.getElementById('heroUpload').onclick = () => {
  uploadDialog.showModal();
};

document.getElementById('adminBtn').onclick = () => {
  document.getElementById('adminAccessKey').value = adminKey;
  adminDialog.showModal();
  refreshAdmin();
};

document.querySelectorAll('[data-close]').forEach(b => {
  b.onclick = () => {
    document.getElementById(b.dataset.close).close();
  };
});

document.getElementById('adminForm').onsubmit = e => {
  e.preventDefault();

  adminKey = document.getElementById('adminAccessKey').value;

  sessionStorage.setItem('egoAdminKey', adminKey);

  document.getElementById('adminStatus').textContent =
    'Key saved for this browser session.';

  refreshAdmin();
  render();

  toast('Admin tools unlocked');
};

function refreshAdmin() {
  document.getElementById('adminTools').hidden = !adminKey;
}

document.getElementById('lockAdmin').onclick = () => {
  adminKey = '';

  sessionStorage.removeItem('egoAdminKey');

  refreshAdmin();
  render();

  toast('Admin session locked');
};

const fileInput = document.querySelector('input[name=file]');

fileInput.onchange = () => {
  document.getElementById('fileName').textContent =
    fileInput.files[0]?.name || 'Choose .js file ⤴';
};

document.getElementById('uploadForm').onsubmit = async e => {
  e.preventDefault();

  const form = e.currentTarget;
  const fd = new FormData(form);

  const key = document.getElementById('adminKey').value;
  const status = document.getElementById('uploadStatus');
  const progress = document.getElementById('uploadProgress');
  const btn = document.getElementById('publishBtn');

  fd.set('author', fd.get('author') || 'EGO');

  btn.disabled = true;
  progress.classList.add('show');
  status.textContent = '';

  try {
    const r = await fetch('/api/commands', {
      method: 'POST',
      headers: {
        'x-admin-key': key
      },
      body: fd
    });

    const d = await r.json();

    if (!r.ok) {
      throw Error(d.error || 'Publish failed');
    }

    status.textContent = '✓ Module published successfully!';
    status.style.color = '#55eeb9';

    adminKey = key;

    sessionStorage.setItem('egoAdminKey', key);

    await load();

    setTimeout(() => {
      uploadDialog.close();
      form.reset();

      document.getElementById('fileName').textContent =
        'Choose .js file ⤴';

      progress.classList.remove('show');
      status.textContent = '';
      btn.disabled = false;
    }, 1000);

  } catch (err) {
    status.textContent = '⚠ ' + err.message;
    status.style.color = '#ff9aaf';

    progress.classList.remove('show');
    btn.disabled = false;
  }
};

load();

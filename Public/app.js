/* ===== Ego GoatStore – App.js ===== */

/* ---------- Animated SVG icons ---------- */
const G = '<defs><linearGradient id="g{id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fe3ff"/><stop offset="1" stop-color="#2f7bff"/></linearGradient></defs>';
const ICONS = {
  flame:`<svg class="ico" viewBox="0 0 64 64">${G}<path class="a-flame" fill="url(#g{id})" d="M32 4c4 10 16 16 16 32a16 16 0 0 1-32 0c0-8 5-11 8-17 2 5 4 6 6 8 0-9-2-14 2-23z"/><path class="a-flame a-d2" fill="#e8f4ff" opacity=".85" d="M32 34c3 5 7 7 7 12a7 7 0 0 1-14 0c0-5 4-7 7-12z"/></svg>`,
  bolt:`<svg class="ico" viewBox="0 0 64 64">${G}<path class="a-bolt" fill="url(#g{id})" d="M36 4 14 36h14l-4 24 26-34H34z"/></svg>`,
  gear:`<svg class="ico" viewBox="0 0 64 64">${G}<g class="a-spin"><circle cx="32" cy="32" r="12" fill="none" stroke="url(#g{id})" stroke-width="7"/><g stroke="url(#g{id})" stroke-width="7" stroke-linecap="round"><path d="M32 6v8M32 50v8M6 32h8M50 32h8M13.6 13.6l5.6 5.6M44.8 44.8l5.6 5.6M13.6 50.4l5.6-5.6M44.8 19.2l5.6-5.6"/></g></g></svg>`,
  music:`<svg class="ico" viewBox="0 0 64 64">${G}<g class="a-bob"><path fill="none" stroke="url(#g{id})" stroke-width="5" stroke-linecap="round" d="M24 46V14l26-6v32"/><circle cx="18" cy="46" r="8" fill="url(#g{id})"/><circle cx="44" cy="40" r="8" fill="url(#g{id})"/></g></svg>`,
  shield:`<svg class="ico" viewBox="0 0 64 64">${G}<path class="a-pulse" fill="url(#g{id})" d="M32 4 10 12v18c0 14 10 26 22 30 12-4 22-16 22-30V12z"/><path fill="none" stroke="#030712" stroke-width="5" stroke-linecap="round" d="m22 32 8 8 14-16"/></svg>`,
  wind:`<svg class="ico" viewBox="0 0 64 64">${G}<g fill="none" stroke="url(#g{id})" stroke-width="5" stroke-linecap="round"><path class="a-wave" d="M6 22h34a8 8 0 1 0-8-8"/><path class="a-wave a-d2" d="M6 34h44a8 8 0 1 1-8 8"/><path class="a-wave a-d3" d="M6 46h22"/></g></svg>`,
  ai:`<svg class="ico" viewBox="0 0 64 64">${G}<rect class="a-pulse" x="12" y="16" width="40" height="34" rx="10" fill="url(#g{id})"/><circle class="a-bob" cx="24" cy="32" r="4" fill="#030712"/><circle class="a-bob a-d2" cx="40" cy="32" r="4" fill="#030712"/><path d="M32 16V8" stroke="url(#g{id})" stroke-width="4" stroke-linecap="round"/></svg>`,
  game:`<svg class="ico" viewBox="0 0 64 64">${G}<g class="a-tilt"><rect x="6" y="20" width="52" height="26" rx="13" fill="url(#g{id})"/><path d="M20 27v12M14 33h12" stroke="#030712" stroke-width="4" stroke-linecap="round"/><circle cx="43" cy="30" r="3.5" fill="#030712"/><circle cx="50" cy="36" r="3.5" fill="#030712"/></g></svg>`,
  star:`<svg class="ico" viewBox="0 0 64 64">${G}<path class="a-spin" fill="url(#g{id})" d="m32 4 8 18 20 2-15 13 5 20-18-10-18 10 5-20L4 24l20-2z"/></svg>`
};
const ICON_KEYS = Object.keys(ICONS);
let iconId = 0;
const icon = k => (ICONS[k] || ICONS.star).replace(/\{id\}/g, ++iconId);

/* ---------- Command template ---------- */
const tpl = (name, desc, cat, body) => `module.exports = {
  config: {
    name: "${name}",
    version: "1.0",
    author: "Ego GoatStore",
    countDown: 5,
    role: 0,
    description: "${desc}",
    category: "${cat}",
    guide: "{pn}"
  },

  onStart: async function ({ message, args, event }) {
${body}
  }
};
`;

/* ---------- Built-in commands (notun command ekhane jog koro) ---------- */
const BUILT_IN = [
  { name:'ping',    icon:'bolt',   cat:'system',  desc:'Bot koto druto reply dey ta dekhao.',
    code: tpl('ping','Bot-er speed check','system','    const t = Date.now();\n    await message.reply("Checking...");\n    message.reply(`Pong! ${Date.now() - t}ms`);') },
  { name:'help',    icon:'flame',  cat:'info',    desc:'Sob command-er list ar kibhabe use korte hoy.',
    code: tpl('help','Command list dekhao','info','    message.reply("Command list: ping, help, weather, ai, ban, music, dice");') },
  { name:'ban',     icon:'shield', cat:'admin',   desc:'Group theke kauke block korar admin command.',
    code: tpl('ban','User ban koro','admin','    if (!args[0]) return message.reply("Kake ban korbo? UID dao.");\n    message.reply(`UID ${args[0]} ban kora hoyeche.`);') },
  { name:'music',   icon:'music',  cat:'media',   desc:'Gaan-er naam diye khuje pathao.',
    code: tpl('music','Gaan khojo','media','    const q = args.join(" ");\n    if (!q) return message.reply("Gaan-er naam likho.");\n    message.reply(`Khujchi: ${q}`);') },
  { name:'weather', icon:'wind',   cat:'utility', desc:'Shohor-er abohawa jene nao.',
    code: tpl('weather','Abohawa dekhao','utility','    const city = args.join(" ") || "Dhaka";\n    message.reply(`${city}-er abohawa ekhane ashbe.`);') },
  { name:'ai',      icon:'ai',     cat:'ai',      desc:'Prosno koro, AI uttor dibe.',
    code: tpl('ai','AI-ke prosno koro','ai','    if (!args.length) return message.reply("Prosno likho.");\n    message.reply("AI uttor ekhane ashbe.");') },
  { name:'dice',    icon:'game',   cat:'game',    desc:'Ekta dice gorao, 1 theke 6.',
    code: tpl('dice','Dice gorao','game','    const n = Math.floor(Math.random() * 6) + 1;\n    message.reply(`Tomar dice: ${n}`);') },
  { name:'settings',icon:'gear',   cat:'system',  desc:'Bot-er prefix ar setting dekhao.',
    code: tpl('settings','Setting dekhao','system','    message.reply("Prefix: / | Version: 1.0");') }
];

/* ---------- Storage (safe) ---------- */
const KEY = 'goatstore.custom';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const save = list => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {} };
let custom = load(), cat = 'all', current = null;

/* ---------- Helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toast.h); toast.h=setTimeout(()=>t.classList.remove('show'),2200); }
async function copyText(text){
  try { await navigator.clipboard.writeText(text); }
  catch {
    const a=document.createElement('textarea'); a.value=text; a.style.cssText='position:fixed;opacity:0';
    document.body.appendChild(a); a.select(); document.execCommand('copy'); a.remove();
  }
  toast('Copy hoye geche');
}
function download(name, text){
  const url = URL.createObjectURL(new Blob([text], {type:'text/javascript'}));
  const a = document.createElement('a'); a.href=url; a.download=name+'.js'; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 1500);
  toast(name + '.js download hocche');
}
const all = () => [...BUILT_IN, ...custom.map(c => ({...c, mine:true}))];

/* ---------- Render ---------- */
function renderChips(){
  const cats = ['all', ...new Set(all().map(c => c.cat))];
  if (!cats.includes(cat)) cat = 'all';
  $('#chips').innerHTML = cats.map(c => `<button class="chip ${c===cat?'on':''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
}
function render(){
  const q = $('#search').value.trim().toLowerCase();
  const list = all().filter(c => (cat==='all' || c.cat===cat) && (c.name+c.desc+c.cat).toLowerCase().includes(q));
  $('#grid').innerHTML = list.map(c => `
    <article class="card">
      ${c.mine ? '<span class="mine">tomar upload</span>' : ''}
      ${icon(c.icon)}
      <h3>${esc(c.name)}</h3>
      <span class="cat">${esc(c.cat)}</span>
      <p>${esc(c.desc)}</p>
      <div class="row">
        <button class="btn" data-act="view" data-name="${esc(c.name)}">Dekho</button>
        <button class="btn" data-act="copy" data-name="${esc(c.name)}">Copy</button>
        <button class="btn solid" data-act="dl" data-name="${esc(c.name)}">Download</button>
      </div>
      ${c.mine ? `<button class="btn danger" data-act="del" data-name="${esc(c.name)}">Muche felo</button>` : ''}
    </article>`).join('');
  $('#empty').hidden = list.length > 0;
  $('#count').textContent = `${list.length}-ta command`;
  renderChips();
}
$('#chips').addEventListener('click', e => { const b=e.target.closest('.chip'); if(!b) return; cat=b.dataset.cat; render(); });
$('#search').addEventListener('input', render);

$('#grid').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const c = all().find(x => x.name === b.dataset.name); if (!c) return;
  const act = b.dataset.act;
  if (act === 'copy') copyText(c.code);
  else if (act === 'dl') download(c.name, c.code);
  else if (act === 'view') openModal(c);
  else if (act === 'del') { custom = custom.filter(x => x.name !== c.name); save(custom); render(); toast(c.name + ' muche gelo'); }
});

/* ---------- Modal (code dekha) ---------- */
function openModal(c){ current = c; $('#mTitle').textContent = c.name + '.js'; $('#mCode').textContent = c.code; $('#modal').hidden = false; }
function closeModal(){ $('#modal').hidden = true; }
$('#mClose').addEventListener('click', closeModal);
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
$('#mCopy').addEventListener('click', () => current && copyText(current.code));
$('#mDl').addEventListener('click', () => current && download(current.name, current.code));

/* ---------- Upload (button + tap + drag & drop) ---------- */
async function addFiles(files){
  const list = [...files]; if (!list.length) return;
  const bar = $('#bar'), wrap = $('.bar'); wrap.classList.add('on'); bar.style.width = '0';
  let n = 0, bad = 0;
  for (let i = 0; i < list.length; i++) {
    const f = list[i];
    if (!f.name.endsWith('.js') || f.size > 500000) { bad++; }
    else {
      const code = await f.text();
      const name = f.name.replace(/\.js$/, '');
      const d = code.match(/description\s*:\s*["'`]([^"'`]+)/);
      const k = code.match(/category\s*:\s*["'`]([^"'`]+)/);
      custom = custom.filter(c => c.name !== name);
      custom.push({ name, cat: k ? k[1].toLowerCase() : 'custom', desc: d ? d[1] : 'Upload kora command.', icon: ICON_KEYS[(custom.length + i) % ICON_KEYS.length], code });
      n++;
    }
    bar.style.width = ((i + 1) / list.length * 100) + '%';
  }
  if (n) { save(custom); render(); }
  toast(n ? `${n}-ta command upload hoyeche` + (bad ? `, ${bad}-ta baad (shudhu .js, 500KB porjonto)` : '') : 'Shudhu .js file upload kora jay');
  setTimeout(() => { wrap.classList.remove('on'); bar.style.width = '0'; }, 800);
}
$('#uploadBtn').addEventListener('click', () => $('#fileInput').click());
$('#fileInput').addEventListener('change', e => { addFiles(e.target.files); e.target.value = ''; });
const drop = $('#drop');
drop.addEventListener('click', () => $('#fileInput').click());
['dragenter','dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave','drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', e => addFiles(e.dataTransfer.files));
addEventListener('dragover', e => e.preventDefault());
addEventListener('drop', e => { e.preventDefault(); if (!drop.contains(e.target)) addFiles(e.dataTransfer.files); });

render();

/* ---------- Nil agun + batas (canvas) ---------- */
(function fire(){
  const cv = $('#fire'), cx = cv.getContext('2d');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let W, H, P = [], t = 0;
  const resize = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; };
  addEventListener('resize', resize); resize();
  const spawn = () => ({
    x: Math.random() * W, y: H + 20,
    vy: 1 + Math.random() * 2.6, r: 14 + Math.random() * 36,
    life: 1, decay: .004 + Math.random() * .007, ph: Math.random() * 6.28
  });
  (function loop(){
    t += .016;
    cx.globalCompositeOperation = 'source-over';
    cx.clearRect(0, 0, W, H);
    cx.globalCompositeOperation = 'lighter';
    const wind = Math.sin(t * .6) * 1.7 + 1.3;
    const n = W < 600 ? 2 : 3;
    for (let i = 0; i < n; i++) P.push(spawn());
    P = P.filter(p => p.life > 0);
    for (const p of P) {
      p.y -= p.vy; p.x += wind + Math.sin(t * 2 + p.ph) * .8; p.life -= p.decay;
      const r = p.r * p.life + 2, a = Math.max(p.life, 0);
      const g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      g.addColorStop(0, `rgba(190,240,255,${a * .5})`);
      g.addColorStop(.4, `rgba(47,123,255,${a * .35})`);
      g.addColorStop(1, 'rgba(47,123,255,0)');
      cx.fillStyle = g; cx.beginPath(); cx.arc(p.x, p.y, r, 0, 6.283); cx.fill();
    }
    requestAnimationFrame(loop);
  })();
})();

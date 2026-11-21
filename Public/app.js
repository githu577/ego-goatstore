const grid=document.getElementById("grid"), search=document.getElementById("search"), category=document.getElementById("category"), count=document.getElementById("count");
document.getElementById("year").textContent=new Date().getFullYear();
let commands=[];
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function render(){
 const q=search.value.trim().toLowerCase(), cat=category.value.toLowerCase();
 const list=commands.filter(c=>(!q||[c.name,c.description,c.author,c.category].join(" ").toLowerCase().includes(q))&&(!cat||cat==="all"||String(c.category).toLowerCase()===cat));
 count.textContent=`${list.length} command${list.length===1?"":"s"} found`;
 if(!list.length){grid.innerHTML='<div class="empty">No commands found. Try another search.</div>';return;}
 grid.innerHTML=list.map(c=>`<article class="card"><div class="cardtop"><span class="tag">${esc(c.category||"Utility")}</span><span class="downloads">↓ ${Number(c.downloads||0)}</span></div><h3>${esc(c.name)}</h3><p>${esc(c.description||"No description provided.")}</p><div class="meta">By ${esc(c.author||"Unknown")} · ${new Date(c.createdAt).toLocaleDateString()}</div><div class="download"><button data-download="${esc(c.name)}">↓ Download .js</button></div></article>`).join("");
 grid.querySelectorAll("[data-download]").forEach(btn=>btn.addEventListener("click",async()=>{const n=btn.dataset.download;try{await fetch(`/api/commands/${encodeURIComponent(n)}/download-count`,{method:"POST"});location.href=`/api/commands/${encodeURIComponent(n)}/download`;}catch{location.href=`/api/commands/${encodeURIComponent(n)}/download`}}));
}
async function load(){try{const r=await fetch("/api/commands");commands=await r.json();render()}catch{count.textContent="Could not connect to store API";grid.innerHTML='<div class="empty">Store unavailable. Try refreshing.</div>';}}
search.addEventListener("input",render);category.addEventListener("change",render);document.getElementById("clear").addEventListener("click",()=>{search.value="";category.value="all";render()});
const dialog=document.getElementById("uploadDialog");document.getElementById("openUpload").onclick=()=>dialog.showModal();document.getElementById("close").onclick=()=>dialog.close();
document.getElementById("uploadForm").addEventListener("submit",async e=>{e.preventDefault();const status=document.getElementById("uploadStatus"),form=e.currentTarget,fd=new FormData(form);const key=document.getElementById("adminKey").value;fd.delete("adminKey");status.textContent="Publishing…";try{const r=await fetch("/api/commands",{method:"POST",headers:{"x-admin-key":key},body:fd});const data=await r.json();if(!r.ok)throw new Error(data.error||"Publish failed");status.textContent="Published successfully!";form.reset();document.getElementById("adminKey").value=key;await load();setTimeout(()=>dialog.close(),900);}catch(err){status.textContent=err.message;}});
load();

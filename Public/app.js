:root{
  --abyss:#030712; --deep:#08123a; --flame:#2f7bff; --cyan:#6fe3ff; --ice:#e8f4ff; --violet:#7a5cff;
  --line:rgba(111,227,255,.2);
}
*{box-sizing:border-box;margin:0}
html{scroll-behavior:smooth}
body{
  font-family:'Outfit',system-ui,sans-serif;color:var(--ice);min-height:100vh;overflow-x:hidden;
  background:radial-gradient(ellipse at 50% 115%,#0d33a0 0%,var(--deep) 38%,var(--abyss) 80%);
}
#fire{position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}

/* batasher dagh */
.gusts{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
.gusts i{
  position:absolute;left:-40%;height:2px;width:35%;border-radius:2px;
  background:linear-gradient(90deg,transparent,rgba(111,227,255,.55),transparent);
  animation:gust 6s linear infinite;
}
.gusts i:nth-child(1){top:14%;animation-duration:5s}
.gusts i:nth-child(2){top:32%;animation-duration:7s;animation-delay:1.5s;width:50%}
.gusts i:nth-child(3){top:55%;animation-duration:6s;animation-delay:3s}
.gusts i:nth-child(4){top:72%;animation-duration:8s;animation-delay:.8s;width:42%}
.gusts i:nth-child(5){top:88%;animation-duration:5.5s;animation-delay:2.4s}
@keyframes gust{to{transform:translateX(420%)}}

.hero,main{position:relative;z-index:1;max-width:1100px;margin:0 auto;padding:0 20px}
.hero{padding-top:44px;padding-bottom:22px;text-align:center}

/* ---- Ego GoatStore bishal nam ---- */
.logo{
  font-family:'Rubik Mono One',sans-serif;font-weight:400;line-height:1.1;
  letter-spacing:-.02em;font-size:clamp(1.5rem,7.4vw,6.2rem);
  transform:skewX(-8deg);
  background:linear-gradient(180deg,#fff 0%,var(--cyan) 30%,var(--flame) 68%,var(--violet) 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 0 18px rgba(47,123,255,.75)) drop-shadow(0 0 50px rgba(111,227,255,.4));
  animation:flicker 3s ease-in-out infinite;
}
@keyframes flicker{
  0%,100%{filter:drop-shadow(0 0 18px rgba(47,123,255,.75)) drop-shadow(0 0 50px rgba(111,227,255,.4))}
  45%{filter:drop-shadow(0 0 28px rgba(47,123,255,1)) drop-shadow(0 0 80px rgba(111,227,255,.6))}
  62%{filter:drop-shadow(0 0 14px rgba(47,123,255,.6)) drop-shadow(0 0 38px rgba(111,227,255,.3))}
}
.flamebar{
  height:6px;width:min(560px,80%);margin:14px auto 0;border-radius:6px;transform:skewX(-8deg);
  background:linear-gradient(90deg,var(--violet),var(--flame),var(--cyan),var(--flame),var(--violet));
  background-size:200% 100%;animation:slide 3s linear infinite;
  box-shadow:0 0 24px rgba(47,123,255,.9);
}
@keyframes slide{to{background-position:200% 0}}
.tag{max-width:46ch;margin:20px auto 26px;color:#b9d2f5;font-size:1.05rem;line-height:1.5}

.tools{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
#search{
  flex:1 1 240px;max-width:380px;padding:13px 18px;border-radius:14px;border:1px solid var(--line);
  background:rgba(8,18,58,.72);color:var(--ice);font:inherit;backdrop-filter:blur(8px);
}
#search:focus,.btn:focus-visible,.chip:focus-visible{outline:2px solid var(--cyan);outline-offset:2px}
.btn{
  font:inherit;font-weight:600;cursor:pointer;padding:12px 20px;border-radius:14px;
  border:1px solid var(--line);background:rgba(8,18,58,.72);color:var(--ice);
  transition:transform .15s,box-shadow .2s;
}
.btn:hover{transform:translateY(-2px);box-shadow:0 0 22px rgba(47,123,255,.6)}
.btn:active{transform:scale(.97)}
.btn.solid{background:linear-gradient(135deg,var(--flame),var(--violet));border-color:transparent;color:#fff}
.btn.danger:hover{box-shadow:0 0 22px rgba(255,90,120,.6)}

.chips{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:18px}
.chip{
  font:inherit;cursor:pointer;padding:7px 16px;border-radius:99px;border:1px solid var(--line);
  background:rgba(8,18,58,.6);color:#b9d2f5;transition:.2s;
}
.chip.on{background:var(--flame);color:#fff;border-color:transparent;box-shadow:0 0 18px rgba(47,123,255,.7)}

.drop{
  position:relative;margin:8px 0 18px;padding:26px 16px;text-align:center;cursor:pointer;
  border:2px dashed var(--line);border-radius:20px;color:#8fb0e0;transition:.2s;
  background:rgba(8,18,58,.45);display:flex;flex-direction:column;gap:6px;
}
.drop b{color:var(--ice)}
.drop.over{border-color:var(--cyan);background:rgba(47,123,255,.16);box-shadow:0 0 40px rgba(47,123,255,.4) inset}
.bar{height:4px;border-radius:4px;background:rgba(255,255,255,.08);overflow:hidden;opacity:0;transition:opacity .2s}
.bar.on{opacity:1}
#bar{height:100%;width:0;background:linear-gradient(90deg,var(--flame),var(--cyan));transition:width .25s}
.count{color:#8fb0e0;margin-bottom:14px;font-size:.95rem}

.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;padding-bottom:90px}
.card{
  position:relative;padding:22px;border-radius:22px;border:1px solid var(--line);
  background:linear-gradient(160deg,rgba(18,40,104,.78),rgba(6,12,32,.88));backdrop-filter:blur(10px);
  display:flex;flex-direction:column;gap:10px;transition:transform .25s,box-shadow .25s,border-color .25s;
}
.card:hover{transform:translateY(-6px);border-color:var(--cyan);box-shadow:0 14px 46px rgba(47,123,255,.45)}
.card .ico{width:66px;height:66px;filter:drop-shadow(0 0 10px rgba(111,227,255,.75))}
.card h3{font-family:'Rubik Mono One',sans-serif;font-weight:400;font-size:1.2rem;word-break:break-word}
.card .cat{font-size:.85rem;color:var(--cyan)}
.card p{color:#b9d2f5;line-height:1.5;flex:1}
.mine{position:absolute;top:16px;right:16px;font-size:.75rem;padding:3px 10px;border-radius:99px;background:var(--violet)}
.row{display:flex;gap:10px}
.row .btn{flex:1;padding:10px 8px;font-size:.95rem}

.modal{position:fixed;inset:0;z-index:10;background:rgba(2,6,20,.8);backdrop-filter:blur(6px);display:grid;place-items:center;padding:16px}
.modal[hidden]{display:none}
.sheet{
  width:min(720px,100%);max-height:88vh;display:flex;flex-direction:column;gap:14px;padding:20px;
  border-radius:22px;border:1px solid var(--cyan);background:var(--deep);box-shadow:0 0 60px rgba(47,123,255,.5);
  animation:pop .25s ease-out;
}
@keyframes pop{from{transform:scale(.94);opacity:0}}
.mhead{display:flex;justify-content:space-between;align-items:center;gap:12px}
.mhead h2{font-family:'Rubik Mono One',sans-serif;font-weight:400;font-size:1.2rem}
.mhead .btn{padding:8px 14px}
pre{overflow:auto;padding:14px;border-radius:14px;background:#020617;color:#bfe3ff;font-size:.85rem;line-height:1.5;flex:1}

.toast{
  position:fixed;left:50%;bottom:28px;transform:translate(-50%,140px);z-index:20;
  padding:12px 22px;border-radius:14px;background:var(--flame);color:#fff;font-weight:600;
  box-shadow:0 0 30px rgba(47,123,255,.8);transition:transform .3s;max-width:90vw;text-align:center;
}
.toast.show{transform:translate(-50%,0)}
.empty{text-align:center;color:#8fb0e0;padding:40px 0}

/* ---- live icon animations ---- */
.ico *{transform-box:fill-box;transform-origin:center}
.a-flame{animation:sway 1.5s ease-in-out infinite}
@keyframes sway{0%,100%{transform:scale(1,1) skewX(0)}50%{transform:scale(1.09,.93) skewX(6deg)}}
.a-bolt{animation:zap 1.8s steps(1) infinite}
@keyframes zap{0%,100%{opacity:1}8%{opacity:.2}14%{opacity:1}22%{opacity:.4}30%{opacity:1}}
.a-spin{animation:spin 6s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.a-bob{animation:bob 2s ease-in-out infinite}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
.a-pulse{animation:pulse 1.8s ease-in-out infinite}
@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.14);opacity:.65}}
.a-wave{animation:wave 2.2s ease-in-out infinite}
@keyframes wave{0%,100%{transform:translateX(-4px)}50%{transform:translateX(4px)}}
.a-tilt{animation:tilt 2.4s ease-in-out infinite}
@keyframes tilt{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}}
.a-d2{animation-delay:.4s}.a-d3{animation-delay:.8s}

@media (prefers-reduced-motion:reduce){
  *{animation:none!important;transition:none!important}
}

(function(){
  var P=[
    {a:'#ff2d2d',f:[[255,235,130],[255,80,20],[110,8,8]]},
    {a:'#ff8a1f',f:[[255,245,170],[255,140,30],[120,40,8]]},
    {a:'#7dff3a',f:[[225,255,150],[70,220,40],[10,70,20]]},
    {a:'#3aa8ff',f:[[210,240,255],[50,130,255],[10,30,110]]},
    {a:'#b04dff',f:[[240,210,255],[150,60,255],[50,10,100]]}
  ];
  var say={idle:'Idle: breathing heavy, watching you',hunt:'Hunt: red eyes sweeping for a target',rage:'Rage: fists up, shaking with anger',rampage:'Rampage: stomping and shaking the ground',roar:'Roar: jaw wide open, flames answering'};
  var D={mode:'idle',pal:0,speed:1,glow:14,tilt:0,fire:7,wind:4,play:true,blink:true,ring:true,emb:true};
  var s=Object.assign({},D);
  var root=document.documentElement,stage=document.getElementById('stage');
  var $=function(id){return document.getElementById(id)};

  function render(){
    root.style.setProperty('--a',P[s.pal].a);
    root.style.setProperty('--speed',s.speed);
    root.style.setProperty('--glow',s.glow);
    $('headTilt').setAttribute('transform','rotate('+s.tilt+' 150 170)');
    stage.dataset.mode=s.mode;
    stage.classList.toggle('blink',s.blink);
    stage.classList.toggle('noring',!s.ring);
    stage.classList.toggle('paused',!s.play);
    $('status').textContent=say[s.mode];
    $('speedO').textContent=Number(s.speed).toFixed(1)+'x';
    $('glowO').textContent=s.glow;$('tiltO').textContent=s.tilt+'°';
    $('fireO').textContent=s.fire;$('windO').textContent=s.wind;
    document.querySelectorAll('#modes button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.mode===s.mode)});
    document.querySelectorAll('#swatches button').forEach(function(b){b.setAttribute('aria-pressed',+b.dataset.i===s.pal)});
    ['speed','glow','tilt','fire','wind'].forEach(function(k){$(k).value=s[k]});
    $('play').checked=s.play;$('blink').checked=s.blink;$('tgRing').checked=s.ring;$('tgEmb').checked=s.emb;
  }
  document.querySelectorAll('#modes button').forEach(function(b){b.onclick=function(){s.mode=b.dataset.mode;render()}});
  document.querySelectorAll('#swatches button').forEach(function(b){b.onclick=function(){s.pal=+b.dataset.i;render()}});
  [['speed',parseFloat],['glow',parseInt],['tilt',parseInt],['fire',parseInt],['wind',parseInt]].forEach(function(a){
    $(a[0]).oninput=function(e){s[a[0]]=a[1](e.target.value);render()}});
  [['play','play'],['blink','blink'],['tgRing','ring'],['tgEmb','emb']].forEach(function(a){
    $(a[0]).onchange=function(e){s[a[1]]=e.target.checked;render()}});
  $('reset').onclick=function(){s=Object.assign({},D);render()};

  /* ---------- fire, embers and wind on canvas ---------- */
  var cv=$('fx'),ctx=cv.getContext('2d'),W=300,H=300,flames=[],embers=[],streaks=[],t=0,accF=0,accE=0,accS=0,stepAcc=0;
  function size(){var dpr=Math.min(window.devicePixelRatio||1,2),r=stage.getBoundingClientRect();
    W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
  if(window.ResizeObserver){new ResizeObserver(size).observe(stage)}else{window.addEventListener('resize',size)}
  size();

  function mix(a,b,k){return [a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k]}
  function rgb(c,al){return 'rgba('+(c[0]|0)+','+(c[1]|0)+','+(c[2]|0)+','+al+')'}

  function update(){
    t+=0.016;
    var w=s.wind*0.12+Math.sin(t*0.9)*s.wind*0.06;
    accF+=s.fire*0.4;
    while(accF>=1&&flames.length<260){accF--;
      flames.push({x:Math.random()*W,y:H+8,vx:(Math.random()-.5)*.6,vy:-(1.2+Math.random()*2)*(0.7+s.fire*0.07),r:22+Math.random()*38,l:0,m:70+Math.random()*60});}
    accF=Math.min(accF,2);
    if(s.emb){
      accE+=s.fire*0.18;
      while(accE>=1&&embers.length<130){accE--;embers.push({x:Math.random()*W,y:H,vx:Math.random()-.3,vy:-(1+Math.random()*2.4),r:1+Math.random()*2,l:0,m:120+Math.random()*120});}
      accE=Math.min(accE,2);
      accS+=s.wind*0.05;
      while(accS>=1&&streaks.length<40){accS--;streaks.push({x:-120,y:Math.random()*H*.9,len:40+Math.random()*100,v:6+s.wind*1.2+Math.random()*4});}
      accS=Math.min(accS,2);
    }
    flames.forEach(function(p){p.l++;var k=p.l/p.m;p.x+=p.vx+w*(0.4+k)*1.5;p.y+=p.vy;p.r*=.992});
    flames=flames.filter(function(p){return p.l<p.m});
    embers.forEach(function(p){p.l++;p.x+=p.vx+w*2.4+Math.sin(p.l*.1)*.4;p.y+=p.vy});
    embers=embers.filter(function(p){return p.l<p.m&&p.y>-10});
    streaks.forEach(function(p){p.x+=p.v});
    streaks=streaks.filter(function(p){return p.x-p.len<W+20});
    if(!s.emb){embers.length=0;streaks.length=0}
  }

  function draw(){
    var f=P[s.pal].f;
    ctx.globalCompositeOperation='source-over';
    ctx.clearRect(0,0,W,H);
    var g=ctx.createLinearGradient(0,H,0,H*.62);
    g.addColorStop(0,rgb(f[1],.35*(s.fire/10+.2)));g.addColorStop(1,rgb(f[2],0));
    ctx.fillStyle=g;ctx.fillRect(0,H*.6,W,H*.4);
    ctx.globalCompositeOperation='lighter';
    flames.forEach(function(p){
      var k=p.l/p.m,c=k<.35?mix(f[0],f[1],k/.35):mix(f[1],f[2],(k-.35)/.65),al=(1-k)*.5;
      var gr=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);
      gr.addColorStop(0,rgb(c,al));gr.addColorStop(1,rgb(c,0));
      ctx.fillStyle=gr;ctx.fillRect(p.x-p.r,p.y-p.r,p.r*2,p.r*2);
    });
    embers.forEach(function(p){
      var k=p.l/p.m;ctx.fillStyle=rgb(f[0],1-k);ctx.fillRect(p.x,p.y,p.r,p.r);
    });
    ctx.lineWidth=1;
    streaks.forEach(function(p){
      ctx.strokeStyle=rgb(f[0],.16);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.len,p.y+p.len*.04);ctx.stroke();
    });
  }

  function frame(){
    if(s.play){stepAcc+=s.speed;while(stepAcc>=1){update();stepAcc--}draw()}
    requestAnimationFrame(frame);
  }
  render();
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches){
    for(var i=0;i<140;i++)update();draw();
  }else{
    for(var j=0;j<60;j++)update();
    requestAnimationFrame(frame);
  }
})();

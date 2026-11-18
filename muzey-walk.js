(function(){
"use strict";
const $ = id => document.getElementById(id);
const cfg = window.MUZEY_BETA_CONFIG || {};
const params = new URLSearchParams(location.search);
const mode = params.get("mode") || "museum";
const room = params.get("room") || Math.random().toString(36).slice(2,8).toUpperCase();

const exhibits = [
  {id:"e1",title:"Amir Temur",text:"Temuriylar saltanati asoschisi (1336–1405). Davlat boshqaruvi, harbiy san’at va me’morchilikda iz qoldirgan.",src:"Tarixiy portret asosida",x:-6,z:-8,theme:"temur"},
  {id:"e2",title:"Registon ansambli",text:"Samarqanddagi Ulug‘bek, Sherdor va Tillakori madrasalari. UNESCO merosi.",src:"Registon maydoni",x:6,z:-8,theme:"registon"},
  {id:"e3",title:"Qal’a mudofaasi",text:"Qadimgi qal’a devorlari, darvozalar va mudofaa tizimlari.",src:"Mudofaa me’morchiligi",x:-6,z:8,theme:"qala"},
  {id:"e4",title:"Qo‘lyozmalar",text:"Ilm-fan, astronomiya va tarixiy matnlar merosi. Ulug‘bek madrasasi an’anasi.",src:"Qo‘lyozma merosi",x:6,z:8,theme:"book"},
  {id:"e5",title:"Koshinkorlik",text:"Moviy koshin, naqqoshlik va an’anaviy hunarlar — Samarqand va Buxoro uslubi.",src:"Hunarmandchilik",x:0,z:-10,theme:"tile"}
];

function paintExhibit(theme, title){
  const c = document.createElement("canvas");
  c.width = 512; c.height = 640;
  const g = c.getContext("2d");
  const bg = g.createLinearGradient(0,0,0,640);
  if(theme==="temur"){ bg.addColorStop(0,"#3a2a1a"); bg.addColorStop(1,"#1a120c"); }
  else if(theme==="registon"){ bg.addColorStop(0,"#1a3a5c"); bg.addColorStop(1,"#0c1a28"); }
  else if(theme==="qala"){ bg.addColorStop(0,"#4a4035"); bg.addColorStop(1,"#2a241c"); }
  else if(theme==="book"){ bg.addColorStop(0,"#3a3020"); bg.addColorStop(1,"#1e1810"); }
  else { bg.addColorStop(0,"#0e3a4a"); bg.addColorStop(1,"#061820"); }
  g.fillStyle = bg; g.fillRect(0,0,512,640);
  g.strokeStyle = "#c9a84c"; g.lineWidth = 10; g.strokeRect(18,18,476,604);
  g.strokeStyle = "rgba(227,199,126,.45)"; g.lineWidth = 3; g.strokeRect(32,32,448,576);
  if(theme==="temur"){
    g.fillStyle = "#e8d5a0"; g.beginPath(); g.arc(256,200,55,0,Math.PI*2); g.fill();
    g.fillStyle = "#2a4060"; g.fillRect(196,255,120,160);
    g.fillStyle = "#b8903e"; g.fillRect(216,250,80,20);
    g.fillStyle = "#e3c77e"; g.beginPath(); g.moveTo(220,150); g.lineTo(256,120); g.lineTo(292,150); g.closePath(); g.fill();
  } else if(theme==="registon"){
    [[90,180,100,220],[206,160,100,240],[322,180,100,220]].forEach(function(r){
      var x=r[0],y=r[1],w=r[2],h=r[3];
      g.fillStyle = "#2a6a9a"; g.fillRect(x,y,w,h);
      g.fillStyle = "#0a2035";
      g.beginPath(); g.moveTo(x+10,y+h*0.55); g.quadraticCurveTo(x+w/2,y+20,x+w-10,y+h*0.55);
      g.lineTo(x+w-10,y+h-10); g.lineTo(x+10,y+h-10); g.closePath(); g.fill();
    });
    g.fillStyle = "#e3c77e"; g.font = "bold 18px Georgia"; g.textAlign="center"; g.fillText("REGISTON", 256, 430);
  } else if(theme==="qala"){
    g.fillStyle = "#6a5a45"; g.fillRect(80,200,352,240);
    g.fillStyle = "#3a3025"; for(var i=0;i<8;i++) g.fillRect(90+i*42,180,28,30);
    g.fillStyle = "#1a1510"; g.fillRect(220,320,70,120);
  } else if(theme==="book"){
    g.fillStyle = "#c9a84c"; g.fillRect(140,160,230,300);
    g.fillStyle = "#f3e6c0"; g.fillRect(150,170,100,280);
    g.fillStyle = "#d4c090"; g.fillRect(250,170,110,280);
    g.strokeStyle = "#8a6a30"; g.lineWidth=2;
    for(var y=190;y<430;y+=18){ g.beginPath(); g.moveTo(160,y); g.lineTo(240,y); g.stroke(); }
  } else {
    for(var y=60;y<520;y+=48) for(var x=50;x<460;x+=48){
      g.fillStyle = ((x/48|0)+(y/48|0))%2 ? "#1a7a8a" : "#0e4a5a";
      g.fillRect(x,y,44,44);
      g.strokeStyle = "#e3c77e"; g.lineWidth=1.5; g.strokeRect(x+6,y+6,32,32);
    }
  }
  g.fillStyle = "rgba(10,14,22,.82)"; g.fillRect(60,520,392,70);
  g.fillStyle = "#e3c77e"; g.font = "bold 26px Georgia, serif"; g.textAlign = "center"; g.fillText(title, 256, 565);
  var tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

let renderer, scene, camera, clock;
let yaw = 0, pitch = 0;
let move = {f:0,b:0,l:0,r:0};
let remoteMove = {f:0,b:0,l:0,r:0};
let stickVec = {x:0,y:0};
let channel = null;
let pointerLocked = false;
let keys = {};
const SPEED = 4.2;
const PLAYER_H = 1.65;
const BOUNDS = {minX:-11,maxX:11,minZ:-11,maxZ:11};

function toast(msg){
  const h=$("hint"); if(!h) return;
  h.style.display="block"; h.textContent=msg;
  clearTimeout(toast._t); toast._t=setTimeout(()=>{h.style.display="none"},2800);
}
function makeMat(color, rough=0.85, metal=0.05){
  return new THREE.MeshStandardMaterial({color, roughness:rough, metalness:metal});
}
function buildHall(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a1018);
  scene.fog = new THREE.Fog(0x0a1018, 18, 42);
  const hemi = new THREE.HemisphereLight(0xb8c8e0, 0x2a2218, 0.55);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffe6b0, 0.9);
  dir.position.set(6,12,4); dir.castShadow = true; dir.shadow.mapSize.set(1024,1024); scene.add(dir);
  scene.add(new THREE.PointLight(0xe3c77e, 0.4, 32).translateY(5));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(28,28), makeMat(0x2c241c, 0.9));
  floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; scene.add(floor);
  const grid = new THREE.GridHelper(28, 28, 0x5a4a32, 0x3a3228); grid.position.y = 0.01; scene.add(grid);
  const wallMat = makeMat(0x1e2d44, 0.88);
  const wallH = 5.5, room = 12, wallT = 0.35;
  function wall(w,h,d,x,y,z){
    const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), wallMat);
    m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; scene.add(m);
  }
  wall(room*2+wallT, wallH, wallT, 0, wallH/2, -room);
  wall(room*2+wallT, wallH, wallT, 0, wallH/2, room);
  wall(wallT, wallH, room*2, -room, wallH/2, 0);
  wall(wallT, wallH, room*2, room, wallH/2, 0);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(28,28), makeMat(0x152033, 0.95));
  ceil.rotation.x = Math.PI/2; ceil.position.y = wallH; scene.add(ceil);
  const pillarMat = makeMat(0x243348, 0.7, 0.15);
  const goldMat = makeMat(0xc9a84c, 0.35, 0.6);
  [[-7,-7],[7,-7],[-7,7],[7,7],[0,-7],[0,7]].forEach(([x,z])=>{
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.32,wallH,12), pillarMat);
    p.position.set(x, wallH/2, z); p.castShadow=true; scene.add(p);
    scene.add(new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.38,0.12,12), goldMat).translateX(x).translateY(wallH-0.1).translateZ(z));
    scene.add(new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,0.15,12), goldMat).translateX(x).translateY(0.08).translateZ(z));
  });
  exhibits.forEach((ex)=>{
    const group = new THREE.Group();
    group.position.set(ex.x, 0, ex.z);
    group.lookAt(0,0,0);
    group.rotateY(Math.PI);
    const pedestal = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.95, 0.55), makeMat(0x3a3228, 0.8));
    pedestal.position.y = 0.48; pedestal.castShadow=true; group.add(pedestal);
    const rim = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.06, 0.58), goldMat);
    rim.position.y = 0.96; group.add(rim);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.75, 2.05, 0.14), goldMat);
    frame.position.y = 2.2; group.add(frame);
    const tex = paintExhibit(ex.theme, ex.title);
    const canvas = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 1.75), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0.05 }));
    canvas.position.set(0, 2.2, 0.09); group.add(canvas);
    const plate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.32, 0.05), makeMat(0x101820));
    plate.position.set(0, 1.12, 0.3); group.add(plate);
    group.userData = {exhibit: ex};
    scene.add(group);
    ex._obj = group;
  });
  const rug = new THREE.Mesh(new THREE.CircleGeometry(3.2, 32), makeMat(0x5a3030, 0.95));
  rug.rotation.x = -Math.PI/2; rug.position.y = 0.02; scene.add(rug);
}
function setupCamera(){
  camera = new THREE.PerspectiveCamera(70, innerWidth/innerHeight, 0.08, 80);
  camera.position.set(0, PLAYER_H, 6);
}
function setupRenderer(){
  const canvas = $("gl");
  renderer = new THREE.WebGLRenderer({canvas, antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1, 2));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  clock = new THREE.Clock();
}
function onResize(){
  if(!camera||!renderer) return;
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight, false);
}
function applyLook(){
  pitch = Math.max(-1.2, Math.min(1.2, pitch));
  camera.quaternion.setFromEuler(new THREE.Euler(pitch, yaw, 0, "YXZ"));
}
function tryMove(dt){
  const fx = (move.f||remoteMove.f||0) - (move.b||remoteMove.b||0) + (-stickVec.y);
  const sx = (move.r||remoteMove.r||0) - (move.l||remoteMove.l||0) + stickVec.x;
  if(Math.abs(fx)<0.01 && Math.abs(sx)<0.01) return;
  const forward = new THREE.Vector3(Math.sin(yaw), 0, -Math.cos(yaw));
  const right = new THREE.Vector3(Math.cos(yaw), 0, Math.sin(yaw));
  const dir = forward.multiplyScalar(fx).add(right.multiplyScalar(sx));
  if(dir.lengthSq()>0) dir.normalize();
  const next = camera.position.clone().addScaledVector(dir, SPEED * dt);
  next.x = Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, next.x));
  next.z = Math.max(BOUNDS.minZ, Math.min(BOUNDS.maxZ, next.z));
  next.y = PLAYER_H;
  camera.position.copy(next);
}
function nearestExhibit(){
  let best=null, bestD=2.8;
  exhibits.forEach(ex=>{
    const d = camera.position.distanceTo(new THREE.Vector3(ex.x, PLAYER_H, ex.z));
    if(d<bestD){ bestD=d; best=ex; }
  });
  return best;
}
function showExhibit(ex){
  if(!ex){ toast("Eksponatga yaqinroq boring"); return; }
  $("infoTitle").textContent = ex.title;
  $("infoText").textContent = ex.text;
  $("infoSrc").textContent = ex.src || "";
  $("info").classList.add("open");
}
function loop(){
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, clock.getDelta());
  move.f = keys["KeyW"]||keys["ArrowUp"]?1:0;
  move.b = keys["KeyS"]||keys["ArrowDown"]?1:0;
  move.l = keys["KeyA"]||keys["ArrowLeft"]?1:0;
  move.r = keys["KeyD"]||keys["ArrowRight"]?1:0;
  tryMove(dt); applyLook();
  renderer.render(scene, camera);
}
let lookTouch=null, lastX=0, lastY=0;
function onTouchStart(e){
  if(e.target.closest && (e.target.closest(".ui")||e.target.closest(".stick-wrap")||e.target.closest(".panel")||e.target.closest("#linkModal"))) return;
  const t=e.changedTouches[0]; lookTouch=t.identifier; lastX=t.clientX; lastY=t.clientY;
}
function onTouchMove(e){
  for(const t of e.changedTouches){
    if(t.identifier!==lookTouch) continue;
    yaw -= (t.clientX-lastX)*0.005; pitch -= (t.clientY-lastY)*0.004;
    lastX=t.clientX; lastY=t.clientY;
  }
}
function onTouchEnd(e){ for(const t of e.changedTouches){ if(t.identifier===lookTouch) lookTouch=null; } }
function onMouseMove(e){ if(!pointerLocked) return; yaw -= e.movementX*0.0025; pitch -= e.movementY*0.0022; }
function setupStick(){
  const base=$("stickBase"), knob=$("stickKnob"), wrap=$("stickWrap");
  let active=false, cx=0, cy=0; const R=36;
  function setKnob(x,y){
    const l=Math.hypot(x,y)||1; const k=Math.min(1,R/l);
    const nx=x*k, ny=y*k;
    knob.style.left=(36+nx)+"px"; knob.style.top=(36+ny)+"px";
    stickVec.x=nx/R; stickVec.y=ny/R;
  }
  function start(e){ active=true; const r=base.getBoundingClientRect(); cx=r.left+r.width/2; cy=r.top+r.height/2; const t=e.touches?e.touches[0]:e; setKnob(t.clientX-cx,t.clientY-cy); }
  function move(e){ if(!active) return; const t=e.touches?e.touches[0]:e; setKnob(t.clientX-cx,t.clientY-cy); }
  function end(){ active=false; setKnob(0,0); stickVec.x=0; stickVec.y=0; }
  base.addEventListener("pointerdown", start);
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
  $("stickBtn").onclick=()=>{ const on=wrap.style.display==="none"||!wrap.style.display; wrap.style.display=on?"block":"none"; $("stickBtn").classList.toggle("on",on); };
}
function loadSupabase(){
  return new Promise(res=>{
    if(window.supabase) return res(true);
    const s=document.createElement("script");
    s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    s.onload=()=>res(true); s.onerror=()=>res(false); document.head.appendChild(s);
  });
}
function connectRealtime(){
  return new Promise(res=>{
    const url=(cfg.SUPABASE_URL||"").trim(), key=(cfg.SUPABASE_ANON_KEY||"").trim();
    if(!url||!key||!window.supabase) return res(false);
    try{
      const client=window.supabase.createClient(url,key);
      channel=client.channel("museum-walk-"+room,{config:{broadcast:{self:true}}});
      channel.subscribe(st=>res(st==="SUBSCRIBED"));
      channel.on("broadcast",{event:"walk"}, payload=>{
        const p=payload.payload||payload;
        if(p.type==="move"){ remoteMove.f=p.f?1:0; remoteMove.b=p.b?1:0; remoteMove.l=p.l?1:0; remoteMove.r=p.r?1:0; }
        else if(p.type==="look"){ yaw+=(p.dyaw||0); pitch+=(p.dpitch||0); }
        else if(p.type==="info") showExhibit(nearestExhibit());
      });
    }catch(e){ res(false); }
  });
}
function send(cmd){ if(channel) try{ channel.send({type:"broadcast", event:"walk", payload:cmd}); }catch(e){} }
function openLink(){
  $("linkModal").classList.remove("hidden"); $("linkModal").style.display="grid";
  $("roomCode").textContent=room;
  const url=location.origin+location.pathname+"?mode=controller&room="+encodeURIComponent(room);
  $("shareUrl").value=url;
  const box=$("qrcode"); box.innerHTML="";
  if(window.QRCode) new QRCode(box,{text:url,width:150,height:150}); else box.textContent=url;
}
function initMuseum(){
  setupRenderer(); setupCamera(); buildHall(); applyLook();
  window.addEventListener("resize", onResize);
  window.addEventListener("keydown", e=>{ keys[e.code]=true; if(e.code==="KeyE") showExhibit(nearestExhibit()); });
  window.addEventListener("keyup", e=>{ keys[e.code]=false; });
  window.addEventListener("mousemove", onMouseMove);
  $("gl").addEventListener("click", ()=>{ $("gl").requestPointerLock&&$("gl").requestPointerLock(); });
  document.addEventListener("pointerlockchange", ()=>{ pointerLocked=document.pointerLockElement===$("gl"); });
  window.addEventListener("touchstart", onTouchStart,{passive:true});
  window.addEventListener("touchmove", onTouchMove,{passive:true});
  window.addEventListener("touchend", onTouchEnd,{passive:true});
  $("startBtn").onclick=()=>{
    $("welcome").classList.add("hidden");
    $("hud").style.display="flex";
    $("hint").style.display="block";
    $("stickWrap").style.display="block";
    setupStick();
    loadSupabase().then(()=>connectRealtime().then(ok=>{
      toast(ok?"Realtime tayyor · xona "+room:"Mahalliy rejim (shu telefon joystigi)");
    }));
    loop();
  };
  $("linkBtn").onclick=openLink;
  $("closeLink").onclick=()=>{ $("linkModal").classList.add("hidden"); $("linkModal").style.display="none"; };
  $("copyLink").onclick=()=>navigator.clipboard&&navigator.clipboard.writeText($("shareUrl").value).then(()=>toast("Nusxalandi"));
  $("closeInfo").onclick=()=>$("info").classList.remove("open");
}
function initController(){
  $("welcome").classList.add("hidden");
  $("controller").classList.add("on");
  $("gl").style.display="none";
  loadSupabase().then(()=>connectRealtime().then(ok=>{
    $("ctrlStatus").textContent = ok ? ("Ulandi · xona "+room) : "Ulanmadi — Supabase sozlang";
    $("ctrlStatus").style.color = ok ? "#9be3b0" : "#ffb4a8";
  }));
  const active={};
  function setDir(dir, on){ active[dir]=on; send({type:"move", f:!!active.f, b:!!active.b, l:!!active.l, r:!!active.r}); }
  document.querySelectorAll("[data-dir]").forEach(btn=>{
    const d=btn.dataset.dir;
    btn.addEventListener("pointerdown", e=>{ e.preventDefault(); setDir(d,true); });
    btn.addEventListener("pointerup", ()=>setDir(d,false));
    btn.addEventListener("pointerleave", ()=>setDir(d,false));
  });
  document.querySelectorAll("[data-act]").forEach(btn=>{
    btn.onclick=()=>{
      const a=btn.dataset.act;
      if(a==="info") send({type:"info"});
      if(a==="lookL") send({type:"look", dyaw:0.2});
      if(a==="lookR") send({type:"look", dyaw:-0.2});
    };
  });
}
if(mode==="controller") initController(); else initMuseum();
})();

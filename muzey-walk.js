(function(){
"use strict";
const $=id=>document.getElementById(id);
const cfg=window.MUZEY_BETA_CONFIG||{};
const params=new URLSearchParams(location.search);
const mode=params.get("mode")||"museum";
const room=params.get("room")||Math.random().toString(36).slice(2,8).toUpperCase();

const exhibits=[
  {id:"e1",title:"Amir Temur",text:"Temuriylar saltanati asoschisi (1336–1405).",src:"Amir Temur muzeyi",x:-4,z:-10.4,ry:0,theme:"temur"},
  {id:"e2",title:"Registon",text:"Ulug'bek, Sherdor va Tillakori. UNESCO.",src:"Samarqand",x:4,z:-10.4,ry:0,theme:"registon"},
  {id:"e3",title:"Minoralar",text:"Kalon minorasi.",src:"Buxoro",x:-10.4,z:0,ry:Math.PI/2,theme:"qala"},
  {id:"e4",title:"Miniatyura",text:"Temuriylar miniatyuralari.",src:"Tarixiy meros",x:10.4,z:0,ry:-Math.PI/2,theme:"book"},
  {id:"e5",title:"Koshinkorlik",text:"Registon koshinlari.",src:"Registon",x:0,z:-10.4,ry:0,theme:"tile"}
];

const WIKI={
  temur:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Amir_Temur_shajarasi.jpg/640px-Amir_Temur_shajarasi.jpg",
  registon:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Registan_01.jpg/640px-Registan_01.jpg",
  qala:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Kalyan_Minaret.jpg/640px-Kalyan_Minaret.jpg",
  book:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Amir_Timur_The_Mongol_Conquer_And_Emperor.jpg/640px-Amir_Timur_The_Mongol_Conquer_And_Emperor.jpg",
  tile:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Decorated_walls_of_Registan_Square_in_Samarkand%2C_Uzbekistan_-_01.jpg/640px-Decorated_walls_of_Registan_Square_in_Samarkand%2C_Uzbekistan_-_01.jpg"
};

let renderer,scene,camera,clock,yaw=0,pitch=0;
let move={f:0,b:0,l:0,r:0},remoteMove={f:0,b:0,l:0,r:0},stickVec={x:0,y:0};
let channel=null,pointerLocked=false,keys={};
const SPEED=4.2,PLAYER_H=1.65,BOUNDS={minX:-10,maxX:10,minZ:-10,maxZ:10};

function toast(msg){const h=$("hint");if(!h)return;h.style.display="block";h.textContent=msg;clearTimeout(toast._t);toast._t=setTimeout(()=>{h.style.display="none"},2800);}
function makeMat(c,r=0.85,m=0.05){return new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});}

function buildHall(){
  scene=new THREE.Scene();
  scene.background=new THREE.Color(0x0a1018);
  scene.fog=new THREE.Fog(0x0a1018,16,40);
  scene.add(new THREE.HemisphereLight(0xc0d0e8,0x2a2218,0.75));
  const dir=new THREE.DirectionalLight(0xffe6b0,1.1);dir.position.set(4,10,6);scene.add(dir);
  scene.add(new THREE.PointLight(0xe3c77e,0.7,30).translateY(4.5));

  const floor=new THREE.Mesh(new THREE.PlaneGeometry(24,24),makeMat(0x2c241c,0.9));
  floor.rotation.x=-Math.PI/2;scene.add(floor);
  const grid=new THREE.GridHelper(24,24,0x5a4a32,0x3a3228);grid.position.y=0.01;scene.add(grid);

  const wallMat=makeMat(0x1e2d44,0.88),wallH=5.2,room=11,wallT=0.3;
  function wall(w,h,d,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),wallMat);m.position.set(x,y,z);scene.add(m);}
  wall(room*2,wallH,wallT,0,wallH/2,-room);
  wall(room*2,wallH,wallT,0,wallH/2,room);
  wall(wallT,wallH,room*2,-room,wallH/2,0);
  wall(wallT,wallH,room*2,room,wallH/2,0);
  const ceil=new THREE.Mesh(new THREE.PlaneGeometry(24,24),makeMat(0x152033,0.95));
  ceil.rotation.x=Math.PI/2;ceil.position.y=wallH;scene.add(ceil);

  const goldMat=makeMat(0xc9a84c,0.35,0.55);
  const pillarMat=makeMat(0x243348,0.7,0.15);
  [[-5,-5],[5,-5],[-5,5],[5,5]].forEach(([x,z])=>{
    const p=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.28,wallH,12),pillarMat);
    p.position.set(x,wallH/2,z);scene.add(p);
  });

  exhibits.forEach(function(ex){
    const group=new THREE.Group();
    group.position.set(ex.x,0,ex.z);
    group.rotation.y=ex.ry;

    const frame=new THREE.Mesh(new THREE.PlaneGeometry(2.1,2.5),goldMat);
    frame.position.set(0,2.3,0.01);group.add(frame);

    const mat=new THREE.MeshBasicMaterial({color:0xffffff});
    const photo=new THREE.Mesh(new THREE.PlaneGeometry(1.9,2.3),mat);
    photo.position.set(0,2.3,0.02);group.add(photo);

    const url=(window.EXHIBIT_IMGS&&window.EXHIBIT_IMGS[ex.theme])||WIKI[ex.theme];
    if(url){
      const loader=new THREE.TextureLoader();
      loader.setCrossOrigin("anonymous");
      loader.load(url,function(tex){
        tex.colorSpace=THREE.SRGBColorSpace;
        mat.map=tex;mat.needsUpdate=true;
      },undefined,function(){console.warn("fail",ex.theme);});
    }

    group.userData={exhibit:ex};
    scene.add(group);
  });

  const rug=new THREE.Mesh(new THREE.CircleGeometry(2.8,32),makeMat(0x5a3030,0.95));
  rug.rotation.x=-Math.PI/2;rug.position.y=0.02;scene.add(rug);
}

function setupCamera(){camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,0.08,80);camera.position.set(0,PLAYER_H,4);}
function setupRenderer(){
  renderer=new THREE.WebGLRenderer({canvas:$("gl"),antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
  renderer.setSize(innerWidth,innerHeight,false);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  clock=new THREE.Clock();
}
function onResize(){if(!camera||!renderer)return;camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false);}
function applyLook(){pitch=Math.max(-1.2,Math.min(1.2,pitch));camera.quaternion.setFromEuler(new THREE.Euler(pitch,yaw,0,"YXZ"));}
function tryMove(dt){
  const fx=(move.f||remoteMove.f||0)-(move.b||remoteMove.b||0)+(-stickVec.y);
  const sx=(move.r||remoteMove.r||0)-(move.l||remoteMove.l||0)+stickVec.x;
  if(Math.abs(fx)<0.01&&Math.abs(sx)<0.01)return;
  const forward=new THREE.Vector3(Math.sin(yaw),0,-Math.cos(yaw));
  const right=new THREE.Vector3(Math.cos(yaw),0,Math.sin(yaw));
  const dir=forward.multiplyScalar(fx).add(right.multiplyScalar(sx));
  if(dir.lengthSq()>0)dir.normalize();
  const next=camera.position.clone().addScaledVector(dir,SPEED*dt);
  next.x=Math.max(BOUNDS.minX,Math.min(BOUNDS.maxX,next.x));
  next.z=Math.max(BOUNDS.minZ,Math.min(BOUNDS.maxZ,next.z));
  next.y=PLAYER_H;camera.position.copy(next);
}
function nearestExhibit(){
  let best=null,bestD=4;
  exhibits.forEach(ex=>{const d=camera.position.distanceTo(new THREE.Vector3(ex.x,PLAYER_H,ex.z));if(d<bestD){bestD=d;best=ex;}});
  return best;
}
function showExhibit(ex){
  if(!ex){toast("Eksponatga yaqinroq boring");return;}
  $("infoTitle").textContent=ex.title;$("infoText").textContent=ex.text;$("infoSrc").textContent=ex.src||"";
  $("info").classList.add("open");
}
function loop(){
  requestAnimationFrame(loop);
  const dt=Math.min(0.05,clock.getDelta());
  move.f=keys["KeyW"]||keys["ArrowUp"]?1:0;
  move.b=keys["KeyS"]||keys["ArrowDown"]?1:0;
  move.l=keys["KeyA"]||keys["ArrowLeft"]?1:0;
  move.r=keys["KeyD"]||keys["ArrowRight"]?1:0;
  tryMove(dt);applyLook();renderer.render(scene,camera);
}
let lookTouch=null,lastX=0,lastY=0;
function onTouchStart(e){if(e.target.closest&&(e.target.closest(".ui")||e.target.closest(".stick-wrap")||e.target.closest(".panel")||e.target.closest("#linkModal")))return;const t=e.changedTouches[0];lookTouch=t.identifier;lastX=t.clientX;lastY=t.clientY;}
function onTouchMove(e){for(const t of e.changedTouches){if(t.identifier!==lookTouch)continue;yaw-=(t.clientX-lastX)*0.005;pitch-=(t.clientY-lastY)*0.004;lastX=t.clientX;lastY=t.clientY;}}
function onTouchEnd(e){for(const t of e.changedTouches){if(t.identifier===lookTouch)lookTouch=null;}}
function onMouseMove(e){if(!pointerLocked)return;yaw-=e.movementX*0.0025;pitch-=e.movementY*0.0022;}
function setupStick(){
  const base=$("stickBase"),knob=$("stickKnob"),wrap=$("stickWrap");
  let active=false,cx=0,cy=0;const R=36;
  function setKnob(x,y){const l=Math.hypot(x,y)||1;const k=Math.min(1,R/l);const nx=x*k,ny=y*k;knob.style.left=(36+nx)+"px";knob.style.top=(36+ny)+"px";stickVec.x=nx/R;stickVec.y=ny/R;}
  function start(e){active=true;const r=base.getBoundingClientRect();cx=r.left+r.width/2;cy=r.top+r.height/2;const t=e.touches?e.touches[0]:e;setKnob(t.clientX-cx,t.clientY-cy);}
  function move(e){if(!active)return;const t=e.touches?e.touches[0]:e;setKnob(t.clientX-cx,t.clientY-cy);}
  function end(){active=false;setKnob(0,0);stickVec.x=0;stickVec.y=0;}
  base.addEventListener("pointerdown",start);window.addEventListener("pointermove",move);window.addEventListener("pointerup",end);
  $("stickBtn").onclick=()=>{const on=wrap.style.display==="none"||!wrap.style.display;wrap.style.display=on?"block":"none";};
}
function loadSupabase(){return new Promise(res=>{if(window.supabase)return res(true);const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";s.onload=()=>res(true);s.onerror=()=>res(false);document.head.appendChild(s);});}
function connectRealtime(){return new Promise(res=>{const url=(cfg.SUPABASE_URL||"").trim(),key=(cfg.SUPABASE_ANON_KEY||"").trim();if(!url||!key||!window.supabase)return res(false);try{const client=window.supabase.createClient(url,key);channel=client.channel("museum-walk-"+room,{config:{broadcast:{self:true}}});channel.subscribe(st=>res(st==="SUBSCRIBED"));channel.on("broadcast",{event:"walk"},payload=>{const p=payload.payload||payload;if(p.type==="move"){remoteMove.f=p.f?1:0;remoteMove.b=p.b?1:0;remoteMove.l=p.l?1:0;remoteMove.r=p.r?1:0;}else if(p.type==="look"){yaw+=(p.dyaw||0);pitch+=(p.dpitch||0);}else if(p.type==="info")showExhibit(nearestExhibit());});}catch(e){res(false);}});}
function send(cmd){if(channel)try{channel.send({type:"broadcast",event:"walk",payload:cmd});}catch(e){}}
function openLink(){$("linkModal").classList.remove("hidden");$("linkModal").style.display="grid";$("roomCode").textContent=room;const url=location.origin+location.pathname+"?mode=controller&room="+encodeURIComponent(room);$("shareUrl").value=url;const box=$("qrcode");box.innerHTML="";if(window.QRCode)new QRCode(box,{text:url,width:150,height:150});else box.textContent=url;}
function initMuseum(){
  setupRenderer();setupCamera();buildHall();applyLook();
  window.addEventListener("resize",onResize);
  window.addEventListener("keydown",e=>{keys[e.code]=true;if(e.code==="KeyE")showExhibit(nearestExhibit());});
  window.addEventListener("keyup",e=>{keys[e.code]=false;});
  window.addEventListener("mousemove",onMouseMove);
  $("gl").addEventListener("click",()=>{$("gl").requestPointerLock&&$("gl").requestPointerLock();});
  document.addEventListener("pointerlockchange",()=>{pointerLocked=document.pointerLockElement===$("gl");});
  window.addEventListener("touchstart",onTouchStart,{passive:true});
  window.addEventListener("touchmove",onTouchMove,{passive:true});
  window.addEventListener("touchend",onTouchEnd,{passive:true});
  $("startBtn").onclick=()=>{$("welcome").classList.add("hidden");$("hud").style.display="flex";$("hint").style.display="block";$("stickWrap").style.display="block";setupStick();loadSupabase().then(()=>connectRealtime().then(ok=>{toast(ok?"Realtime":"Mahalliy");}));loop();};
  $("linkBtn").onclick=openLink;
  $("closeLink").onclick=()=>{$("linkModal").classList.add("hidden");$("linkModal").style.display="none";};
  $("copyLink").onclick=()=>navigator.clipboard&&navigator.clipboard.writeText($("shareUrl").value).then(()=>toast("Nusxalandi"));
  $("closeInfo").onclick=()=>$("info").classList.remove("open");
}
function initController(){
  $("welcome").classList.add("hidden");$("controller").classList.add("on");$("gl").style.display="none";
  loadSupabase().then(()=>connectRealtime().then(ok=>{$("ctrlStatus").textContent=ok?("Ulandi "+room):"Ulanmadi";$("ctrlStatus").style.color=ok?"#9be3b0":"#ffb4a8";}));
  const active={};function setDir(dir,on){active[dir]=on;send({type:"move",f:!!active.f,b:!!active.b,l:!!active.l,r:!!active.r});}
  document.querySelectorAll("[data-dir]").forEach(btn=>{const d=btn.dataset.dir;btn.addEventListener("pointerdown",e=>{e.preventDefault();setDir(d,true);});btn.addEventListener("pointerup",()=>setDir(d,false));btn.addEventListener("pointerleave",()=>setDir(d,false));});
  document.querySelectorAll("[data-act]").forEach(btn=>{btn.onclick=()=>{const a=btn.dataset.act;if(a==="info")send({type:"info"});if(a==="lookL")send({type:"look",dyaw:0.2});if(a==="lookR")send({type:"look",dyaw:-0.2});};});
}
if(mode==="controller")initController();else initMuseum();
})();

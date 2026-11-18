(function(){
  "use strict";
  const $ = id => document.getElementById(id);
  const cfg = window.MUZEY_BETA_CONFIG || {};
  const params = new URLSearchParams(location.search);
  const mode = params.get("mode") || "museum";
  const room = params.get("room") || makeRoom();
  let channel = null, viewer = null, vrLeft = null, vrRight = null, currentHall = 0, gyroEnabled = false, vrEnabled = false;
  let halls = [
    {id:"registon",name:"Tarixiy zal",title:"Tarixiy me’moriy makon",text:"Bu 360° ko‘rinishda tarixiy bino ichki makoni: gumbazlar, ustunlar, me’moriy bezaklar va eksponatlar. Aylantirib tomosha qiling — har tomonda yangi detal ochiladi.",source:"Panorama: Wikimedia Commons (CC BY-SA). Keyinroq Registon / qal’a / maydon 360° suratlari bilan almashtiriladi.",yaw:0},
    {id:"temur",name:"Amir Temur zali",title:"Temuriylar davri",text:"Temuriylar me’morchiligi, davlat boshqaruvi, hunarmandchilik va ilm-fan. Eksponatlar keyingi bosqichda haqiqiy buyumlar suratlari bilan boyitiladi.",source:"BETA kontent · manbalar tekshiruvi rejalashtirilgan.",yaw:45},
    {id:"qala",name:"Qal’a va mudofaa",title:"Qal’a me’morchiligi",text:"Qadimgi qal’alar, devorlar, darvozalar va mudofaa tizimlari haqida ma’lumotlar. 360° muhitda qal’a ichki hovlisi yoki zalini his qilish mumkin.",source:"BETA: hozirgi panorama umumiy tarixiy interyer sifatida ishlatilmoqda.",yaw:120},
    {id:"maydon",name:"Tarixiy maydon",title:"Registon va shahar maydonlari",text:"Samarqand Registoni, Buxoro va Xiva maydonlari — madrasa, minora va maydon ansambllari. Keyingi versiyada alohida 360° maydon panoramalari qo‘shiladi.",source:"UNESCO merosi · kontent yangilanadi.",yaw:200},
    {id:"uzbek",name:"O‘zbekiston merosi",title:"Milliy meros",text:"Arxeologiya, qo‘lyozmalar, hunarmandchilik va qadimiy shaharlar. Zal orasida o‘tib, eksponat tugmasini bosing.",source:"BETA namuna matn.",yaw:280}
  ];

  function makeRoom(){ return Math.random().toString(36).slice(2,8).toUpperCase(); }
  function toast(msg){
    const t=$("toast"); if(!t) return;
    t.textContent=msg; t.classList.add("show");
    clearTimeout(toast._tm); toast._tm=setTimeout(()=>t.classList.remove("show"),2400);
  }
  function setStatus(txt,ok){
    const el=$("ctrlStatus"); if(el){ el.textContent=txt; el.style.color=ok?"#9be3b0":"#ffb4a8"; }
  }

  function panoramaConfig(yaw){
    const url = cfg.PANORAMA_URL || "assets/demo-panorama.svg?v=2";
    return {
      type: "equirectangular",
      panorama: url,
      autoLoad: true,
      showZoomCtrl: false,
      showFullscreenCtrl: false,
      mouseZoom: true,
      draggable: true,
      friction: 0.15,
      yaw: yaw || 0,
      hfov: 100,
      minHfov: 50,
      maxHfov: 120,
      compass: false,
      horizonPitch: 0,
      orientationOnByDefault: false
    };
  }

  function createViewer(id, yaw){
    if(typeof pannellum === "undefined"){
      toast("Pannellum yuklanmadi");
      return null;
    }
    try{
      return pannellum.viewer(id, panoramaConfig(yaw));
    }catch(e){
      console.error(e);
      toast("Panorama ochilmadi");
      return null;
    }
  }

  function updateHallUI(){
    const h = halls[currentHall];
    if($("hallLabel")) $("hallLabel").textContent = h.name;
    if($("hallSub")) $("hallSub").textContent = "360° panorama";
    if($("exhibitTitle")) $("exhibitTitle").textContent = h.title;
    if($("exhibitText")) $("exhibitText").textContent = h.text;
    if($("exhibitSource")) $("exhibitSource").textContent = h.source;
  }

  function goHall(delta){
    currentHall = (currentHall + delta + halls.length) % halls.length;
    updateHallUI();
    const yaw = halls[currentHall].yaw || 0;
    if(viewer){ try{ viewer.setYaw(yaw); }catch(e){} }
    if(vrLeft){ try{ vrLeft.setYaw(yaw); }catch(e){} }
    if(vrRight){ try{ vrRight.setYaw(yaw); }catch(e){} }
    toast(halls[currentHall].name);
  }

  function showExhibit(open){
    const p=$("exhibitPanel");
    if(!p) return;
    p.classList.toggle("open", open!==false);
  }

  function enableGyro(on){
    gyroEnabled = !!on;
    $("gyroBtn") && $("gyroBtn").classList.toggle("active", gyroEnabled);
    const apply = v => {
      if(!v) return;
      try{
        if(gyroEnabled && typeof v.startOrientation === "function") v.startOrientation();
        else if(typeof v.stopOrientation === "function") v.stopOrientation();
      }catch(e){ console.warn(e); }
    };
    apply(viewer); apply(vrLeft); apply(vrRight);
    toast(gyroEnabled ? "Giroskop yoqildi" : "Giroskop o‘chirildi");
  }

  function setVR(on){
    vrEnabled = !!on;
    $("vrBtn") && $("vrBtn").classList.toggle("active", vrEnabled);
    const normal=$("panoramaNormal"), vr=$("panoramaVR");
    if(vrEnabled){
      normal && normal.classList.add("hidden");
      vr && vr.classList.remove("hidden");
      if(!vrLeft){
        vrLeft = createViewer("panoramaLeft", halls[currentHall].yaw);
        vrRight = createViewer("panoramaRight", halls[currentHall].yaw);
      }
      enableGyro(true);
      try{ document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); }catch(e){}
      toast("VR rejim (BETA split)");
    }else{
      vr && vr.classList.add("hidden");
      normal && normal.classList.remove("hidden");
      toast("Oddiy panorama rejimi");
    }
  }

  function loadSupabase(){
    return new Promise(resolve=>{
      if(window.supabase){ resolve(true); return; }
      const s=document.createElement("script");
      s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      s.onload=()=>resolve(true);
      s.onerror=()=>resolve(false);
      document.head.appendChild(s);
    });
  }

  function connectRealtime(){
    return new Promise(resolve=>{
      const url = (cfg.SUPABASE_URL||"").trim();
      const key = (cfg.SUPABASE_ANON_KEY||"").trim();
      if(!url || !key){
        resolve(false);
        return;
      }
      try{
        const client = window.supabase.createClient(url, key);
        channel = client.channel("museum-beta-"+room, { config: { broadcast: { self: true } } });
        channel.subscribe(status=>{
          resolve(status==="SUBSCRIBED");
        });
        channel.on("broadcast", { event: "remote-command" }, payload=>{
          handleRemote(payload.payload || payload);
        });
      }catch(e){
        console.error(e);
        resolve(false);
      }
    });
  }

  function sendCommand(cmd){
    if(!channel) return;
    try{ channel.send({ type:"broadcast", event:"remote-command", payload: cmd }); }catch(e){}
  }

  function handleRemote(cmd){
    if(!cmd || !cmd.type) return;
    if(cmd.type==="move"){
      const step = 12;
      const map = { left:-step, right:step, up:-step, down:step };
      const d = map[cmd.direction];
      if(d==null || !viewer) return;
      try{
        if(cmd.direction==="left" || cmd.direction==="right") viewer.setYaw(viewer.getYaw()+d);
        else viewer.setPitch(Math.max(-80, Math.min(80, viewer.getPitch()+d)));
      }catch(e){}
    } else if(cmd.type==="action"){
      if(cmd.action==="hall-prev") goHall(-1);
      if(cmd.action==="hall-next") goHall(1);
      if(cmd.action==="info") showExhibit(true);
    }
  }

  function openLinkModal(){
    const modal=$("linkModal");
    if(!modal) return;
    modal.classList.remove("hidden");
    $("roomCode").textContent = room;
    const url = location.origin + location.pathname + "?mode=controller&room=" + encodeURIComponent(room);
    $("shareUrl").value = url;
    const box=$("qrcode");
    box.innerHTML="";
    if(window.QRCode){
      new QRCode(box, { text:url, width:160, height:160, correctLevel: QRCode.CorrectLevel.M });
    } else {
      box.textContent = url;
    }
  }

  function initMuseum(){
    $("startBtn") && $("startBtn").addEventListener("click", ()=>{
      $("welcome").classList.add("hidden");
      $("museumShell").classList.remove("hidden");
      viewer = createViewer("panoramaNormal", halls[0].yaw);
      updateHallUI();
      loadSupabase().then(()=>connectRealtime().then(ok=>{
        if(ok) toast("Realtime tayyor · xona "+room);
        else toast("Mahalliy rejim · Supabase bo‘sh");
      }));
    });
    $("hallPrev") && $("hallPrev").addEventListener("click", ()=>goHall(-1));
    $("hallNext") && $("hallNext").addEventListener("click", ()=>goHall(1));
    $("infoBtn") && $("infoBtn").addEventListener("click", ()=>showExhibit(true));
    $("closeExhibit") && $("closeExhibit").addEventListener("click", ()=>showExhibit(false));
    $("gyroBtn") && $("gyroBtn").addEventListener("click", ()=>enableGyro(!gyroEnabled));
    $("vrBtn") && $("vrBtn").addEventListener("click", ()=>setVR(!vrEnabled));
    $("linkBtn") && $("linkBtn").addEventListener("click", openLinkModal);
    $("closeLink") && $("closeLink").addEventListener("click", ()=>$("linkModal").classList.add("hidden"));
    $("closeLink2") && $("closeLink2").addEventListener("click", ()=>$("linkModal").classList.add("hidden"));
    $("copyLink") && $("copyLink").addEventListener("click", ()=>{
      const v=$("shareUrl").value;
      navigator.clipboard && navigator.clipboard.writeText(v).then(()=>toast("Havola nusxalandi")).catch(()=>toast("Nusxalanmadi"));
    });
  }

  function initController(){
    $("museumMode").classList.add("hidden");$("controllerPage").classList.remove("hidden");
    loadSupabase().then(joinController);
    function joinController(){
      connectRealtime().then(ok=>{
        setStatus(ok?"Muzeyga ulandi · xona "+room:"Ulanmadi · Supabase sozlamasini tekshiring",ok);
        if(ok)channel.on("broadcast",{event:"remote-command"},()=>{});
      });
    }
    document.querySelectorAll("[data-dir]").forEach(btn=>{
      const dir=btn.dataset.dir;
      const start=e=>{e.preventDefault();sendCommand({type:"move",direction:dir});};
      btn.addEventListener("pointerdown",start);
      btn.addEventListener("click",e=>{if(e.detail===0)start(e);});
    });
    document.querySelectorAll("[data-action]").forEach(btn=>btn.addEventListener("click",()=>sendCommand({type:"action",action:btn.dataset.action})));
  }

  if(mode==="controller")initController();else initMuseum();
})();

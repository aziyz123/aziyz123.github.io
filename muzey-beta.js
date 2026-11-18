(function(){
  "use strict";
  const $ = id => document.getElementById(id);
  const cfg = window.MUZEY_BETA_CONFIG || {};
  const params = new URLSearchParams(location.search);
  const mode = params.get("mode") || "museum";
  const room = params.get("room") || makeRoom();
  let channel = null, viewer = null, vrLeft = null, vrRight = null, currentHall = 0, gyroEnabled = false, vrEnabled = false;
  let halls = [
    {id:"registon",name:"Registon — bosh zal",title:"Registon maydoni",text:"Samarqanddagi Registon ansambli Ulug‘bek, Sherdor va Tillakori madrasalaridan tashkil topgan. Ushbu beta zal panoramali namoyish uchun sinov makonidir.",source:"Manba tekshiruvi: UNESCO va O‘zbekiston madaniy merosi manbalari bilan boyitish rejalashtirilgan.",yaw:0},
    {id:"temur",name:"Amir Temur zali",title:"Amir Temur davri",text:"Bu zalda Temuriylar davri me’morchiligi, davlat boshqaruvi, hunarmandchilik va ilm-faniga oid eksponatlar namoyish etiladi. Tarixiy buyumlar uchun alohida tasdiqlangan manbalar kiritiladi.",source:"BETA: hozircha demo panorama. Tarixiy eksponatlar keyingi bosqichda qo‘shiladi.",yaw:90},
    {id:"ancient",name:"Qadimgi dunyo",title:"Qadimgi sivilizatsiyalar",text:"Qadimgi Misr, Mesopotamiya va antik dunyo yodgorliklari uchun mo‘ljallangan zal.",source:"BETA: kontent namunasi.",yaw:180},
    {id:"islamic",name:"Islom sivilizatsiyasi",title:"Ilm-fan va qo‘lyozmalar",text:"Ilmiy meros, qo‘lyozmalar, astronomiya, matematika va tarixiy olimlar faoliyati yoritiladi.",source:"BETA: kontent namunasi.",yaw:270},
    {id:"uzbek",name:"O‘zbekiston tarixi",title:"O‘zbekiston tarixiy merosi",text:"Arxeologik topilmalar, qadimiy shaharlar va moddiy madaniyat namunalari uchun zal.",source:"BETA: kontent namunasi.",yaw:0}
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
    const url = cfg.PANORAMA_URL || "assets/demo-panorama.svg";
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

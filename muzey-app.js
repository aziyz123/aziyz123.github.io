// Muzey ilovasi: yurish, qarash, giroskop va ikki ko'zli VR rejimi.
(function(){
  var $ = function(id){ return document.getElementById(id); };
  var canvas = $('gl');
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xcfe0ee, 80, 260);
  // osmon
  var sky = new THREE.Mesh(new THREE.SphereGeometry(400, 24, 12), new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false, map: (function(){
    var c = document.createElement('canvas'); c.width = 8; c.height = 256; var g = c.getContext('2d'); var gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, '#4A86C5'); gr.addColorStop(.55, '#A9CBE6'); gr.addColorStop(.75, '#E8E2CF'); gr.addColorStop(1, '#E8E2CF'); g.fillStyle = gr; g.fillRect(0, 0, 8, 256); return new THREE.CanvasTexture(c); })() }));
  scene.add(sky);
  scene.add(new THREE.HemisphereLight(0xdfeeff, 0x8a7048, .7));
  var sun = new THREE.DirectionalLight(0xfff0d0, .75); sun.position.set(-60, 90, 70); scene.add(sun);
  scene.add(window.RegistonMuseum.build());

  var cam = new THREE.PerspectiveCamera(68, 1, .1, 700);
  var camL = new THREE.PerspectiveCamera(80, 1, .1, 700), camR = new THREE.PerspectiveCamera(80, 1, .1, 700);
  var pos = new THREE.Vector3(0, 1.7, 30), yaw = 0, pitch = 0;
  var gyro = { on: false, offset: 0, q: new THREE.Quaternion(), has: false };
  var vr = false;

  function resize(){
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    cam.aspect = w / h; cam.updateProjectionMatrix();
    camL.aspect = camR.aspect = (w / 2) / h; camL.updateProjectionMatrix(); camR.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize); window.addEventListener('orientationchange', function(){ setTimeout(resize, 200); }); resize();

  // ---- Qarash: barmoq bilan surish
  var drag = null;
  canvas.addEventListener('pointerdown', function(e){ drag = { x: e.clientX, y: e.clientY }; try{ canvas.setPointerCapture(e.pointerId); }catch(_){} });
  canvas.addEventListener('pointermove', function(e){
    if(!drag) return; var dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY;
    var k = .0042; if(gyro.on){ gyro.offset -= dx * k; } else { yaw -= dx * k; pitch = Math.max(-1.3, Math.min(1.3, pitch - dy * k)); }
  });
  ['pointerup', 'pointercancel'].forEach(function(n){ canvas.addEventListener(n, function(){ drag = null; }); });

  // ---- Yurish: ekrandagi doira va klaviatura
  var pad = $('pad'), knob = $('knob'), pv = { x: 0, y: 0 }, padId = null;
  function padMove(e){ var r = pad.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; var dx = (e.clientX - cx) / (r.width / 2), dy = (e.clientY - cy) / (r.height / 2); var l = Math.hypot(dx, dy); if(l > 1){ dx /= l; dy /= l; } pv.x = dx; pv.y = dy; knob.style.transform = 'translate(' + dx * 38 + 'px,' + dy * 38 + 'px)'; }
  pad.addEventListener('pointerdown', function(e){ padId = e.pointerId; try{ pad.setPointerCapture(e.pointerId); }catch(_){} padMove(e); e.stopPropagation(); });
  pad.addEventListener('pointermove', function(e){ if(e.pointerId === padId) padMove(e); });
  function padEnd(e){ if(e.pointerId !== padId) return; padId = null; pv.x = pv.y = 0; knob.style.transform = ''; }
  pad.addEventListener('pointerup', padEnd); pad.addEventListener('pointercancel', padEnd);
  var keys = {};
  window.addEventListener('keydown', function(e){ keys[e.code] = true; }); window.addEventListener('keyup', function(e){ keys[e.code] = false; });

  // ---- Joylar (chips) va ma'lumot
  var spots = window.RegistonMuseum.spots, tween = null;
  function showInfo(s){ $('info').innerHTML = '<h3></h3><p></p><small></small>'; $('info').querySelector('h3').textContent = s.title; $('info').querySelector('p').textContent = s.text; $('info').querySelector('small').textContent = window.RegistonMuseum.note; }
  function goto(s, instant){
    var target = new THREE.Vector3(s.pos[0], s.pos[1], s.pos[2]);
    if(instant){ pos.copy(target); yaw = s.yaw; pitch = 0; if(gyro.on) gyro.offset = s.yaw - gyro.baseYaw; showInfo(s); document.querySelectorAll('#chips .pill').forEach(function(b){ b.classList.toggle('on', b.dataset.id === s.id); }); return; }
    tween = { t: 0, from: pos.clone(), to: target, y0: yaw, y1: s.yaw, off0: gyro.offset };
    showInfo(s);
    document.querySelectorAll('#chips .pill').forEach(function(b){ b.classList.toggle('on', b.dataset.id === s.id); });
  }
  spots.forEach(function(s){ var b = document.createElement('button'); b.type = 'button'; b.className = 'pill'; b.dataset.id = s.id; b.textContent = s.name; b.addEventListener('click', function(){ goto(s); }); $('chips').appendChild(b); });
  showInfo(spots[0]); document.querySelector('#chips .pill').classList.add('on'); goto(spots[0], true);
  setTimeout(function(){ var h = $('hint'); if(h) h.style.opacity = 0; }, 7000);

  // ---- Giroskop
  var zee = new THREE.Vector3(0, 0, 1), eul = new THREE.Euler(), q1 = new THREE.Quaternion(-Math.sqrt(.5), 0, 0, Math.sqrt(.5)), q0 = new THREE.Quaternion();
  var lastOri = null;
  function oriHandler(e){ if(e.alpha == null) return; lastOri = e; gyro.has = true; }
  function gyroQuat(){
    var e = lastOri; if(!e) return null;
    var a = THREE.MathUtils.degToRad(e.alpha || 0), b = THREE.MathUtils.degToRad(e.beta || 0), g = THREE.MathUtils.degToRad(e.gamma || 0);
    var o = THREE.MathUtils.degToRad((screen.orientation && screen.orientation.angle) || window.orientation || 0);
    eul.set(b, a, -g, 'YXZ'); gyro.q.setFromEuler(eul); gyro.q.multiply(q1); gyro.q.multiply(q0.setFromAxisAngle(zee, -o)); return gyro.q;
  }
  function enableGyro(){
    function start(){
      window.addEventListener('deviceorientation', oriHandler, true); gyro.on = true; $('gyroBtn').classList.add('on');
      setTimeout(function(){ var q = gyroQuat(); if(!q){ gyro.on = false; $('gyroBtn').classList.remove('on'); $('hint').style.opacity = 1; $('hint').textContent = 'Bu qurilmada giroskop topilmadi'; return; } eul.setFromQuaternion(q, 'YXZ'); gyro.baseYaw = eul.y; gyro.offset = yaw - eul.y; }, 400);
    }
    if(typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function'){
      DeviceOrientationEvent.requestPermission().then(function(r){ if(r === 'granted') start(); else { $('hint').style.opacity = 1; $('hint').textContent = 'Giroskopga ruxsat berilmadi'; } }).catch(function(){});
    } else start();
  }
  function disableGyro(){ window.removeEventListener('deviceorientation', oriHandler, true); gyro.on = false; $('gyroBtn').classList.remove('on'); var q = gyro.q; eul.setFromQuaternion(q, 'YXZ'); yaw = eul.y + gyro.offset; pitch = eul.x; }
  $('gyroBtn').addEventListener('click', function(){ gyro.on ? disableGyro() : enableGyro(); });

  // ---- VR rejimi
  function setVR(on){
    vr = on; document.body.classList.toggle('vr', on);
    renderer.setScissorTest(on);
    if(on){
      if(!gyro.on) enableGyro();
      var el = document.documentElement; try{ (el.requestFullscreen || el.webkitRequestFullscreen).call(el); }catch(_){}
      try{ screen.orientation.lock('landscape'); }catch(_){}
    } else { try{ document.exitFullscreen && document.fullscreenElement && document.exitFullscreen(); }catch(_){} try{ screen.orientation.unlock(); }catch(_){} }
    setTimeout(resize, 250);
  }
  $('vrBtn').addEventListener('click', function(){ setVR(true); }); $('vrExit').addEventListener('click', function(){ setVR(false); });

  // ---- Chizish sikli
  var clock = new THREE.Clock(), euler = new THREE.Euler(0, 0, 0, 'YXZ'), qCam = new THREE.Quaternion(), qYaw = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
  function updatePose(dt){
    if(tween){
      tween.t = Math.min(1, tween.t + dt / 1.1); var k = tween.t * tween.t * (3 - 2 * tween.t);
      pos.lerpVectors(tween.from, tween.to, k);
      var dy = ((tween.y1 - tween.y0 + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; // eng qisqa burilish
      if(gyro.on){ gyro.offset = tween.off0 + (tween.y1 - (function(){ var q = gyroQuat(); if(!q) return 0; var e2 = new THREE.Euler().setFromQuaternion(q, 'YXZ'); return e2.y + tween.off0; })()) * k; }
      else { yaw = tween.y0 + dy * k; pitch *= (1 - k); }
      if(tween.t >= 1) tween = null;
    }
    // yurish
    var fx = pv.x, fy = -pv.y; if(keys.KeyW || keys.ArrowUp) fy += 1; if(keys.KeyS || keys.ArrowDown) fy -= 1; if(keys.KeyD) fx += 1; if(keys.KeyA) fx -= 1;
    if(keys.ArrowLeft) yaw += dt * 1.6; if(keys.ArrowRight) yaw -= dt * 1.6;
    if(fx || fy){
      tween = null;
      var head = gyro.on ? (function(){ var q = gyroQuat(); if(!q) return yaw; var e3 = new THREE.Euler().setFromQuaternion(q, 'YXZ'); return e3.y + gyro.offset; })() : yaw;
      var sp = 6 * dt, sx = Math.sin(head), cz = Math.cos(head);
      pos.x += (-sx * fy + cz * fx) * sp * -1 * -1; pos.z += (-cz * fy - sx * fx) * sp;
      pos.x = Math.max(-95, Math.min(95, pos.x)); pos.z = Math.max(-95, Math.min(95, pos.z));
    }
    // yo'nalish
    if(gyro.on){ var q = gyroQuat(); if(q){ qYaw.setFromAxisAngle(up, gyro.offset); qCam.copy(qYaw).multiply(q); } }
    else { euler.set(pitch, yaw, 0); qCam.setFromEuler(euler); }
  }
  var right = new THREE.Vector3();
  function frame(){
    requestAnimationFrame(frame);
    var dt = Math.min(.05, clock.getDelta()); updatePose(dt);
    var w = renderer.domElement.width, h = renderer.domElement.height;
    sky.position.copy(pos);
    if(!vr){
      cam.position.copy(pos); cam.quaternion.copy(qCam); renderer.setViewport(0, 0, w, h); renderer.render(scene, cam);
    } else {
      right.set(1, 0, 0).applyQuaternion(qCam).multiplyScalar(.032);
      camL.quaternion.copy(qCam); camR.quaternion.copy(qCam);
      camL.position.copy(pos).sub(right); camR.position.copy(pos).add(right);
      renderer.setScissor(0, 0, w / 2, h); renderer.setViewport(0, 0, w / 2, h); renderer.render(scene, camL);
      renderer.setScissor(w / 2, 0, w / 2, h); renderer.setViewport(w / 2, 0, w / 2, h); renderer.render(scene, camR);
    }
  }
  $('load').style.display = 'none'; frame();
  window.__muzey = { setVR: setVR, goto: function(i){ goto(spots[i], true); }, scene: scene };
})();

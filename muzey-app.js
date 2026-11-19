// Muzey ilovasi: yurish, qarash, giroskop va ikki ko'zli VR rejimi.
(function(){
  var $ = function(id){ return document.getElementById(id); };
  var canvas = $('gl');
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .72;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  var scene = new THREE.Scene();
  // osmon: gradient + quyosh + bulutlar; shu osmondan yaltiroq sirtlar uchun aks (env) olinadi
  function skyTex(){ var c = document.createElement('canvas'); c.width = 1024; c.height = 512; var g = c.getContext('2d');
    var gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#2F6DB3'); gr.addColorStop(.45, '#7FB2DE'); gr.addColorStop(.72, '#CFE1EE'); gr.addColorStop(.82, '#EFE6CF'); gr.addColorStop(1, '#D9CBA5'); g.fillStyle = gr; g.fillRect(0, 0, 1024, 512);
    for(var i = 0; i < 38; i++){ var x = Math.random() * 1024, y = 90 + Math.random() * 190, r = 24 + Math.random() * 60; for(var k = 0; k < 7; k++){ var rg = g.createRadialGradient(x + k * r * .5, y + Math.random() * 14, 0, x + k * r * .5, y, r); rg.addColorStop(0, 'rgba(255,255,255,.34)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(x - r, y - r, r * 3.8, r * 2); } }
    var sg = g.createRadialGradient(330, 150, 0, 330, 150, 90); sg.addColorStop(0, 'rgba(255,250,225,1)'); sg.addColorStop(.12, 'rgba(255,244,200,.95)'); sg.addColorStop(1, 'rgba(255,230,170,0)'); g.fillStyle = sg; g.fillRect(200, 20, 260, 260);
    var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; }
  var skyT = skyTex();
  var sky = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false, map: skyT, toneMapped: false }));
  scene.add(sky);
  try{ var pm = new THREE.PMREMGenerator(renderer); var envScene = new THREE.Scene(); envScene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.MeshBasicMaterial({ side: THREE.BackSide, map: skyT }))); scene.environment = pm.fromScene(envScene, 0).texture; pm.dispose(); }catch(e){}
  scene.fog = new THREE.Fog(0xcfc6ac, 140, 360);
  scene.add(new THREE.HemisphereLight(0xcfe4ff, 0x8a6d44, .4));
  var sun = new THREE.DirectionalLight(0xfff1d4, 1.7); sun.position.set(-70, 95, 60);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); var sc = sun.shadow.camera; sc.left = -120; sc.right = 120; sc.top = 120; sc.bottom = -120; sc.near = 10; sc.far = 320; sun.shadow.bias = -.0006; sun.shadow.normalBias = .4;
  scene.add(sun);
  var MU = /[?&]m=oqsaroy/.test(location.search) ? window.OqsaroyMuseum : window.RegistonMuseum;
  var tt = document.querySelector('.title'); if(tt) tt.textContent = MU.title; document.title = 'Virtual muzey — ' + MU.title;
  scene.add(MU.build());
  if(MU.fog){ scene.fog.near = MU.fog[0]; scene.fog.far = MU.fog[1]; }
  if(MU.shadowCenter){ var shc = MU.shadowCenter; sun.position.set(-70, 95, 60 + shc[0]); sun.target.position.set(0, 0, shc[0]); scene.add(sun.target); sc.left = -shc[1]; sc.right = shc[1]; sc.top = shc[1]; sc.bottom = -shc[1]; sc.far = 420; }

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
  var ext = { x: 0, y: 0, turn: 0, t: 0 }; // tashqi pultdan
  var keys = {};
  window.addEventListener('keydown', function(e){ keys[e.code] = true; }); window.addEventListener('keyup', function(e){ keys[e.code] = false; });

  // ---- Joylar (chips) va ma'lumot
  var spots = MU.spots, tween = null;
  function showInfo(s){ $('info').innerHTML = '<h3></h3><p></p><small></small>'; $('info').querySelector('h3').textContent = s.title; $('info').querySelector('p').textContent = s.text; $('info').querySelector('small').textContent = MU.note; }
  function goto(s, instant){
    if(MU.onSpot) MU.onSpot(s);
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

  // ---- Sifat: soya va yuqori aniqlik (sekin telefonlar uchun o'chiriladi)
  var hq = true;
  function setQuality(on){ hq = on; sun.castShadow = on; renderer.setPixelRatio(on ? Math.min(window.devicePixelRatio || 1, 2) : 1); resize(); $('qBtn').classList.toggle('on', on); $('qBtn').textContent = on ? '✨ Sifat: yuqori' : '⚡ Sifat: oddiy'; }
  $('qBtn').addEventListener('click', function(){ setQuality(!hq); });
  if(/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) && (window.devicePixelRatio || 1) >= 3) setQuality(false); else setQuality(true);

  // ---- VR rejimi: har ko'z uchun linza markaziga moslangan tasvir + linza buzilishini to'g'rilash
  var DEF = { shift: .07, k1: .30, k2: .08, zoom: 1.0, ipd: 64 };
  var VS = (function(){ try{ var o = JSON.parse(localStorage.getItem('muzeyVR') || 'null'); if(o) return Object.assign({}, DEF, o); }catch(_){} return Object.assign({}, DEF); })();
  function saveVS(){ try{ localStorage.setItem('muzeyVR', JSON.stringify(VS)); }catch(_){} }
  var rt = null, post = null, postScene = new THREE.Scene(), postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), postMat = null;
  function makeRT(){
    var pr = Math.min(window.devicePixelRatio || 1, 1.5), W = Math.round(window.innerWidth * pr), H = Math.round(window.innerHeight * pr);
    if(rt) rt.dispose();
    var half = renderer.capabilities.isWebGL2 && (renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float'));
    rt = new THREE.WebGLRenderTarget(W, H, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, type: half ? THREE.HalfFloatType : THREE.UnsignedByteType, depthBuffer: true });
    if(!half) rt.texture.encoding = THREE.sRGBEncoding;
    rt.scissorTest = true;
    if(!postMat){
      postMat = new THREE.ShaderMaterial({
        uniforms: { t: { value: null }, res: { value: new THREE.Vector2(1, 1) }, cL: { value: new THREE.Vector2(.25, .5) }, cR: { value: new THREE.Vector2(.75, .5) }, k: { value: new THREE.Vector2(.3, .08) }, zoom: { value: 1 } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
        fragmentShader: 'uniform sampler2D t; uniform vec2 res, cL, cR, k; uniform float zoom; varying vec2 vUv;\n' +
          'void main(){ bool left = vUv.x < .5; vec2 c = left ? cL : cR; vec2 d = vUv - c;\n' +
          '  vec2 p = vec2(d.x * res.x, d.y * res.y) / (res.y * .5);\n' +
          '  float r2 = dot(p, p); float f = (1. + k.x * r2 + k.y * r2 * r2) / zoom; vec2 q = p * f;\n' +
          '  vec2 s = c + vec2(q.x * (res.y * .5) / res.x, q.y * (res.y * .5) / res.y);\n' +
          '  float lo = left ? 0. : .5, hi = left ? .5 : 1.;\n' +
          '  if(s.x < lo || s.x > hi || s.y < 0. || s.y > 1.){ gl_FragColor = vec4(0., 0., 0., 1.); }\n' +
          '  else { gl_FragColor = vec4(texture2D(t, s).rgb, 1.); }\n' +
          '  #if defined( TONE_MAPPING )\n gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );\n #endif\n gl_FragColor = linearToOutputTexel( gl_FragColor ); }'
      });
      postMat.toneMapped = true;
      post = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat); postScene.add(post);
    }
    postMat.uniforms.t.value = rt.texture; postMat.uniforms.res.value.set(W, H);
  }
  function applyVS(){
    if(!postMat) return;
    postMat.uniforms.cL.value.set(.25 + .5 * VS.shift, .5); postMat.uniforms.cR.value.set(.75 - .5 * VS.shift, .5);
    postMat.uniforms.k.value.set(VS.k1, VS.k2); postMat.uniforms.zoom.value = VS.zoom;
  }
  function setVR(on){
    vr = on; document.body.classList.toggle('vr', on);
    if(on){
      makeRT(); applyVS();
      if(!gyro.on) enableGyro();
      var el = document.documentElement; try{ (el.requestFullscreen || el.webkitRequestFullscreen).call(el); }catch(_){}
      try{ screen.orientation.lock('landscape'); }catch(_){}
    } else { try{ document.exitFullscreen && document.fullscreenElement && document.exitFullscreen(); }catch(_){} try{ screen.orientation.unlock(); }catch(_){} }
    setTimeout(function(){ resize(); if(vr){ makeRT(); applyVS(); } }, 300);
  }
  $('vrBtn').addEventListener('click', function(){ setVR(true); }); $('vrExit').addEventListener('click', function(){ setVR(false); });
  // VR ichidagi tez sozlash tugmalari (ochiq old tomondan bosiladi)
  function bump(key, d, lo, hi){ VS[key] = Math.max(lo, Math.min(hi, +(VS[key] + d).toFixed(3))); saveVS(); applyVS(); syncSliders(); }
  $('vrShiftM').addEventListener('click', function(){ bump('shift', -.01, -.1, .3); }); $('vrShiftP').addEventListener('click', function(){ bump('shift', .01, -.1, .3); });
  $('vrDistM').addEventListener('click', function(){ bump('k1', -.04, -.2, .8); }); $('vrDistP').addEventListener('click', function(){ bump('k1', .04, -.2, .8); });
  $('vrZoomM').addEventListener('click', function(){ bump('zoom', -.05, .6, 1.6); }); $('vrZoomP').addEventListener('click', function(){ bump('zoom', .05, .6, 1.6); });
  // sozlash oynasi
  var sl = { shift: $('sShift'), k1: $('sK1'), zoom: $('sZoom'), ipd: $('sIpd') };
  function syncSliders(){ Object.keys(sl).forEach(function(k){ sl[k].value = VS[k]; var o = $('o' + k); if(o) o.textContent = VS[k]; }); }
  Object.keys(sl).forEach(function(k){ sl[k].addEventListener('input', function(){ VS[k] = parseFloat(sl[k].value); saveVS(); applyVS(); syncSliders(); }); });
  $('vrSet').addEventListener('click', function(){ $('vrPanel').hidden = !$('vrPanel').hidden; syncSliders(); });
  $('vrReset').addEventListener('click', function(){ Object.assign(VS, DEF); saveVS(); applyVS(); syncSliders(); });
  $('vrPanelClose').addEventListener('click', function(){ $('vrPanel').hidden = true; });
  syncSliders();

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
    if(ext.t && performance.now() - ext.t > 1500){ ext.x = ext.y = ext.turn = 0; }
    var fx = pv.x + ext.x, fy = -(pv.y + ext.y); if(keys.KeyW || keys.ArrowUp) fy += 1; if(keys.KeyS || keys.ArrowDown) fy -= 1; if(keys.KeyD) fx += 1; if(keys.KeyA) fx -= 1;
    if(keys.ArrowLeft) yaw += dt * 1.6; if(keys.ArrowRight) yaw -= dt * 1.6;
    if(ext.turn){ yaw += ext.turn * dt * 1.8; if(gyro.on) gyro.offset += ext.turn * dt * 1.8; }
    if(fx || fy){
      tween = null;
      var head = gyro.on ? (function(){ var q = gyroQuat(); if(!q) return yaw; var e3 = new THREE.Euler().setFromQuaternion(q, 'YXZ'); return e3.y + gyro.offset; })() : yaw;
      var sp = (MU.speed || 6) * dt, sx = Math.sin(head), cz = Math.cos(head);
      pos.x += (-sx * fy + cz * fx) * sp * -1 * -1; pos.z += (-cz * fy - sx * fx) * sp;
      var bd = MU.bounds || [-95, 95, -95, 95]; pos.x = Math.max(bd[0], Math.min(bd[1], pos.x)); pos.z = Math.max(bd[2], Math.min(bd[3], pos.z));
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
      if(!rt) { makeRT(); applyVS(); }
      var ipd = VS.ipd / 1000 / 2; right.set(1, 0, 0).applyQuaternion(qCam).multiplyScalar(ipd);
      camL.quaternion.copy(qCam); camR.quaternion.copy(qCam);
      camL.position.copy(pos).sub(right); camR.position.copy(pos).add(right);
      var RW = rt.width, RH = rt.height, ar = (RW / 2) / RH, tf = Math.tan(THREE.MathUtils.degToRad(80 / 2));
      [camL, camR].forEach(function(c, i){
        c.aspect = ar; c.updateProjectionMatrix();
        c.projectionMatrix.elements[8] = (i === 0 ? -1 : 1) * 2 * VS.shift; // asosiy nuqtani linza markaziga surish
        c.projectionMatrixInverse.copy(c.projectionMatrix).invert();
      });
      rt.viewport.set(0, 0, RW / 2, RH); rt.scissor.set(0, 0, RW / 2, RH); renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, camL);
      rt.viewport.set(RW / 2, 0, RW / 2, RH); rt.scissor.set(RW / 2, 0, RW / 2, RH); renderer.setRenderTarget(rt); renderer.render(scene, camR);
      renderer.setRenderTarget(null); renderer.setScissorTest(false); renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
      renderer.render(postScene, postCam);
    }
  }
  $('load').style.display = 'none'; frame();
  window.__muzey = { ext: ext, go: function(i){ if(spots[i]) goto(spots[i]); }, spots: spots, setVR: setVR, VS: VS, goto: function(i){ goto(spots[i], true); }, scene: scene };
})();
(function(){ var l = document.getElementById('swMu'); if(l && /[?&]m=oqsaroy/.test(location.search)){ l.href = 'muzey.html'; l.textContent = '🏛 Registon'; } })();

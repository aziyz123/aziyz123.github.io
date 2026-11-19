// Oqsaroy (Shahrisabz) — hozirgi holat va manbalarga asoslangan tiklangan holat.
// Manbalar: Klavixo (1404, "Narrative of the Embassy", XI bob), Archnet "Aq Saray Palace", Wikipedia "Ak-Saray Palace", society.uz (qurilish sanalari).
(function(){
  var K = window.MuzeyKit, C = K.C, rnd = K.rnd, mk = K.mk, plain = K.plain;
  var Zp = 110; // portal old yuzi (shimolga, Samarqand tomonga qaragan) z koordinatasi
  var ochre = '#C8A25A', gold = '#D9B24C', dblue = '#1E4F9C', lblue = '#4FB3C8';
  var ruin = null, recon = null, hallLight = null;

  function tex(rx, ry, main){
    main = main || ochre;
    function d(c, w, h, bump){
      c.fillStyle = bump ? '#808080' : main; c.fillRect(0, 0, w, h);
      var n = 4, s = w / n;
      for(var i = 0; i < n; i++) for(var j = 0; j < n; j++){
        var cx = i * s + s / 2, cy = j * s + s / 2;
        var dia = function(r, col, bcol){ c.fillStyle = bump ? bcol : col; c.beginPath(); c.moveTo(cx, cy - r); c.lineTo(cx + r, cy); c.lineTo(cx, cy + r); c.lineTo(cx - r, cy); c.closePath(); c.fill(); };
        dia(s * .5, dblue, '#505050'); dia(s * .36, lblue, '#9a9a9a'); dia(s * .2, main, '#606060'); dia(s * .08, dblue, '#404040');
      }
      c.fillStyle = bump ? '#303030' : 'rgba(255,255,255,.35)'; for(var k = 0; k <= n; k++){ c.fillRect(0, k * s - 1, w, 2); c.fillRect(k * s - 1, 0, 2, h); }
      if(!bump){ for(var m = 0; m < 900; m++){ c.fillStyle = 'rgba(' + (rnd() > .5 ? '255,240,200' : '60,40,20') + ',' + rnd() * .09 + ')'; c.fillRect(rnd() * w, rnd() * h, 2, 2); } }
    }
    return { map: mk(256, 256, function(c, w, h){ d(c, w, h, false); }, rx, ry), bump: mk(256, 256, function(c, w, h){ d(c, w, h, true); }, rx, ry, false) };
  }
  // minoralar uchun zigzag naqsh (Archnet: «minoralarni zigzag naqshlar qoplagan»)
  function zig(rx, ry){
    function d(c, w, h, bump){
      c.fillStyle = bump ? '#808080' : dblue; c.fillRect(0, 0, w, h);
      var rows = 8, rh = h / rows;
      for(var r = 0; r < rows; r++){
        c.strokeStyle = bump ? (r % 2 ? '#e0e0e0' : '#404040') : (r % 2 ? ochre : lblue); c.lineWidth = rh * .22; c.beginPath();
        for(var x = 0; x <= w; x += w / 8){ var yy = r * rh + rh / 2 + (Math.round(x / (w / 8)) % 2 ? -rh * .28 : rh * .28); if(x === 0) c.moveTo(x, yy); else c.lineTo(x, yy); } c.stroke();
      }
    }
    return { map: mk(256, 256, function(c, w, h){ d(c, w, h, false); }, rx, ry), bump: mk(256, 256, function(c, w, h){ d(c, w, h, true); }, rx, ry, false) };
  }
  function glz(set, b){ return new THREE.MeshStandardMaterial({ map: set.map, bumpMap: set.bump, bumpScale: b || .8, roughness: .3, metalness: .06, envMapIntensity: .9, side: THREE.DoubleSide }); }
  function brick(rx, ry){ var b = K.brickSet('#B9915A', '#8F6B3A', rx, ry); return new THREE.MeshStandardMaterial({ map: b.map, bumpMap: b.bump, bumpScale: 1.6, roughness: .92 }); }
  function flag(rx, ry){
    return mk(256, 256, function(g, w, h){ g.fillStyle = '#E4DED0'; g.fillRect(0, 0, w, h); for(var i = 0; i < 8; i++) for(var j = 0; j < 8; j++){ var v = rnd(); g.fillStyle = 'rgba(' + (v > .5 ? '255,255,250,' : '90,80,60,') + Math.abs(v - .5) * .25 + ')'; g.fillRect(i * 32 + 1, j * 32 + 1, 30, 30); } }, rx, ry);
  }
  // Sher va Quyosh belgisi (Klavixo: kirish tepasida va hovli arkalari ustida)
  function sunTex(){
    return mk(256, 256, function(c, w, h){
      c.clearRect(0, 0, w, h); var cx = w / 2, cy = h / 2;
      c.fillStyle = '#D9B24C'; for(var i = 0; i < 24; i++){ var a = i / 24 * 6.2832; c.beginPath(); c.moveTo(cx + Math.cos(a - .09) * 92, cy + Math.sin(a - .09) * 92); c.lineTo(cx + Math.cos(a) * 124, cy + Math.sin(a) * 124); c.lineTo(cx + Math.cos(a + .09) * 92, cy + Math.sin(a + .09) * 92); c.fill(); }
      c.beginPath(); c.arc(cx, cy, 88, 0, 6.2832); c.fillStyle = '#E8C65A'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#8A6A1E'; c.stroke();
      // sher (soddalashtirilgan siluet)
      c.fillStyle = '#6B4B14'; c.beginPath(); c.moveTo(70, 160); c.lineTo(72, 118); c.quadraticCurveTo(90, 96, 126, 104); c.lineTo(150, 96); c.quadraticCurveTo(176, 84, 186, 104); c.lineTo(176, 120); c.lineTo(184, 160); c.lineTo(170, 160); c.lineTo(164, 132); c.lineTo(100, 134); c.lineTo(92, 160); c.closePath(); c.fill();
      c.beginPath(); c.arc(178, 100, 14, 0, 6.2832); c.fill(); c.lineWidth = 6; c.strokeStyle = '#6B4B14'; c.beginPath(); c.moveTo(72, 120); c.quadraticCurveTo(46, 110, 54, 84); c.stroke();
    }, 1, 1);
  }
  var sunMat = null;
  function sunPlaque(r){ if(!sunMat) sunMat = new THREE.MeshStandardMaterial({ map: sunTex(), transparent: true, alphaTest: .3, side: THREE.DoubleSide, roughness: .4, metalness: .3 }); return new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), sunMat); }

  // Ravoqli (teshikli) devor: shakl + teshik, old/orqa yuz tex bilan
  function screen(totalW, H, openW, openH, depth, front, side){
    var sh = new THREE.Shape(); sh.moveTo(-totalW / 2, 0); sh.lineTo(totalW / 2, 0); sh.lineTo(totalW / 2, H); sh.lineTo(-totalW / 2, H); sh.lineTo(-totalW / 2, 0);
    var hole = new THREE.Path(), r = openW / 2; hole.moveTo(-r, 0); hole.lineTo(-r, openH - r); hole.absarc(0, openH - r, r, Math.PI, 0, true); hole.lineTo(r, 0); hole.lineTo(-r, 0); sh.holes.push(hole);
    return new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: depth, bevelEnabled: false, curveSegments: 28 }), [front, side]);
  }
  // Arkadali uzun devor (x bo'ylab uzunlik L)
  function arcade(L, H, bay, depth){
    var sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(L, 0); sh.lineTo(L, H); sh.lineTo(0, H); sh.lineTo(0, 0);
    var n = Math.floor(L / bay), aw = bay * .72, ah = H * .72, r = aw / 2;
    for(var i = 0; i < n; i++){ var cx = (i + .5) * bay, p = new THREE.Path(); p.moveTo(cx - r, 0); p.lineTo(cx - r, ah - r); p.absarc(cx, ah - r, r, Math.PI, 0, true); p.lineTo(cx + r, 0); p.lineTo(cx - r, 0); sh.holes.push(p); }
    var g = new THREE.ExtrudeGeometry(sh, { depth: depth, bevelEnabled: false, curveSegments: 8 });
    return new THREE.Mesh(g, [glz(tex(1 / 6, 1 / 6)), brick(1 / 8, 1 / 8)]);
  }

  // Hozirgi holat: buzilgan ustun
  function pylon(x, z){
    var g = new THREE.Group(), W = 17, H = 38, D = 13;
    var face = glz(tex(3, 6)), side = brick(2, 5);
    var box = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), [side, side, side, side, face, brick(3, 5)]); box.position.y = H / 2; g.add(box);
    for(var i = 0; i < 9; i++){
      var w = 1.6 + rnd() * 1.6, h = .8 + rnd() * 3.2, d = D * (.45 + rnd() * .5);
      var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), i % 3 ? brick(1, 1) : glz(tex(1, 1)));
      m.position.set(-W / 2 + w / 2 + i * (W - 1.6) / 8.2, H + h / 2, (rnd() - .5) * 2); g.add(m);
    }
    g.position.set(x, 0, z); return g;
  }

  function build(){
    var root = new THREE.Group();
    var grass = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ color: 0x4F7F2E, roughness: 1, envMapIntensity: .3 })); grass.rotation.x = -Math.PI / 2; grass.receiveShadow = true; root.add(grass);
    var stone = flag(6, 14);
    var path = new THREE.Mesh(new THREE.PlaneGeometry(26, 260), new THREE.MeshStandardMaterial({ map: stone, roughness: .95 })); path.rotation.x = -Math.PI / 2; path.position.set(0, .03, Zp + 120); path.receiveShadow = true; root.add(path);

    // ---------- HOZIRGI HOLAT ----------
    ruin = new THREE.Group();
    ruin.add(pylon(-19.5, Zp - 6.5)); ruin.add(pylon(19.5, Zp - 6.5));
    var st = new THREE.Group();
    var ped = new THREE.Mesh(new THREE.BoxGeometry(6, 7, 6), plain(0xCFC8B6, .6)); ped.position.y = 3.5; st.add(ped);
    var capb = new THREE.Mesh(new THREE.BoxGeometry(7, .8, 7), plain(0x8E8670, .6)); capb.position.y = 7.4; st.add(capb);
    var bronze = plain(0x6B5A2E, .35, .7, 1);
    var body = new THREE.Mesh(new THREE.CylinderGeometry(.9, 1.3, 3.2, 14), bronze); body.position.y = 9.4; st.add(body);
    var head = new THREE.Mesh(new THREE.SphereGeometry(.55, 14, 10), bronze); head.position.y = 11.5; st.add(head);
    var cape = new THREE.Mesh(new THREE.ConeGeometry(1.7, 3.4, 14, 1, true), bronze); cape.position.y = 9.5; st.add(cape);
    st.position.set(0, 0, Zp + 46); ruin.add(st);
    // qazishma konturi (120 x 250 m)
    var fnd = brick(8, 1);
    [[-60, Zp - 50 - 125, .8, 250], [60, Zp - 50 - 125, .8, 250], [0, Zp - 300, 120, .8]].forEach(function(w){ var m = new THREE.Mesh(new THREE.BoxGeometry(w[2], .9, w[3]), fnd); m.position.set(w[0], .45, w[1]); ruin.add(m); });
    for(var i = 0; i < 16; i++){ var sd = i % 2 ? 1 : -1; ruin.add(K.tree(sd * (24 + rnd() * 4), Zp + 100 - Math.floor(i / 2) * 15, .9 + rnd() * .4)); }
    [[-60, Zp + 30], [60, Zp + 30], [-90, Zp + 70], [90, Zp + 70], [-80, Zp - 30], [80, Zp - 30]].forEach(function(p){ ruin.add(K.tree(p[0], p[1], 1.1 + rnd() * .4)); });
    root.add(ruin);

    // ---------- TIKLANGAN HOLAT ----------
    recon = new THREE.Group();
    var T = tex(1 / 6, 1 / 6), TG = tex(1 / 6, 1 / 6, gold);
    // 1) Asosiy portal (birinchi ayvon): oraliq 22 m, balandligi ~50 m (Archnet: tiklangan gumbaz ~50 m)
    var scr = screen(56, 56, 22, 46, 14, glz(T), brick(1 / 8, 1 / 8)); scr.position.set(0, 0, Zp - 14); recon.add(scr);
    // Qurb yozuv belbog'i (kvadrat kufiy uslubi, Archnet): to'q ko'k lenta
    var band = new THREE.Mesh(new THREE.PlaneGeometry(50, 2.2), new THREE.MeshStandardMaterial({ map: mk(512, 32, function(c, w, h){ c.fillStyle = dblue; c.fillRect(0, 0, w, h); c.fillStyle = '#EDE6D2'; for(var i = 0; i < 64; i++){ var x = i * 8 + 1; c.fillRect(x, 6, 3, 20); if(i % 2) c.fillRect(x, 6, 6, 4); else c.fillRect(x, 22, 6, 4); } }, 1, 1), roughness: .4 })); band.position.set(0, 50.5, Zp + .06); recon.add(band);
    // 2) Ikki yon minora (kesik silindr): tarixiy manbalarga ko'ra 60–70 m; o'rtacha 65 m olingan
    [-1, 1].forEach(function(s){
      var tw = new THREE.Group();
      var body = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.8, 65, 36), glz(zig(6, 10))); body.position.y = 32.5; tw.add(body);
      var ring = new THREE.Mesh(new THREE.CylinderGeometry(6.4, 6.4, 1.6, 36), plain(0x2c3e5f, .5)); ring.position.y = 64; tw.add(ring);
      var top = new THREE.Mesh(new THREE.CylinderGeometry(5.6, 5.6, 3, 36, 1, true), glz(tex(1 / 3, 1 / 3))); top.position.y = 66; tw.add(top);
      var base = new THREE.Mesh(new THREE.CylinderGeometry(6.6, 6.6, 3, 36), brick(4, 1)); base.position.y = 1.5; tw.add(base);
      tw.position.set(s * 28, 0, Zp - 9); recon.add(tw);
    });
    // 3) Birinchi ayvon gumbazi (yarim silindr) va yon devorlar
    var vault = new THREE.Mesh(new THREE.CylinderGeometry(11, 11, 22, 40, 1, true, Math.PI / 2, Math.PI), glz(tex(1 / 6, 1 / 6, '#B8923F'))); vault.rotation.x = Math.PI / 2; vault.position.set(0, 35, Zp - 25); recon.add(vault);
    [-1, 1].forEach(function(s){
      var w = new THREE.Mesh(new THREE.BoxGeometry(6, 35, 22), brick(1, 3)); w.position.set(s * 14, 17.5, Zp - 25); recon.add(w);
      // Klavixo: yo'lakning ikki yonida kichik ochiq xonalar — ko'k koshinli pol va ravoqlar
      for(var k = 0; k < 3; k++){ var niche = new THREE.Mesh(new THREE.ShapeGeometry((function(){ var sh = new THREE.Shape(), r = 2.2; sh.moveTo(-r, 0); sh.lineTo(r, 0); sh.lineTo(r, 6); sh.absarc(0, 6, r, 0, Math.PI, false); sh.lineTo(-r, 0); return sh; })(), 16), glz(tex(1 / 3, 1 / 3)));
        niche.position.set(s * 10.95, .1, Zp - 18 - k * 7); niche.rotation.y = -s * Math.PI / 2; recon.add(niche); }
    });
    // 4) Ikkinchi, tor ayvon (13 m) va undan hovlining kirish yo'lagi
    var scr2 = screen(30, 26, 13, 21, 6, glz(T), brick(1 / 8, 1 / 8)); scr2.position.set(0, 0, Zp - 40); recon.add(scr2);
    [-1, 1].forEach(function(s){ var w = new THREE.Mesh(new THREE.BoxGeometry(8, 16, 12), brick(1, 2)); w.position.set(s * 10.5, 8, Zp - 44); recon.add(w); });
    var pf = new THREE.Mesh(new THREE.PlaneGeometry(22, 52), new THREE.MeshStandardMaterial({ map: K.tileSet(C.blue, C.white, 4, 9).map, roughness: .35, envMapIntensity: .8 })); pf.rotation.x = -Math.PI / 2; pf.position.set(0, .06, Zp - 24); recon.add(pf);
    // 5) Hovli: oq tosh plitalar, to'rt tomoni arkada, o'rtasida katta hovuz (Klavixo)
    var z0 = Zp - 50, L = 250, zc = z0 - L / 2;
    var court = new THREE.Mesh(new THREE.PlaneGeometry(120, L), new THREE.MeshStandardMaterial({ map: flag(10, 20), roughness: .9 })); court.rotation.x = -Math.PI / 2; court.position.set(0, .05, zc); court.receiveShadow = true; recon.add(court);
    var pool = new THREE.Mesh(new THREE.PlaneGeometry(30, 60), new THREE.MeshStandardMaterial({ color: 0x2F7F9F, roughness: .04, metalness: .45, envMapIntensity: 1.6 })); pool.rotation.x = -Math.PI / 2; pool.position.set(0, .5, zc); recon.add(pool);
    var cop = new THREE.Mesh(new THREE.BoxGeometry(33, .7, 63), plain(0xE4DED0, .6)); cop.position.set(0, .3, zc); recon.add(cop);
    // sharqiy va g'arbiy arkadalar
    [-1, 1].forEach(function(s){
      var a = arcade(L, 10, 5, 7); a.rotation.y = s > 0 ? Math.PI / 2 : -Math.PI / 2; a.position.set(s * 60, 0, s > 0 ? z0 : z0 - L); recon.add(a);
      var back = new THREE.Mesh(new THREE.BoxGeometry(5, 12, L), brick(1, 1)); back.position.set(s * 65.5, 6, zc); recon.add(back);
      for(var i = 0; i < 12; i++){ var p = sunPlaque(1.5); p.position.set(s * 59.9, 10.6, z0 - 10 - i * 20.5); p.rotation.y = -s * Math.PI / 2; recon.add(p); }
    });
    // shimoliy (kirish) va janubiy devorlar; markazda asosiy darvoza
    [-14, 14].forEach(function(x0){ var a = arcade(46, 10, 5, 6); a.position.set(x0 > 0 ? 14 : -60, 0, z0); recon.add(a); });
    var zs = z0 - L; // janubiy devor z
    [-1, 1].forEach(function(s){ var a = arcade(45, 10, 5, 6); a.position.set(s > 0 ? 15 : -60, 0, zs); recon.add(a); });
    // 6) Asosiy darvoza (Klavixo: «juda baland va keng», oltin va ko'k koshin; tepasida Sher va Quyosh)
    var gate = screen(30, 34, 12, 24, 12, glz(TG), brick(1 / 8, 1 / 8)); gate.position.set(0, 0, zs - 12); recon.add(gate);
    var gp = sunPlaque(3.2); gp.position.set(0, 29.5, zs + .08); recon.add(gp);
    var hp = sunPlaque(1.9); hp.position.set(0, 53.6, Zp + .12); recon.add(hp); // portal tepasida ham (Klavixo: kirish tepasida)
    // 7) Qabul zali (kvadrat, devori oltin va ko'k koshin, shifti oltin ranglangan)
    var hz = zs - 12 - 15; // zal markazi
    var hallWall = glz(tex(5, 5, gold), 1);
    var floor = new THREE.MeshStandardMaterial({ map: K.tileSet(C.blue, C.white, 6, 6).map, roughness: .3, metalness: .05, envMapIntensity: .8 });
    var ceil = new THREE.MeshStandardMaterial({ color: 0xC9A23E, roughness: .35, metalness: .5, envMapIntensity: 1 });
    var ghost = new THREE.MeshBasicMaterial({ visible: false });
    var inner = new THREE.Mesh(new THREE.BoxGeometry(30, 20, 30), [hallWall, hallWall, ceil, floor, ghost, hallWall]); inner.material.forEach(function(m){ m.side = THREE.BackSide; }); inner.position.set(0, 10, hz); recon.add(inner);
    var outer = new THREE.Mesh(new THREE.BoxGeometry(31.4, 20.8, 31.4), [brick(1, 1), brick(1, 1), brick(1, 1), brick(1, 1), ghost, brick(1, 1)]); outer.position.set(0, 10.2, hz); recon.add(outer);
    hallLight = new THREE.PointLight(0xFFE2A8, 1.4, 60); hallLight.position.set(0, 14, hz); recon.add(hallLight);
    // 8) Yon bog'lar (Klavixo: «katta bog' — mevali daraxtlar, hovuzlar, maysa»)
    [-1, 1].forEach(function(s){
      var lawn = new THREE.Mesh(new THREE.PlaneGeometry(60, 130), new THREE.MeshStandardMaterial({ color: 0x5E9438, roughness: 1, envMapIntensity: .3 })); lawn.rotation.x = -Math.PI / 2; lawn.position.set(s * 95, .03, zs - 40); recon.add(lawn);
      var tank = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ color: 0x2F7F9F, roughness: .04, metalness: .45 })); tank.rotation.x = -Math.PI / 2; tank.position.set(s * 95, .12, zs - 40); recon.add(tank);
      for(var r = 0; r < 5; r++) for(var c = 0; c < 3; c++){ if(c === 1 && r === 2) continue; recon.add(K.tree(s * (80 + c * 15), zs + 15 - r * 24, .8 + rnd() * .3)); }
    });
    recon.visible = false; root.add(recon);

    root.traverse(function(o){ if(o.isMesh && o !== grass){ o.castShadow = o.material && !o.material.transparent; o.receiveShadow = true; } });
    return root;
  }
  var ruinTexts = "Hozir saroydan faqat portal ustunlari saqlangan: ular balandligi manbalarga ko'ra taxminan 30–38 m, oraliq ravoq kengligi 22 m.";
  window.OqsaroyMuseum = {
    title: 'Oqsaroy (Shahrisabz)',
    build: build,
    bounds: [-140, 140, -260, 232], speed: 14, fog: [260, 640], shadowCenter: [-30, 170],
    onSpot: function(s){ var m = s.mode || (ruin && ruin.visible ? 'ruin' : 'recon'); if(ruin) ruin.visible = m === 'ruin'; if(recon) recon.visible = m === 'recon'; },
    spots: [
      { id: 'now', mode: 'ruin', name: 'Hozirgi holat', pos: [0, 1.7, Zp + 70], yaw: 0, title: 'Oqsaroy — hozirgi holat',
        text: "Amir Temur o'z vatani Kesh (Shahrisabz)da 1380-yilda qurdirishni boshlagan, qurilish 1404-yilgacha davom etgan. XVI asrda saroy buzilgan. " + ruinTexts + " Shahrisabz tarixiy markazi YUNESKO ro'yxatida (2000)." },
      { id: 'statue', mode: 'ruin', name: 'Haykal', pos: [10, 1.7, Zp + 62], yaw: Math.PI / 4 * .55, title: 'Amir Temur haykali',
        text: "Saroyning asl joyida Amir Temur haykali o'rnatilgan. Maketda sodda shaklda berilgan." },
      { id: 'rfront', mode: 'recon', name: 'Tiklangan: old', pos: [0, 1.7, Zp + 112], yaw: 0, title: 'Tiklangan portal (taxminiy)',
        text: "Portal shimolga, Samarqand tomonga qaragan. Ikki yon minora kesik silindr shaklida; manbalarga ko'ra ularning asl balandligi 60–70 m, ayvon gumbazi ~50 m (Archnet). Maketda minoralar 65 m, ayvon 46 m qilib olingan. Old yuzi to'q sariq, ko'k va havorang sirlangan g'isht naqshlari bilan qoplangan." },
      { id: 'riwan', mode: 'recon', name: 'Birinchi ayvon', pos: [0, 1.7, Zp + 6], yaw: 0, title: 'Birinchi ayvon (22 m)',
        text: "Ayvon kengligi 22 m. Uning ortida ikkinchi, tor (13 m) ayvon va hovlining kirish yo'lagi bor. Klavixo uzun kirish yo'lagini va ikki yonida ko'k koshinli pol va ravoqli kichik xonalarni tasvirlagan." },
      { id: 'rpass', mode: 'recon', name: "Kirish yo'lagi", pos: [0, 1.7, Zp - 30], yaw: Math.PI / 2, title: "Kirish yo'lagi va kichik xonalar",
        text: "Klavixo (1404): yo'lakning ikki yonida kutish uchun kichik xonalar bo'lgan, ularning poli ko'k koshin bilan, ravoqlari ko'k koshinli g'ishtdan." },
      { id: 'rcourt', mode: 'recon', name: 'Hovli', pos: [0, 1.7, Zp - 56], yaw: 0, title: 'Asosiy hovli',
        text: "Hovli oq tosh plitalar bilan yotqizilgan, to'rt tomoni nafis ravoqlar (arkada) bilan o'ralgan, o'rtasida katta suv havzasi bo'lgan (Klavixo). Zamonaviy tadqiqotlarda o'lchami taxminan 120×250 m. Arkada ustida Sher va Quyosh belgilari bo'lgan." },
      { id: 'rpool', mode: 'recon', name: 'Havza', pos: [0, 1.7, -2], yaw: Math.PI, title: 'Orqaga qarash',
        text: "Hovlining o'rtasidan portal va ikki minora ko'rinishi. Havza o'lchami manbalarda aniq berilmagan, maketda taxminiy." },
      { id: 'rgate', mode: 'recon', name: 'Asosiy darvoza', pos: [0, 1.7, -120], yaw: 0, title: 'Asosiy darvoza',
        text: "Klavixo: «juda baland va keng» darvoza, oltin va ko'k koshin bilan bezatilgan; tepasida Sher va Quyosh tasviri. U Samarqand avvalgi hukmdorining gerbi deb tushuntirilgan." },
      { id: 'rhall', mode: 'recon', name: 'Qabul zali', pos: [0, 1.7, -196], yaw: 0, title: 'Kvadrat zal',
        text: "Klavixo: darvozadan keyin kvadrat zal, devorlari oltin va ko'k koshin bilan qoplangan, shifti oltin ranglar bilan bezatilgan. Maketda ichki bezak taxminiy." },
      { id: 'rgarden', mode: 'recon', name: "Bog'", pos: [-80, 1.7, -170], yaw: Math.PI / 2 * -1 + Math.PI, title: "Saroy bog'i",
        text: "Klavixo yozishicha, zal yonida katta bog' tashkil qilinayotgan edi: mevali va soyali daraxtlar, suv havzalari, maysazorlar. Maketda joylashuvi taxminiy." }
    ],
    note: "Manbalar: Klavixo (1404), Archnet «Aq Saray Palace», Wikipedia, society.uz. Haqiqiy asl rejasi saqlanmagan, shuning uchun tiklangan holat — manbalarga asoslangan gipoteza; o'lchamlar o'rtacha qiymatlar. Darslik bilan solishtiring."
  };
})();

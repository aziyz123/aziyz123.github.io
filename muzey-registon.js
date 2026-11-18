// Registon ansambli — 3D maket (kod bilan yasalgan, tashqi model yo'q).
// Nisbatlar va bezaklar taxminiy: arxitektura chizmasi emas, ko'rgazmali maket.
(function(){
  var C = { brick:'#C9A66B', brick2:'#A98150', turq:'#1FA3A8', turq2:'#137F86', blue:'#1E4F9C', blue2:'#16397A', navy:'#13294F', gold:'#D8B24A', white:'#EFE8D6' };
  var rnd = (function(){ var s = 12345; return function(){ s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();

  function mk(w, h, draw, rx, ry, srgb){
    var c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx || 1, ry || 1); t.anisotropy = 8;
    if(srgb !== false) t.encoding = THREE.sRGBEncoding; return t;
  }
  // G'isht: rang + relyef (bump) xaritasi
  function brickSet(base, line, rx, ry){
    var data = []; for(var y = 0; y < 16; y++){ data[y] = []; for(var x = 0; x < 8; x++) data[y][x] = (rnd() - .5) * .22; }
    function d(c, w, h, bump){
      c.fillStyle = bump ? '#888' : base; c.fillRect(0, 0, w, h);
      for(var r = 0; r < 16; r++){ var off = r % 2 ? 16 : 0; for(var i = -1; i < 8; i++){
        var bx = i * 32 + off, by = r * 16, v = data[r][((i % 8) + 8) % 8];
        if(bump){ c.fillStyle = 'rgb(' + (150 + v * 90) + ',' + (150 + v * 90) + ',' + (150 + v * 90) + ')'; c.fillRect(bx + 2, by + 2, 28, 12); }
        else { c.fillStyle = v > 0 ? 'rgba(255,230,170,' + v * .5 + ')' : 'rgba(60,35,10,' + (-v) * .6 + ')'; c.fillRect(bx + 1, by + 1, 30, 14); }
      } }
      if(!bump){ c.strokeStyle = line; c.lineWidth = 2; for(var y2 = 0; y2 < h; y2 += 16){ c.beginPath(); c.moveTo(0, y2); c.lineTo(w, y2); c.stroke(); } for(var k = 0; k < 1500; k++){ c.fillStyle = 'rgba(70,45,15,' + rnd() * .08 + ')'; c.fillRect(rnd() * w, rnd() * h, 3, 3); } }
    }
    return { map: mk(256, 256, function(c, w, h){ d(c, w, h, false); }, rx, ry), bump: mk(256, 256, function(c, w, h){ d(c, w, h, true); }, rx, ry, false) };
  }
  // Koshin: sakkizburchakli yulduz naqshi
  function tileSet(c1, c2, rx, ry, accent){
    function d(c, w, h, bump){
      c.fillStyle = bump ? '#999' : c1; c.fillRect(0, 0, w, h);
      for(var gx = 0; gx < 2; gx++) for(var gy = 0; gy < 2; gy++){
        var cx = gx * 128 + 64, cy = gy * 128 + 64;
        c.beginPath(); for(var k = 0; k < 16; k++){ var a = k * Math.PI / 8, r = k % 2 ? 22 : 54; c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } c.closePath();
        if(bump){ c.fillStyle = '#bbb'; c.fill(); } else { c.fillStyle = 'rgba(255,255,255,.14)'; c.fill(); c.strokeStyle = c2; c.lineWidth = 3; c.stroke(); }
        c.beginPath(); c.arc(cx, cy, 9, 0, 6.28); c.fillStyle = bump ? '#ddd' : (accent || '#D8B24A'); c.fill();
        for(var q = 0; q < 8; q++){ var aa = q * Math.PI / 4 + Math.PI / 8; c.beginPath(); c.arc(cx + Math.cos(aa) * 36, cy + Math.sin(aa) * 36, 4, 0, 6.28); c.fillStyle = bump ? '#ccc' : c2; c.fill(); }
      }
      c.strokeStyle = bump ? '#555' : 'rgba(255,255,255,.55)'; c.lineWidth = 2; c.strokeRect(1, 1, w - 2, h - 2);
      if(!bump) for(var n = 0; n < 500; n++){ c.fillStyle = 'rgba(0,30,60,' + rnd() * .05 + ')'; c.fillRect(rnd() * w, rnd() * h, 3, 3); }
    }
    return { map: mk(256, 256, function(c, w, h){ d(c, w, h, false); }, rx, ry), bump: mk(256, 256, function(c, w, h){ d(c, w, h, true); }, rx, ry, false) };
  }
  function stripeTex(c1, c2, n){ return mk(256, 64, function(g, w, h){ for(var i = 0; i < n; i++){ g.fillStyle = i % 2 ? c1 : c2; g.fillRect(i * w / n, 0, w / n + 1, h); } g.fillStyle = 'rgba(255,255,255,.35)'; for(var j = 0; j < n; j += 2) g.fillRect(j * w / n + 2, 8, 2, h - 16); }, 1, 1); }

  function mat(set, o){ o = o || {}; return new THREE.MeshStandardMaterial({ map: set ? set.map : null, bumpMap: set ? set.bump : null, bumpScale: o.bump == null ? 1.2 : o.bump, color: o.color || 0xffffff, roughness: o.rough == null ? .8 : o.rough, metalness: o.metal || 0, envMapIntensity: o.env == null ? .5 : o.env }); }
  function glaze(set){ return mat(set, { rough: .22, metal: .08, env: 1.1, bump: .6 }); }
  function plain(color, rough, metal, env){ return new THREE.MeshStandardMaterial({ color: color, roughness: rough == null ? .8 : rough, metalness: metal || 0, envMapIntensity: env == null ? .5 : env }); }

  function archShape(w, h){ var s = new THREE.Shape(), r = w / 2; s.moveTo(-r, 0); s.lineTo(r, 0); s.lineTo(r, h - r); s.absarc(0, h - r, r, 0, Math.PI, false); s.lineTo(-r, 0); return s; }
  // pointed-ish (to'rt markazli) ravoq: ozgina o'tkir uchli
  function archMesh(w, h, material){ return new THREE.Mesh(new THREE.ShapeGeometry(archShape(w, h), 18), material); }
  function archSolid(w, h, depth, material){ var m = new THREE.Mesh(new THREE.ExtrudeGeometry(archShape(w, h), { depth: depth, bevelEnabled: false, curveSegments: 18 }), material); return m; }

  function minaret(x, z, hgt, rad){
    var g = new THREE.Group(), br = brickSet(C.brick, C.brick2, 4, hgt / 4), tl = tileSet(C.blue, C.white, 6, 1), tq = tileSet(C.turq, C.white, 6, 1);
    var body = new THREE.Mesh(new THREE.CylinderGeometry(rad * .86, rad, hgt, 32, 1), mat(br)); body.position.y = hgt / 2; g.add(body);
    [.18, .45, .74].forEach(function(f, i){ var b = new THREE.Mesh(new THREE.CylinderGeometry(rad * (1 - f * .14) + .08, rad * (1 - f * .14) + .08, 1.5, 32), glaze(i === 1 ? tq : tl)); b.position.y = hgt * f; g.add(b); });
    var top = new THREE.Mesh(new THREE.CylinderGeometry(rad * 1.2, rad * .88, 2.8, 32), glaze(tq)); top.position.y = hgt + 1.4; g.add(top);
    for(var i = 0; i < 12; i++){ var a = i / 12 * 6.28, w = new THREE.Mesh(new THREE.BoxGeometry(.5, 1.5, .5), plain(0x2c3e5f)); w.position.set(Math.cos(a) * rad * 1.2, hgt + 1.4, Math.sin(a) * rad * 1.2); g.add(w); }
    var cap = new THREE.Mesh(new THREE.SphereGeometry(rad * 1.2, 32, 14, 0, 6.28, 0, 1.45), mat(tq, { rough: .25, env: 1.1 })); cap.position.y = hgt + 2.8; g.add(cap);
    var tip = new THREE.Mesh(new THREE.ConeGeometry(.16, 1.8, 8), plain(0xD8B24A, .3, .6, 1)); tip.position.y = hgt + 2.8 + rad * 1.2 + .5; g.add(tip);
    var base = new THREE.Mesh(new THREE.CylinderGeometry(rad * 1.14, rad * 1.22, 3.2, 32), mat(brickSet(C.brick2, C.brick, 4, 1))); base.position.y = 1.6; g.add(base);
    g.position.set(x, 0, z); return g;
  }

  function dome(r, color, h){
    var g = new THREE.Group(), ribs = mk(512, 128, function(c, w, hh){ c.fillStyle = color; c.fillRect(0, 0, w, hh); for(var i = 0; i < 24; i++){ c.fillStyle = 'rgba(0,25,70,.45)'; c.fillRect(i * w / 24, 0, 6, hh); c.fillStyle = 'rgba(255,255,255,.1)'; c.fillRect(i * w / 24 + 8, 0, 3, hh); } for(var k = 0; k < 600; k++){ c.fillStyle = 'rgba(255,255,255,' + rnd() * .06 + ')'; c.fillRect(rnd() * w, rnd() * hh, 3, 3); } }, 1, 1);
    var tl = tileSet(C.blue, C.white, 8, 1), hh = h || r * .9;
    var drum = new THREE.Mesh(new THREE.CylinderGeometry(r * .8, r * .84, hh, 40), glaze(tl)); drum.position.y = hh / 2; g.add(drum);
    var rim = new THREE.Mesh(new THREE.CylinderGeometry(r * .9, r * .88, 1, 40), plain(0xB98F52, .6)); rim.position.y = hh; g.add(rim);
    var d = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 24, 0, 6.28, 0, Math.PI * .6), new THREE.MeshStandardMaterial({ map: ribs, roughness: .22, metalness: .1, envMapIntensity: 1.2 }));
    d.scale.y = 1.28; d.position.y = hh - r * .08; g.add(d);
    var tip = new THREE.Mesh(new THREE.ConeGeometry(.22, 2.6, 8), plain(0xD8B24A, .3, .6, 1)); tip.position.y = hh + r * 1.18; g.add(tip);
    return g;
  }

  // Muqarnas (balandli tokcha qatorlari) — pishtoq gumbazi ostida
  function muqarnas(cx, cy, w, rows, z){
    var g = new THREE.Group(), cols = [C.turq, C.blue, C.turq2, C.gold];
    for(var r = 0; r < rows; r++){
      var n = 4 + r * 2, cw = (w * (1 - r * .09)) / n;
      for(var i = 0; i < n; i++){
        var x = (i - (n - 1) / 2) * cw, m = archMesh(cw * .86, cw * 1.35, new THREE.MeshStandardMaterial({ color: cols[(r + i) % 4], roughness: .3, metalness: .1, envMapIntensity: 1 }));
        m.position.set(x, cy + r * cw * .9, z + r * .04); g.add(m);
      }
    }
    return g;
  }

  function madrasa(o){
    var g = new THREE.Group(), W = o.W, D = o.D, H = o.H, PW = o.pw, PH = o.ph;
    var brW = brickSet(C.brick, C.brick2, W / 7, H / 6);
    var wall = mat(brW, { bump: 1.6, rough: .9 });
    var body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), wall); body.position.set(0, H / 2, -D / 2); g.add(body);
    // poydevor va belbog'lar
    var plinth = new THREE.Mesh(new THREE.BoxGeometry(W + .4, 1.4, D + .4), mat(brickSet(C.brick2, C.brick, W / 5, 1), { rough: .95 })); plinth.position.set(0, .7, -D / 2); g.add(plinth);
    var belt = new THREE.Mesh(new THREE.BoxGeometry(W + .3, 1.2, D + .3), glaze(tileSet(C.turq, C.white, W / 3, 1))); belt.position.set(0, H + .6, -D / 2); g.add(belt);
    var mid = new THREE.Mesh(new THREE.BoxGeometry(W + .2, .5, D + .2), glaze(tileSet(C.blue, C.white, W / 3, 1))); mid.position.set(0, H * .5 - 1.4, -D / 2 + .05); if(o.floors === 2) g.add(mid);
    var cornice = new THREE.Mesh(new THREE.BoxGeometry(W + .8, .6, D + .8), plain(0xB08850, .8)); cornice.position.set(0, H + 1.5, -D / 2); g.add(cornice);
    for(var cr = -W / 2 + 1; cr < W / 2; cr += 1.6){ var cren = new THREE.Mesh(new THREE.BoxGeometry(.9, .9, .5), plain(0xB08850, .85)); cren.position.set(cr, H + 2.25, 0.2); g.add(cren); }

    // yon qanot hujralari: ramka (relyef) + chuqur tokcha
    var nicheDark = new THREE.MeshStandardMaterial({ color: 0x172846, roughness: 1 });
    var frameMat = plain(0xE1CFA2, .85);
    var bay = o.bay || 4.4, nw = bay * .56, rows = o.floors === 1 ? [1.6] : [1.6, H * .54];
    for(var side = -1; side <= 1; side += 2){
      for(var x = PW / 2 + bay * .7; x < W / 2 - 3.6; x += bay){
        rows.forEach(function(ry){
          var nh = o.floors === 1 ? H * .72 : H * .38;
          var fr = archSolid(nw + .8, nh + .7, .35, frameMat); fr.position.set(side * x, ry - .35, 0); g.add(fr);
          var n = archSolid(nw, nh, .1, nicheDark); n.position.set(side * x, ry, .36); g.add(n);
          var top = archMesh(nw * .6, nw * .6, glaze(tileSet(C.turq, C.white, 1, 1))); top.position.set(side * x, ry + nh + .4, .1); // kichik koshin
        });
      }
    }
    // pishtoq
    var px = new THREE.Mesh(new THREE.BoxGeometry(PW, PH, 4.6), mat(brW, { bump: 1.6 })); px.position.set(0, PH / 2, 2.3); g.add(px);
    var f1 = archSolid(PW - 1.4, PH - 1, .5, glaze(tileSet(C.blue, C.white, .45, .45))); f1.position.set(0, 0, 4.6); g.add(f1);
    var f2 = archSolid(PW - 3.8, PH - 4.2, .5, glaze(tileSet(C.turq, C.white, .4, .4, '#F0CB62'))); f2.position.set(0, 0, 5.05); g.add(f2);
    var f3 = archSolid(PW - 7.4, PH - 9, .5, glaze(tileSet(C.blue2, C.gold, .35, .35, '#FFF'))); f3.position.set(0, 0, 5.5); g.add(f3);
    var doorH = PH * .4, doorW = PW * .34;
    var doorGrad = mk(8, 128, function(c, w, h){ var gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0B1630'); gr.addColorStop(.7, '#1B2D52'); gr.addColorStop(1, '#C79A55'); c.fillStyle = gr; c.fillRect(0, 0, w, h); }, 1 / doorW, 1 / doorH); doorGrad.wrapS = doorGrad.wrapT = THREE.ClampToEdgeWrapping; doorGrad.offset.set(.5, 0);
    var doorFrame = archSolid(doorW + 1.6, doorH + 1, .5, glaze(tileSet(C.turq, C.white, .6, .6))); doorFrame.position.set(0, 0, 5.9); g.add(doorFrame);
    var door = archMesh(doorW, doorH, new THREE.MeshBasicMaterial({ map: doorGrad })); door.position.set(0, 0, 6.45); g.add(door);
    g.add(muqarnas(0, doorH + 1.4, doorW * 1.05, 4, 6.2));
    var ban = new THREE.Mesh(new THREE.BoxGeometry(PW - 1.2, 1.7, .4), new THREE.MeshStandardMaterial({ map: stripeTex('#1E4F9C', '#EFE8D6', 46), roughness: .3, metalness: .1, envMapIntensity: .8 })); ban.position.set(0, PH - 2.2, 5.9); g.add(ban);
    var gb = new THREE.Mesh(new THREE.BoxGeometry(PW - 1.2, .35, .45), plain(0xD8B24A, .3, .7, 1.2)); gb.position.set(0, PH - 3.2, 5.9); g.add(gb);
    [-1, 1].forEach(function(s){ var cc = new THREE.Mesh(new THREE.CylinderGeometry(.95, .95, PH - 2.5, 20), glaze(tileSet(C.blue, C.white, 1, 6))); cc.position.set(s * (PW / 2 + .15), (PH - 2.5) / 2, 4.9); g.add(cc); var pc = new THREE.Mesh(new THREE.ConeGeometry(.95, 1.8, 20), plain(0x1FA3A8, .3, .1, 1)); pc.position.set(s * (PW / 2 + .15), PH - 1.6, 4.9); g.add(pc); });
    // pishtoq tepasi
    var pcor = new THREE.Mesh(new THREE.BoxGeometry(PW + .8, 1.1, 5.4), plain(0xB08850, .8)); pcor.position.set(0, PH + .5, 2.5); g.add(pcor);
    var mh = o.mh || H + 12, mr = o.mr || 2.2;
    g.add(minaret(-W / 2 + 1.3, 1.6, mh, mr)); g.add(minaret(W / 2 - 1.3, 1.6, mh, mr));
    (o.domes || []).forEach(function(d){ var dm = dome(d.r, d.color || C.turq, d.h); dm.position.set(d.x, H + 1.7, -(d.z || D * .55)); g.add(dm); });
    var roof = new THREE.Mesh(new THREE.BoxGeometry(W - 1, .4, D - 1), plain(0x9E7A4C, .9)); roof.position.set(0, H + 1.8, -D / 2); g.add(roof);
    return g;
  }

  function tree(x, z, s){
    var g = new THREE.Group(), trunk = new THREE.Mesh(new THREE.CylinderGeometry(.35 * s, .5 * s, 5 * s, 8), plain(0x5a4026, 1)); trunk.position.y = 2.5 * s; g.add(trunk);
    var leaf = new THREE.MeshStandardMaterial({ color: 0x3E6B2E, roughness: .9, flatShading: true });
    for(var i = 0; i < 6; i++){ var b = new THREE.Mesh(new THREE.IcosahedronGeometry((2.4 - i * .12) * s, 1), leaf); b.position.set((rnd() - .5) * 2.2 * s, (6 + i * 1.1) * s, (rnd() - .5) * 2.2 * s); g.add(b); }
    g.position.set(x, 0, z); return g;
  }

  function buildRegistan(){
    var root = new THREE.Group();
    var paving = mk(256, 256, function(g, w, h){ g.fillStyle = '#C9B282'; g.fillRect(0, 0, w, h); for(var i = 0; i < 8; i++) for(var j = 0; j < 8; j++){ var v = rnd(); g.fillStyle = 'rgba(' + (v > .5 ? '255,235,190,' : '90,60,25,') + Math.abs(v - .5) * .35 + ')'; g.fillRect(i * 32 + 1, j * 32 + 1, 30, 30); } g.strokeStyle = 'rgba(80,55,25,.55)'; g.lineWidth = 2; for(var k = 0; k <= 8; k++){ g.beginPath(); g.moveTo(k * 32, 0); g.lineTo(k * 32, h); g.moveTo(0, k * 32); g.lineTo(w, k * 32); g.stroke(); } for(var n = 0; n < 900; n++){ g.fillStyle = 'rgba(70,45,15,' + rnd() * .08 + ')'; g.fillRect(rnd() * w, rnd() * h, 4, 4); } }, 34, 34);
    var plaza = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), new THREE.MeshStandardMaterial({ map: paving, roughness: .95, bumpMap: paving, bumpScale: .5 }));
    plaza.rotation.x = -Math.PI / 2; plaza.receiveShadow = true; root.add(plaza);
    var star = new THREE.Mesh(new THREE.CircleGeometry(10, 48), glaze(tileSet(C.blue, C.white, 5, 5))); star.rotation.x = -Math.PI / 2; star.position.y = .04; star.receiveShadow = true; root.add(star);
    var ring = new THREE.Mesh(new THREE.RingGeometry(10, 10.8, 48), plain(0xD8B24A, .4, .5, 1)); ring.rotation.x = -Math.PI / 2; ring.position.y = .05; root.add(ring);

    var ub = madrasa({ W: 56, D: 34, H: 15, pw: 20, ph: 27, floors: 2, mh: 31, mr: 2.3, domes: [{ x: -17, r: 5.5, color: C.turq }, { x: 17, r: 5.5, color: C.turq }] });
    ub.position.set(-44, 0, 0); ub.rotation.y = Math.PI / 2; root.add(ub);
    var sd = madrasa({ W: 56, D: 34, H: 15, pw: 20, ph: 27, floors: 2, mh: 31, mr: 2.3, domes: [{ x: -17, r: 6, color: C.turq }, { x: 17, r: 6, color: C.turq }] });
    sd.position.set(44, 0, 0); sd.rotation.y = -Math.PI / 2; root.add(sd);
    var tk = madrasa({ W: 70, D: 34, H: 14, pw: 22, ph: 24, floors: 1, mh: 26, mr: 2, domes: [{ x: 0, r: 8.5, color: C.blue, h: 9, z: 22 }] });
    tk.position.set(0, 0, -44); root.add(tk);

    // daraxtlar
    [[-30, 36], [30, 36], [-62, 22], [62, 22], [-62, -24], [62, -24], [-22, 54], [22, 54], [-50, 50], [50, 50]].forEach(function(p){ root.add(tree(p[0], p[1], .9 + rnd() * .5)); });
    // fonar ustunlari
    [-14, 14].forEach(function(x){ var l = new THREE.Mesh(new THREE.CylinderGeometry(.1, .14, 4.2, 10), plain(0x2B2B2B, .6, .6)); l.position.set(x, 2.1, 24); root.add(l); var lh = new THREE.Mesh(new THREE.SphereGeometry(.3, 12, 8), new THREE.MeshBasicMaterial({ color: 0xFFE6A8 })); lh.position.set(x, 4.3, 24); root.add(lh); });
    root.traverse(function(o){ if(o.isMesh && o !== plaza && o !== star){ o.castShadow = true; o.receiveShadow = true; } });
    return root;
  }

  window.RegistonMuseum = {
    build: buildRegistan,
    spots: [
      { id:'center', name:'Maydon markazi', pos:[0, 1.7, 30], yaw: 0,
        title:'Registon maydoni', text:"Samarqanddagi ansambl uch madrasadan iborat: g'arbda Ulug'bek, sharqda Sherdor, shimolda Tillakori. «Registon» — «qumli joy» ma'nosini anglatadi." },
      { id:'ub', name:"Ulug'bek madrasasi", pos:[-16, 1.7, 0], yaw: Math.PI / 2,
        title:"Ulug'bek madrasasi (1417–1420)", text:"Mirzo Ulug'bek davrida qurilgan: ansamblning eng qadimgi binosi, u yerda riyoziyot va falakiyot (astronomiya) o'qitilgan." },
      { id:'sd', name:'Sherdor madrasasi', pos:[16, 1.7, 0], yaw: -Math.PI / 2,
        title:'Sherdor madrasasi (1619–1636)', text:"Ulug'bek madrasasiga qarama-qarshi, uning nusxasi sifatida qurilgan; pishtoqdagi sher va quyosh tasviri bilan mashhur." },
      { id:'tk', name:'Tillakori madrasasi', pos:[0, 1.7, -16], yaw: 0,
        title:'Tillakori madrasasi (1646–1660)', text:"Oltin bilan bezatilgan, ham madrasa, ham jome masjidi vazifasini bajargan. Ichki gumbazi oltin naqshlari bilan mashhur." }
    ],
    note: "Bu 3D maket: nisbat va bezaklar taxminiy. Tarixiy ma'lumotlarni darslik bilan solishtiring."
  };
})();

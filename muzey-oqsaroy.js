// Oqsaroy (Shahrisabz) — Klavixo, Archnet, Wikipedia asosida.
(function(){
  var K = window.MuzeyKit, C = K.C, rnd = K.rnd, mk = K.mk, plain = K.plain;
  var Zp = 110;
  var ochre = '#C8A25A', gold = '#D9B24C', dblue = '#1E4F9C', lblue = '#4FB3C8';
  var ruin = null, recon = null, hallLight = null;

  function tex(rx, ry, main){
    main = main || ochre; var N = 512;
    function star(c, cx, cy, R, n, col){
      c.fillStyle = col; c.beginPath();
      for(var k = 0; k < n * 2; k++){ var a = k * Math.PI / n - Math.PI / 2, r = k % 2 ? R * .38 : R; c[k ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
      c.closePath(); c.fill();
    }
    function d(c, w, h, bump){
      c.fillStyle = bump ? '#787878' : main; c.fillRect(0, 0, w, h);
      var cell = w / 4;
      for(var i = 0; i < 4; i++) for(var j = 0; j < 4; j++){
        var cx = i * cell + cell / 2, cy = j * cell + cell / 2;
        c.fillStyle = bump ? '#404040' : dblue;
        c.beginPath(); c.moveTo(cx, cy - cell * .48); c.lineTo(cx + cell * .48, cy); c.lineTo(cx, cy + cell * .48); c.lineTo(cx - cell * .48, cy); c.closePath(); c.fill();
        c.fillStyle = bump ? '#a0a0a0' : lblue; c.beginPath();
        for(var k = 0; k < 8; k++){ var a = k * Math.PI / 4 + Math.PI / 8, r = cell * .28; c[k ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
        c.closePath(); c.fill();
        star(c, cx, cy, cell * .2, 8, bump ? '#606060' : main);
        c.fillStyle = bump ? '#303030' : dblue; c.beginPath(); c.arc(cx, cy, cell * .05, 0, 6.2832); c.fill();
        for(var q = 0; q < 4; q++){ var a = q * Math.PI / 2 + Math.PI / 4; star(c, cx + Math.cos(a) * cell * .42, cy + Math.sin(a) * cell * .42, cell * .09, 8, bump ? '#555' : (q % 2 ? gold : dblue)); }
      }
      c.strokeStyle = bump ? '#2a2a2a' : 'rgba(255,255,255,.25)'; c.lineWidth = 2;
      for(var g = 0; g <= 4; g++){ c.beginPath(); c.moveTo(g * cell, 0); c.lineTo(g * cell, h); c.stroke(); c.beginPath(); c.moveTo(0, g * cell); c.lineTo(w, g * cell); c.stroke(); }
      if(!bump) for(var m = 0; m < 1800; m++){ c.fillStyle = 'rgba(' + (rnd() > .55 ? '255,245,210' : '40,30,15') + ',' + (rnd() * .07) + ')'; c.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2); }
    }
    return { map: mk(N, N, function(c, w, h){ d(c, w, h, false); }, rx, ry), bump: mk(N, N, function(c, w, h){ d(c, w, h, true); }, rx, ry, false) };
  }
  function zig(rx, ry){
    var N = 512;
    function d(c, w, h, bump){
      c.fillStyle = bump ? '#707070' : dblue; c.fillRect(0, 0, w, h);
      var rows = 14, rh = h / rows;
      for(var r = 0; r < rows; r++){
        var isGold = r % 2 === 0;
        c.fillStyle = bump ? (isGold ? '#c8c8c8' : '#404040') : (isGold ? ochre : lblue);
        c.beginPath();
        for(var x = 0; x <= w; x += w / 12){ var yy = r * rh + rh / 2 + ((Math.round(x / (w / 12)) % 2) ? -rh * .32 : rh * .32); if(x === 0) c.moveTo(x, yy); else c.lineTo(x, yy); }
        c.lineTo(w, (r + 1) * rh); c.lineTo(0, (r + 1) * rh); c.closePath(); c.fill();
        c.strokeStyle = bump ? '#222' : (isGold ? dblue : gold); c.lineWidth = Math.max(2, rh * .12); c.beginPath();
        for(var x2 = 0; x2 <= w; x2 += w / 12){ var yy2 = r * rh + rh / 2 + ((Math.round(x2 / (w / 12)) % 2) ? -rh * .32 : rh * .32); if(x2 === 0) c.moveTo(x2, yy2); else c.lineTo(x2, yy2); }
        c.stroke();
      }
      if(!bump) for(var m = 0; m < 600; m++){ c.fillStyle = 'rgba(255,255,255,' + rnd() * .06 + ')'; c.fillRect(rnd() * w, rnd() * h, 2, 2); }
    }
    return { map: mk(N, N, function(c, w, h){ d(c, w, h, false); }, rx, ry), bump: mk(N, N, function(c, w, h){ d(c, w, h, true); }, rx, ry, false) };
  }
  function glz(set, b){ return new THREE.MeshStandardMaterial({ map: set.map, bumpMap: set.bump, bumpScale: b || 1.1, roughness: .28, metalness: .08, envMapIntensity: 1.05, side: THREE.DoubleSide }); }
  function brick(rx, ry){ var b = K.brickSet('#B9915A', '#8F6B3A', rx, ry); return new THREE.MeshStandardMaterial({ map: b.map, bumpMap: b.bump, bumpScale: 1.6, roughness: .92 }); }
  function flag(rx, ry){
    return mk(256, 256, function(g, w, h){ g.fillStyle = '#E4DED0'; g.fillRect(0, 0, w, h); for(var i = 0; i < 8; i++) for(var j = 0; j < 8; j++){ var v = rnd(); g.fillStyle = 'rgba(' + (v > .5 ? '255,255,250,' : '90,80,60,') + Math.abs(v - .5) * .25 + ')'; g.fillRect(i * 32 + 1, j * 32 + 1, 30, 30); } }, rx, ry);
  }
  function sunTex(){
    return mk(256, 256, function(c, w, h){
      c.clearRect(0, 0, w, h); var cx = w / 2, cy = h / 2;
      c.fillStyle = '#D9B24C'; for(var i = 0; i < 24; i++){ var a = i / 24 * 6.2832; c.beginPath(); c.moveTo(cx + Math.cos(a - .09) * 92, cy + Math.sin(a - .09) * 92); c.lineTo(cx + Math.cos(a) * 124, cy + Math.sin(a) * 124); c.lineTo(cx + Math.cos(a + .09) * 92, cy + Math.sin(a + .09) * 92); c.fill(); }
      c.beginPath(); c.arc(cx, cy, 88, 0, 6.2832); c.fillStyle = '#E8C65A'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#8A6A1E'; c.stroke();
      c.fillStyle = '#6B4B14'; c.beginPath(); c.moveTo(70, 160); c.lineTo(72, 118); c.quadraticCurveTo(90, 96, 126, 104); c.lineTo(150, 96); c.quadraticCurveTo(176, 84, 186, 104); c.lineTo(176, 120); c.lineTo(184, 160); c.lineTo(170, 160); c.lineTo(164, 132); c.lineTo(100, 134); c.lineTo(92, 160); c.closePath(); c.fill();
      c.beginPath(); c.arc(178, 100, 14, 0, 6.2832); c.fill(); c.lineWidth = 6; c.strokeStyle = '#6B4B14'; c.beginPath(); c.moveTo(72, 120); c.quadraticCurveTo(46, 110, 54, 84); c.stroke();
    }, 1, 1);
  }
  var sunMat = null;
  function sunPlaque(r){ if(!sunMat) sunMat = new THREE.MeshStandardMaterial({ map: sunTex(), transparent: true, alphaTest: .3, side: THREE.DoubleSide, roughness: .4, metalness: .3 }); return new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), sunMat); }

  function screen(totalW, H, openW, openH, depth, front, side){
    var sh = new THREE.Shape(); sh.moveTo(-totalW / 2, 0); sh.lineTo(totalW / 2, 0); sh.lineTo(totalW / 2, H); sh.lineTo(-totalW / 2, H); sh.lineTo(-totalW / 2, 0);
    var hole = new THREE.Path(), r = openW / 2; hole.moveTo(-r, 0); hole.lineTo(-r, openH - r); hole.absarc(0, openH - r, r, Math.PI, 0, true); hole.lineTo(r, 0); hole.lineTo(-r, 0); sh.holes.push(hole);
    return new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: depth, bevelEnabled: false, curveSegments: 28 }), [front, side]);
  }
  function arcade(L, H, bay, depth){
    var sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(L, 0); sh.lineTo(L, H); sh.lineTo(0, H); sh.lineTo(0, 0);
    var n = Math.floor(L / bay), aw = bay * .68;
    var ah1 = H * .42, r1 = aw / 2;
    for(var i = 0; i < n; i++){ var cx = (i + .5) * bay, p = new THREE.Path(); p.moveTo(cx - r1, 0); p.lineTo(cx - r1, ah1 - r1); p.absarc(cx, ah1 - r1, r1, Math.PI, 0, true); p.lineTo(cx + r1, 0); p.lineTo(cx - r1, 0); sh.holes.push(p); }
    var base2 = H * .52, ah2 = H * .38, r2 = aw * .42;
    for(var i = 0; i < n; i++){ var cx = (i + .5) * bay, p = new THREE.Path(); p.moveTo(cx - r2, base2); p.lineTo(cx - r2, base2 + ah2 - r2); p.absarc(cx, base2 + ah2 - r2, r2, Math.PI, 0, true); p.lineTo(cx + r2, base2); p.lineTo(cx - r2, base2); sh.holes.push(p); }
    var g = new THREE.ExtrudeGeometry(sh, { depth: depth, bevelEnabled: false, curveSegments: 10 });
    var mesh = new THREE.Mesh(g, [glz(tex(1 / 4, 1 / 3)), brick(1 / 6, 1 / 5)]);
    var band = new THREE.Mesh(new THREE.BoxGeometry(L, .55, depth + .3), plain(0xD4C49A, .55)); band.position.set(L / 2, H * .48, depth / 2); mesh.add(band);
    return mesh;
  }

  function pylon(x, z){
    var g = new THREE.Group(), W = 17, H = 38, D = 13;
    var face = glz(tex(2, 4), 1.2), side = brick(2, 5);
    var box = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), [side, side, side, side, face, brick(3, 5)]); box.position.y = H / 2; g.add(box);
    for(var i = 0; i < 9; i++){ var w = 1.6 + rnd() * 1.6, h = .8 + rnd() * 3.2, d = D * (.45 + rnd() * .5); var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), i % 3 ? brick(1, 1) : glz(tex(1, 1))); m.position.set(-W / 2 + w / 2 + i * (W - 1.6) / 8.2, H + h / 2, (rnd() - .5) * 2); g.add(m); }
    g.position.set(x, 0, z); return g;
  }

  function build(){
    var root = new THREE.Group();
    var grass = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ color: 0x4F7F2E, roughness: 1, envMapIntensity: .3 })); grass.rotation.x = -Math.PI / 2; grass.receiveShadow = true; root.add(grass);
    var stone = flag(6, 14);
    var path = new THREE.Mesh(new THREE.PlaneGeometry(26, 260), new THREE.MeshStandardMaterial({ map: stone, roughness: .95 })); path.rotation.x = -Math.PI / 2; path.position.set(0, .03, Zp + 120); path.receiveShadow = true; root.add(path);

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
    var fnd = brick(8, 1);
    [[-60, Zp - 50 - 125, .8, 250], [60, Zp - 50 - 125, .8, 250], [0, Zp - 300, 120, .8]].forEach(function(w){ var m = new THREE.Mesh(new THREE.BoxGeometry(w[2], .9, w[3]), fnd); m.position.set(w[0], .45, w[1]); ruin.add(m); });
    for(var i = 0; i < 16; i++){ var sd = i % 2 ? 1 : -1; ruin.add(K.tree(sd * (24 + rnd() * 4), Zp + 100 - Math.floor(i / 2) * 15, .9 + rnd() * .4)); }
    [[-60, Zp + 30], [60, Zp + 30], [-90, Zp + 70], [90, Zp + 70], [-80, Zp - 30], [80, Zp - 30]].forEach(function(p){ ruin.add(K.tree(p[0], p[1], 1.1 + rnd() * .4)); });
    root.add(ruin);

    recon = new THREE.Group();
    var T = tex(1 / 4, 1 / 4), TG = tex(1 / 4, 1 / 4, gold);
    var scr = screen(56, 56, 22, 46, 14, glz(T), brick(1 / 8, 1 / 8)); scr.position.set(0, 0, Zp - 14); recon.add(scr);
    var band = new THREE.Mesh(new THREE.PlaneGeometry(50, 2.2), new THREE.MeshStandardMaterial({ map: mk(512, 32, function(c, w, h){ c.fillStyle = dblue; c.fillRect(0, 0, w, h); c.fillStyle = '#EDE6D2'; for(var i = 0; i < 64; i++){ var x = i * 8 + 1; c.fillRect(x, 6, 3, 20); if(i % 2) c.fillRect(x, 6, 6, 4); else c.fillRect(x, 22, 6, 4); } }, 1, 1), roughness: .4 })); band.position.set(0, 50.5, Zp + .06); recon.add(band);
    [-1, 1].forEach(function(s){
      var tw = new THREE.Group();
      var body = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.8, 65, 36), glz(zig(4, 8), 1.3)); body.position.y = 32.5; tw.add(body);
      var ring = new THREE.Mesh(new THREE.CylinderGeometry(6.4, 6.4, 1.6, 36), plain(0x2c3e5f, .5)); ring.position.y = 64; tw.add(ring);
      var top = new THREE.Mesh(new THREE.CylinderGeometry(5.6, 5.6, 3, 36, 1, true), glz(tex(1 / 2, 1 / 2))); top.position.y = 66; tw.add(top);
      var base = new THREE.Mesh(new THREE.CylinderGeometry(6.6, 6.6, 3, 36), brick(4, 1)); base.position.y = 1.5; tw.add(base);
      tw.position.set(s * 28, 0, Zp - 9); recon.add(tw);
    });
    var vault = new THREE.Mesh(new THREE.CylinderGeometry(11, 11, 22, 40, 1, true, Math.PI / 2, Math.PI), glz(tex(1 / 4, 1 / 4, '#B8923F'))); vault.rotation.x = Math.PI / 2; vault.position.set(0, 35, Zp - 25); recon.add(vault);
    [-1, 1].forEach(function(s){
      var w = new THREE.Mesh(new THREE.BoxGeometry(6, 35, 22), brick(1, 3)); w.position.set(s * 14, 17.5, Zp - 25); recon.add(w);
      for(var k = 0; k < 3; k++){ var niche = new THREE.Mesh(new THREE.ShapeGeometry((function(){ var sh = new THREE.Shape(), r = 2.2; sh.moveTo(-r, 0); sh.lineTo(r, 0); sh.lineTo(r, 6); sh.absarc(0, 6, r, 0, Math.PI, false); sh.lineTo(-r, 0); return sh; })(), 16), glz(tex(1 / 3, 1 / 3))); niche.position.set(s * 10.95, .1, Zp - 18 - k * 7); niche.rotation.y = -s * Math.PI / 2; recon.add(niche); }
    });
    var scr2 = screen(30, 26, 13, 21, 6, glz(T), brick(1 / 8, 1 / 8)); scr2.position.set(0, 0, Zp - 40); recon.add(scr2);
    [-1, 1].forEach(function(s){ var w = new THREE.Mesh(new THREE.BoxGeometry(8, 16, 12), brick(1, 2)); w.position.set(s * 10.5, 8, Zp - 44); recon.add(w); });
    var pf = new THREE.Mesh(new THREE.PlaneGeometry(22, 52), new THREE.MeshStandardMaterial({ map: K.tileSet(C.blue, C.white, 4, 9).map, roughness: .35, envMapIntensity: .8 })); pf.rotation.x = -Math.PI / 2; pf.position.set(0, .06, Zp - 24); recon.add(pf);
    var z0 = Zp - 50, L = 250, zc = z0 - L / 2;
    var court = new THREE.Mesh(new THREE.PlaneGeometry(120, L), new THREE.MeshStandardMaterial({ map: flag(10, 20), roughness: .9 })); court.rotation.x = -Math.PI / 2; court.position.set(0, .05, zc); court.receiveShadow = true; recon.add(court);
    // Asosiy hovuz — yer sathida, KO'K SUV
    (function(){
      var pw = 36, pd = 72, wallH = 1.15, waterY = .42;
      var stoneRim = plain(0xE8E2D4, .55, .15, .4);
      [[0, (pd + 2.4) / 2, pw + 2.4, 1.2], [0, -(pd + 2.4) / 2, pw + 2.4, 1.2], [(pw + 2.4) / 2, 0, 1.2, pd], [-(pw + 2.4) / 2, 0, 1.2, pd]].forEach(function(w){
        var m = new THREE.Mesh(new THREE.BoxGeometry(w[2], wallH, w[3]), stoneRim); m.position.set(w[0], wallH / 2, zc + w[1]); recon.add(m);
      });
      var inner = new THREE.Mesh(new THREE.BoxGeometry(pw + .4, .45, pd + .4), plain(0xD4CFC0, .5)); inner.position.set(0, .22, zc); recon.add(inner);
      var depth = new THREE.Mesh(new THREE.PlaneGeometry(pw - .8, pd - .8), new THREE.MeshStandardMaterial({ color: 0x0B3D5C, roughness: .95 })); depth.rotation.x = -Math.PI / 2; depth.position.set(0, .08, zc); recon.add(depth);
      var waterMat = new THREE.MeshStandardMaterial({ color: 0x1E90FF, roughness: .05, metalness: .45, envMapIntensity: 2.0, transparent: true, opacity: .95 });
      var water = new THREE.Mesh(new THREE.PlaneGeometry(pw - .5, pd - .5), waterMat); water.rotation.x = -Math.PI / 2; water.position.set(0, waterY, zc); recon.add(water);
      var shine = new THREE.Mesh(new THREE.PlaneGeometry(pw - 1.2, pd - 1.2), new THREE.MeshBasicMaterial({ color: 0x87CEEB, transparent: true, opacity: .25 })); shine.rotation.x = -Math.PI / 2; shine.position.set(0, waterY + .03, zc); recon.add(shine);
      var fbase = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, .8, 24), plain(0xE4DED0, .5)); fbase.position.set(0, .5, zc); recon.add(fbase);
      var fcol = new THREE.Mesh(new THREE.CylinderGeometry(.45, .55, 2.4, 16), plain(0xC9B896, .4, .2)); fcol.position.set(0, 1.9, zc); recon.add(fcol);
      var fbowl = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.2, .5, 24), plain(0xE8E2D4, .45)); fbowl.position.set(0, 3.2, zc); recon.add(fbowl);
      var fwater = new THREE.Mesh(new THREE.CircleGeometry(1.3, 24), new THREE.MeshStandardMaterial({ color: 0x1E90FF, roughness: .06, metalness: .4, envMapIntensity: 1.8, transparent: true, opacity: .95 })); fwater.rotation.x = -Math.PI / 2; fwater.position.set(0, 3.4, zc); recon.add(fwater);
    })();
    [-1, 1].forEach(function(s){
      var a = arcade(L, 18, 5, 8); a.rotation.y = s > 0 ? Math.PI / 2 : -Math.PI / 2; a.position.set(s * 60, 0, s > 0 ? z0 : z0 - L); recon.add(a);
      var back = new THREE.Mesh(new THREE.BoxGeometry(5, 20, L), brick(1, 1)); back.position.set(s * 65.5, 10, zc); recon.add(back);
      for(var i = 0; i < 12; i++){ var p = sunPlaque(1.5); p.position.set(s * 59.9, 18.8, z0 - 10 - i * 20.5); p.rotation.y = -s * Math.PI / 2; recon.add(p); }
    });
    [-14, 14].forEach(function(x0){ var a = arcade(46, 18, 5, 7); a.position.set(x0 > 0 ? 14 : -60, 0, z0); recon.add(a); });
    var zs = z0 - L;
    [-1, 1].forEach(function(s){ var a = arcade(45, 18, 5, 7); a.position.set(s > 0 ? 15 : -60, 0, zs); recon.add(a); });
    var gate = screen(30, 34, 12, 24, 12, glz(TG), brick(1 / 8, 1 / 8)); gate.position.set(0, 0, zs - 12); recon.add(gate);
    var gp = sunPlaque(3.2); gp.position.set(0, 29.5, zs + .08); recon.add(gp);
    var hp = sunPlaque(1.9); hp.position.set(0, 53.6, Zp + .12); recon.add(hp);
    var hz = zs - 12 - 15;
    var hallWall = glz(tex(3, 3, gold), 1.2);
    var floor = new THREE.MeshStandardMaterial({ map: K.tileSet(C.blue, C.white, 6, 6).map, roughness: .3, metalness: .05, envMapIntensity: .8 });
    var ceil = new THREE.MeshStandardMaterial({ color: 0xC9A23E, roughness: .35, metalness: .5, envMapIntensity: 1 });
    var ghost = new THREE.MeshBasicMaterial({ visible: false });
    var inner = new THREE.Mesh(new THREE.BoxGeometry(30, 20, 30), [hallWall, hallWall, ceil, floor, ghost, hallWall]); inner.material.forEach(function(m){ m.side = THREE.BackSide; }); inner.position.set(0, 10, hz); recon.add(inner);
    var outer = new THREE.Mesh(new THREE.BoxGeometry(31.4, 20.8, 31.4), [brick(1, 1), brick(1, 1), brick(1, 1), brick(1, 1), ghost, brick(1, 1)]); outer.position.set(0, 10.2, hz); recon.add(outer);
    hallLight = new THREE.PointLight(0xFFE2A8, 1.4, 60); hallLight.position.set(0, 14, hz); recon.add(hallLight);
    [-1, 1].forEach(function(s){
      var lawn = new THREE.Mesh(new THREE.PlaneGeometry(60, 130), new THREE.MeshStandardMaterial({ color: 0x5E9438, roughness: 1, envMapIntensity: .3 })); lawn.rotation.x = -Math.PI / 2; lawn.position.set(s * 95, .03, zs - 40); recon.add(lawn);
      (function(sx){
        var tw = 12, td = 12, rim = plain(0xE4DED0, .55);
        [[0, (td+1.6)/2, tw+1.6, .8], [0, -(td+1.6)/2, tw+1.6, .8], [(tw+1.6)/2, 0, .8, td], [-(tw+1.6)/2, 0, .8, td]].forEach(function(w){
          var m = new THREE.Mesh(new THREE.BoxGeometry(w[2], .9, w[3]), rim); m.position.set(sx * 95 + w[0], .45, zs - 40 + w[1]); recon.add(m);
        });
        var wm = new THREE.MeshStandardMaterial({ color: 0x1E90FF, roughness: .06, metalness: .4, envMapIntensity: 1.8, transparent: true, opacity: .95 });
        var wt = new THREE.Mesh(new THREE.PlaneGeometry(tw - .4, td - .4), wm); wt.rotation.x = -Math.PI / 2; wt.position.set(sx * 95, .35, zs - 40); recon.add(wt);
      })(s);
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
        text: "Amir Temur o'z vatani Kesh (Shahrisabz)da 1380-yilda qurdirishni boshlagan, qurilish 1404-yilgacha davom etgan. XVI asrda saroy buzilgan. " + ruinTexts },
      { id: 'statue', mode: 'ruin', name: 'Haykal', pos: [10, 1.7, Zp + 62], yaw: Math.PI / 4 * .55, title: 'Amir Temur haykali',
        text: "Saroyning asl joyida Amir Temur haykali o'rnatilgan." },
      { id: 'rfront', mode: 'recon', name: 'Tiklangan: old', pos: [0, 1.7, Zp + 112], yaw: 0, title: 'Tiklangan portal',
        text: "Portal shimolga qaragan. Minoralar 60–70 m (Archnet). Maketda 65 m." },
      { id: 'riwan', mode: 'recon', name: 'Birinchi ayvon', pos: [0, 1.7, Zp + 6], yaw: 0, title: 'Birinchi ayvon (22 m)',
        text: "Ayvon kengligi 22 m. Klavixo: uzun kirish yo'lagi va yon xonalar." },
      { id: 'rpass', mode: 'recon', name: "Kirish yo'lagi", pos: [0, 1.7, Zp - 30], yaw: Math.PI / 2, title: "Kirish yo'lagi",
        text: "Klavixo: yo'lak yonida kichik xonalar, poli ko'k koshin." },
      { id: 'rcourt', mode: 'recon', name: 'Hovli', pos: [0, 1.7, Zp - 56], yaw: 0, title: 'Asosiy hovli',
        text: "Klavixo: oq tosh plitali hovli, o'rtasida katta hovuz. Atrof 2 qavatli arkadalar (~120×250 m)." },
      { id: 'rpool', mode: 'recon', name: 'Havza', pos: [0, 1.7, -40], yaw: Math.PI, title: 'Asosiy hovuz',
        text: "Klavixo: hovli o'rtasida (yer sathida) katta hovuz — 2-qavatda emas. Ko'k suv, favvora." },
      { id: 'rgate', mode: 'recon', name: 'Asosiy darvoza', pos: [0, 1.7, -120], yaw: 0, title: 'Asosiy darvoza',
        text: "Klavixo: oltin va ko'k koshinli darvoza; tepasida Sher va Quyosh." },
      { id: 'rhall', mode: 'recon', name: 'Qabul zali', pos: [0, 1.7, -196], yaw: 0, title: 'Kvadrat zal',
        text: "Klavixo: oltin va ko'k koshinli zal, oltin shift." },
      { id: 'rgarden', mode: 'recon', name: "Bog'", pos: [-80, 1.7, -170], yaw: Math.PI / 2 * -1 + Math.PI, title: "Saroy bog'i",
        text: "Klavixo: bog' — mevali daraxtlar va suv havzalari (yer sathida)." }
    ],
    note: "Manbalar: Klavixo (1404), Archnet, Wikipedia. Asosiy hovuz hovlida, ko'k suv bilan."
  };
})();

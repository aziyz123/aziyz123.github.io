// Registon ansambli — soddalashtirilgan 3D maket (kod bilan yasalgan, tashqi model yo'q).
// Nisbatlar taxminiy: aniq arxitektura chizmasi emas, ko'rgazmali sxema.
(function(){
  var C = { brick:'#C9A66B', brick2:'#B88F52', turq:'#1FA3A8', blue:'#1E4F9C', navy:'#13294F', gold:'#D8B24A', sand:'#D9C79E', white:'#EFE8D6' };

  function tex(w, h, draw, rx, ry){
    var c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx || 1, ry || 1);
    t.anisotropy = 4; return t;
  }
  function brickTex(base, line, rx, ry){
    return tex(256, 256, function(g, w, h){
      g.fillStyle = base; g.fillRect(0, 0, w, h); g.strokeStyle = line; g.lineWidth = 2;
      for(var y = 0; y < h; y += 16){ g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); var off = (y / 16) % 2 ? 0 : 16; for(var x = off; x < w; x += 32){ g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 16); g.stroke(); } }
      for(var i = 0; i < 900; i++){ g.fillStyle = 'rgba(80,50,20,' + (Math.random() * .06) + ')'; g.fillRect(Math.random() * w, Math.random() * h, 4, 3); }
    }, rx, ry);
  }
  function tileTex(c1, c2, rx, ry){
    // Geometrik naqsh (sakkizburchakli yulduz) — ko'k/feruza koshin
    return tex(256, 256, function(g, w, h){
      g.fillStyle = c1; g.fillRect(0, 0, w, h);
      g.strokeStyle = c2; g.lineWidth = 3;
      for(var gx = 0; gx < 2; gx++) for(var gy = 0; gy < 2; gy++){
        var cx = gx * 128 + 64, cy = gy * 128 + 64;
        g.beginPath(); for(var k = 0; k < 16; k++){ var a = k * Math.PI / 8, r = k % 2 ? 24 : 52; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath(); g.stroke();
        g.fillStyle = 'rgba(216,178,74,.85)'; g.beginPath(); g.arc(cx, cy, 8, 0, 6.28); g.fill();
      }
      g.strokeStyle = 'rgba(255,255,255,.5)'; g.strokeRect(2, 2, w - 4, h - 4);
    }, rx, ry);
  }
  function stripeTex(c1, c2, n){
    return tex(256, 64, function(g, w, h){ for(var i = 0; i < n; i++){ g.fillStyle = i % 2 ? c1 : c2; g.fillRect(i * w / n, 0, w / n + 1, h); } }, 1, 1);
  }
  function std(map, color, rough){ return new THREE.MeshStandardMaterial({ map: map || null, color: color || 0xffffff, roughness: rough == null ? .85 : rough, metalness: .02 }); }

  // Yoyli (pishtoq) shakl: to'rtburchak + yarim doira
  function archShape(w, h){
    var s = new THREE.Shape(), r = w / 2;
    s.moveTo(-r, 0); s.lineTo(r, 0); s.lineTo(r, h - r); s.absarc(0, h - r, r, 0, Math.PI, false); s.lineTo(-r, 0);
    return s;
  }
  function archMesh(w, h, mat){ return new THREE.Mesh(new THREE.ShapeGeometry(archShape(w, h), 16), mat); }

  // Minora
  function minaret(x, z, hgt, rad){
    var g = new THREE.Group();
    var body = new THREE.Mesh(new THREE.CylinderGeometry(rad * .88, rad, hgt, 24, 1), std(brickTex(C.brick, C.brick2, 3, hgt / 5)));
    body.position.y = hgt / 2; g.add(body);
    var band = new THREE.Mesh(new THREE.CylinderGeometry(rad * .9, rad * .9, 1.4, 24), std(tileTex(C.blue, C.white, 4, 1)));
    band.position.y = hgt * .72; g.add(band);
    var band2 = band.clone(); band2.position.y = hgt * .38; g.add(band2);
    var top = new THREE.Mesh(new THREE.CylinderGeometry(rad * 1.15, rad * .9, 2.6, 24), std(tileTex(C.turq, C.white, 4, 1)));
    top.position.y = hgt + 1.3; g.add(top);
    var cap = new THREE.Mesh(new THREE.SphereGeometry(rad * 1.15, 24, 12, 0, 6.28, 0, 1.57), std(null, 0x1FA3A8, .4));
    cap.position.y = hgt + 2.6; g.add(cap);
    var tip = new THREE.Mesh(new THREE.ConeGeometry(.18, 1.6, 8), std(null, 0xD8B24A, .3)); tip.position.y = hgt + 2.6 + rad * 1.15 + .6; g.add(tip);
    var base = new THREE.Mesh(new THREE.CylinderGeometry(rad * 1.12, rad * 1.18, 3, 24), std(brickTex(C.brick2, C.brick, 3, 1)));
    base.position.y = 1.5; g.add(base);
    g.position.set(x, 0, z); return g;
  }

  // Qovurg'ali gumbaz
  function dome(r, color, h){
    var g = new THREE.Group();
    var rib = tex(256, 128, function(c, w, hh){ c.fillStyle = color; c.fillRect(0, 0, w, hh); for(var i = 0; i < 24; i++){ c.fillStyle = 'rgba(0,20,60,.35)'; c.fillRect(i * w / 24, 0, 5, hh); } var gr = c.createLinearGradient(0, 0, 0, hh); gr.addColorStop(0, 'rgba(255,255,255,.12)'); gr.addColorStop(1, 'rgba(0,0,0,.1)'); c.fillStyle = gr; c.fillRect(0, 0, w, hh); }, 1, 1);
    var drum = new THREE.Mesh(new THREE.CylinderGeometry(r * .82, r * .85, h || r * .9, 32), std(tileTex(C.blue, C.white, 6, 1)));
    drum.position.y = (h || r * .9) / 2; g.add(drum);
    var d = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20, 0, 6.28, 0, Math.PI * .62), std(rib, 0xffffff, .35));
    d.scale.y = 1.25; d.position.y = (h || r * .9) - r * .1; g.add(d);
    var tip = new THREE.Mesh(new THREE.ConeGeometry(.25, 2.4, 8), std(null, 0xD8B24A, .3)); tip.position.y = (h || r * .9) + r * 1.15; g.add(tip);
    return g;
  }

  // Madrasa: old tomoni +z ga qaragan, jabha z=0 tekisligida
  function madrasa(o){
    var g = new THREE.Group(), W = o.W, D = o.D, H = o.H, PW = o.pw, PH = o.ph, depth = D;
    var wall = std(brickTex(C.brick, C.brick2, W / 8, H / 8));
    var body = new THREE.Mesh(new THREE.BoxGeometry(W, H, depth), wall); body.position.set(0, H / 2, -depth / 2); g.add(body);
    // ichki hovli devori
    var cor = new THREE.Mesh(new THREE.BoxGeometry(W * .98, H * .9, depth * .98), std(brickTex(C.brick2, C.brick, 6, 2))); cor.position.set(0, H * .45, -depth / 2); // ko'rinmaydi, chuqurlik uchun
    // bezak belbog'lari
    var belt = new THREE.Mesh(new THREE.BoxGeometry(W + .3, 1.1, depth + .3), std(tileTex(C.turq, C.white, W / 3, 1))); belt.position.set(0, H + .55, -depth / 2); g.add(belt);
    var cornice = new THREE.Mesh(new THREE.BoxGeometry(W + .6, .5, depth + .6), std(null, 0xB88F52)); cornice.position.set(0, H + 1.35, -depth / 2); g.add(cornice);
    // yon qanotlardagi hujralar (ikki qavat tokchalar)
    var niche = new THREE.MeshBasicMaterial({ color: 0x1B2B4A });
    var nicheFrame = new THREE.MeshBasicMaterial({ color: 0xD9C79E });
    var bay = o.bay || 4.2, nw = bay * .55, rows = o.floors === 1 ? [1.2] : [1.2, H * .52];
    var ph2 = PW / 2 + 1;
    for(var side = -1; side <= 1; side += 2){
      var from = ph2 + bay * .6, to = W / 2 - 3.2, x;
      for(x = from; x < to; x += bay){
        rows.forEach(function(ry){
          var nh = (o.floors === 1 ? H * .75 : H * .4);
          var fr = archMesh(nw + .6, nh + .5, nicheFrame); fr.position.set(side * x, ry - .25, .02); g.add(fr);
          var n = archMesh(nw, nh, niche); n.position.set(side * x, ry, .05); g.add(n);
        });
      }
    }
    // pishtoq
    var px = new THREE.Mesh(new THREE.BoxGeometry(PW, PH, 4.5), wall); px.position.set(0, PH / 2, 2.25); g.add(px);
    var frame = archMesh(PW - 1.6, PH - 1.2, std(tileTex(C.blue, C.white, 3, 4), 0xffffff)); frame.position.set(0, 0, 4.52); g.add(frame);
    var frame2 = archMesh(PW - 4.4, PH - 5.2, std(tileTex(C.turq, C.gold, 2, 3), 0xffffff)); frame2.position.set(0, 0, 4.55); g.add(frame2);
    var door = archMesh(PW * .36, PH * .42, new THREE.MeshBasicMaterial({ color: 0x0F1E3A })); door.position.set(0, 0, 4.6); g.add(door);
    var doorFr = archMesh(PW * .36 + 1.2, PH * .42 + .8, std(tileTex(C.turq, C.white, 2, 2))); doorFr.position.set(0, 0, 4.57); g.add(doorFr);
    // pishtoq usti sirli yozuv bandi
    var ban = new THREE.Mesh(new THREE.BoxGeometry(PW - 1, 1.6, .3), std(stripeTex('#1E4F9C', '#EFE8D6', 40))); ban.position.set(0, PH * .72, 4.6); g.add(ban);
    // pishtoq yon minoralari (ustunchalar)
    [-1, 1].forEach(function(s){ var cc = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, PH - 2, 16), std(tileTex(C.blue, C.white, 1, 6))); cc.position.set(s * (PW / 2 + .2), (PH - 2) / 2, 4.5); g.add(cc); });
    // burchak minoralari
    var mh = o.mh || H + 12, mr = o.mr || 2.2;
    g.add(minaret(-W / 2 + 1.2, 1.5, mh, mr)); g.add(minaret(W / 2 - 1.2, 1.5, mh, mr));
    // gumbazlar (jabha ortida)
    (o.domes || []).forEach(function(d){ var dm = dome(d.r, d.color || C.turq, d.h); dm.position.set(d.x, H + 1.6, -(d.z || depth * .55)); g.add(dm); });
    // tomi
    var roof = new THREE.Mesh(new THREE.BoxGeometry(W - 1, .4, depth - 1), std(null, 0xA9855A)); roof.position.set(0, H + 1.7, -depth / 2); g.add(roof);
    return g;
  }

  function buildRegistan(){
    var root = new THREE.Group();
    // yer: maydon plitkalari + atrofi
    var plaza = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), std(tex(256, 256, function(g, w, h){ g.fillStyle = '#B79F6C'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(120,90,40,.35)'; g.lineWidth = 2; for(var i = 0; i <= 8; i++){ g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, h); g.moveTo(0, i * 32); g.lineTo(w, i * 32); g.stroke(); } for(var k = 0; k < 600; k++){ g.fillStyle = 'rgba(90,60,20,' + Math.random() * .07 + ')'; g.fillRect(Math.random() * w, Math.random() * h, 5, 4); } }, 30, 30)));
    plaza.rotation.x = -Math.PI / 2; root.add(plaza);
    // markaz naqshi
    var star = new THREE.Mesh(new THREE.CircleGeometry(9, 32), std(tileTex(C.blue, C.white, 4, 4), 0xffffff)); star.rotation.x = -Math.PI / 2; star.position.y = .03; root.add(star);

    // Ulug'bek madrasasi (g'arbda, jabha sharqqa)
    var ub = madrasa({ W: 56, D: 34, H: 15, pw: 20, ph: 27, floors: 2, mh: 31, mr: 2.3, domes: [{ x: -17, r: 5.5, color: C.turq }, { x: 17, r: 5.5, color: C.turq }] });
    ub.position.set(-44, 0, 0); ub.rotation.y = Math.PI / 2; root.add(ub);
    // Sherdor madrasasi (sharqda, jabha g'arbga)
    var sd = madrasa({ W: 56, D: 34, H: 15, pw: 20, ph: 27, floors: 2, mh: 31, mr: 2.3, domes: [{ x: -17, r: 6, color: C.turq }, { x: 17, r: 6, color: C.turq }] });
    sd.position.set(44, 0, 0); sd.rotation.y = -Math.PI / 2; root.add(sd);
    // Tillakori madrasasi (shimolda, jabha janubga) — bitta qavat va katta ko'k gumbaz
    var tk = madrasa({ W: 70, D: 34, H: 14, pw: 22, ph: 24, floors: 1, mh: 26, mr: 2, domes: [{ x: 0, r: 8.5, color: C.blue, h: 9, z: 22 }] });
    tk.position.set(0, 0, -44); root.add(tk);

    // yoritgich ustunlar
    for(var i = -1; i <= 1; i += 2){ var lamp = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, 4, 8), std(null, 0x2B2B2B)); lamp.position.set(i * 14, 2, 22); root.add(lamp); }
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
    note: "Bu soddalashtirilgan maket: nisbat va bezaklar taxminiy. Tarixiy ma'lumotlarni darslik bilan solishtiring."
  };
})();

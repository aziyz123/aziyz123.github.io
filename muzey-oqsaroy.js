// Oqsaroy (Shahrisabz) — taxminiy 3D maket. Manbalar: Wikipedia "Ak-Saray Palace", Turkestan Travel (Clavijo, Bobur), UNESCO №885.
(function(){
  var K = window.MuzeyKit, C = K.C, rnd = K.rnd, mk = K.mk, plain = K.plain;
  var ochre = '#C8A25A', dblue = '#1E4F9C', lblue = '#4FB3C8';
  function tex(rx, ry){
    function d(c, w, h, bump){
      c.fillStyle = bump ? '#808080' : ochre; c.fillRect(0, 0, w, h);
      var n = 4, s = w / n;
      for(var i = 0; i < n; i++) for(var j = 0; j < n; j++){
        var cx = i * s + s / 2, cy = j * s + s / 2;
        function dia(r, col, bcol){ c.fillStyle = bump ? bcol : col; c.beginPath(); c.moveTo(cx, cy - r); c.lineTo(cx + r, cy); c.lineTo(cx, cy + r); c.lineTo(cx - r, cy); c.closePath(); c.fill(); }
        dia(s * .5, dblue, '#505050'); dia(s * .36, lblue, '#9a9a9a'); dia(s * .2, ochre, '#606060'); dia(s * .08, dblue, '#404040');
      }
      c.fillStyle = bump ? '#303030' : 'rgba(255,255,255,.35)'; for(var k = 0; k <= n; k++){ c.fillRect(0, k * s - 1, w, 2); c.fillRect(k * s - 1, 0, 2, h); }
      if(!bump){ for(var m = 0; m < 900; m++){ c.fillStyle = 'rgba(' + (rnd() > .5 ? '255,240,200' : '60,40,20') + ',' + rnd() * .09 + ')'; c.fillRect(rnd() * w, rnd() * h, 2, 2); } }
    }
    return { map: mk(256, 256, function(c, w, h){ d(c, w, h, false); }, rx, ry), bump: mk(256, 256, function(c, w, h){ d(c, w, h, true); }, rx, ry, false) };
  }
  function glz(set){ return new THREE.MeshStandardMaterial({ map: set.map, bumpMap: set.bump, bumpScale: .8, roughness: .3, metalness: .06, envMapIntensity: .9 }); }
  function brick(rx, ry){
    var b = K.brickSet('#B9915A', '#8F6B3A', rx, ry); return new THREE.MeshStandardMaterial({ map: b.map, bumpMap: b.bump, bumpScale: 1.6, roughness: .92 });
  }
  var recon = null;

  function pylon(x, z, flip){
    var g = new THREE.Group(), W = 17, H = 38, D = 13;
    var face = glz(tex(3, 6)), side = brick(2, 5);
    // yon va orqa tomonlar g'isht, old (z+) tomon naqshli sirlangan g'isht
    var box = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), [side, side, side, side, face, brick(3, 5)]);
    box.position.y = H / 2; g.add(box);
    // yuqorisi: buzilgan, notekis tish-tish qism
    for(var i = 0; i < 9; i++){
      var w = 1.6 + rnd() * 1.6, h = .8 + rnd() * 3.2, d = D * (.45 + rnd() * .5);
      var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), i % 3 ? brick(1, 1) : glz(tex(1, 1)));
      m.position.set(-W / 2 + w / 2 + i * (W - 1.6) / 8.2, H + h / 2, (rnd() - .5) * 2); g.add(m);
    }
    // pastki qism: ichki (portal tomonga qaragan) bezakli tokcha belbog'i
    var band = new THREE.Mesh(new THREE.BoxGeometry(W + .6, 1.2, D + .6), plain(0x2c3e5f, .5)); band.position.y = 1; g.add(band);
    var inscr = new THREE.Mesh(new THREE.PlaneGeometry(W * .8, 1.4), new THREE.MeshStandardMaterial({ color: 0xE3DDC8, roughness: .4 }));
    inscr.position.set(0, 27, D / 2 + .03); g.add(inscr); // «Alloh Sultonning umrini uzoq qilsin» yozuvi (belgilangan joy)
    g.position.set(x, 0, z); return g;
  }

  function build(){
    var root = new THREE.Group();
    // yashil maysa + yo'laklar
    var grass = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), new THREE.MeshStandardMaterial({ color: 0x5F8A3A, roughness: 1 }));
    grass.rotation.x = -Math.PI / 2; grass.receiveShadow = true; root.add(grass);
    var stone = mk(256, 256, function(g, w, h){ g.fillStyle = '#BDB6A3'; g.fillRect(0, 0, w, h); for(var i = 0; i < 8; i++) for(var j = 0; j < 8; j++){ var v = rnd(); g.fillStyle = 'rgba(' + (v > .5 ? '255,255,240,' : '70,60,40,') + Math.abs(v - .5) * .3 + ')'; g.fillRect(i * 32 + 1, j * 32 + 1, 30, 30); } }, 6, 8);
    var path = new THREE.Mesh(new THREE.PlaneGeometry(26, 90), new THREE.MeshStandardMaterial({ map: stone, roughness: .95 })); path.rotation.x = -Math.PI / 2; path.position.set(0, .03, 5); path.receiveShadow = true; root.add(path);
    var cross = new THREE.Mesh(new THREE.PlaneGeometry(120, 8), new THREE.MeshStandardMaterial({ map: stone, roughness: .95 })); cross.rotation.x = -Math.PI / 2; cross.position.set(0, .03, 30); root.add(cross);

    // Portal ustunlari (pylon): ichki oraliq 22 m
    root.add(pylon(-19.5, -40)); root.add(pylon(19.5, -40));

    // Amir Temur haykali (hozirgi holat): poydevor + sodda shakl
    var st = new THREE.Group();
    var ped = new THREE.Mesh(new THREE.BoxGeometry(6, 7, 6), plain(0xCFC8B6, .6)); ped.position.y = 3.5; st.add(ped);
    var capb = new THREE.Mesh(new THREE.BoxGeometry(7, .8, 7), plain(0x8E8670, .6)); capb.position.y = 7.4; st.add(capb);
    var bronze = plain(0x6B5A2E, .35, .7, 1);
    var body = new THREE.Mesh(new THREE.CylinderGeometry(.9, 1.3, 3.2, 14), bronze); body.position.y = 7.8 + 1.6; st.add(body);
    var head = new THREE.Mesh(new THREE.SphereGeometry(.55, 14, 10), bronze); head.position.y = 7.8 + 3.7; st.add(head);
    var cape = new THREE.Mesh(new THREE.ConeGeometry(1.7, 3.4, 14, 1, true), bronze); cape.position.y = 7.8 + 1.7; st.add(cape);
    st.position.set(0, 0, 24); root.add(st);

    // ark ortidagi hovli: poydevor chiziqlari (120 x 240 m, taxminiy) va hovuz
    var fnd = brick(8, 1);
    function wall(x, z, w, d){ var m = new THREE.Mesh(new THREE.BoxGeometry(w, .9, d), fnd); m.position.set(x, .45, z); root.add(m); }
    wall(-60, -135, .8, 190); wall(60, -135, .8, 190); wall(0, -230, 120, .8);
    var pool = new THREE.Mesh(new THREE.PlaneGeometry(24, 40), new THREE.MeshStandardMaterial({ color: 0x2F6F8F, roughness: .05, metalness: .4, envMapIntensity: 1.5 }));
    pool.rotation.x = -Math.PI / 2; pool.position.set(0, .06, -85); root.add(pool);
    var rim = new THREE.Mesh(new THREE.BoxGeometry(26, .4, 42), plain(0xCFC8B6, .6)); rim.position.set(0, .15, -85); root.add(rim);
    pool.position.y = .36;
    var yard = new THREE.Mesh(new THREE.PlaneGeometry(120, 190), new THREE.MeshStandardMaterial({ color: 0xB9A678, roughness: 1 })); yard.rotation.x = -Math.PI / 2; yard.position.set(0, .02, -135); yard.receiveShadow = true; root.add(yard);

    // daraxtlar (cho'nglar va chinorlar)
    for(var i = 0; i < 14; i++){ var side = i % 2 ? 1 : -1; root.add(K.tree(side * (20 + rnd() * 3), 56 - Math.floor(i / 2) * 13, .9 + rnd() * .4)); }
    [[-60, 20], [60, 20], [-50, 60], [50, 60], [-80, -10], [80, -10]].forEach(function(p){ root.add(K.tree(p[0], p[1], 1.1 + rnd() * .4)); });

    // Taxminiy asl holat (yarim shaffof): portal toqi va hovli arkadalari. Faqat gipoteza!
    recon = new THREE.Group();
    var gm = new THREE.MeshStandardMaterial({ color: 0xE3C77E, transparent: true, opacity: .38, roughness: .5, emissive: 0x403010 });
    var sh = new THREE.Shape(); sh.moveTo(-28, 26); sh.lineTo(28, 26); sh.lineTo(28, 38); sh.lineTo(-28, 38); sh.lineTo(-28, 26);
    var arch = new THREE.Shape(); arch.moveTo(-28, 0); arch.lineTo(28, 0); arch.lineTo(28, 38); arch.lineTo(-28, 38); arch.lineTo(-28, 0);
    var hole = new THREE.Path(); hole.moveTo(-11, 0); hole.lineTo(11, 0); hole.lineTo(11, 22); hole.absarc(0, 22, 11, 0, Math.PI, false); hole.lineTo(-11, 0); arch.holes.push(hole);
    var span = new THREE.Mesh(new THREE.ExtrudeGeometry(arch, { depth: 13, bevelEnabled: false, curveSegments: 20 }), gm);
    span.position.set(0, 0, -40 - 6.5); span.scale.set(1, 1, 1); recon.add(span);
    [-60, 60].forEach(function(x){ var ar = new THREE.Mesh(new THREE.BoxGeometry(.8, 7, 190), gm); ar.position.set(x, 3.5, -135); recon.add(ar); });
    recon.visible = false; root.add(recon);

    root.traverse(function(o){ if(o.isMesh && o !== grass){ o.castShadow = true; o.receiveShadow = true; } });
    return root;
  }

  window.OqsaroyMuseum = {
    title: 'Oqsaroy (Shahrisabz)',
    build: build,
    onSpot: function(s){ if(recon) recon.visible = s.id === 'recon'; },
    spots: [
      { id: 'far', name: 'Maydon', pos: [0, 1.7, 52], yaw: 0, title: 'Oqsaroy — Shahrisabz',
        text: "Amir Temur o'z vatani Kesh (Shahrisabz)da 1380-yilda qurdirishni boshlagan va 1404-yilda yakunlagan saroy. Hozir faqat portalning ikki ulkan ustuni saqlangan. Shahrisabz tarixiy markazi YUNESKO ro'yxatida (2000)." },
      { id: 'statue', name: 'Haykal', pos: [8, 1.7, 36], yaw: Math.PI / 4, title: 'Amir Temur haykali',
        text: "Saroyning asl joyida Amir Temur haykali o'rnatilgan. Haykal shu maketda sodda shaklda berilgan." },
      { id: 'near', name: 'Portal oldida', pos: [0, 1.7, -12], yaw: 0, title: 'Portal ustunlari',
        text: "Ustunlarning balandligi taxminan 38 m, ular orasidagi ravoq kengligi taxminan 22 m bo'lgan. Old tomoni to'q sariq, ko'k va havorang sirlangan g'isht naqshlari bilan qoplangan. Yozuvda «Alloh Sulton umrini uzoq qilsin» deyilgan. Qiya tepaga qarash uchun ekranni pastga suring." },
      { id: 'back', name: 'Hovli', pos: [0, 1.7, -62], yaw: Math.PI, title: 'Ichki hovli',
        text: "Saroy hovlisi taxminan 120–125 m kenglik va 240–250 m uzunlikda, atrofi arkadalar bilan o'ralgan, o'rtasida hovuz bo'lgan, deb yoziladi. Saroyning qolgan qismi XVI asrda buzilgan." },
      { id: 'recon', name: 'Asl holat (taxmin)', pos: [0, 1.7, 56], yaw: 0, title: 'Taxminiy asl holat',
        text: "Sariq yarim shaffof shakl — ustunlar orasidagi tuzilma va hovli arkadalarining taxminiy hajmi. Bu faqat gipoteza: asl ko'rinishning ishonchli chizmalari saqlanmagan." }
    ],
    note: "Bu 3D maket: o'lchamlar manbalarga ko'ra (Wikipedia, YUNESKO), bezaklar va hovli tuzilishi taxminiy. Ispaniya elchisi Klavixo 1404-yilda saroy hali tugallanmaganini yozgan. Tarixiy ma'lumotni darslik bilan solishtiring."
  };
})();

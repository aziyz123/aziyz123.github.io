/*
 * Fayl Uzatish "24 soatlik xona" uchun DOM'siz yuklash API'si (boshqa sahifalar ishlatadi,
 * masalan Slayd Yaratuvchi). Xuddi shu yo'llarga yozadi, shuning uchun
 * fayl-uzatish.html dagi «24 soatlik xona» bo'limi kod bilan ochadi.
 * Talab: firebase-app-compat va firebase-database-compat oldin yuklangan bo'lsin.
 */
(function () {
  'use strict';
  var CFG = {
    apiKey: "AIzaSyBJfq4Kc6YZHpbV9WBg__im4bivBcZo1WU",
    authDomain: "osonvakerak.firebaseapp.com",
    databaseURL: "https://osonvakerak-default-rtdb.firebaseio.com",
    projectId: "osonvakerak",
    storageBucket: "osonvakerak.firebasestorage.app",
    messagingSenderId: "363556171064",
    appId: "1:363556171064:web:e21be98e50dff4d031e5cd"
  };
  var TTL = 24 * 3600 * 1000, MAX_FILE = 25 * 1024 * 1024, RAW = 196608, CONC = 4, BPS = 800 * 1024;
  function db() { if (!firebase.apps.length) firebase.initializeApp(CFG); return firebase.database(); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function pad(i) { return 'c' + String(i).padStart(5, '0'); }
  function b64(bytes) {
    var s = '', step = 0x8000;
    for (var i = 0; i < bytes.length; i += step) s += String.fromCharCode.apply(null, bytes.subarray(i, i + step));
    return btoa(s);
  }
  function code6() { var a = new Uint32Array(1); crypto.getRandomValues(a); return String(100000 + (a[0] % 900000)); }
  function remember(code, exp) {
    try { var o = JSON.parse(localStorage.getItem('fayl_stash') || '{}'); o[code] = exp; localStorage.setItem('fayl_stash', JSON.stringify(o)); } catch (e) {}
  }
  async function newCode() {
    for (var i = 0; i < 8; i++) {
      var c = code6();
      var e = (await db().ref('rooms/' + c + '/stash/exp').once('value')).val();
      if (!e) return c;
      if (e <= Date.now()) { await db().ref('rooms/' + c + '/stash').remove(); return c; }
    }
    throw new Error("Bo'sh kod topilmadi, qayta urinib ko'ring");
  }
  function friendly(e) {
    var m = (e && (e.code || e.message)) || String(e);
    return /permission/i.test(m) ? "Ma'lumotlar bazasi yozishga ruxsat bermadi (qoidalar)." : m;
  }
  /** file: File|Blob (name berilsa File). Qaytaradi {code, exp}. */
  async function upload(file, name, onProg) {
    try {
      if (!file || !file.size) throw new Error("Fayl bo'sh");
      if (file.size > MAX_FILE) throw new Error('Fayl katta (' + (file.size / 1048576).toFixed(1) + " MB). Eng ko'pi 25 MB.");
      var code = await newCode(), exp = Date.now() + TTL, base = 'rooms/' + code + '/stash';
      await db().ref(base + '/exp').set(exp);
      remember(code, exp);
      var fid = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      var total = Math.ceil(file.size / RAW);
      var meta = db().ref(base + '/files/' + fid);
      try {
        await meta.set({ name: name || file.name || 'fayl', size: file.size, type: file.type || '', total: total, at: Date.now(), complete: false });
        var next = 0, done = 0, written = 0, t0 = Date.now();
        var worker = async function () {
          for (;;) {
            var i = next++; if (i >= total) return;
            var raw = new Uint8Array(await file.slice(i * RAW, Math.min((i + 1) * RAW, file.size)).arrayBuffer());
            var s = b64(raw); written += s.length;
            var w = t0 + (written / BPS) * 1000 - Date.now(); if (w > 0) await sleep(w);
            await db().ref(base + '/data/' + fid + '/' + pad(i)).set(s);
            done++; if (onProg) onProg(Math.min(file.size, done * RAW), file.size);
          }
        };
        var ws = []; for (var k = 0; k < CONC; k++) ws.push(worker());
        await Promise.all(ws);
        await meta.child('complete').set(true);
      } catch (e) { db().ref(base).remove().catch(function () {}); throw e; }
      return { code: code, exp: exp };
    } catch (e) { var err = new Error(friendly(e)); throw err; }
  }
  window.FaylStashAPI = { upload: upload };
})();

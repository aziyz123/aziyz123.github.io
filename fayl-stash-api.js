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
  /** Mavjud xonani tekshiradi (code berilsa) yoki yangi xona ochadi. */
  async function openRoom(existing) {
    if (existing) {
      if (!/^\d{6}$/.test(existing)) throw new Error("Xona kodi 6 ta raqam bo'lishi kerak.");
      var e = (await db().ref('rooms/' + existing + '/stash/exp').once('value')).val();
      if (!e || e <= Date.now()) throw new Error('Bunday xona topilmadi yoki muddati tugagan.');
      return { code: existing, exp: e };
    }
    var code = await newCode(), exp = Date.now() + TTL;
    await db().ref('rooms/' + code + '/stash/exp').set(exp);
    remember(code, exp);
    return { code: code, exp: exp };
  }
  function countQuestions(text) {
    return String(text || '').split(/\n\s*\n+/).filter(function (b) { return b.trim(); }).length;
  }
  /** Bilim Kechasi savollarini (matn) xonaga saqlaydi. existing — mavjud xona kodi (ixtiyoriy). */
  async function saveQuiz(text, name, existing) {
    try {
      text = String(text || '').trim();
      if (!text) throw new Error("Savollar matni bo'sh.");
      if (text.length > 200000) throw new Error('Savollar matni juda uzun.');
      var room = await openRoom(existing);
      var qid = 'q' + Date.now().toString(36) + Math.random().toString(36).slice(2, 4);
      await db().ref('rooms/' + room.code + '/stash/quizzes/' + qid).set({ name: name || 'Bilim Kechasi savollari', text: text, count: countQuestions(text), at: Date.now() });
      return { code: room.code, exp: room.exp, qid: qid };
    } catch (e) { throw new Error(friendly(e)); }
  }
  /** Xonadagi savollar to'plamlarini o'qiydi. only — bitta qid (ixtiyoriy). */
  async function getQuizzes(code, only) {
    try {
      var room = await openRoom(code);
      var v = (await db().ref('rooms/' + code + '/stash/quizzes').once('value')).val() || {};
      var list = Object.keys(v).filter(function (k) { return !only || k === only; })
        .sort(function (a, b) { return (v[a].at || 0) - (v[b].at || 0); })
        .map(function (k) { return { id: k, name: v[k].name, text: v[k].text, count: v[k].count }; });
      return { exp: room.exp, quizzes: list };
    } catch (e) { throw new Error(friendly(e)); }
  }
  /** file: File|Blob (name berilsa File). Qaytaradi {code, exp}. */
  async function upload(file, name, onProg, existing) {
    try {
      if (!file || !file.size) throw new Error("Fayl bo'sh");
      if (file.size > MAX_FILE) throw new Error('Fayl katta (' + (file.size / 1048576).toFixed(1) + " MB). Eng ko'pi 25 MB.");
      var room = await openRoom(existing), code = room.code, exp = room.exp, base = 'rooms/' + code + '/stash';
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
  window.FaylStashAPI = { upload: upload, saveQuiz: saveQuiz, getQuizzes: getQuizzes, openRoom: openRoom };
})();

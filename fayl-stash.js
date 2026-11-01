/*
 * Fayl Uzatish — "Oldindan saqlash": fayllarni xonaga oldindan yuklab qo'yish, 24 soatdan keyin o'chadi.
 * Ma'lumot Firebase Realtime Database'da:
 *   rooms/<kod>/stash/exp                  — tugash vaqti (ms)
 *   rooms/<kod>/stash/files/<fid>          — {name,size,type,total,at,complete}
 *   rooms/<kod>/stash/data/<fid>/cNNNNN    — base64 bo'laklar
 * Realtime Database o'zi o'chirmaydi, shuning uchun muddati o'tganlarini sahifa ochilganda
 * va kod kiritilganda tozalaymiz (sweep).
 */
(function () {
  'use strict';
  var TTL = 24 * 60 * 60 * 1000;
  var MAX_FILE = 25 * 1024 * 1024;
  var MAX_TOTAL = 50 * 1024 * 1024;
  var RAW = 196608;
  var CONC = 4;
  var BPS = 800 * 1024;

  function $(id) { return document.getElementById(id); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function pad(i) { return 'c' + String(i).padStart(5, '0'); }
  function dbr() { return initFb().db; }
  function errText(e) {
    var m = (e && (e.code || e.message)) || String(e);
    if (/permission/i.test(m)) return "Ma'lumotlar bazasi yozishga ruxsat bermadi (qoidalar).";
    return m;
  }
  function leftText(exp) {
    var ms = exp - Date.now();
    if (ms <= 0) return "muddati tugagan";
    var h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000);
    return h + ' soat ' + m + " daqiqadan so'ng o'chadi";
  }

  /* ---------- tozalash ---------- */
  function removeStash(code) {
    return Promise.all([
      dbr().ref('rooms/' + code + '/stash').remove(),
      Promise.resolve(forget(code))
    ]).catch(function () {});
  }
  // Bu qurilmada yaratilgan xonalar ro'yxati (eskilarini o'zimiz tozalaymiz)
  function mine() { try { return JSON.parse(localStorage.getItem('fayl_stash') || '{}'); } catch (e) { return {}; } }
  function saveMine(o) { try { localStorage.setItem('fayl_stash', JSON.stringify(o)); } catch (e) {} }
  function remember(code, exp) { var o = mine(); o[code] = exp; saveMine(o); }
  function forget(code) { var o = mine(); delete o[code]; saveMine(o); }
  function sweep() {
    var o = mine();
    Object.keys(o).forEach(function (code) { if (o[code] <= Date.now()) removeStash(code); });
  }

  /* ---------- yuklash ---------- */
  var curCode = null, curExp = 0, busy = false;

  function newCode() {
    return (async function () {
      for (var i = 0; i < 8; i++) {
        var c = generateRoomCode();
        var s = await dbr().ref('rooms/' + c + '/stash/exp').once('value');
        var e = s.val();
        if (!e) return c;
        if (e <= Date.now()) { await removeStash(c); return c; }
      }
      throw new Error('Bo\'sh kod topilmadi, qayta urinib ko\'ring');
    })();
  }

  async function ensureRoom() {
    if (curCode && curExp > Date.now()) return curCode;
    var code = await newCode();
    curExp = Date.now() + TTL;
    await dbr().ref('rooms/' + code + '/stash/exp').set(curExp);
    remember(code, curExp);
    curCode = code;
    $('stashCode').textContent = code;
    $('stashCodeBox').style.display = 'block';
    renderExpiry();
    watchFiles(code, $('stashUpList'), true);
    return code;
  }

  function renderExpiry() {
    if (curCode) $('stashExpiry').textContent = '⏳ ' + leftText(curExp);
  }
  setInterval(renderExpiry, 60000);

  async function uploadOne(code, file, onProg) {
    if (!file.size) throw new Error('Fayl bo\'sh');
    if (file.size > MAX_FILE) throw new Error('Fayl katta (' + formatSize(file.size) + '). Eng ko\'pi ' + formatSize(MAX_FILE) + '.');
    var cur = (await dbr().ref('rooms/' + code + '/stash/files').once('value')).val() || {};
    var sum = 0; Object.keys(cur).forEach(function (k) { sum += (cur[k].size || 0); });
    if (sum + file.size > MAX_TOTAL) throw new Error('Xonada joy yetmaydi (jami ' + formatSize(MAX_TOTAL) + ').');
    var fid = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    var total = Math.ceil(file.size / RAW);
    var metaRef = dbr().ref('rooms/' + code + '/stash/files/' + fid);
    var dataBase = 'rooms/' + code + '/stash/data/' + fid;
    try {
      await metaRef.set({ name: file.name, size: file.size, type: file.type || '', total: total, at: Date.now(), complete: false });
      var next = 0, done = 0, written = 0, t0 = Date.now();
      var worker = async function () {
        for (;;) {
          var i = next++;
          if (i >= total) return;
          var raw = new Uint8Array(await file.slice(i * RAW, Math.min((i + 1) * RAW, file.size)).arrayBuffer());
          var b64 = FileXfer.bytesToBase64(raw);
          written += b64.length;
          var wait = t0 + (written / BPS) * 1000 - Date.now();
          if (wait > 0) await sleep(wait);
          await dbr().ref(dataBase + '/' + pad(i)).set(b64);
          done++;
          onProg(Math.min(file.size, done * RAW), file.size);
        }
      };
      var ws = []; for (var k = 0; k < CONC; k++) ws.push(worker());
      await Promise.all(ws);
      await metaRef.child('complete').set(true);
    } catch (e) {
      dbr().ref(dataBase).remove().catch(function () {});
      metaRef.remove().catch(function () {});
      throw e;
    }
  }

  async function uploadFiles(files) {
    if (busy || !files.length) return;
    busy = true;
    var st = $('stashUpStatus'), bg = $('stashUpBg'), fill = $('stashUpFill');
    $('stashFileInput').disabled = true;
    window.onbeforeunload = function () { return 'Fayl hali yuklanmoqda.'; };
    try {
      setStatus(st, 'Xona tayyorlanmoqda...');
      var code = await ensureRoom();
      var okCount = 0;
      for (var n = 0; n < files.length; n++) {
        var f = files[n];
        bg.classList.add('active'); fill.style.width = '0%';
        try {
          await uploadOne(code, f, function (d, t) {
            var pct = Math.round(d / t * 100);
            fill.style.width = pct + '%';
            setStatus(st, 'Yuklanmoqda (' + (n + 1) + '/' + files.length + ') ' + f.name + ' — ' + pct + '%');
          });
          okCount++;
        } catch (e) {
          setStatus(st, '✗ ' + f.name + ': ' + errText(e), 'err');
          if (n < files.length - 1) await sleep(2500);
        }
      }
      fill.style.width = '100%';
      if (okCount === files.length) setStatus(st, '✅ Yuklandi. Kod: ' + code + ' — doskada «Kod bilan olish» ga kiriting.', 'ok');
    } catch (e) {
      setStatus(st, '✗ ' + errText(e), 'err');
    } finally {
      window.onbeforeunload = null;
      busy = false;
      $('stashFileInput').disabled = false;
      $('stashFileInput').value = '';
    }
  }

  /* ---------- ro'yxat (yuklovchi va oluvchi uchun) ---------- */
  var watched = {};
  function watchFiles(code, listEl, canDelete) {
    if (watched[listEl.id]) { try { watched[listEl.id].off(); } catch (e) {} }
    var ref = dbr().ref('rooms/' + code + '/stash/files');
    watched[listEl.id] = ref;
    ref.on('value', function (s) {
      var v = s.val() || {};
      listEl.innerHTML = '';
      var keys = Object.keys(v).sort(function (a, b) { return (v[a].at || 0) - (v[b].at || 0); });
      if (!keys.length) { listEl.innerHTML = '<div class="hint">Hozircha fayl yo\'q.</div>'; return; }
      keys.forEach(function (fid) {
        var m = v[fid];
        var row = document.createElement('div');
        row.className = 'stash-row';
        var label = document.createElement('span');
        label.className = 'stash-name';
        label.textContent = (m.complete ? '' : '⏳ ') + m.name + ' (' + formatSize(m.size || 0) + ')';
        row.appendChild(label);
        if (canDelete) {
          var del = document.createElement('button');
          del.className = 'secondary stash-btn'; del.textContent = "O'chirish";
          del.onclick = function () {
            dbr().ref('rooms/' + code + '/stash/files/' + fid).remove();
            dbr().ref('rooms/' + code + '/stash/data/' + fid).remove();
          };
          row.appendChild(del);
        } else if (m.complete) {
          var open = document.createElement('button');
          open.className = 'primary stash-btn'; open.textContent = 'Yuklab olish / ochish';
          open.onclick = function () { fetchFile(code, fid, m, row, open); };
          row.appendChild(open);
        }
        listEl.appendChild(row);
      });
    });
  }

  var cache = {};
  function fetchFile(code, fid, m, row, btn) {
    var key = code + '/' + fid;
    if (cache[key]) { present(cache[key]); return; }
    btn.disabled = true;
    var ref = dbr().ref('rooms/' + code + '/stash/data/' + fid);
    var parts = new Array(m.total), got = 0, finished = false;
    var st = $('stashGetStatus');
    var timer = setTimeout(function () {
      if (finished) return;
      finished = true; ref.off(); btn.disabled = false;
      setStatus(st, "✗ Fayl to'liq kelmadi. Qayta urinib ko'ring.", 'err');
    }, 90000);
    ref.on('child_added', function (s) {
      if (finished) return;
      var idx = parseInt(String(s.key).slice(1), 10);
      if (isNaN(idx) || idx >= m.total || parts[idx]) return;
      parts[idx] = FileXfer.base64ToBytes(s.val());
      got++;
      setStatus(st, 'Yuklab olinmoqda... ' + Math.round(got / m.total * 100) + '%');
      if (got === m.total) {
        finished = true; clearTimeout(timer); ref.off();
        var mime = guessMime(m.name, m.type);
        var blob = new Blob(parts, { type: mime });
        btn.disabled = false;
        if (blob.size !== m.size) { setStatus(st, '✗ Hajm mos kelmadi, qayta urinib ko\'ring.', 'err'); return; }
        setStatus(st, '✅ Tayyor: ' + m.name, 'ok');
        cache[key] = { name: m.name, type: mime, size: m.size, data: URL.createObjectURL(blob) };
        present(cache[key]);
      }
    });
    function present(f) {
      var cat = getFileCategory(f.name, f.type);
      if (cat === 'image') openImageViewer(f);
      else if (cat === 'pdf') openPdfViewer(f);
      else if (cat === 'pptx') openPptxViewer(f);
      else downloadFile(f);
    }
  }

  /* ---------- kod bilan olish ---------- */
  async function openByCode(code) {
    var st = $('stashGetStatus');
    code = (code || '').trim();
    if (!/^\d{6}$/.test(code)) { setStatus(st, "Kod 6 ta raqam bo'lishi kerak.", 'err'); return; }
    setStatus(st, 'Tekshirilmoqda...');
    try {
      var exp = (await dbr().ref('rooms/' + code + '/stash/exp').once('value')).val();
      if (!exp) { setStatus(st, '✗ Bunday xona topilmadi.', 'err'); $('stashGetList').innerHTML = ''; return; }
      if (exp <= Date.now()) {
        await removeStash(code);
        setStatus(st, "✗ Xonaning 24 soatlik muddati tugagan, fayllar o'chirilgan.", 'err');
        $('stashGetList').innerHTML = ''; return;
      }
      setStatus(st, '✅ Xona topildi — ' + leftText(exp), 'ok');
      watchFiles(code, $('stashGetList'), false);
    } catch (e) { setStatus(st, '✗ ' + errText(e), 'err'); }
  }

  /* ---------- ulash ---------- */
  function init() {
    if (!$('stashPanel')) return;
    sweep();
    $('stashFileInput').addEventListener('change', function (e) { uploadFiles(Array.prototype.slice.call(e.target.files)); });
    $('stashCopyBtn').addEventListener('click', function () {
      var t = $('stashCode').textContent;
      try { navigator.clipboard.writeText(t); $('stashCopyBtn').textContent = '✓ Nusxalandi'; } catch (e) {}
      setTimeout(function () { $('stashCopyBtn').textContent = 'Kodni nusxalash'; }, 1800);
    });
    $('stashOpenBtn').addEventListener('click', function () { openByCode($('stashCodeInput').value); });
    $('stashCodeInput').addEventListener('keydown', function (e) { if (e.key === 'Enter') openByCode(e.target.value); });
    var p = new URLSearchParams(location.search).get('stash');
    if (p && /^\d{6}$/.test(p)) { showMode('stash'); $('stashCodeInput').value = p; openByCode(p); }
  }
  window.FaylStash = { openByCode: openByCode, sweep: sweep, _removeStash: removeStash };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

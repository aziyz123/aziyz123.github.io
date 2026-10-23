/*
 * Fayl Uzatish — Telegram bot orqali qabul qilish.
 * Sozlash: telegram-bot/README.md. Quyidagi ikki qiymatni to'ldiring (yoki sahifada window.FAYL_TG ni o'rnating).
 */
window.FAYL_TG = Object.assign({
  api: '',   // Worker manzili, masalan: 'https://fayl-uzatish-bot.mening-nomim.workers.dev'
  bot: ''    // botning username'i @ belgisiz, masalan: 'fayl_uzatish_bot'
}, window.FAYL_TG || {});

(function () {
  'use strict';
  var ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 ta belgi, Worker bilan bir xil (0,1,I,O yo'q)
  var POLL_MS = 2500, MAX_MS = 60 * 60 * 1000;
  var timer = null, startedAt = 0;

  function makeCode() {
    var a = new Uint8Array(8);
    (window.crypto || window.msCrypto).getRandomValues(a);
    var s = '';
    for (var i = 0; i < a.length; i++) s += ALPHA[a[i] % 32];
    return s;
  }
  function cfg() { var c = window.FAYL_TG || {}; return { api: String(c.api || '').replace(/\/+$/, ''), bot: String(c.bot || '').replace(/^@/, '') }; }
  function el(tag, css, html) { var e = document.createElement(tag); if (css) e.style.cssText = css; if (html != null) e.innerHTML = html; return e; }

  function buildPanel(c, code) {
    var old = document.getElementById('tgPanel');
    if (old) old.remove();
    if (!c.api || !c.bot) return null;
    var box = el('div', 'margin-top:18px;padding:16px;border-radius:12px;border:1px solid rgba(201,164,92,0.35);background:rgba(0,0,0,0.22);');
    box.id = 'tgPanel';
    box.appendChild(el('div', 'font-weight:700;font-size:15px;margin-bottom:8px;', '📨 Telegram orqali yuborish'));
    if (!c.api || !c.bot) return null; // sozlanmagan bo'lsa, tashrif buyuruvchilarga hech narsa ko'rsatilmaydi
    var link = 'https://t.me/' + c.bot + '?start=' + code;
    var row = el('div', 'display:flex;gap:16px;align-items:center;flex-wrap:wrap;');
    var qr = el('div', 'background:#fff;padding:6px;border-radius:8px;line-height:0;');
    qr.id = 'tgQr';
    row.appendChild(qr);
    var side = el('div', 'flex:1;min-width:180px;font-size:13px;line-height:1.55;');
    side.innerHTML = '<div>1. Telegramda QR ni skanerlang yoki <a href="' + link + '" target="_blank" rel="noopener" style="color:var(--gold-2,#e6c27a);font-weight:700;">botni ochish</a></div>' +
      '<div>2. «Start» ni bosing</div><div>3. Slayd faylini (PPTX, PDF…) botga yuboring</div>' +
      '<div style="margin-top:8px;opacity:.75;">Qo\'lda: botga <b id="tgCode" style="letter-spacing:2px;color:var(--gold-2,#e6c27a);">' + code + '</b> kodini yozing. 20 MB gacha.</div>';
    row.appendChild(side);
    box.appendChild(row);
    var st = el('div', 'margin-top:10px;font-size:12px;opacity:.7;', 'Telegramdan fayl kutilmoqda…');
    st.id = 'tgStatus';
    box.appendChild(st);
    if (typeof QRCode !== 'undefined') {
      try { new QRCode(qr, { text: link, width: 120, height: 120, colorDark: '#12151C', colorLight: '#ffffff' }); } catch (e) {}
    }
    return box;
  }

  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  function start(code) {
    var c = cfg();
    var host = document.querySelector('#roomBox .steps');
    var panel = buildPanel(c, code);
    if (!panel) { if (window.console) console.info('Telegram bot sozlanmagan: fayl-telegram.js ichidagi api va bot qiymatlarini to\'ldiring (telegram-bot/README.md).'); return; }
    if (host) host.insertAdjacentElement('afterend', panel); else document.getElementById('roomBox').appendChild(panel);
    var last = 0, busy = false, seen = {};
    startedAt = Date.now();
    var st = document.getElementById('tgStatus');
    stop();
    timer = setInterval(function () {
      if (busy) return;
      if (Date.now() - startedAt > MAX_MS) { stop(); if (st) st.textContent = 'Telegram kutish to\'xtatildi. Yangi xona oching.'; return; }
      busy = true;
      fetch(c.api + '/api/inbox/' + code + '?after=' + last, { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
        .then(function (j) {
          (j.items || []).forEach(function (it) {
            if (seen[it.id]) return;
            seen[it.id] = 1;
            if (it.ts > last) last = it.ts;
            var name = it.name || 'fayl';
            var mime = (typeof guessMime === 'function') ? guessMime(name, it.mime) : (it.mime || 'application/octet-stream');
            if (typeof showReceivedFile === 'function') {
              showReceivedFile({ name: name, type: mime, size: it.size || 0, data: c.api + '/dl/' + code + '/' + it.id });
              var line = document.getElementById('statusLine');
              if (line) line.textContent = '✅ Fayl Telegramdan qabul qilindi!';
            }
            if (st) st.textContent = '✅ Oxirgi fayl: ' + name;
          });
        })
        .catch(function () { if (st) st.textContent = 'Telegram bilan aloqa yo\'q, qayta urinilmoqda…'; })
        .then(function () { busy = false; });
    }, POLL_MS);
  }

  var btn = document.getElementById('openRoomBtn');
  if (btn) btn.addEventListener('click', function () { setTimeout(function () { start(makeCode()); }, 0); });
  window.FaylTelegram = { start: start, stop: stop, makeCode: makeCode };
})();

const firebaseConfig = {
  apiKey: "AIzaSyBJfq4Kc6YZHpbV9WBg__im4bivBcZo1WU",
  authDomain: "osonvakerak.firebaseapp.com",
  databaseURL: "https://osonvakerak-default-rtdb.firebaseio.com",
  projectId: "osonvakerak",
  storageBucket: "osonvakerak.firebasestorage.app",
  messagingSenderId: "363556171064",
  appId: "1:363556171064:web:e21be98e50dff4d031e5cd"
};

let fbApp = null, fbDb = null;
function initFb() {
  if (!fbApp) {
    fbApp = firebase.initializeApp(firebaseConfig);
    fbDb = firebase.database();
  }
  return { db: fbDb };
}
function generateRoomCode(){
  const a = new Uint32Array(1);
  (window.crypto || window.msCrypto).getRandomValues(a);
  return String(100000 + (a[0] % 900000));
}

let html5QrCode = null;
let currentFile = null;
let receiver = null, sender = null, wakeLock = null;

function guessMime(name, mime) {
  if (mime && mime !== 'application/octet-stream') return mime;
  const n = (name || '').toLowerCase();
  if (n.endsWith('.pdf')) return 'application/pdf';
  if (/\.jpe?g$/.test(n)) return 'image/jpeg';
  if (n.endsWith('.png')) return 'image/png';
  if (n.endsWith('.gif')) return 'image/gif';
  if (n.endsWith('.webp')) return 'image/webp';
  if (n.endsWith('.pptx')) return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  if (n.endsWith('.ppt')) return 'application/vnd.ms-powerpoint';
  return mime || 'application/octet-stream';
}
function routeLabel(route) { return route === 'p2p' ? "⚡ to'g'ridan-to'g'ri" : '☁️ zaxira usuli'; }
function setStatus(el, text, cls) { el.textContent = text; el.className = 'status-line' + (cls ? ' ' + cls : ''); }

function getFileCategory(name, mime) {
  const lower = (name || '').toLowerCase();
  const m = (mime || '').toLowerCase();
  if (m.startsWith('image/') || /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(lower)) return 'image';
  if (m === 'application/pdf' || lower.endsWith('.pdf')) return 'pdf';
  if (m.includes('presentation') || m.includes('powerpoint') || /\.(pptx?|ppsx?)$/i.test(lower)) return 'pptx';
  return 'other';
}
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024*1024) return (bytes/1024).toFixed(0) + ' KB';
  return (bytes/1024/1024).toFixed(1) + ' MB';
}
function downloadFile(file) {
  const a = document.createElement('a');
  a.href = file.data; a.download = file.name;
  a.target = '_blank'; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}
function openImageViewer(file) {
  document.getElementById('imgViewerTitle').textContent = file.name;
  document.getElementById('imgViewerImg').src = file.data;
  document.getElementById('imageViewer').classList.add('active');
  document.getElementById('imgDownloadBtn').onclick = () => downloadFile(file);
  document.getElementById('imgCloseBtn').onclick = () => document.getElementById('imageViewer').classList.remove('active');
}
function openPdfViewer(file) {
  document.getElementById('pdfViewerTitle').textContent = file.name;
  document.getElementById('pdfViewerFrame').src = file.data;
  document.getElementById('pdfViewer').classList.add('active');
  document.getElementById('pdfDownloadBtn').onclick = () => downloadFile(file);
  document.getElementById('pdfCloseBtn').onclick = () => {
    document.getElementById('pdfViewer').classList.remove('active');
    document.getElementById('pdfViewerFrame').src = '';
  };
}
function openPptxViewer(file) {
  document.getElementById('pptxViewerTitle').textContent = file.name;
  document.getElementById('pptxViewer').classList.add('active');
  document.getElementById('pptxDownloadBtn').onclick = () => downloadFile(file);
  document.getElementById('pptxCloseBtn').onclick = () => document.getElementById('pptxViewer').classList.remove('active');
}
function addToHistory(f) {
  let box = document.getElementById('receivedHistory');
  if (!box) {
    box = document.createElement('div');
    box.id = 'receivedHistory';
    box.style.cssText = 'margin-top:16px;';
    box.innerHTML = '<div class="hint" style="margin-bottom:8px;">Oldingi qabul qilingan fayllar</div>';
    document.getElementById('fileResult').insertAdjacentElement('afterend', box);
  }
  const row = document.createElement('div');
  row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 0;border-top:1px dashed rgba(255,255,255,0.12);font-size:13px;';
  const label = document.createElement('span');
  label.style.cssText = 'word-break:break-all;';
  label.textContent = f.name + ' (' + formatSize(f.size || 0) + ')';
  const btn = document.createElement('button');
  btn.className = 'secondary';
  btn.style.cssText = 'flex:0 0 auto;width:auto;padding:6px 12px;';
  btn.textContent = 'Yuklab olish';
  btn.onclick = () => downloadFile(f);
  row.appendChild(label); row.appendChild(btn);
  box.insertBefore(row, box.children[1] || null);
}
function showReceivedFile(val) {
  if (currentFile) addToHistory(currentFile);
  currentFile = val;
  const cat = getFileCategory(val.name, val.type);
  document.getElementById('statusLine').textContent = '✅ Fayl qabul qilindi!';
  document.getElementById('statusLine').className = 'status-line ok';
  document.getElementById('fileName').textContent = val.name;
  document.getElementById('fileMeta').textContent = formatSize(val.size || 0);
  document.getElementById('fileResult').classList.add('active');
  document.getElementById('recvProgressBg').classList.remove('active');
  const badge = document.getElementById('fileTypeBadge');
  const labels = { image: '🖼 Rasm', pdf: '📄 PDF', pptx: '📊 PowerPoint', other: '📁 Fayl' };
  badge.textContent = labels[cat] || labels.other;
  const actions = document.getElementById('actionButtons');
  actions.innerHTML = '';
  if (cat === 'image') {
    const btn = document.createElement('button'); btn.className = 'primary';
    btn.textContent = "To'liq ekranda ochish"; btn.onclick = () => openImageViewer(val); actions.appendChild(btn);
  } else if (cat === 'pdf') {
    const btn = document.createElement('button'); btn.className = 'primary';
    btn.textContent = 'PDF ni ochish'; btn.onclick = () => openPdfViewer(val); actions.appendChild(btn);
  } else if (cat === 'pptx') {
    const btn = document.createElement('button'); btn.className = 'primary';
    btn.textContent = 'PowerPoint haqida'; btn.onclick = () => openPptxViewer(val); actions.appendChild(btn);
  }
  const dl = document.createElement('button'); dl.className = 'secondary';
  dl.textContent = 'Yuklab olish'; dl.onclick = () => downloadFile(val); actions.appendChild(dl);
}
function showMode(mode) {
  document.getElementById('tabComputer').classList.toggle('active', mode === 'computer');
  document.getElementById('tabPhone').classList.toggle('active', mode === 'phone');
  document.getElementById('computerPanel').style.display = mode === 'computer' ? 'block' : 'none';
  document.getElementById('phonePanel').style.display = mode === 'phone' ? 'block' : 'none';
  if (mode !== 'phone') stopScanner();
}
function goToSend(room) {
  stopScanner();
  document.getElementById('homeScreen').style.display = 'none';
  document.getElementById('sendScreen').style.display = 'block';
  document.getElementById('sendRoomLabel').textContent = 'Xona: ' + room;
  setupSend(room);
}

document.getElementById('openRoomBtn').addEventListener('click', () => {
  const { db } = initFb();
  const room = generateRoomCode();
  const sendUrl = location.origin + location.pathname + '?send=' + room;
  document.getElementById('roomCodeDisplay').textContent = room;
  document.getElementById('qrcodeBox').innerHTML = '';
  new QRCode(document.getElementById('qrcodeBox'), {
    text: sendUrl, width: 140, height: 140, colorDark: '#12151C', colorLight: '#ffffff'
  });
  document.getElementById('roomBox').style.display = 'block';
  document.getElementById('openRoomBtn').style.display = 'none';
  document.getElementById('statusLine').textContent = 'Fayl kutilmoqda...';
  document.getElementById('statusLine').className = 'status-line';
  document.getElementById('fileResult').classList.remove('active');

  if (receiver) { try { receiver.close(); } catch (e) {} }
  const statusEl = document.getElementById('statusLine');
  receiver = FileXfer.createReceiver({
    db, room,
    onEvent: (e) => {
      if (e.type === 'peer') {
        setStatus(statusEl, e.route === 'p2p'
          ? "📱 Telefon ulandi (⚡ to'g'ridan-to'g'ri). Fayl kutilmoqda..."
          : "☁️ Fayl zaxira usulida kelmoqda (sekinroq)...");
      } else if (e.type === 'progress') {
        const pct = e.total ? Math.min(100, Math.round(e.done / e.total * 100)) : 0;
        document.getElementById('recvProgressBg').classList.add('active');
        document.getElementById('recvProgressFill').style.width = pct + '%';
        setStatus(statusEl, 'Qabul qilinmoqda... ' + pct + '% (' + formatSize(e.done) + ' / ' + formatSize(e.total) + ') ' + routeLabel(e.route));
      } else if (e.type === 'file') {
        const mime = guessMime(e.name, e.mime);
        const blob = new Blob([e.blob], { type: mime });
        showReceivedFile({ name: e.name, type: mime, size: e.size, data: URL.createObjectURL(blob) });
      } else if (e.type === 'error') {
        document.getElementById('recvProgressBg').classList.remove('active');
        setStatus(statusEl, "✗ Fayl to'liq kelmadi (" + (e.name || '') + "). Telefondan qayta yuboring.", 'err');
      }
    }
  });
  receiver.start().catch((err) => setStatus(statusEl, '✗ Ulanishda xato: ' + (err && err.message || err), 'err'));
});

function setupSend(room) {
  const { db } = initFb();
  const input = document.getElementById('fileInput');
  const newInput = input.cloneNode(true);
  input.parentNode.replaceChild(newInput, input);
  const statusEl = document.getElementById('sendStatus');

  let routeInfo = document.getElementById('routeInfo');
  if (!routeInfo) {
    routeInfo = document.createElement('div');
    routeInfo.id = 'routeInfo';
    routeInfo.className = 'hint';
    routeInfo.style.cssText = 'margin-top:12px;font-size:13px;';
    statusEl.insertAdjacentElement('beforebegin', routeInfo);
  }
  routeInfo.textContent = 'Kompyuter bilan ulanmoqda...';

  if (sender) { try { sender.close(); } catch (e) {} }
  sender = FileXfer.createSender({
    db, room,
    onEvent: (e) => {
      if (e.type === 'route') {
        routeInfo.textContent = e.route === 'p2p'
          ? "⚡ Kompyuter bilan to'g'ridan-to'g'ri ulandi (tez, 200 MB gacha)"
          : "☁️ To'g'ridan-to'g'ri ulanib bo'lmadi. Zaxira usuli ishlatiladi (sekinroq, 60 MB gacha)";
      } else if (e.type === 'progress') {
        const pct = e.total ? Math.min(100, Math.round(e.done / e.total * 100)) : 0;
        document.getElementById('progressBarFill').style.width = pct + '%';
        setStatus(statusEl, 'Yuborilmoqda... ' + pct + '% (' + formatSize(e.done) + ' / ' + formatSize(e.total) + ')');
      } else if (e.type === 'fallback') {
        routeInfo.textContent = "⚠️ To'g'ridan-to'g'ri ulanish uzildi. Zaxira usulida qayta yuborilmoqda...";
        document.getElementById('progressBarFill').style.width = '0%';
      }
    }
  });
  sender.start();

  async function lockScreen() {
    try { if (navigator.wakeLock) wakeLock = await navigator.wakeLock.request('screen'); } catch (e) {}
  }
  function unlockScreen() {
    try { if (wakeLock) wakeLock.release(); } catch (e) {}
    wakeLock = null;
  }

  newInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    newInput.disabled = true;
    setStatus(statusEl, 'Yuborilmoqda...');
    document.getElementById('progressBarBg').classList.add('active');
    document.getElementById('progressBarFill').style.width = '0%';
    await lockScreen();
    window.onbeforeunload = () => 'Fayl hali yuborilmoqda. Sahifadan chiqsangiz, uzatish to\'xtaydi.';
    try {
      const res = await sender.sendFile(file);
      document.getElementById('progressBarFill').style.width = '100%';
      if (res.acked) {
        setStatus(statusEl, '✅ Kompyuterga yetib bordi! (' + routeLabel(res.route) + ')', 'ok');
      } else if (res.route === 'relay') {
        setStatus(statusEl, "⚠️ Kompyuter qabul qilganini tasdiqlamadi. Kompyuter sahifasi ochiq ekanini tekshirib, qayta yuboring.", 'err');
      } else {
        setStatus(statusEl, "✅ Yuborildi, lekin kompyuterdan tasdiq kelmadi. Kompyuter ekranini tekshiring.", 'ok');
      }
    } catch (err) {
      const m = err && err.message;
      let text = '✗ Xato: ' + m;
      if (m === 'empty-file') text = "✗ Fayl bo'sh.";
      else if (m === 'too-big') text = "✗ Fayl katta (" + formatSize(file.size) + "). To'g'ridan-to'g'ri ulanish o'rnatilmadi, zaxira usuli esa 60 MB gacha. Telefon va kompyuterni bir xil Wi‑Fi'ga ulab, sahifani qayta ochib ko'ring.";
      setStatus(statusEl, text, 'err');
    } finally {
      window.onbeforeunload = null;
      unlockScreen();
      newInput.disabled = false;
      newInput.value = '';
    }
  });
}

function extractRoomFromUrl(text) {
  try {
    const u = new URL(text);
    const send = u.searchParams.get('send');
    if (send && /^\d{4,6}$/.test(send)) return send;
  } catch(e) {}
  if (/^\d{4,6}$/.test(text.trim())) return text.trim();
  return null;
}
async function startScanner() {
  const status = document.getElementById('scanStatus');
  status.textContent = ''; status.className = 'status-line';
  document.getElementById('scannerBox').classList.add('active');
  document.getElementById('startScanBtn').style.display = 'none';
  document.getElementById('stopScanBtn').style.display = 'block';
  html5QrCode = new Html5Qrcode('qr-reader');
  try {
    await html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        const room = extractRoomFromUrl(decodedText);
        if (room) {
          status.textContent = '✅ Topildi! Xona: ' + room;
          status.classList.add('ok');
          stopScanner().then(() => goToSend(room));
        } else {
          status.textContent = 'Bu QR Fayl Uzatish uchun emas.';
          status.className = 'status-line err';
        }
      },
      () => {}
    );
  } catch (err) {
    status.textContent = 'Kamera ochilmadi: ' + (err.message || err);
    status.className = 'status-line err';
    document.getElementById('scannerBox').classList.remove('active');
    document.getElementById('startScanBtn').style.display = 'block';
    document.getElementById('stopScanBtn').style.display = 'none';
  }
}
async function stopScanner() {
  if (html5QrCode) {
    try { await html5QrCode.stop(); } catch(e) {}
    try { html5QrCode.clear(); } catch(e) {}
    html5QrCode = null;
  }
  document.getElementById('scannerBox').classList.remove('active');
  document.getElementById('startScanBtn').style.display = 'block';
  document.getElementById('stopScanBtn').style.display = 'none';
}
document.getElementById('startScanBtn').addEventListener('click', startScanner);
document.getElementById('stopScanBtn').addEventListener('click', stopScanner);
document.getElementById('manualJoinBtn').addEventListener('click', () => {
  const code = document.getElementById('manualCode').value.trim();
  if (/^\d{4,6}$/.test(code)) goToSend(code);
  else {
    document.getElementById('scanStatus').textContent = "Kod 4–6 raqam bo'lishi kerak.";
    document.getElementById('scanStatus').className = 'status-line err';
  }
});
const urlParams = new URLSearchParams(location.search);
const sendRoom = urlParams.get('send');
if (sendRoom && /^\d{4,6}$/.test(sendRoom)) goToSend(sendRoom);

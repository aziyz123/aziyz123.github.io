const firebaseConfig = {
  apiKey: "AIzaSyBJfq4Kc6YZHpbV9WBg__im4bivBcZo1WU",
  authDomain: "osonvakerak.firebaseapp.com",
  databaseURL: "https://osonvakerak-default-rtdb.firebaseio.com",
  projectId: "osonvakerak",
  storageBucket: "osonvakerak.firebasestorage.app",
  messagingSenderId: "363556171064",
  appId: "1:363556171064:web:e21be98e50dff4d031e5cd"
};

let fbApp = null, fbDb = null, fbStorage = null;
function initFb() {
  if (!fbApp) {
    fbApp = firebase.initializeApp(firebaseConfig);
    fbDb = firebase.database();
    fbStorage = firebase.storage();
  }
  return { db: fbDb, storage: fbStorage };
}
function generateRoomCode(){ return String(Math.floor(1000 + Math.random() * 9000)); }

const MAX_BYTES = 50 * 1024 * 1024;
let html5QrCode = null;
let currentFile = null;

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
function showReceivedFile(val) {
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

  db.ref('rooms/' + room + '/file').on('value', (snapshot) => {
    const val = snapshot.val();
    if (!val || !val.url) return;
    showReceivedFile({
      name: val.name,
      type: val.type,
      size: val.size,
      data: val.url
    });
  });
});

function setupSend(room) {
  const { db, storage } = initFb();
  const input = document.getElementById('fileInput');
  const newInput = input.cloneNode(true);
  input.parentNode.replaceChild(newInput, input);

  newInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const statusEl = document.getElementById('sendStatus');
    if (file.size > MAX_BYTES) {
      statusEl.textContent = '✗ Fayl juda katta (' + formatSize(file.size) + '). 50 MB dan kichik tanlang.';
      statusEl.className = 'status-line err';
      return;
    }
    statusEl.textContent = 'Yuklanmoqda...';
    statusEl.className = 'status-line';
    document.getElementById('progressBarBg').classList.add('active');
    document.getElementById('progressBarFill').style.width = '0%';

    const safeName = file.name.replace(/[^a-zA-Z0-9._\-\u0400-\u04FF\u0600-\u06FF]/g, '_');
    const path = 'transfer/' + room + '/' + Date.now() + '_' + safeName;
    const ref = storage.ref(path);
    const task = ref.put(file, { contentType: file.type || 'application/octet-stream' });

    task.on('state_changed',
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        document.getElementById('progressBarFill').style.width = pct + '%';
        statusEl.textContent = 'Yuklanmoqda... ' + pct + '%';
      },
      (err) => {
        statusEl.textContent = '✗ Xato: ' + err.message;
        statusEl.className = 'status-line err';
      },
      async () => {
        try {
          const url = await ref.getDownloadURL();
          await db.ref('rooms/' + room + '/file').set({
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
            url: url,
            sentAt: Date.now()
          });
          document.getElementById('progressBarFill').style.width = '100%';
          statusEl.textContent = "✅ Yuborildi! Kompyuter / doskada ko'ring.";
          statusEl.className = 'status-line ok';
        } catch (err) {
          statusEl.textContent = '✗ Xato: ' + err.message;
          statusEl.className = 'status-line err';
        }
      }
    );
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

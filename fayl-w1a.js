const firebaseConfig = {
  apiKey: "AIzaSyBJfq4Kc6YZHpbV9WBg__im4bivBcZo1WU",
  authDomain: "osonvakerak.firebaseapp.com",
  databaseURL: "https://osonvakerak-default-rtdb.firebaseio.com",
  projectId: "osonvakerak",
  storageBucket: "osonvakerak.firebasestorage.app",
  messagingSenderId: "363556171064",
  appId: "1:363556171064:web:e21be98e50dff4d031e5cd"
};
let fbDb = null;
function getDb(){
  if(!fbDb){ firebase.initializeApp(firebaseConfig); fbDb = firebase.database(); }
  return fbDb;
}
function generateRoomCode(){ return String(Math.floor(1000 + Math.random() * 9000)); }

const ICE_SERVERS = { iceServers: [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
]};
const CHUNK_SIZE = 16384;

let html5QrCode = null;
let currentFile = null;
let hostPc = null;

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
function showReceivedFile(meta, blob) {
  const url = URL.createObjectURL(blob);
  const val = { name: meta.name, type: meta.type, size: meta.size, data: url };
  currentFile = val;
  const cat = getFileCategory(val.name, val.type);
  document.getElementById('statusLine').textContent = '✅ Fayl qabul qilindi!';
  document.getElementById('statusLine').className = 'status-line ok';
  document.getElementById('fileName').textContent = val.name;
  document.getElementById('fileMeta').textContent = formatSize(val.size);
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

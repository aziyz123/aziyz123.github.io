async function setupSend(room) {
  const statusEl = document.getElementById('connStatus');
  const signalRef = getDb().ref('rooms/' + room);
  const fileInput = document.getElementById('fileInput');
  statusEl.textContent = 'Kompyuterga ulanilmoqda...';
  statusEl.className = 'status-line';

  let offerSnap = await signalRef.child('offer').once('value');
  let offer = offerSnap.val();
  if (!offer) {
    statusEl.textContent = 'Xona topilmadi, kutilmoqda...';
    await new Promise((resolve) => {
      const t = setTimeout(() => { signalRef.child('offer').off('value'); resolve(); }, 15000);
      signalRef.child('offer').on('value', (s) => {
        if (s.val()) { clearTimeout(t); signalRef.child('offer').off('value'); offer = s.val(); resolve(); }
      });
    });
  }
  if (!offer) {
    statusEl.textContent = '✗ Xona topilmadi. Kompyuterda avval xona oching.';
    statusEl.className = 'status-line err';
    return;
  }

  const pc = new RTCPeerConnection(ICE_SERVERS);
  let channel = null;

  pc.ondatachannel = (ev) => {
    channel = ev.channel;
    channel.binaryType = 'arraybuffer';
    channel.onopen = () => {
      statusEl.textContent = "✅ Ulandi — faylni tanlang";
      statusEl.className = 'status-line ok';
      fileInput.style.display = 'block';
      document.getElementById('sendHint').style.display = 'block';
    };
    channel.onclose = () => {
      statusEl.textContent = 'Aloqa yopildi';
      statusEl.className = 'status-line';
    };
  };

  pc.oniceconnectionstatechange = () => {
    const st = pc.iceConnectionState;
    if (st === 'failed') {
      statusEl.textContent = '✗ Aloqa uzildi. Bir xil Wi-Fi da bo\'ling.';
      statusEl.className = 'status-line err';
    }
  };

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      signalRef.child('phoneCandidates').push(e.candidate.toJSON()).catch(() => {});
    }
  };

  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  await signalRef.child('answer').set({ sdp: answer.sdp, type: answer.type });

  signalRef.child('hostCandidates').on('child_added', async (snap) => {
    const c = snap.val();
    if (!c) return;
    try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch (e) {}
  });

  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!channel || channel.readyState !== 'open') {
      document.getElementById('sendStatus').textContent = '✗ Hali ulanmagan. Biroz kuting.';
      document.getElementById('sendStatus').className = 'status-line err';
      return;
    }
    const sendStatus = document.getElementById('sendStatus');
    sendStatus.textContent = 'Yuborilmoqda...';
    sendStatus.className = 'status-line';
    document.getElementById('progressBarBg').classList.add('active');
    document.getElementById('progressBarFill').style.width = '0%';

    try {
      channel.send(JSON.stringify({
        type: 'meta',
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size
      }));

      let offset = 0;
      const buffer = await file.arrayBuffer();
      while (offset < buffer.byteLength) {
        while (channel.bufferedAmount > 512 * 1024) {
          await new Promise(r => setTimeout(r, 30));
        }
        if (channel.readyState !== 'open') throw new Error('Aloqa uzildi');
        const end = Math.min(offset + CHUNK_SIZE, buffer.byteLength);
        channel.send(buffer.slice(offset, end));
        offset = end;
        const pct = Math.round(offset / buffer.byteLength * 100);
        document.getElementById('progressBarFill').style.width = pct + '%';
        sendStatus.textContent = 'Yuborilmoqda... ' + pct + '%';
      }

      while (channel.bufferedAmount > 0) {
        await new Promise(r => setTimeout(r, 50));
      }
      channel.send(JSON.stringify({ type: 'done' }));

      document.getElementById('progressBarFill').style.width = '100%';
      sendStatus.textContent = "✅ Yuborildi! Kompyuterda ko'ring.";
      sendStatus.className = 'status-line ok';
    } catch (err) {
      sendStatus.textContent = '✗ Yuborish xato: ' + err.message;
      sendStatus.className = 'status-line err';
    }
  };
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

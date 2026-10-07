async function startHost(room) {
  const signalRef = getDb().ref('rooms/' + room);
  try { await signalRef.remove(); } catch (e) {}
  hostPc = new RTCPeerConnection(ICE_SERVERS);
  const hostChannel = hostPc.createDataChannel('file', { ordered: true });
  let recvMeta = null, recvChunks = [], recvBytes = 0;
  hostChannel.binaryType = 'arraybuffer';

  hostChannel.onopen = () => {
    document.getElementById('statusLine').textContent = '🔗 Ulandi — fayl kutilmoqda...';
    document.getElementById('statusLine').className = 'status-line ok';
  };
  hostChannel.onclose = () => {
    const el = document.getElementById('statusLine');
    if (el && !el.textContent.includes('qabul')) {
      el.textContent = 'Aloqa yopildi';
      el.className = 'status-line';
    }
  };
  hostChannel.onerror = (e) => {
    document.getElementById('statusLine').textContent = '✗ Kanal xatosi';
    document.getElementById('statusLine').className = 'status-line err';
  };

  hostChannel.onmessage = (ev) => {
    try {
      if (typeof ev.data === 'string') {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'meta') {
          recvMeta = msg; recvChunks = []; recvBytes = 0;
          document.getElementById('statusLine').textContent = '📥 Qabul qilinmoqda: ' + msg.name + ' (' + formatSize(msg.size) + ')';
          document.getElementById('statusLine').className = 'status-line';
          document.getElementById('recvProgressBg').classList.add('active');
          document.getElementById('recvProgressFill').style.width = '0%';
        } else if (msg.type === 'done') {
          const blob = new Blob(recvChunks, { type: (recvMeta && recvMeta.type) || 'application/octet-stream' });
          showReceivedFile(recvMeta, blob);
          recvChunks = [];
          try { signalRef.remove(); } catch (e) {}
        }
      } else {
        const chunk = ev.data;
        recvChunks.push(chunk);
        const len = chunk.byteLength != null ? chunk.byteLength : (chunk.size || 0);
        recvBytes += len;
        if (recvMeta && recvMeta.size) {
          const pct = Math.min(100, Math.round(recvBytes / recvMeta.size * 100));
          document.getElementById('recvProgressFill').style.width = pct + '%';
          document.getElementById('statusLine').textContent = '📥 ' + pct + '% — ' + recvMeta.name;
        }
      }
    } catch (err) {
      document.getElementById('statusLine').textContent = '✗ Qabul xato: ' + err.message;
      document.getElementById('statusLine').className = 'status-line err';
    }
  };

  hostPc.oniceconnectionstatechange = () => {
    const st = hostPc.iceConnectionState;
    if (st === 'failed' || st === 'disconnected') {
      document.getElementById('statusLine').textContent = '✗ Aloqa uzildi (' + st + '). Qayta urinib ko\'ring.';
      document.getElementById('statusLine').className = 'status-line err';
    }
  };

  hostPc.onicecandidate = (e) => {
    if (e.candidate) {
      signalRef.child('hostCandidates').push(e.candidate.toJSON()).catch(() => {});
    }
  };

  const offer = await hostPc.createOffer();
  await hostPc.setLocalDescription(offer);
  await signalRef.child('offer').set({ sdp: offer.sdp, type: offer.type });

  signalRef.child('answer').on('value', async (snap) => {
    const ans = snap.val();
    if (!ans || hostPc.currentRemoteDescription) return;
    try {
      await hostPc.setRemoteDescription(new RTCSessionDescription(ans));
    } catch (err) {
      console.error(err);
    }
  });

  signalRef.child('phoneCandidates').on('child_added', async (snap) => {
    const c = snap.val();
    if (!c) return;
    try { await hostPc.addIceCandidate(new RTCIceCandidate(c)); } catch (e) {}
  });
}

document.getElementById('openRoomBtn').addEventListener('click', async () => {
  const room = generateRoomCode();
  const sendUrl = location.origin + location.pathname + '?send=' + room;
  document.getElementById('roomCodeDisplay').textContent = room;
  document.getElementById('qrcodeBox').innerHTML = '';
  new QRCode(document.getElementById('qrcodeBox'), { text: sendUrl, width: 140, height: 140, colorDark: '#12151C', colorLight: '#ffffff' });
  document.getElementById('roomBox').style.display = 'block';
  document.getElementById('openRoomBtn').style.display = 'none';
  document.getElementById('statusLine').textContent = 'Ulanish kutilmoqda...';
  document.getElementById('statusLine').className = 'status-line';
  document.getElementById('fileResult').classList.remove('active');
  try { await startHost(room); }
  catch (err) {
    document.getElementById('statusLine').textContent = '✗ Xato: ' + err.message;
    document.getElementById('statusLine').className = 'status-line err';
  }
});

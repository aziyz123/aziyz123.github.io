async function startHost(room) {
  const signalRef = getDb().ref('webrtc/' + room);
  await signalRef.remove();
  hostPc = new RTCPeerConnection(ICE_SERVERS);
  const hostChannel = hostPc.createDataChannel('file', { ordered: true });
  let recvMeta = null, recvChunks = [], recvBytes = 0;
  hostChannel.binaryType = 'arraybuffer';
  hostChannel.onopen = () => {
    document.getElementById('statusLine').textContent = '🔗 Ulandi — fayl kutilmoqda...';
    document.getElementById('statusLine').className = 'status-line ok';
  };
  hostChannel.onmessage = async (ev) => {
    if (typeof ev.data === 'string') {
      const msg = JSON.parse(ev.data);
      if (msg.type === 'meta') {
        recvMeta = msg; recvChunks = []; recvBytes = 0;
        document.getElementById('statusLine').textContent = '📥 Qabul qilinmoqda: ' + msg.name;
        document.getElementById('statusLine').className = 'status-line';
        document.getElementById('recvProgressBg').classList.add('active');
        document.getElementById('recvProgressFill').style.width = '0%';
      } else if (msg.type === 'done') {
        const blob = new Blob(recvChunks, { type: (recvMeta && recvMeta.type) || 'application/octet-stream' });
        await showReceivedFile(recvMeta, blob);
        recvChunks = [];
        signalRef.remove();
      }
    } else {
      recvChunks.push(ev.data);
      recvBytes += ev.data.byteLength || 0;
      if (recvMeta && recvMeta.size) {
        const pct = Math.min(100, Math.round(recvBytes / recvMeta.size * 100));
        document.getElementById('recvProgressFill').style.width = pct + '%';
        document.getElementById('statusLine').textContent = '📥 ' + pct + '% — ' + recvMeta.name;
      }
    }
  };
  hostPc.onicecandidate = (e) => {
    if (e.candidate) signalRef.child('hostCandidates').push(e.candidate.toJSON());
  };
  const offer = await hostPc.createOffer();
  await hostPc.setLocalDescription(offer);
  await signalRef.child('offer').set({ sdp: offer.sdp, type: offer.type });
  signalRef.child('answer').on('value', async (snap) => {
    const ans = snap.val();
    if (!ans || hostPc.currentRemoteDescription) return;
    try { await hostPc.setRemoteDescription(new RTCSessionDescription(ans)); } catch (err) { console.error(err); }
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
  try { await startHost(room); }
  catch (err) {
    document.getElementById('statusLine').textContent = '✗ Xato: ' + err.message;
    document.getElementById('statusLine').className = 'status-line err';
  }
});

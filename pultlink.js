/* Pultlink: serversiz WebRTC ulanish. Kelishuv ma'lumoti qisqa matn (QR) ko'rinishida almashadi. */
(function(){
  var ICE = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
  function pack(sdp){
    var u = /a=ice-ufrag:(\S+)/.exec(sdp)[1], p = /a=ice-pwd:(\S+)/.exec(sdp)[1];
    var f = /a=fingerprint:sha-256 (\S+)/.exec(sdp)[1].replace(/:/g, '');
    var seen = {}, cs = [];
    sdp.split(/\r?\n/).forEach(function(l){
      if(l.indexOf('a=candidate:') !== 0) return;
      var a = l.slice(12).split(' ');
      if(a[2].toLowerCase() !== 'udp' || a[1] !== '1' || a[4].indexOf(':') >= 0) return;
      var s = a[4] + '~' + a[5] + '~' + (a[7] === 'host' ? 'h' : 's');
      if(!seen[s]){ seen[s] = 1; cs.push(s); }
    });
    return [u, p, f, cs.slice(0, 6).join(',')].join('|');
  }
  function unpack(str, type){
    var a = str.split('|'); if(a.length < 4) throw new Error('Kod noto\'g\'ri');
    var f = a[2].match(/../g).join(':').toUpperCase();
    var lines = ['v=0', 'o=- 4611731400430051336 2 IN IP4 127.0.0.1', 's=-', 't=0 0', 'a=group:BUNDLE 0', 'a=msid-semantic: WMS',
      'm=application 9 UDP/DTLS/SCTP webrtc-datachannel', 'c=IN IP4 0.0.0.0', 'a=ice-ufrag:' + a[0], 'a=ice-pwd:' + a[1],
      'a=fingerprint:sha-256 ' + f, 'a=setup:' + (type === 'offer' ? 'actpass' : 'active'), 'a=mid:0', 'a=sctp-port:5000', 'a=max-message-size:262144'];
    a[3].split(',').filter(Boolean).forEach(function(c, i){
      var q = c.split('~'), host = q[2] === 'h';
      lines.push('a=candidate:' + (i + 1) + ' 1 udp ' + (host ? 2122260223 - i : 1686052607 - i) + ' ' + q[0] + ' ' + q[1] + ' typ ' + (host ? 'host' : 'srflx raddr 0.0.0.0 rport 0'));
    });
    lines.push('a=end-of-candidates');
    return { type: type, sdp: lines.join('\r\n') + '\r\n' };
  }
  function gather(pc){
    return new Promise(function(res){
      if(pc.iceGatheringState === 'complete') return res();
      var done = function(){ pc.removeEventListener('icegatheringstatechange', ch); res(); };
      var ch = function(){ if(pc.iceGatheringState === 'complete') done(); };
      pc.addEventListener('icegatheringstatechange', ch); setTimeout(done, 3000);
    });
  }
  // VR telefon: taklif yaratadi
  function host(onOpen, onMsg, onState){
    var pc = new RTCPeerConnection(ICE), ch = pc.createDataChannel('ctl', { ordered: false, maxRetransmits: 0 });
    ch.onopen = function(){ onOpen(ch); }; ch.onmessage = function(e){ onMsg(e.data); };
    pc.onconnectionstatechange = function(){ onState && onState(pc.connectionState); };
    return pc.createOffer().then(function(o){ return pc.setLocalDescription(o); }).then(function(){ return gather(pc); }).then(function(){
      return { pc: pc, ch: ch, code: pack(pc.localDescription.sdp), accept: function(code){ return pc.setRemoteDescription(unpack(code, 'answer')); } };
    });
  }
  // Pult telefon: taklifni qabul qilib javob yaratadi
  function join(offerCode, onOpen, onMsg, onState){
    var pc = new RTCPeerConnection(ICE);
    pc.ondatachannel = function(e){ var ch = e.channel; ch.onmessage = function(m){ onMsg(m.data); }; if(ch.readyState === 'open') onOpen(ch); else ch.onopen = function(){ onOpen(ch); }; };
    pc.onconnectionstatechange = function(){ onState && onState(pc.connectionState); };
    return pc.setRemoteDescription(unpack(offerCode, 'offer')).then(function(){ return pc.createAnswer(); }).then(function(a){ return pc.setLocalDescription(a); }).then(function(){ return gather(pc); }).then(function(){
      return { pc: pc, code: pack(pc.localDescription.sdp) };
    });
  }
  // QR chizish (canvas'ga) va kamera bilan o'qish
  function drawQR(canvas, text){
    var qr = qrcode(0, 'L'); qr.addData(text); qr.make();
    var n = qr.getModuleCount(), cell = Math.max(3, Math.floor(300 / n)), m = 4, size = (n + m * 2) * cell;
    canvas.width = canvas.height = size; var g = canvas.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, size, size); g.fillStyle = '#000';
    for(var r = 0; r < n; r++) for(var c = 0; c < n; c++) if(qr.isDark(r, c)) g.fillRect((c + m) * cell, (r + m) * cell, cell, cell);
  }
  function loadScript(src){ return new Promise(function(ok, bad){ if(window.jsQR) return ok(); var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = bad; document.head.appendChild(s); }); }
  function scan(video, onText, onErr){
    var stop = false, stream = null;
    loadScript('lib/jsqr.js').then(function(){ return navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }); }).then(function(s){
      stream = s; video.srcObject = s; video.setAttribute('playsinline', ''); video.play();
      var cv = document.createElement('canvas'), g = cv.getContext('2d', { willReadFrequently: true });
      (function tick(){
        if(stop) return;
        if(video.videoWidth){
          var k = Math.min(1, 480 / video.videoWidth); cv.width = video.videoWidth * k; cv.height = video.videoHeight * k; g.drawImage(video, 0, 0, cv.width, cv.height);
          var r = jsQR(g.getImageData(0, 0, cv.width, cv.height).data, cv.width, cv.height);
          if(r && r.data){ stop = true; s.getTracks().forEach(function(t){ t.stop(); }); onText(r.data); return; }
        }
        setTimeout(tick, 120);
      })();
    }).catch(function(e){ onErr && onErr(e); });
    return function(){ stop = true; if(stream) stream.getTracks().forEach(function(t){ t.stop(); }); };
  }
  window.PultLink = { host: host, join: join, drawQR: drawQR, scan: scan, pack: pack, unpack: unpack };
})();

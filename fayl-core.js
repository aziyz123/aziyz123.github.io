/*
 * Fayl Uzatish — transfer engine.
 *  1) Tries a direct WebRTC data channel (signalling through Firebase Realtime Database).
 *  2) If the direct connection does not open in time, or breaks mid-transfer,
 *     falls back to sending the file in chunks through Realtime Database.
 * No DOM access here, so it can be tested in Node.
 */
(function (root) {
  'use strict';

  var DEFAULTS = {
    iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }],
    p2pChunk: 16 * 1024,           // safe size for every browser
    readBlock: 256 * 1024,         // how much of the file we read at once
    highWater: 4 * 1024 * 1024,    // pause sending above this buffered amount
    lowWater: 1 * 1024 * 1024,     // resume below this
    relayRaw: 196608,              // 192 KB raw -> 256 KB base64 per database chunk
    relayConcurrency: 4,
    relayBytesPerSec: 800 * 1024,  // keep well under Realtime Database's 64 MB/minute write limit
    p2pMax: 200 * 1024 * 1024,
    relayMax: 60 * 1024 * 1024,
    connectTimeoutMs: 10000,
    stallMs: 15000,
    ackTimeoutMs: 30000,
    relayAckTimeoutMs: 120000
  };

  function sid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function bytesToBase64(bytes) {
    var s = '', step = 0x8000;
    for (var i = 0; i < bytes.length; i += step) {
      s += String.fromCharCode.apply(null, bytes.subarray(i, i + step));
    }
    return btoa(s);
  }
  function base64ToBytes(b64) {
    var s = atob(b64), out = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  }
  // Realtime Database rejects `undefined`, so only copy known fields.
  function candJson(c) {
    var o = { candidate: c.candidate || '' };
    if (c.sdpMid != null) o.sdpMid = c.sdpMid;
    if (c.sdpMLineIndex != null) o.sdpMLineIndex = c.sdpMLineIndex;
    if (c.usernameFragment != null) o.usernameFragment = c.usernameFragment;
    return o;
  }
  // ICE candidates may arrive before the remote description is set; queue them.
  function candidateQueue(pc) {
    var pending = [];
    return {
      add: function (c) {
        if (!c) return;
        if (pc.remoteDescription) { pc.addIceCandidate(c).catch(function () {}); }
        else pending.push(c);
      },
      flush: function () {
        var list = pending; pending = [];
        return Promise.all(list.map(function (c) { return pc.addIceCandidate(c).catch(function () {}); }));
      }
    };
  }

  /* ------------------------------------------------------------------ SENDER */
  function createSender(opts) {
    var cfg = Object.assign({}, DEFAULTS, opts.config || {});
    var db = opts.db, room = opts.room;
    var emit = opts.onEvent || function () {};
    var RTC = opts.RTCPeerConnection || root.RTCPeerConnection;
    var base = 'rooms/' + room + '/rtc/' + sid();
    var pc = null, dc = null, timer = null, decided = false, gotAnswer = false;
    var resolveRoute;
    var routePromise = new Promise(function (r) { resolveRoute = r; });
    var ackWaiters = [];

    function decide(route, reason) {
      if (decided) return;
      decided = true; clearTimeout(timer);
      resolveRoute(route);
      emit({ type: 'route', route: route, reason: reason || '' });
    }

    function start() {
      if (!RTC) { decide('relay', 'no-webrtc'); return Promise.resolve(); }
      try {
        pc = new RTC({ iceServers: cfg.iceServers });
        dc = pc.createDataChannel('file');
      } catch (e) { decide('relay', 'rtc-error'); return Promise.resolve(); }
      dc.binaryType = 'arraybuffer';
      dc.bufferedAmountLowThreshold = cfg.lowWater;
      dc.onopen = function () { decide('p2p'); };
      dc.onmessage = function (e) {
        if (typeof e.data !== 'string') return;
        var m; try { m = JSON.parse(e.data); } catch (_) { return; }
        if (m.t === 'ack') { var w = ackWaiters.shift(); if (w) w(m); }
      };
      pc.oniceconnectionstatechange = function () {
        if (pc.iceConnectionState === 'failed') decide('relay', 'ice-failed');
      };
      pc.onicecandidate = function (e) {
        if (e.candidate) db.ref(base + '/s').push(candJson(e.candidate));
      };
      var q = candidateQueue(pc);
      db.ref(base + '/r').on('child_added', function (s) { q.add(s.val()); });
      db.ref(base + '/answer').on('value', function (s) {
        var a = s.val();
        if (!a || gotAnswer) return;
        gotAnswer = true;
        pc.setRemoteDescription(a).then(function () { return q.flush(); })
          .catch(function () { decide('relay', 'answer-failed'); });
      });
      timer = setTimeout(function () { decide('relay', 'timeout'); }, cfg.connectTimeoutMs);
      return pc.createOffer().then(function (offer) {
        return pc.setLocalDescription(offer).then(function () {
          return db.ref(base + '/offer').set({ type: offer.type, sdp: offer.sdp });
        });
      }).catch(function () { decide('relay', 'offer-failed'); });
    }

    function waitAck(ms) {
      return new Promise(function (res) {
        var t;
        var w = function (m) { clearTimeout(t); res(m); };
        t = setTimeout(function () {
          var i = ackWaiters.indexOf(w); if (i >= 0) ackWaiters.splice(i, 1);
          res(null);
        }, ms);
        ackWaiters.push(w);
      });
    }

    async function waitDrain() {
      if (dc.bufferedAmount <= cfg.highWater) return;
      var last = dc.bufferedAmount, lastChange = Date.now();
      while (dc.bufferedAmount > cfg.lowWater) {
        if (dc.readyState !== 'open') throw new Error('p2p-closed');
        await Promise.race([
          new Promise(function (r) { dc.onbufferedamountlow = function () { dc.onbufferedamountlow = null; r(); }; }),
          sleep(200)
        ]);
        var now = dc.bufferedAmount;
        if (now < last) { last = now; lastChange = Date.now(); }
        else if (Date.now() - lastChange > cfg.stallMs) throw new Error('p2p-stalled');
      }
    }

    async function sendP2P(file) {
      if (!dc || dc.readyState !== 'open') throw new Error('p2p-not-open');
      emit({ type: 'progress', route: 'p2p', done: 0, total: file.size });
      dc.send(JSON.stringify({ t: 'meta', name: file.name, size: file.size, type: file.type || '' }));
      var sent = 0, lastEmitAt = 0;
      for (var off = 0; off < file.size; off += cfg.readBlock) {
        var block = new Uint8Array(await file.slice(off, Math.min(off + cfg.readBlock, file.size)).arrayBuffer());
        for (var i = 0; i < block.length; i += cfg.p2pChunk) {
          await waitDrain();
          if (dc.readyState !== 'open') throw new Error('p2p-closed');
          var piece = block.slice(i, Math.min(i + cfg.p2pChunk, block.length)); // copy => exact ArrayBuffer
          dc.send(piece);
          sent += piece.length;
          if (sent - lastEmitAt >= 128 * 1024 || sent === file.size) {
            lastEmitAt = sent;
            emit({ type: 'progress', route: 'p2p', done: sent, total: file.size });
          }
        }
      }
      var ackP = waitAck(cfg.ackTimeoutMs);   // register BEFORE sending "done"
      dc.send(JSON.stringify({ t: 'done' }));
      var ack = await ackP;
      if (ack && ack.ok === false) throw new Error('p2p-size-mismatch');
      return { acked: !!ack };
    }

    async function sendRelay(file) {
      if (file.size > cfg.relayMax) throw new Error('too-big');
      var tid = sid();
      var total = Math.ceil(file.size / cfg.relayRaw);
      var metaRef = db.ref('rooms/' + room + '/relayMeta/' + tid);
      var chunkBase = 'rooms/' + room + '/relayChunks/' + tid;
      emit({ type: 'progress', route: 'relay', done: 0, total: file.size });
      try {
        await metaRef.set({ name: file.name, size: file.size, type: file.type || '', total: total, at: Date.now() });
        var next = 0, doneChunks = 0, writtenBytes = 0, t0 = Date.now();
        // Reserve a slot in the write budget, then wait until our turn.
        var throttle = async function (n) {
          writtenBytes += n;
          var wait = t0 + (writtenBytes / cfg.relayBytesPerSec) * 1000 - Date.now();
          if (wait > 0) await sleep(wait);
        };
        var worker = async function () {
          for (;;) {
            var i = next++;
            if (i >= total) return;
            var raw = new Uint8Array(await file.slice(i * cfg.relayRaw, Math.min((i + 1) * cfg.relayRaw, file.size)).arrayBuffer());
            var b64 = bytesToBase64(raw);
            await throttle(b64.length);
            await db.ref(chunkBase + '/c' + String(i).padStart(5, '0')).set(b64);
            doneChunks++;
            emit({ type: 'progress', route: 'relay', done: Math.min(file.size, doneChunks * cfg.relayRaw), total: file.size });
          }
        };
        var workers = [];
        for (var k = 0; k < cfg.relayConcurrency; k++) workers.push(worker());
        await Promise.all(workers);
        await metaRef.child('complete').set(true);
      } catch (err) {
        db.ref(chunkBase).remove().catch(function () {});
        throw err;
      }
      var ackRef = metaRef.child('ack');
      var acked = await new Promise(function (res) {
        var t, h;
        h = function (s) { if (s.val()) { clearTimeout(t); ackRef.off('value', h); res(true); } };
        t = setTimeout(function () { ackRef.off('value', h); res(false); }, cfg.relayAckTimeoutMs);
        ackRef.on('value', h);
      });
      if (!acked) db.ref(chunkBase).remove().catch(function () {}); // receiver is gone: do not leave data behind
      return { acked: acked };
    }

    async function sendFile(file) {
      if (!file || !file.size) throw new Error('empty-file');
      var route = await routePromise;
      if (route === 'p2p' && file.size <= cfg.p2pMax) {
        try {
          var r = await sendP2P(file);
          emit({ type: 'sent', route: 'p2p', acked: r.acked });
          return { route: 'p2p', acked: r.acked };
        } catch (err) {
          emit({ type: 'fallback', reason: String((err && err.message) || err) });
        }
      } else if (route === 'p2p') {
        emit({ type: 'fallback', reason: 'file-too-big-for-p2p' });
      }
      var rr = await sendRelay(file);
      emit({ type: 'sent', route: 'relay', acked: rr.acked });
      return { route: 'relay', acked: rr.acked };
    }

    function close() {
      clearTimeout(timer);
      try { db.ref(base + '/r').off(); db.ref(base + '/answer').off(); } catch (_) {}
      try { if (dc) dc.close(); } catch (_) {}
      try { if (pc) pc.close(); } catch (_) {}
    }

    return {
      start: start, sendFile: sendFile, close: close, route: routePromise,
      _debug: { dc: function () { return dc; }, cfg: cfg }
    };
  }

  /* ---------------------------------------------------------------- RECEIVER */
  function createReceiver(opts) {
    var cfg = Object.assign({}, DEFAULTS, opts.config || {});
    var db = opts.db, room = opts.room;
    var emit = opts.onEvent || function () {};
    var RTC = opts.RTCPeerConnection || root.RTCPeerConnection;
    var rtcBase = 'rooms/' + room + '/rtc';
    var sessions = [];
    var handledTransfers = {};

    function attachChannel(dc) {
      dc.binaryType = 'arraybuffer';
      var meta = null, chunks = [], got = 0, lastEmitAt = 0;
      dc.onopen = function () { emit({ type: 'peer', route: 'p2p' }); };
      dc.onmessage = function (e) {
        if (typeof e.data === 'string') {
          var m; try { m = JSON.parse(e.data); } catch (_) { return; }
          if (m.t === 'meta') {
            meta = m; chunks = []; got = 0; lastEmitAt = 0;
            emit({ type: 'progress', route: 'p2p', name: m.name, done: 0, total: m.size });
          } else if (m.t === 'done' && meta) {
            var blob = new Blob(chunks, { type: meta.type || 'application/octet-stream' });
            var ok = blob.size === meta.size;
            try { dc.send(JSON.stringify({ t: 'ack', ok: ok })); } catch (_) {}
            if (ok) emit({ type: 'file', route: 'p2p', name: meta.name, size: meta.size, mime: meta.type, blob: blob });
            else emit({ type: 'error', reason: 'size-mismatch', name: meta.name });
            meta = null; chunks = []; got = 0;
          }
        } else if (meta) {
          chunks.push(e.data);
          got += e.data.byteLength;
          if (got - lastEmitAt >= 128 * 1024 || got === meta.size) {
            lastEmitAt = got;
            emit({ type: 'progress', route: 'p2p', name: meta.name, done: got, total: meta.size });
          }
        }
      };
    }

    function handleSession(sessionId) {
      var base = rtcBase + '/' + sessionId;
      if (!RTC) return;
      var pc = new RTC({ iceServers: cfg.iceServers });
      sessions.push({ sid: sessionId, pc: pc });
      var q = candidateQueue(pc);
      pc.onicecandidate = function (e) {
        if (e.candidate) db.ref(base + '/r').push(candJson(e.candidate));
      };
      pc.ondatachannel = function (ev) { attachChannel(ev.channel); };
      db.ref(base + '/s').on('child_added', function (s) { q.add(s.val()); });
      var answered = false;
      db.ref(base + '/offer').on('value', function (s) {
        var offer = s.val();
        if (!offer || answered) return;
        answered = true;
        pc.setRemoteDescription(offer)
          .then(function () { return q.flush(); })
          .then(function () { return pc.createAnswer(); })
          .then(function (ans) {
            return pc.setLocalDescription(ans).then(function () {
              return db.ref(base + '/answer').set({ type: ans.type, sdp: ans.sdp });
            });
          })
          .catch(function () {});
      });
    }

    function handleRelay(tid, meta) {
      if (handledTransfers[tid] || !meta || meta.ack) return;
      handledTransfers[tid] = true;
      emit({ type: 'peer', route: 'relay' });
      var parts = new Array(meta.total), got = 0, finished = false;
      var chunksRef = db.ref('rooms/' + room + '/relayChunks/' + tid);
      emit({ type: 'progress', route: 'relay', name: meta.name, done: 0, total: meta.size });
      chunksRef.on('child_added', function (s) {
        if (finished) return;
        var idx = parseInt(String(s.key).slice(1), 10);
        if (isNaN(idx) || idx >= meta.total || parts[idx]) return;
        parts[idx] = base64ToBytes(s.val());
        got++;
        emit({ type: 'progress', route: 'relay', name: meta.name, done: Math.min(meta.size, got * cfg.relayRaw), total: meta.size });
        if (got === meta.total) {
          finished = true;
          chunksRef.off();
          var blob = new Blob(parts, { type: meta.type || 'application/octet-stream' });
          parts = null;
          var ok = blob.size === meta.size;
          if (ok) emit({ type: 'file', route: 'relay', name: meta.name, size: meta.size, mime: meta.type, blob: blob });
          else emit({ type: 'error', reason: 'size-mismatch', name: meta.name });
          db.ref('rooms/' + room + '/relayMeta/' + tid + '/ack').set(ok)
            .then(function () { return chunksRef.remove(); })
            .catch(function () {});
        }
      });
    }

    function start() {
      return db.ref(rtcBase).once('value').then(function (snap) {
        var seen = {}; var v = snap.val() || {};
        Object.keys(v).forEach(function (k) { seen[k] = true; });   // ignore stale sessions
        db.ref(rtcBase).on('child_added', function (s) {
          if (seen[s.key]) return;
          seen[s.key] = true;
          handleSession(s.key);
        });
        db.ref('rooms/' + room + '/relayMeta').on('child_added', function (s) { handleRelay(s.key, s.val()); });
      });
    }

    function close() {
      try { db.ref(rtcBase).off(); db.ref('rooms/' + room + '/relayMeta').off(); } catch (_) {}
      sessions.forEach(function (x) { try { x.pc.close(); } catch (_) {} });
    }

    return { start: start, close: close };
  }

  var api = {
    createSender: createSender, createReceiver: createReceiver,
    DEFAULTS: DEFAULTS, bytesToBase64: bytesToBase64, base64ToBytes: base64ToBytes
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FileXfer = api;
})(typeof window !== 'undefined' ? window : globalThis);

(function(){
  var $ = function(i){ return document.getElementById(i); }, M = window.__muzey, link = null, stopScan = null, ch = null;
  function stat(t){ $('pStat').textContent = t; }
  $('pultBtn').addEventListener('click', function(){ $('pultPanel').hidden = !$('pultPanel').hidden; });
  $('pClose').addEventListener('click', function(){ $('pultPanel').hidden = true; if(stopScan) stopScan(); $('pVid').hidden = true; });
  function onMsg(d){
    var m; try{ m = JSON.parse(d); }catch(_){ return; }
    var e = M.ext; e.t = performance.now();
    if(m.t === 'c'){ e.x = +m.x || 0; e.y = +m.y || 0; e.turn = -(+m.r || 0); }
    else if(m.t === 'g'){ M.go(m.i | 0); }
  }
  $('pMake').addEventListener('click', function(){
    if(!window.RTCPeerConnection){ stat('Bu brauzer WebRTC\'ni qo\'llamaydi.'); return; }
    stat('Yaratilmoqda…'); $('pMake').disabled = true;
    PultLink.host(function(c){ ch = c; stat('✅ Ulandi! Endi VR tugmasini bosing.'); $('pStep1').hidden = true; $('pVid').hidden = true;
      try{ c.send(JSON.stringify({ t: 'hi', s: M.spots.map(function(s){ return s.name; }) })); }catch(_){}
    }, onMsg, function(s){ if(s === 'disconnected' || s === 'failed' || s === 'closed'){ stat('Ulanish uzildi. Qayta «QR yaratish»ni bosing.'); M.ext.x = M.ext.y = M.ext.turn = 0; $('pMake').disabled = false; } })
    .then(function(l){
      link = l; var url = new URL('muzey-pult.html', location.href).href + '#o=' + encodeURIComponent(l.code);
      PultLink.drawQR($('pQR'), url); $('pStep1').hidden = false; $('pMake').disabled = false; $('pMake').textContent = 'QR\'ni qayta yaratish'; stat('QR tayyor.');
    }).catch(function(e){ stat('Xato: ' + (e && e.message || e)); $('pMake').disabled = false; });
  });
  $('pScan').addEventListener('click', function(){
    if(!link){ return; } $('pVid').hidden = false; stat('Pult ekranidagi QR\'ga kamerani qarating…');
    stopScan = PultLink.scan($('pVid'), function(txt){
      $('pVid').hidden = true; stat('Ulanmoqda…');
      link.accept(txt.replace(/^MZA1:/, '')).catch(function(e){ stat('Kod noto\'g\'ri: ' + (e && e.message || e)); });
    }, function(){ stat('Kameraga ruxsat berilmadi.'); $('pVid').hidden = true; });
  });
})();

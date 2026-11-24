/* Bilim Kechasi: ustoz telefoni — taxtani masofadan boshqarish (Firebase: rooms/<kod>/remote) */
(function(){
  var $ = function(i){ return document.getElementById(i); };
  var code = null, ref = null, lastQ = null, timer = null, phoneOn = false;
  function newCode(){ return String(Math.floor(100000 + Math.random() * 900000)); }
  function stateJson(){
    if(typeof session === 'undefined' || !session || typeof board === 'undefined' || !board) return null;
    var s = { rt: $('roundTag').textContent, turn: board.currentTeamIdx, teams: session.teams.map(function(t){ return { n: t.name, s: t.score }; }),
      tiles: board.tiles.map(function(t){ return { n: t.number, u: t.used ? 1 : 0, k: t.kind === 'surprise' ? 's' : 'q' }; }), pts: session.correctPoints };
    var ov = $('playOverlay');
    if(ov && ov.classList.contains('active')){
      var pc = $('playCard');
      if(pc.querySelector('.question-text') && lastQ){
        var cr = $('ctrlRow');
        s.card = { t: 'q', q: lastQ.question, mc: lastQ.type === 'mc', o: lastQ.options || [], c: lastQ.type === 'mc' ? lastQ.correctIndex : -1, a: lastQ.answer || '', rev: !!(cr && cr.style.display === 'none') };
      } else {
        var tg = $('stealTargets');
        s.card = { t: 's', title: (pc.querySelector('.surprise-title') || {}).textContent || '', desc: (pc.querySelector('.surprise-desc') || {}).textContent || '', ack: !!$('surAck'), targets: tg ? Array.prototype.map.call(tg.querySelectorAll('button'), function(b){ return b.textContent; }) : [] };
      }
    }
    if($('roundEndOverlay').classList.contains('active')){
      s.end = { w: ($('winnerName') || {}).textContent || '', last: $('nextRoundBtn').style.display === 'none' };
    }
    return s;
  }
  function push(){
    if(!ref) return; clearTimeout(timer);
    timer = setTimeout(function(){ var s = stateJson(); if(s) ref.child('state').set({ j: JSON.stringify(s), t: Date.now() }).catch(showErr); }, 80);
  }
  function showErr(e){ var st = $('remoteStatus'); if(st) st.textContent = '✗ Ulanishda xato: ' + (e && e.message ? e.message : e) + '. Internet va Firebase ruxsatini tekshiring.'; }
  function click(id){ var e = $(id); if(e && e.offsetParent !== null) e.click(); }
  function exec(c){
    var ov = $('playOverlay').classList.contains('active'), end = $('roundEndOverlay').classList.contains('active');
    switch(c.c){
      case 'pick': if(!ov && !end){ var t = board.tiles.filter(function(x){ return x.number === c.n && !x.used; })[0]; if(t) selectTile(t); } break;
      case 'reveal': click('revealBtn2'); break;
      case 'correct': click('correctBtn2'); break;
      case 'wrong': click('wrongBtn2'); break;
      case 'skip': click('skipBtn2'); break;
      case 'ack': click('surAck'); break;
      case 'steal': var b = $('stealTargets') && $('stealTargets').querySelectorAll('button')[c.i]; if(b) b.click(); break;
      case 'next': click('nextRoundBtn'); break;
      case 'finish': click('finishBtn'); break;
    }
    push();
  }
  function wrap(name, after){ var f = window[name]; if(typeof f !== 'function') return; window[name] = function(){ var r = f.apply(this, arguments); try{ after.apply(null, arguments); }catch(_){} return r; }; }
  function connect(){
    if(typeof firebase === 'undefined'){ showErr('Firebase yuklanmadi'); return; }
    ref = getDb().ref('rooms/' + code + '/remote');
    ref.child('cmd').remove().catch(function(){});
    ref.child('cmd').on('child_added', function(sn){ var c = sn.val(); sn.ref.remove().catch(function(){}); if(c && Date.now() - (c.t || 0) < 20000) exec(c); });
    ref.child('phone').on('value', function(sn){ phoneOn = !!sn.val(); render(); });
    push();
  }
  function render(){
    var st = $('remoteStatus'), b = $('remoteBtn');
    if(st) st.innerHTML = phoneOn ? '✅ Ustoz telefoni ulandi' : '⏳ Telefon ulanishi kutilmoqda…';
    if(b) b.textContent = phoneOn ? '📱 Pult: ulangan ✓' : '📱 Telefon pulti';
  }
  function open(){
    if(!code){ try{ code = sessionStorage.getItem('bkRemote'); }catch(_){} if(!code){ code = newCode(); try{ sessionStorage.setItem('bkRemote', code); }catch(_){} } connect(); }
    var url = new URL('bilim-pult.html', location.href).href + '?c=' + code;
    $('remoteCode').textContent = code; $('remoteUrl').textContent = url;
    $('remoteQR').innerHTML = ''; try{ new QRCode($('remoteQR'), { text: url, width: 170, height: 170, colorDark: '#12151C', colorLight: '#ffffff' }); }catch(_){}
    $('remotePanel').style.display = 'flex'; render();
  }
  function init(){
    var bar = document.querySelector('#gameScreen .top-bar'); if(!bar) return;
    var b = document.createElement('span'); b.className = 'exit-link'; b.id = 'remoteBtn'; b.textContent = '📱 Telefon pulti'; b.style.marginLeft = 'auto'; b.style.marginRight = '10px';
    bar.insertBefore(b, $('roundTag')); b.addEventListener('click', open);
    var p = document.createElement('div'); p.id = 'remotePanel';
    p.style.cssText = 'display:none;position:fixed;inset:0;z-index:60;background:rgba(10,18,32,.78);align-items:center;justify-content:center;padding:16px;';
    p.innerHTML = '<div style="background:#F4EFE3;color:#14213A;border-radius:22px;padding:22px;max-width:420px;width:100%;text-align:center;box-shadow:0 30px 80px rgba(0,0,0,.4)">' +
      '<div style="font:700 20px Georgia,serif;margin-bottom:6px">📱 Ustoz telefoni — pult</div>' +
      '<div style="font-size:13.5px;line-height:1.5;color:#3b4660;margin-bottom:12px">Telefon kamerasi bilan QR\'ni skanerlang yoki <b>bilim-pult</b> sahifasida kodni kiriting. Raqamni tanlash, javobni ko\'rsatish va ball berishni telefondan qilasiz, taxtaga borish shart emas.</div>' +
      '<div id="remoteQR" style="display:inline-block;background:#fff;padding:10px;border-radius:12px;line-height:0"></div>' +
      '<div style="margin-top:10px;font:600 13px monospace;color:#6b7690">Kod</div><div id="remoteCode" style="font:700 34px monospace;letter-spacing:6px"></div>' +
      '<div id="remoteUrl" style="font-size:11px;color:#6b7690;word-break:break-all;margin:6px 0"></div>' +
      '<div id="remoteStatus" style="margin:10px 0;font-size:14px;font-weight:600"></div>' +
      '<button id="remoteClose" type="button" style="padding:12px 26px;border-radius:999px;border:0;background:#14213A;color:#F4EFE3;font:600 14px Inter,sans-serif;cursor:pointer">Yopish</button></div>';
    document.body.appendChild(p); $('remoteClose').addEventListener('click', function(){ p.style.display = 'none'; });
    wrap('openQuestionCard', function(q){ lastQ = q; push(); });
    ['renderBoard', 'renderScoreboard', 'renderTurnBanner', 'openSurpriseCard', 'closePlayCard', 'showRoundEnd', 'startRound'].forEach(function(n){ wrap(n, push); });
    $('playCard').addEventListener('click', function(){ setTimeout(push, 120); });
    document.addEventListener('click', function(e){ if(e.target && /nextRoundBtn|finishBtn/.test(e.target.id || '')) setTimeout(push, 150); });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

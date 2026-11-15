/* Jang xaritasi enhancements: timeline, stage nav, compass */
(function(){
  function $(id){ return document.getElementById(id); }

  window.stageIndexAt = function(tm){
    if(typeof stateAt === 'function') return stateAt(tm);
    if(!window.model || !model.stages) return -1;
    const sts = model.stages;
    let k = sts.findIndex(s => tm >= s.t0 && tm < s.t1);
    if(k < 0) k = tm < sts[0].t0 ? -1 : sts.length;
    return k;
  };

  window.goToStage = function(idx){
    if(!window.model || !model.stages) return;
    const sts = model.stages;
    if(idx < 0) window.t = 0;
    else if(idx >= sts.length) window.t = (model.outro && model.outro.t0 != null) ? model.outro.t0 : model.total;
    else window.t = sts[idx].t0 + 0.05;
    window.playing = false;
    try { const pb = $('playBtn'); if(pb) pb.textContent = '\u25b6 Davom'; } catch(e) {}
    try { if(typeof audPause === 'function') audPause(true); } catch(e) {}
    try { const sk = $('seek'); if(sk && model.total) sk.value = Math.round(1000 * Math.min(1, t / model.total)); } catch(e) {}
    try { if(typeof render === 'function') render(t); } catch(e) {}
    updateTimelineUI(t);
  };

  window.updateTimelineUI = function(tm){
    const box = $('tlSteps');
    const info = $('stageInfo');
    if(!box || !window.model || !model.stages) return;
    const sts = model.stages;
    const k = stageIndexAt(tm);
    if(!box.dataset.built || box.dataset.count != String(sts.length)){
      box.innerHTML = '';
      sts.forEach((st, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'tl-step'; b.dataset.i = String(i);
        const short = (st.text || ('Bosqich ' + (i+1))).replace(/\s+/g,' ').slice(0, 72);
        b.innerHTML = '<b>' + (i+1) + ' / ' + sts.length + '</b>' + short;
        b.onclick = () => goToStage(i);
        box.appendChild(b);
      });
      const rb = document.createElement('button');
      rb.type = 'button'; rb.className = 'tl-step'; rb.dataset.i = String(sts.length);
      rb.innerHTML = '<b>Natija</b>' + ((model.sc && model.sc.result) ? String(model.sc.result).slice(0,72) : 'Yakun');
      rb.onclick = () => goToStage(sts.length);
      box.appendChild(rb);
      box.dataset.built = '1'; box.dataset.count = String(sts.length);
    }
    Array.from(box.querySelectorAll('.tl-step')).forEach(el => {
      const i = +el.dataset.i;
      el.classList.toggle('on', i === k || (k === sts.length && i === sts.length));
    });
    if(info){
      if(k < 0) info.textContent = 'Kirish \u00b7 VS';
      else if(k >= sts.length) info.textContent = 'Natija';
      else info.textContent = 'Bosqich ' + (k+1) + ' / ' + sts.length + (sts[k].text ? ' \u2014 ' + sts[k].text.slice(0,48) : '');
    }
  };

  window.drawCompassAndScale = function(v){
    if(typeof cv === 'undefined' || typeof ctx === 'undefined' || !cv || !ctx) return;
    const W = cv.width, H = cv.height, u = W / 540;
    const cx = W - 36 * u, cy = H - 110 * u, r = 16 * u;
    ctx.save();
    ctx.fillStyle = 'rgba(15,12,8,.55)';
    ctx.beginPath(); ctx.arc(cx, cy, r + 6 * u, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#E8A33D';
    ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx - 6 * u, cy + 4 * u); ctx.lineTo(cx + 6 * u, cy + 4 * u); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '700 ' + 11 * u + 'px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('N', cx, cy + 6 * u);
    const sx = 28 * u, sy = H - 28 * u, sw = 56 * u;
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.lineWidth = 2 * u;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + sw, sy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx, sy - 4 * u); ctx.lineTo(sx, sy + 4 * u); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx + sw, sy - 4 * u); ctx.lineTo(sx + sw, sy + 4 * u); ctx.stroke();
    ctx.font = '600 ' + 11 * u + 'px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('\u2248 5 km', sx + sw / 2, sy - 6 * u);
    ctx.restore();
  };

  function patchRender(){
    if(window.__jangEnhancePatched) return;
    if(typeof window.drawOverlay !== 'function') return;
    const orig = window.drawOverlay;
    window.drawOverlay = function(tm, k, gn, v){
      const r = orig.apply(this, arguments);
      try { drawCompassAndScale(v); } catch(e) {}
      try { updateTimelineUI(tm); } catch(e) {}
      return r;
    };
    window.__jangEnhancePatched = true;
  }

  function wire(){
    patchRender();
    const prev = $('prevStageBtn'), next = $('nextStageBtn');
    if(prev) prev.onclick = function(){
      if(!window.model) return;
      const k = stageIndexAt(window.t || 0);
      if(k < 0) goToStage(0);
      else if(k === 0) goToStage(-1);
      else goToStage(k - 1);
    };
    if(next) next.onclick = function(){
      if(!window.model) return;
      const k = stageIndexAt(window.t || 0);
      if(k < 0) goToStage(0);
      else goToStage(Math.min(model.stages.length, k + 1));
    };
    try {
      if(window.model){
        const tl=$('tlSteps'); if(tl){ tl.dataset.built=''; updateTimelineUI(window.t||0); }
      }
    } catch(e) {}
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
  setTimeout(wire, 50);
  setTimeout(wire, 500);
  setInterval(function(){ try{ patchRender(); if(window.model) updateTimelineUI(window.t||0);}catch(e){} }, 500);
})();

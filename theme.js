// Navy klub: ilova rejimi (pastki navigatsiya) va Telegram havolalari
(function(){
  try{
    var me = document.currentScript, homeOnly = me && me.getAttribute('data-home-only') != null;
    var ua = navigator.userAgent;
    var isApp = matchMedia('(display-mode: standalone)').matches || navigator.standalone || /; wv\)/.test(ua) || window.Android;
    var exam = /[?&]exam=/.test(location.search);
    if(isApp) document.documentElement.classList.add('app');
    if(homeOnly){
      if(isApp && !document.querySelector('.homebtn')){ var h = document.createElement('a'); h.className = 'homebtn'; h.href = 'index.html'; h.setAttribute('aria-label','Bosh sahifa'); h.textContent = '⌂'; h.style.cssText = 'position:fixed;z-index:9000;left:10px;bottom:max(12px,env(safe-area-inset-bottom));width:42px;height:42px;opacity:.9;border-radius:50%;background:rgba(20,33,58,.92);color:#E6CF98;text-decoration:none;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 8px 18px rgba(0,0,0,.35)'; document.body.appendChild(h); }
      window.__themeHomeOnly = true; return;
    }
    if(!isApp || exam || document.querySelector('.appnav')) return;
    var cur = location.pathname.split('/').pop() || 'index.html';
    var items = [['index.html','⌂','Bosh'],['fayl-uzatish.html','⇄','Fayllar'],['dars-jadvali.html','▦','Jadval'],['https://t.me/byaziyz','✈','Kanal']];
    var nav = document.createElement('nav'); nav.className = 'appnav'; nav.setAttribute('aria-label','Ilova');
    nav.innerHTML = items.map(function(i){ var ext = /^https/.test(i[0]); return '<a href="'+i[0]+'"'+(ext?' target="_blank" rel="noopener"':'')+(i[0]===cur?' class="on"':'')+'><b>'+i[1]+'</b>'+i[2]+'</a>'; }).join('');
    document.body.appendChild(nav);
    document.body.style.paddingBottom = 'calc(96px + env(safe-area-inset-bottom, 0px))';
  }catch(e){}
})();
(function(){
  try{
    if(window.__themeHomeOnly || document.querySelector('.tg-foot') || /[?&]exam=/.test(location.search)) return;
    var d = document.createElement('div'); d.className = 'tg-foot';
    d.innerHTML = '<a href="https://t.me/byaziyz" target="_blank" rel="noopener">Telegram kanal: @byaziyz →</a><a href="https://t.me/abuubaydah_bot" target="_blank" rel="noopener">Admin bilan bog\'lanish: @abuubaydah_bot →</a>';
    document.body.appendChild(d);
  }catch(e){}
})();

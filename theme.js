// Navy klub: har bir sahifa tagida Telegram kanal havolasi
(function(){
  try{
    if(document.querySelector('.tg-foot') || /[?&]exam=/.test(location.search)) return;
    var d = document.createElement('div'); d.className = 'tg-foot';
    d.innerHTML = '<a href="https://t.me/byaziyz" target="_blank" rel="noopener">Telegram kanal: @byaziyz →</a><a href="https://t.me/abuubaydah_bot" target="_blank" rel="noopener">Admin bilan bog\'lanish: @abuubaydah_bot →</a>';
    document.body.appendChild(d);
  }catch(e){}
})();

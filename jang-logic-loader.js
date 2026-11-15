(function(){
  var parts = window.__JANG_LOGIC_B64 || [];
  if(!parts.length){ console.error('jang logic parts missing'); return; }
  var b64 = parts.join('');
  try {
    var bin = atob(b64);
    var s = document.createElement('script');
    s.text = bin;
    document.head.appendChild(s);
  } catch(e) {
    console.error('jang logic decode failed', e);
  }
})();

(function(){
  var parts = window.__JANG_LOGIC_B64 || [];
  if(!parts.length){ console.error('jang logic parts missing'); return; }
  var b64 = '';
  for(var i=0; i<parts.length; i++){
    if(typeof parts[i] !== 'string'){ console.error('missing part', i); return; }
    b64 += parts[i];
  }
  try {
    var bin = atob(b64);
    var s = document.createElement('script');
    s.text = bin;
    document.head.appendChild(s);
    console.log('Jang core loaded, size', bin.length);
  } catch(e){
    console.error('jang decode fail', e);
  }
})();

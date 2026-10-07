// ================= Parsing =================
function parseQA(rawText){
  const blocks = rawText.split(/\n\s*\n+/).map(b => b.trim()).filter(Boolean);
  const questions = [];
  blocks.forEach((block) => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if(lines.length === 0) return;
    let questionLine = lines[0].replace(/^\d+[\.\)]\s*/, '').trim();
    const options = [];
    let answerRaw = null;
    for(let i = 1; i < lines.length; i++){
      const line = lines[i];
      const optMatch = line.match(/^([A-Da-d])[\.\)]\s*(.+)$/);
      const ansMatch = line.match(/^(javob|to'g'ri javob|togri javob|answer|javobi)\s*[:\-–]?\s*(.+)$/i);
      if(ansMatch){ answerRaw = ansMatch[2].trim(); }
      else if(optMatch){ options.push(optMatch[2].trim()); }
    }
    if(!questionLine) return;
    if(options.length >= 2){
      let correctIndex = -1;
      if(answerRaw){
        const letterMatch = answerRaw.match(/^([A-Da-d])\b/);
        if(letterMatch){ correctIndex = letterMatch[1].toUpperCase().charCodeAt(0) - 65; }
        else {
          correctIndex = options.findIndex(o => o.toLowerCase() === answerRaw.toLowerCase());
          if(correctIndex === -1) correctIndex = options.findIndex(o => o.toLowerCase().includes(answerRaw.toLowerCase()));
        }
      }
      if(correctIndex === -1 || correctIndex >= options.length) correctIndex = 0;
      questions.push({ type: 'mc', question: questionLine, options, correctIndex });
    } else if(answerRaw){
      questions.push({ type: 'open', question: questionLine, answer: answerRaw });
    }
  });
  return questions;
}

function escapeHtml(str){ const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
function uid(){ return 'q_' + Date.now() + '_' + Math.random().toString(36).slice(2,8); }

// ================= File-based question input =================
if(window.pdfjsLib){
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}
async function extractTextFromFile(file){
  const ext = file.name.split('.').pop().toLowerCase();
  if(ext === 'pdf'){
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for(let i=1; i<=pdf.numPages; i++){
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(it => it.str).join(' ') + '\n\n';
    }
    return text;
  } else if(ext === 'docx'){
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } else if(ext === 'txt'){
    return await file.text();
  } else {
    throw new Error('Qo\'llab-quvvatlanmaydigan fayl turi: .' + ext);
  }
}
document.getElementById('deckFileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const statusEl = document.getElementById('deckFileStatus');
  if(!file) return;
  statusEl.className = 'file-status';
  statusEl.textContent = 'Fayl o\'qilmoqda...';
  try{
    const text = await extractTextFromFile(file);
    const cleaned = text.replace(/\s+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
    if(cleaned.length < 10) throw new Error('Fayldan matn topilmadi.');
    document.getElementById('deckText').value = cleaned;
    document.getElementById('deckText').dispatchEvent(new Event('input'));
    statusEl.className = 'file-status ok';
    statusEl.textContent = '✓ ' + file.name + ' o\'qildi';
  }catch(err){
    statusEl.className = 'file-status err';
    statusEl.textContent = '✗ ' + err.message;
  }
});

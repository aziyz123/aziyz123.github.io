// ================= Storage =================
const STORAGE_KEY = 'aqlliTakrorlashDecks';
function loadDecks(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }catch(e){ return {}; }
}
function saveDecks(decks){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
}
let decks = loadDecks();

// ================= Classification =================
function classifyQuestion(q){
  const history = q.history || [];
  if(history.length === 0) return 'new';
  const window = history.slice(-3);
  const wrongCount = window.filter(h => h === false).length;
  if(wrongCount >= 1) return 'red';
  if(history.length >= 3) return 'green';
  return 'yellow';
}
function statusMeta(status){
  return {
    red: { label: '🔴 Zaif', pillClass:'red', tagBg:'rgba(214,69,69,0.18)', tagColor:'#ff9d9d' },
    yellow: { label: "🟡 Tasdiqlanmoqda", pillClass:'yellow', tagBg:'rgba(212,167,44,0.18)', tagColor:'#f0d878' },
    green: { label: '🟢 Mustahkam', pillClass:'green', tagBg:'rgba(74,154,106,0.18)', tagColor:'#8fdb9f' },
    new: { label: '⚪ Yangi', pillClass:'gray', tagBg:'rgba(255,255,255,0.08)', tagColor:'rgba(243,239,228,0.6)' }
  }[status];
}

// ================= Home screen: deck list =================
function renderDeckList(){
  const container = document.getElementById('deckList');
  const names = Object.keys(decks);
  if(names.length === 0){ container.innerHTML = '<div class="empty-note">Hali to\'plam yo\'q. Pastda birinchisini yarating.</div>'; return; }
  container.innerHTML = names.map(name => {
    const deck = decks[name];
    const counts = { red:0, yellow:0, green:0, new:0 };
    deck.questions.forEach(q => counts[classifyQuestion(q)]++);
    return '<div class="deck-row">' +
      '<div><div class="deck-name">' + escapeHtml(name) + '</div>' +
      '<div class="deck-stats">' +
        '<span class="pill red">' + counts.red + ' zaif</span>' +
        '<span class="pill yellow">' + counts.yellow + ' tasdiqlanmoqda</span>' +
        '<span class="pill green">' + counts.green + ' mustahkam</span>' +
        '<span class="pill gray">' + counts.new + ' yangi</span>' +
      '</div></div>' +
      '<div class="deck-actions">' +
        '<button class="btn-secondary" data-name="' + escapeHtml(name) + '" data-action="practice">Mashq qilish</button>' +
        '<button class="btn-danger-outline" data-name="' + escapeHtml(name) + '" data-action="delete">✕</button>' +
      '</div></div>';
  }).join('');
  container.querySelectorAll('[data-action="practice"]').forEach(b => {
    b.addEventListener('click', () => startPractice(b.dataset.name, 'all'));
  });
  container.querySelectorAll('[data-action="delete"]').forEach(b => {
    b.addEventListener('click', () => {
      if(confirm('"' + b.dataset.name + '" to\'plamini o\'chirasizmi?')){
        delete decks[b.dataset.name];
        saveDecks(decks);
        renderDeckList();
      }
    });
  });
}

// ================= Create deck =================
const deckTextEl = document.getElementById('deckText');
deckTextEl.addEventListener('input', () => {
  const qs = parseQA(deckTextEl.value.trim());
  document.getElementById('deckPreview').textContent = qs.length ? qs.length + ' ta savol aniqlandi.' : '';
});

document.getElementById('createDeckBtn').addEventListener('click', () => {
  const errEl = document.getElementById('deckError');
  errEl.classList.remove('active');
  const name = document.getElementById('deckNameInput').value.trim();
  const text = deckTextEl.value.trim();
  if(!name){ errEl.textContent = 'To\'plam nomini kiriting.'; errEl.classList.add('active'); return; }
  if(decks[name]){ errEl.textContent = 'Shu nomli to\'plam allaqachon mavjud.'; errEl.classList.add('active'); return; }
  const parsed = parseQA(text);
  if(parsed.length === 0){ errEl.textContent = 'Hech qanday savol aniqlanmadi.'; errEl.classList.add('active'); return; }
  const questions = parsed.map(q => Object.assign({ id: uid(), history: [] }, q));
  decks[name] = { questions, createdAt: Date.now() };
  saveDecks(decks);
  document.getElementById('deckNameInput').value = '';
  deckTextEl.value = '';
  document.getElementById('deckPreview').textContent = '';
  renderDeckList();
});

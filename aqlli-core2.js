// ================= Practice session =================
let session = null; // { deckName, pool: [questionRefs], idx, results: {correct, total}, mode }

function startPractice(deckName, mode){
  const deck = decks[deckName];
  if(!deck) return;
  let pool = deck.questions.slice();
  if(mode === 'weak'){
    pool = pool.filter(q => ['red','yellow'].includes(classifyQuestion(q)));
  }
  if(pool.length === 0){
    alert(mode === 'weak' ? 'Zaif yoki tasdiqlanmagan savol qolmadi — barchasi mustahkam! 🎉' : 'Bu to\'plamda savol yo\'q.');
    return;
  }
  shuffle(pool);
  session = { deckName, pool, idx: 0, correctCount: 0, mode };
  document.getElementById('homeScreen').style.display = 'none';
  document.getElementById('sessionEndScreen').style.display = 'none';
  document.getElementById('practiceScreen').style.display = 'block';
  document.getElementById('modeLabel').textContent = mode === 'weak' ? 'Zaiflar mashqi' : 'To\'liq mashq';
  renderQuestion();
}
function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; }

document.getElementById('backLink').addEventListener('click', goHome);
function goHome(){
  document.getElementById('practiceScreen').style.display = 'none';
  document.getElementById('sessionEndScreen').style.display = 'none';
  document.getElementById('homeScreen').style.display = 'block';
  renderDeckList();
}

function renderQuestion(){
  if(session.idx >= session.pool.length){ endSession(); return; }
  const q = session.pool[session.idx];
  document.getElementById('progressLine').textContent = 'Savol ' + (session.idx+1) + ' / ' + session.pool.length;

  const meta = statusMeta(classifyQuestion(q));
  const tag = document.getElementById('qStatusTag');
  tag.textContent = meta.label;
  tag.style.background = meta.tagBg; tag.style.color = meta.tagColor;

  document.getElementById('qText').textContent = q.question;
  const optsWrap = document.getElementById('qOptions');
  optsWrap.innerHTML = '';
  document.getElementById('feedbackBox').className = 'feedback-box';
  document.getElementById('nextBtnRow').className = 'next-btn-row';

  if(q.type === 'mc'){
    const idxArr = q.options.map((_, i) => i);
    shuffle(idxArr);
    const displayOptions = idxArr.map(i => q.options[i]);
    const displayCorrectIndex = idxArr.indexOf(q.correctIndex);

    displayOptions.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'opt-btn';
      btn.innerHTML = '<span class="opt-letter">' + String.fromCharCode(65+i) + ')</span> ' + escapeHtml(opt);
      btn.addEventListener('click', () => answerMC(q, i, displayCorrectIndex, optsWrap));
      optsWrap.appendChild(btn);
    });
  } else {
    const row = document.createElement('div');
    row.className = 'open-ans-row';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Javobingizni yozing...';
    const btn = document.createElement('button');
    btn.className = 'btn-secondary';
    btn.textContent = 'Tekshirish';
    btn.addEventListener('click', () => answerOpen(q, input.value, input, btn));
    input.addEventListener('keydown', (e) => { if(e.key === 'Enter') answerOpen(q, input.value, input, btn); });
    row.appendChild(input); row.appendChild(btn);
    optsWrap.appendChild(row);
  }
}

function recordResult(q, correct){
  q.history = q.history || [];
  q.history.push(correct);
  if(q.history.length > 20) q.history = q.history.slice(-20);
  if(correct) session.correctCount++;
  saveDecks(decks);
}

function answerMC(q, chosenIndex, correctIndexForRender, optsWrap){
  const buttons = Array.from(optsWrap.children);
  buttons.forEach(b => b.disabled = true);
  const correct = chosenIndex === correctIndexForRender;
  buttons[correctIndexForRender].classList.add('correct-answer');
  if(!correct) buttons[chosenIndex].classList.add('wrong-answer');
  showFeedback(correct, null);
  recordResult(q, correct);
}
function answerOpen(q, val, input, btn){
  input.disabled = true; btn.disabled = true;
  const v = val.trim().toLowerCase();
  const correctAns = (q.answer||'').trim().toLowerCase();
  const correct = v.length > 0 && (v === correctAns || v.includes(correctAns) || correctAns.includes(v));
  showFeedback(correct, q.answer);
  recordResult(q, correct);
}
function showFeedback(correct, correctAnswerText){
  const box = document.getElementById('feedbackBox');
  box.className = 'feedback-box active ' + (correct ? 'correct' : 'wrong');
  box.textContent = correct ? '✓ To\'g\'ri!' : ('✗ Noto\'g\'ri.' + (correctAnswerText ? ' To\'g\'ri javob: ' + correctAnswerText : ''));
  document.getElementById('nextBtnRow').className = 'next-btn-row active';
}
document.getElementById('nextQBtn').addEventListener('click', () => {
  session.idx++;
  renderQuestion();
});

function endSession(){
  document.getElementById('practiceScreen').style.display = 'none';
  document.getElementById('sessionEndScreen').style.display = 'block';
  const deck = decks[session.deckName];
  const counts = { red:0, yellow:0, green:0, new:0 };
  deck.questions.forEach(q => counts[classifyQuestion(q)]++);
  document.getElementById('endStats').innerHTML =
    '<div class="end-stat"><b style="color:#ff9d9d;">' + counts.red + '</b><span>ZAIF</span></div>' +
    '<div class="end-stat"><b style="color:#f0d878;">' + counts.yellow + '</b><span>TASDIQLANMOQDA</span></div>' +
    '<div class="end-stat"><b style="color:#8fdb9f;">' + counts.green + '</b><span>MUSTAHKAM</span></div>';
  document.getElementById('practiceWeakBtn').onclick = () => startPractice(session.deckName, 'weak');
}
document.getElementById('backToHomeBtn').addEventListener('click', goHome);

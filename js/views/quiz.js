/* ============================================================
   VIEW — Quiz (text + SVG abstract)
   ============================================================ */
import { CFG } from '../config.js';
import { state } from '../state.js';
import { getUserData, saveUserData, updateProgress, getProgress, todayStr, updateStreak } from '../storage.js';
import { generateAbstractQuestion, svgRenderCell } from '../svg.js';
import { showToast, tagCls, tagLbl, scoreClass, formatTime } from '../ui.js';
import { navigate, updateBadges } from '../router.js';

function shuffle(arr) { return [...arr].sort(()=>Math.random()-.5); }

export function renderQuiz() {
  const p = CFG.EXAM_PARAMS;
  const icons = {verbal:'📝',numerical:'🔢',abstract:'🔷',eu_knowledge:'🇪🇺',digital:'💻'};
  document.getElementById('page-content').innerHTML=`
  <div id="quiz-area">

    <div class="card" style="background:var(--eu-blue-dark);color:white;margin-bottom:14px;padding:14px 18px">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--eu-gold);margin-bottom:10px;font-weight:700">📋 Épreuves officielles AD5 — Cliquez pour lancer une simulation</div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px">
        ${Object.entries(p).map(([k,v])=>`
          <div onclick="window._ad5.setExamMode('${k}')" style="background:rgba(255,255,255,.08);border-radius:6px;padding:10px 6px;text-align:center;cursor:pointer;border:1px solid rgba(255,255,255,.1);transition:.2s" onmouseover="this.style.background='rgba(255,204,0,.15)'" onmouseout="this.style.background='rgba(255,255,255,.08)'">
            <div style="font-size:22px;margin-bottom:4px">${icons[k]||'📋'}</div>
            <div style="font-weight:700;color:var(--eu-gold);font-size:11px;line-height:1.3">${v.label.replace('Raisonnement ','').replace(' (SVG)','')}</div>
            <div style="color:rgba(255,255,255,.75);font-size:11px;margin-top:4px">${v.questions} Q · ${v.minutes} min</div>
            <div style="color:rgba(255,255,255,.45);font-size:10px">${v.secPerQ}s / Q</div>
          </div>`).join('')}
      </div>
      <div style="font-size:10px;color:rgba(255,255,255,.35);margin-top:8px">⏱️ La simulation se lancera automatiquement avec les paramètres officiels du concours</div>
    </div>

    <div class="card" id="quiz-setup">
      <div class="card-title">⚙️ Paramètres personnalisés</div>
      <div class="grid-2">
        <div class="form-group">
          <label class="form-label">Épreuve</label>
          <select class="form-control" id="quiz-category" onchange="window._ad5.updateQuizDefaults()">
            <option value="all">🎯 Toutes les catégories (mixte)</option>
            <option value="verbal">📝 Raisonnement Verbal</option>
            <option value="numerical">🔢 Raisonnement Numérique</option>
            <option value="abstract">🔷 Raisonnement Abstrait (SVG)</option>
            <option value="eu_knowledge">🇪🇺 Connaissances UE</option>
            <option value="digital">💻 Compétences Numériques</option>
            <option value="managerial">👔 Situations Managériales</option>
            <option value="priority">⚡ Prioritaires (erreurs)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Mode</label>
          <select class="form-control" id="quiz-mode">
            <option value="training">📘 Entraînement (feedback immédiat)</option>
            <option value="simulation">⏱️ Simulation (chrono · sans feedback)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Nombre de questions</label>
          <select class="form-control" id="quiz-count">
            <option value="5">5 questions</option>
            <option value="10" selected>10 questions</option>
            <option value="20">20 questions</option>
            <option value="30">30 questions</option>
            <option value="40">40 questions</option>
            <option value="all">Toutes</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Temps / question (simulation)</label>
          <select class="form-control" id="quiz-timer">
            <option value="45">45 s (Numérique · Digital)</option>
            <option value="60" selected>60 s</option>
            <option value="80">80 s (Connaissances UE)</option>
            <option value="105">105 s (Verbal)</option>
            <option value="0">Sans limite</option>
          </select>
        </div>
      </div>
      <div class="flex gap-8" style="flex-wrap:wrap">
        <button class="btn btn-primary" onclick="window._ad5.startQuiz()">▶ Démarrer</button>
        <button class="btn btn-gold" onclick="window._ad5.startQuiz(true)">⚡ Rapide (5 prioritaires)</button>
        <button class="btn btn-outline btn-sm" onclick="window._ad5.startAbstractOnly()">🔷 5 Abstraites SVG</button>
      </div>
    </div>
    <div id="quiz-runner" class="hidden"></div>
  </div>`;
}

export function updateQuizDefaults() {
  const cat = document.getElementById('quiz-category').value;
  const p = CFG.EXAM_PARAMS[cat];
  if (!p) return;
  const cntSel = document.getElementById('quiz-count');
  for (let o of cntSel.options) { if (parseInt(o.value) === p.questions) { cntSel.value = o.value; break; } }
  const tmrSel = document.getElementById('quiz-timer');
  for (let o of tmrSel.options) { if (parseInt(o.value) === p.secPerQ) { tmrSel.value = o.value; break; } }
}

export function setExamMode(category) {
  const p = CFG.EXAM_PARAMS[category];
  if (!p) return;
  const cntSel = document.getElementById('quiz-count');
  let found = false;
  for (let o of cntSel.options) { if (parseInt(o.value) === p.questions) { cntSel.value = o.value; found=true; break; } }
  if (!found) cntSel.value = 'all';
  document.getElementById('quiz-category').value = category;
  document.getElementById('quiz-mode').value = 'simulation';
  const tmrSel = document.getElementById('quiz-timer');
  for (let o of tmrSel.options) { if (parseInt(o.value) === p.secPerQ) { tmrSel.value = o.value; break; } }
  showToast(`✓ ${p.label} · ${p.questions} Q · ${p.minutes} min · ${p.secPerQ}s/Q`);
  setTimeout(()=>startQuiz(), 600);
}

function buildQuizPool(category, count, quick) {
  if (category === 'abstract') {
    const imagePool = shuffle(state.QUESTION_BANK.filter(q => q.type === 'image' && q.category === 'abstract'));
    const n = count === 'all' ? Math.max(10, imagePool.length) : parseInt(count) || 10;
    if (imagePool.length >= n) return imagePool.slice(0, n);
    const nSvg = n - imagePool.length;
    const svgQs = Array.from({length: nSvg}, (_, i) => {
      const d = i < Math.ceil(nSvg * 0.3) ? 1 : i < Math.ceil(nSvg * 0.7) ? 2 : 3;
      return generateAbstractQuestion(d);
    });
    return shuffle([...imagePool, ...svgQs]);
  }
  let pool;
  if (quick || category === 'priority') {
    const ud = getUserData();
    pool = state.QUESTION_BANK.filter(q=>q.type!=='svg')
      .map(q=>({ q, score:(ud.questionProgress[q.id]?.timesWrong||0)*2
        - (ud.questionProgress[q.id]?.timesCorrect||0)
        + (ud.questionProgress[q.id]?.tag==='review'?3:0)
        + (ud.questionProgress[q.id]?.tag==='unseen'?1:0) }))
      .sort((a,b)=>b.score-a.score)
      .map(x=>x.q).slice(0, quick?5:20);
  } else if (category==='all') {
    const textPool = shuffle([...state.QUESTION_BANK.filter(q=>q.type!=='svg')]);
    const n = count==='all' ? textPool.length : parseInt(count)||10;
    const nAbstract = Math.max(1, Math.floor(n*0.15));
    const nText = n - nAbstract;
    const abstracts = Array.from({length:nAbstract}, generateAbstractQuestion);
    return shuffle([...textPool.slice(0,nText), ...abstracts]);
  } else {
    pool = shuffle(state.QUESTION_BANK.filter(q=>q.category===category && q.type!=='svg'));
  }
  const n = count==='all' ? pool.length : parseInt(count)||10;
  return pool.slice(0, n);
}

export function startAbstractOnly() {
  state.quizState = {
    questions: Array.from({length:5}, (_,i) => generateAbstractQuestion(i<2?1:i<4?2:3)),
    current:0, mode:'training', timerSec:0,
    startTime:Date.now(), answers:[], timer:null, questionStartTime:Date.now()
  };
  document.getElementById('quiz-setup').classList.add('hidden');
  document.getElementById('quiz-runner').classList.remove('hidden');
  renderQuestion();
}

export function startQuiz(quick=false) {
  const cat = quick?'priority':document.getElementById('quiz-category').value;
  const mode = quick?'training':document.getElementById('quiz-mode').value;
  const cnt = quick?5:document.getElementById('quiz-count').value;
  const timerSec = quick?45:parseInt(document.getElementById('quiz-timer').value)||0;

  const questions = buildQuizPool(cat, cnt, quick);
  if (!questions.length) { showToast('Aucune question disponible pour cette sélection.'); return; }

  state.quizState={ questions, current:0, mode, timerSec, startTime:Date.now(), answers:[], timer:null, questionStartTime:Date.now() };
  document.getElementById('quiz-setup').classList.add('hidden');
  document.getElementById('quiz-runner').classList.remove('hidden');
  renderQuestion();
}

function renderProgressBar() {
  const total = state.quizState.questions.length;
  const pct = Math.round((state.quizState.current/total)*100);
  const isSim = state.quizState.mode==='simulation';
  return `<div class="quiz-progress">
    <div style="font-size:11px;color:var(--gray-400);white-space:nowrap">Q ${state.quizState.current+1} / ${total}</div>
    <div class="bar-mini"><div class="bar-mini-fill" style="width:${pct}%"></div></div>
    ${isSim&&state.quizState.timerSec>0?`<div class="timer-display" id="q-timer">${state.quizState.timerSec}s</div>`:''}
  </div>`;
}

function renderQuestion() {
  if (!state.quizState || state.quizState.current >= state.quizState.questions.length) { finishQuiz(); return; }
  const q = state.quizState.questions[state.quizState.current];
  if (state.quizState.timer) clearInterval(state.quizState.timer);
  state.quizState.questionStartTime = Date.now();

  if (q.type==='svg') {
    renderSVGQuestion(q);
  } else if (q.type==='image') {
    renderImageQuestion(q);
  } else {
    renderTextQuestion(q);
  }

  if (state.quizState.mode==='simulation' && state.quizState.timerSec>0) {
    let remaining = state.quizState.timerSec;
    state.quizState.timer = setInterval(()=>{
      remaining--;
      const tel = document.getElementById('q-timer');
      if (tel) { tel.textContent=remaining+'s'; if(remaining<=10)tel.classList.add('urgent'); }
      if (remaining<=0) { clearInterval(state.quizState.timer); autoAnswer(); }
    },1000);
  }
}

function renderTextQuestion(q) {
  const p = getProgress(q.id);
  const letters = ['A','B','C','D','E'];
  document.getElementById('quiz-runner').innerHTML=`
    ${renderProgressBar()}
    <div class="question-card" id="q-card">
      <div class="question-meta">
        <span class="tag tag-category">${q.categoryLabel}</span>
        <span class="tag ${tagCls(p.tag)}">${tagLbl(p.tag)}</span>
      </div>
      <div class="question-text">${q.text}</div>
      <div class="options-list" id="opts">
        ${q.options.map((opt,i)=>`
          <button class="option-btn" onclick="window._ad5.answerText(${i})" id="opt-${i}">
            <span class="opt-letter">${letters[i]}</span><span>${opt}</span>
          </button>`).join('')}
      </div>
      <div id="feedback-area"></div>
      <div id="action-area" class="hidden" style="margin-top:14px;display:flex;gap:10px;justify-content:space-between;flex-wrap:wrap">
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn btn-xs btn-outline" onclick="window._ad5.tagQ('review')">🔴 À revoir</button>
          <button class="btn btn-xs btn-outline" onclick="window._ad5.tagQ('consolidate')">🟡 Consolider</button>
          <button class="btn btn-xs btn-outline" onclick="window._ad5.tagQ('mastered')">🟢 Maîtrisé</button>
        </div>
        <button class="btn btn-primary" onclick="window._ad5.nextQuestion()">
          ${state.quizState.current+1<state.quizState.questions.length?'Suivant →':'Résultats ✓'}
        </button>
      </div>
    </div>`;
}

function renderSVGQuestion(q) {
  const patternHTML = q.patternType==='matrix' ? renderMatrixPattern(q) : renderSequencePattern(q);
  const letters=['A','B','C','D','E'];
  const cellSize=78;

  document.getElementById('quiz-runner').innerHTML=`
    ${renderProgressBar()}
    <div class="question-card" id="q-card">
      <div class="question-meta">
        <span class="tag tag-category">${q.categoryLabel}</span>
        <span class="tag tag-neutral">🔷 SVG · ${q.patternType==='matrix'?'Matrice 3×3':'Suite'}</span>
      </div>
      <div class="question-text" style="font-size:13px;margin-bottom:14px">
        ${q.patternType==='matrix'?'Quelle figure complète la matrice ?':'Quelle figure vient ensuite dans la suite ?'}
      </div>
      <div class="svg-question-area">
        <div class="svg-pattern-label">${q.patternType==='matrix'?'Matrice — trouvez la pièce manquante (?)':'Suite — trouvez la 6ème figure'}</div>
        ${patternHTML}
      </div>
      <div style="margin:16px 0 8px;font-size:12px;color:var(--gray-600);text-align:center">Choisissez la bonne réponse :</div>
      <div class="svg-options-grid" id="svg-opts">
        ${q.options.map((opt,i)=>`
          <button class="svg-opt-btn" id="svgopt-${i}" onclick="window._ad5.answerSVG(${i})">
            ${svgRenderCell(opt,cellSize)}
            <span class="opt-label">${letters[i]}</span>
          </button>`).join('')}
      </div>
      <div id="feedback-area"></div>
      <div id="action-area" class="hidden" style="margin-top:14px;display:flex;justify-content:flex-end">
        <button class="btn btn-primary" onclick="window._ad5.nextQuestion()">
          ${state.quizState.current+1<state.quizState.questions.length?'Suivant →':'Résultats ✓'}
        </button>
      </div>
    </div>`;
}

function renderImageQuestion(q) {
  const letters = ['A','B','C','D','E'];
  document.getElementById('quiz-runner').innerHTML=`
    ${renderProgressBar()}
    <div class="question-card" id="q-card">
      <div class="question-meta">
        <span class="tag tag-category">${q.categoryLabel}</span>
        <span class="tag tag-neutral">🔷 EPSO authentique</span>
      </div>
      <div class="question-text" style="font-size:13px;margin-bottom:12px">
        Quelle figure (A à E) complète la séquence ?
      </div>
      <div id="img-wrap" style="position:relative;overflow:hidden;max-height:500px;border-radius:8px;border:1px solid var(--border);margin-bottom:16px;transition:max-height .4s ease">
        <img src="${q.src}" style="width:100%;display:block" alt="Question de raisonnement abstrait">
        <div id="img-fade" style="position:absolute;bottom:0;left:0;right:0;height:80px;background:linear-gradient(transparent,#f4f6fb);pointer-events:none"></div>
      </div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:4px" id="img-opts">
        ${letters.map((l,i)=>`
          <button id="imgopt-${i}" onclick="window._ad5.answerImage(${i})"
            style="width:54px;height:54px;border-radius:8px;border:2px solid #dde2f0;background:white;
            font-size:18px;font-weight:700;cursor:pointer;transition:.15s;color:#003399;font-family:inherit">
            ${l}
          </button>`).join('')}
      </div>
      <div id="feedback-area"></div>
      <div id="action-area" class="hidden" style="margin-top:14px;display:flex;gap:10px;justify-content:space-between;flex-wrap:wrap">
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn btn-xs btn-outline" onclick="window._ad5.tagQ('review')">🔴 À revoir</button>
          <button class="btn btn-xs btn-outline" onclick="window._ad5.tagQ('consolidate')">🟡 Consolider</button>
          <button class="btn btn-xs btn-outline" onclick="window._ad5.tagQ('mastered')">🟢 Maîtrisé</button>
        </div>
        <button class="btn btn-primary" onclick="window._ad5.nextQuestion()">
          ${state.quizState.current+1<state.quizState.questions.length?'Suivant →':'Résultats ✓'}
        </button>
      </div>
    </div>`;
}

function renderMatrixPattern(q) {
  const cellSize=78;
  const cells = q.cells.map((c,i) => {
    if (c===null) return `<div class="svg-cell missing svg-cell-question-mark" style="width:${cellSize}px;height:${cellSize}px;display:flex;align-items:center;justify-content:center;font-size:26px;color:var(--eu-blue);font-weight:700;background:#f0f4ff">?</div>`;
    return `<div class="svg-cell" style="width:${cellSize}px;height:${cellSize}px">${svgRenderCell(c,cellSize)}</div>`;
  });
  return `<div class="svg-matrix-grid">${cells.join('')}</div>`;
}

function renderSequencePattern(q) {
  const cellSize=74;
  const cells = q.cells.map(c=>`<div class="svg-cell" style="width:${cellSize}px;height:${cellSize}px">${svgRenderCell(c,cellSize)}</div>`).join('');
  return `<div class="svg-sequence-row">
    ${cells}
    <div class="svg-cell missing" style="width:${cellSize}px;height:${cellSize}px;display:flex;align-items:center;justify-content:center;font-size:24px;color:var(--eu-blue);font-weight:700;background:#f0f4ff">?</div>
  </div>`;
}

export function answerText(selected) {
  if (!state.quizState) return;
  if (state.quizState.timer) clearInterval(state.quizState.timer);
  const q = state.quizState.questions[state.quizState.current];
  const isCorrect = selected === q.correct;
  const timeSpent = Math.round((Date.now()-state.quizState.questionStartTime)/1000);
  state.quizState.answers.push({questionId:q.id, selected, correct:isCorrect, timeSpent});
  updateProgress(q.id, isCorrect);

  document.querySelectorAll('.option-btn').forEach(b=>b.disabled=true);
  document.querySelectorAll('.option-btn').forEach((b,i)=>{
    if(i===q.correct) b.classList.add('correct');
    else if(i===selected&&!isCorrect) b.classList.add('incorrect');
  });

  if (state.quizState.mode==='training') {
    document.getElementById('feedback-area').innerHTML=`
      <div class="explanation-box alert ${isCorrect?'alert-success':'alert-danger'}">
        <strong>${isCorrect?'✓ Bonne réponse !':'✗ Incorrect. La bonne réponse était '+['A','B','C','D','E'][q.correct]+'.'}</strong>
        <div style="margin-top:6px">${q.explanation}</div>
      </div>`;
  }
  document.getElementById('action-area').classList.remove('hidden');
}

export function answerSVG(selected) {
  if (!state.quizState) return;
  if (state.quizState.timer) clearInterval(state.quizState.timer);
  const q = state.quizState.questions[state.quizState.current];
  const isCorrect = selected === q.correct;
  const timeSpent = Math.round((Date.now()-state.quizState.questionStartTime)/1000);
  state.quizState.answers.push({questionId:q.id, selected, correct:isCorrect, timeSpent});

  document.querySelectorAll('.svg-opt-btn').forEach(b=>b.disabled=true);
  document.getElementById('svgopt-'+q.correct)?.classList.add('correct');
  if (!isCorrect) document.getElementById('svgopt-'+selected)?.classList.add('incorrect');

  if (state.quizState.mode==='training') {
    document.getElementById('feedback-area').innerHTML=`
      <div class="explanation-box alert ${isCorrect?'alert-success':'alert-danger'}" style="margin-top:12px">
        <strong>${isCorrect?'✓ Bonne réponse !':'✗ Incorrect.'}</strong>
        <div style="margin-top:6px">${q.explanation}</div>
      </div>`;
  }
  document.getElementById('action-area').classList.remove('hidden');
}

export function answerImage(selected) {
  if (!state.quizState) return;
  if (state.quizState.timer) clearInterval(state.quizState.timer);
  const q = state.quizState.questions[state.quizState.current];
  const isCorrect = selected === q.correct;
  const timeSpent = Math.round((Date.now()-state.quizState.questionStartTime)/1000);
  state.quizState.answers.push({questionId:q.id, selected, correct:isCorrect, timeSpent});
  updateProgress(q.id, isCorrect);

  const wrap = document.getElementById('img-wrap');
  const fade = document.getElementById('img-fade');
  if (wrap) wrap.style.maxHeight = '9999px';
  if (fade) fade.style.display = 'none';

  const letters = ['A','B','C','D','E'];
  for (let i = 0; i < 5; i++) {
    const btn = document.getElementById('imgopt-'+i);
    if (!btn) continue;
    btn.disabled = true;
    if (i === q.correct) { btn.style.background='#d4edda'; btn.style.borderColor='#1a7a4a'; btn.style.color='#1a7a4a'; }
    else if (i === selected && !isCorrect) { btn.style.background='#fff3cd'; btn.style.borderColor='#cc8800'; btn.style.color='#cc8800'; }
  }

  if (state.quizState.mode==='training') {
    document.getElementById('feedback-area').innerHTML=`
      <div class="explanation-box alert ${isCorrect?'alert-success':'alert-danger'}" style="margin-top:12px">
        <strong>${isCorrect?'✓ Bonne réponse !':'✗ Incorrect. La bonne réponse était '+letters[q.correct]+'.'}</strong>
        ${q.explanation?`<div style="margin-top:6px">${q.explanation}</div>`:''}
      </div>`;
  }
  document.getElementById('action-area').classList.remove('hidden');
}

function autoAnswer() {
  const q = state.quizState.questions[state.quizState.current];
  state.quizState.answers.push({questionId:q.id, selected:-1, correct:false, timeSpent:state.quizState.timerSec});
  if (q.type === 'svg') {
    document.querySelectorAll('.svg-opt-btn').forEach(b=>b.disabled=true);
    document.getElementById('svgopt-'+q.correct)?.classList.add('correct');
  } else if (q.type === 'image') {
    const wrap = document.getElementById('img-wrap');
    const fade = document.getElementById('img-fade');
    if (wrap) wrap.style.maxHeight = '9999px';
    if (fade) fade.style.display = 'none';
    for (let i = 0; i < 5; i++) {
      const btn = document.getElementById('imgopt-'+i);
      if (!btn) continue;
      btn.disabled = true;
      if (i === q.correct) { btn.style.background='#d4edda'; btn.style.borderColor='#1a7a4a'; btn.style.color='#1a7a4a'; }
    }
    if (state.quizState.mode==='training')
      document.getElementById('feedback-area').innerHTML=`<div class="explanation-box alert alert-danger"><strong>⏱ Temps écoulé !</strong>${q.explanation?`<div style="margin-top:6px">${q.explanation}</div>`:''}</div>`;
  } else {
    updateProgress(q.id, false);
    document.querySelectorAll('.option-btn').forEach((b,i)=>{ b.disabled=true; if(i===q.correct)b.classList.add('correct'); });
    if (state.quizState.mode==='training')
      document.getElementById('feedback-area').innerHTML=`<div class="explanation-box alert alert-danger"><strong>⏱ Temps écoulé !</strong><div style="margin-top:6px">${q.explanation}</div></div>`;
  }
  document.getElementById('action-area')?.classList.remove('hidden');
}

export function tagQ(tag) {
  const q = state.quizState?.questions[state.quizState.current];
  if (!q || q.type==='svg') return;
  const ud = getUserData();
  if (!ud.questionProgress[q.id]) ud.questionProgress[q.id] = {tag:'unseen',timesCorrect:0,timesWrong:0,lastSeen:null};
  ud.questionProgress[q.id].tag = tag;
  saveUserData(ud);
}

export function nextQuestion() {
  state.quizState.current++;
  if (state.quizState.current >= state.quizState.questions.length) finishQuiz();
  else renderQuestion();
}

function finishQuiz() {
  if (state.quizState.timer) clearInterval(state.quizState.timer);
  const correct = state.quizState.answers.filter(a=>a.correct).length;
  const total = state.quizState.answers.length;
  const score = total>0 ? Math.round((correct/total)*100) : 0;
  const durationSec = Math.round((Date.now()-state.quizState.startTime)/1000);
  const weaknesses = [...new Set(state.quizState.answers.filter(a=>!a.correct).map(a=>{
    const q=state.quizState.questions.find(x=>x.id===a.questionId);
    return q?q.categoryLabel:'';
  }).filter(Boolean))];

  const ud = getUserData();
  ud.sessions.push({ id:Date.now().toString(), date:new Date().toISOString(), score, correct, total, durationSec, mode:state.quizState.mode, weaknesses });
  ud.calendarStudied[todayStr()] = true;
  saveUserData(ud);
  updateStreak();

  const el = document.getElementById('quiz-runner');
  const pct = score;
  const clr = pct>=70?'var(--success)':pct>=50?'var(--warning)':'var(--danger)';
  el.innerHTML=`
    <div class="question-card text-center">
      <div class="result-circle" style="border-color:${clr}">
        <div class="pct" style="color:${clr}">${score}%</div>
        <div class="pct-label">${correct}/${total}</div>
      </div>
      <div style="font-family:var(--font-h);font-size:19px;color:var(--eu-blue);margin-bottom:6px">
        ${score>=80?'🏆 Excellent !':score>=60?'👍 Bon travail !':'💪 Continuez !'}
      </div>
      <div class="text-muted text-sm" style="margin-bottom:16px">Durée : ${formatTime(durationSec)} · ${state.quizState.mode==='training'?'Entraînement':'Simulation'}</div>
      ${weaknesses.length?`<div class="alert alert-info" style="text-align:left"><strong>À travailler :</strong> ${weaknesses.join(', ')}</div>`:'<div class="alert alert-success">Aucune faiblesse identifiée dans cette session !</div>'}
      <div style="margin-top:16px;font-size:13px;text-align:left">
        <strong>Détail :</strong>
        <div style="margin-top:8px;display:flex;flex-direction:column;gap:5px">
          ${state.quizState.answers.map((a,i)=>{
            const q=state.quizState.questions[i];
            return `<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:4px;background:${a.correct?'var(--success-bg)':'var(--danger-bg)'}">
              <span style="font-size:14px">${a.correct?'✓':'✗'}</span>
              <span style="flex:1;font-size:11.5px">${q.type==='svg'?'[SVG Abstrait]':q.type==='image'?`[Image EPSO] → ${['A','B','C','D','E'][q.correct]}`:q.text.substring(0,55)+'…'}</span>
              <span class="tag tag-category" style="font-size:10px">${q.categoryLabel}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div style="display:flex;gap:10px;justify-content:center;margin-top:18px">
        <button class="btn btn-primary" onclick="window._ad5.renderQuiz()">🔄 Nouvelle session</button>
        <button class="btn btn-outline" onclick="window._ad5.navigate('dashboard')">📊 Tableau de bord</button>
      </div>
    </div>`;
  state.quizState=null; updateBadges();
}

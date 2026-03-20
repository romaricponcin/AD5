/* ============================================================
   VIEW — Dashboard
   ============================================================ */
import { state } from '../state.js';
import { computeStats, getLast7Scores } from '../stats.js';
import { getUserData } from '../storage.js';
import { scoreClass, formatDate, formatTime, tagCls, tagLbl } from '../ui.js';
import { navigate } from '../router.js';

export function renderDashboard() {
  const el=document.getElementById('page-content');
  const stats=computeStats();
  const last7=getLast7Scores();
  const mottos=[
    '"Excellence est une habitude." — Aristote',
    '"In varietate concordia — Unie dans la diversité."',
    '"Chaque question maîtrisée est un pas vers Bruxelles."',
    '"La constance est la vertu des grands concours."',
    '"Le succès appartient à ceux qui se préparent." — Sénèque'
  ];

  el.innerHTML=`
  <div class="motivational-banner">
    <div style="font-size:28px">🇪🇺</div>
    <div>
      <div style="font-size:11px;color:rgba(255,255,255,.55);text-transform:uppercase;letter-spacing:1px;margin-bottom:2px">Motivation du jour</div>
      <div class="motto">${mottos[Math.floor(Math.random()*mottos.length)]}</div>
    </div>
  </div>
  <div class="grid-4" style="margin-bottom:18px">
    <div class="stat-box"><div class="stat-value">${stats.total}</div><div class="stat-label">Questions</div></div>
    <div class="stat-box success"><div class="stat-value">${stats.mastered}</div><div class="stat-label">Maîtrisées</div></div>
    <div class="stat-box danger"><div class="stat-value">${stats.toReview}</div><div class="stat-label">À revoir</div></div>
    <div class="stat-box gold"><div class="stat-value">${stats.successRate}%</div><div class="stat-label">Taux réussite</div></div>
  </div>
  <div class="grid-2">
    <div>
      <div class="card">
        <div class="card-title">📊 Maîtrise par catégorie</div>
        ${renderCategoryBars(stats.byCategory)}
      </div>
      <div class="card">
        <div class="card-title">🎯 Objectif quotidien</div>
        <div style="font-size:12px;color:var(--gray-600);margin-bottom:8px">${stats.todayAnswered} / ${getUserData().goals.dailyQuestions} questions aujourd'hui</div>
        <div class="progress-bar-wrap"><div class="progress-bar-fill gold" style="width:${Math.min(100,(stats.todayAnswered/(getUserData().goals.dailyQuestions||20))*100)}%"></div></div>
        <div class="mt-12"><button class="btn btn-primary btn-sm" onclick="window._ad5.navigate('quiz')">▶ Commencer une session</button></div>
      </div>
    </div>
    <div>
      <div class="card">
        <div class="card-title">📈 Scores — 7 derniers jours</div>
        <div id="bar-chart-container">
          ${last7.map(d=>`
            <div class="bar-group">
              <div class="bar-val">${d.avg>0?d.avg+'%':''}</div>
              <div class="bar-wrap" style="height:90px"><div class="bar" style="height:${d.avg}%;min-height:${d.avg>0?3:0}px"></div></div>
              <div class="bar-label">${d.label}</div>
            </div>`).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-title">🕓 Dernières sessions</div>
        ${stats.sessions.length===0?'<div class="text-muted text-sm">Aucune session. Lancez votre premier quiz !</div>':`
        <table class="data-table"><thead><tr><th>Date</th><th>Score</th><th>Nb</th><th>Durée</th></tr></thead><tbody>
          ${[...stats.sessions].reverse().slice(0,5).map(s=>`<tr>
            <td>${formatDate(s.date)}</td>
            <td class="${scoreClass(s.score)}">${s.score}%</td>
            <td>${s.total}</td><td>${formatTime(s.durationSec)}</td>
          </tr>`).join('')}
        </tbody></table>`}
      </div>
    </div>
  </div>
  <div class="card">
    <div class="card-title">⚡ Questions prioritaires</div>
    ${renderPriorityList()}
  </div>`;
}

export function renderCategoryBars(byCategory) {
  const cats=[
    {key:'verbal',      label:'Raisonnement Verbal',        icon:'📝'},
    {key:'numerical',   label:'Raisonnement Numérique',     icon:'🔢'},
    {key:'abstract',    label:'Raisonnement Abstrait (SVG)', icon:'🔷'},
    {key:'eu_knowledge',label:'Connaissances UE',           icon:'🇪🇺'},
    {key:'digital',     label:'Compétences Numériques',     icon:'💻'},
    {key:'managerial',  label:'Situations Managériales',    icon:'👔'}
  ];
  return cats.map(c=>{
    const d=byCategory[c.key]||{pct:0};
    return `<div class="cat-progress-item">
      <div class="cat-progress-header">
        <span class="cat-progress-name">${c.icon} ${c.label}</span>
        <span class="cat-progress-pct">${d.pct}%</span>
      </div>
      <div class="progress-bar-wrap"><div class="progress-bar-fill ${d.pct>75?'success':''}" style="width:${d.pct}%"></div></div>
    </div>`;
  }).join('');
}

export function renderPriorityList() {
  const ud = getUserData();
  const priority = state.QUESTION_BANK
    .filter(q => q.category !== 'abstract')
    .map(q => ({ q, p: ud.questionProgress[q.id]||{timesWrong:0,timesCorrect:0} }))
    .filter(({p}) => p.timesWrong > 0)
    .sort((a,b) => (b.p.timesWrong-b.p.timesCorrect)-(a.p.timesWrong-a.p.timesCorrect))
    .slice(0,5);
  if (!priority.length) return "<div class=\"text-muted text-sm\">Aucune question prioritaire pour l'instant. Continuez à vous entraîner !</div>";
  return `<div style="display:flex;flex-direction:column;gap:7px">${priority.map(({q,p})=>`
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border:1px solid var(--gray-200);border-radius:var(--radius);background:var(--gray-100)">
      <div>
        <span class="tag tag-category">${q.categoryLabel}</span>
        <div style="font-size:12.5px;margin-top:4px">${q.text.substring(0,75)}…</div>
      </div>
      <div style="text-align:right;flex-shrink:0;margin-left:12px">
        <div style="font-size:11px;color:var(--danger)">✗ ${p.timesWrong}</div>
        <div style="font-size:11px;color:var(--success)">✓ ${p.timesCorrect}</div>
      </div>
    </div>`).join('')}</div>`;
}

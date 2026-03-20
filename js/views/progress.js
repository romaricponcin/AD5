/* ============================================================
   VIEW — Progression & Analyse
   ============================================================ */
import { state } from '../state.js';
import { computeStats } from '../stats.js';
import { getUserData, saveUserData } from '../storage.js';
import { tagCls, tagLbl, scoreClass, formatDate, formatTime } from '../ui.js';
import { renderCategoryBars } from './dashboard.js';

export function renderProgress() {
  const el=document.getElementById('page-content');
  const stats=computeStats();
  const ud=getUserData();

  const tagCount={unseen:0,review:0,consolidate:0,mastered:0};
  state.QUESTION_BANK.filter(q=>q.type!=='svg').forEach(q => {
    const t=(ud.questionProgress[q.id]?.tag)||'unseen';
    tagCount[t]=(tagCount[t]||0)+1;
  });

  el.innerHTML=`
  <div class="grid-2">
    <div class="card">
      <div class="card-title">📊 Maîtrise par catégorie</div>
      ${renderCategoryBars(stats.byCategory)}
    </div>
    <div class="card">
      <div class="card-title">🏷️ Distribution des tags</div>
      ${Object.entries({unseen:'Non vues',review:'À revoir',consolidate:'À consolider',mastered:'Maîtrisées'}).map(([tag,lbl])=>{
        const count=tagCount[tag]||0;
        const total=state.QUESTION_BANK.filter(q=>q.type!=='svg').length||1;
        const cls={unseen:'neutral',review:'review',consolidate:'consolidate',mastered:'mastered'}[tag];
        return `<div style="margin-bottom:10px">
          <div class="flex-between" style="margin-bottom:3px">
            <span class="tag tag-${cls}">${lbl}</span>
            <span style="font-size:11px;color:var(--gray-600)">${count} (${Math.round(count/total*100)}%)</span>
          </div>
          <div class="progress-bar-wrap"><div class="progress-bar-fill ${tag==='mastered'?'success':''}" style="width:${Math.round(count/total*100)}%"></div></div>
        </div>`;
      }).join('')}
    </div>
  </div>
  <div class="card">
    <div class="card-title">📋 Historique des sessions (${ud.sessions.length})</div>
    ${ud.sessions.length===0?'<div class="text-muted text-sm">Aucune session.</div>':`
    <table class="data-table"><thead><tr><th>Date</th><th>Score</th><th>✓</th><th>Total</th><th>Durée</th><th>Mode</th><th>Faiblesses</th></tr></thead>
    <tbody>${[...ud.sessions].reverse().map(s=>`<tr>
      <td>${formatDate(s.date)}</td>
      <td class="${scoreClass(s.score)}">${s.score}%</td>
      <td>${s.correct}</td><td>${s.total}</td>
      <td>${formatTime(s.durationSec)}</td>
      <td>${s.mode==='training'?'📘':'⏱️'}</td>
      <td style="font-size:11px">${(s.weaknesses||[]).join(', ')||'—'}</td>
    </tr>`).join('')}</tbody></table>`}
  </div>
  <div class="card">
    <div class="card-title">🔍 Questions prioritaires — retagger</div>
    ${renderPriorityTable()}
  </div>`;
}

function renderPriorityTable() {
  const ud=getUserData();
  const priority=state.QUESTION_BANK.filter(q=>q.type!=='svg')
    .map(q=>({q,p:ud.questionProgress[q.id]||{timesWrong:0,timesCorrect:0,tag:'unseen'}}))
    .filter(({p})=>p.timesWrong>0).sort((a,b)=>b.p.timesWrong-a.p.timesWrong).slice(0,10);
  if(!priority.length) return '<div class="text-muted text-sm">Aucune question avec erreurs.</div>';
  return `<table class="data-table"><thead><tr><th>Question</th><th>Catégorie</th><th>Tag</th><th>✗</th><th>✓</th><th>Modifier</th></tr></thead>
  <tbody>${priority.map(({q,p})=>`<tr>
    <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${q.text.substring(0,55)}…</td>
    <td><span class="tag tag-category" style="font-size:10px">${q.categoryLabel}</span></td>
    <td><span class="tag tag-${tagCls(p.tag).replace('tag-','')}" style="font-size:10px">${tagLbl(p.tag)}</span></td>
    <td style="color:var(--danger)">${p.timesWrong}</td>
    <td style="color:var(--success)">${p.timesCorrect}</td>
    <td><select class="form-control" style="padding:3px 8px;font-size:11px;width:110px" onchange="window._ad5.changeTag('${q.id}',this.value)">
      <option value="unseen" ${p.tag==='unseen'?'selected':''}>Non vue</option>
      <option value="review" ${p.tag==='review'?'selected':''}>À revoir</option>
      <option value="consolidate" ${p.tag==='consolidate'?'selected':''}>Consolider</option>
      <option value="mastered" ${p.tag==='mastered'?'selected':''}>Maîtrisé</option>
    </select></td>
  </tr>`).join('')}</tbody></table>`;
}

export function changeTag(qId, newTag) {
  const ud=getUserData();
  if(!ud.questionProgress[qId]) ud.questionProgress[qId]={tag:'unseen',timesCorrect:0,timesWrong:0,lastSeen:null};
  ud.questionProgress[qId].tag=newTag;
  saveUserData(ud);
}

/* ============================================================
   VIEW — Gérer les questions
   ============================================================ */
import { state } from '../state.js';
import { getUserData, saveUserData, getDefaultUserData } from '../storage.js';
import { loadAllData } from '../data.js';
import { showModal, closeModal, showAlert, showToast, tagCls, tagLbl } from '../ui.js';
import { updateBadges } from '../router.js';
import { exportProfile } from '../user.js';

export function renderManage() {
  const el=document.getElementById('page-content');
  const ud=getUserData();
  el.innerHTML=`
  <div class="flex-between" style="margin-bottom:14px;flex-wrap:wrap;gap:8px">
    <div class="flex gap-8">
      <select class="form-control" id="f-cat" onchange="window._ad5.filterManage()" style="width:190px">
        <option value="all">Toutes catégories</option>
        <option value="verbal">Verbal</option>
        <option value="numerical">Numérique</option>
        <option value="eu_knowledge">Connaissances UE</option>
        <option value="digital">💻 Compétences Numériques</option>
        <option value="managerial">Managérial</option>
      </select>
    </div>
    <div class="flex gap-8" style="flex-wrap:wrap">
      <button class="btn btn-gold btn-sm" onclick="window._ad5.openAddQuestion()">+ Ajouter question</button>
      <button class="btn btn-outline btn-sm" onclick="window._ad5.importQuestionsFromFile()">📤 Import JSON/CSV</button>
      <button class="btn btn-outline btn-sm" onclick="window._ad5.exportProfile()">📥 Export profil</button>
      <button class="btn btn-danger btn-sm" onclick="window._ad5.resetData()">🗑 Réinitialiser</button>
    </div>
  </div>
  <div class="card">
    <div class="card-title">Questions texte (${state.QUESTION_BANK.filter(q=>q.type!=='svg').length} — abstraites SVG générées automatiquement)</div>
    <div id="manage-table"></div>
  </div>`;
  filterManage();
}

export function filterManage() {
  const cat=document.getElementById('f-cat')?.value||'all';
  const ud=getUserData();
  let qs=state.QUESTION_BANK.filter(q=>q.type!=='svg');
  if(cat!=='all') qs=qs.filter(q=>q.category===cat);
  if(!qs.length){document.getElementById('manage-table').innerHTML='<div class="text-muted text-sm">Aucune question.</div>';return;}
  document.getElementById('manage-table').innerHTML=`<table class="data-table"><thead><tr><th>Question</th><th>Catégorie</th><th>Tag</th><th>✓</th><th>✗</th><th>Source</th><th>Actions</th></tr></thead>
  <tbody>${qs.map(q=>{
    const p=ud.questionProgress[q.id]||{tag:'unseen',timesCorrect:0,timesWrong:0};
    const isCustom=(ud.customQuestions||[]).some(c=>c.id===q.id);
    return `<tr>
      <td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${q.text}">${q.text.substring(0,60)}…</td>
      <td><span class="tag tag-category" style="font-size:10px">${q.categoryLabel}</span></td>
      <td><span class="tag tag-${tagCls(p.tag).replace('tag-','')}" style="font-size:10px">${tagLbl(p.tag)}</span></td>
      <td style="color:var(--success)">${p.timesCorrect}</td>
      <td style="color:var(--danger)">${p.timesWrong}</td>
      <td style="font-size:10px">${isCustom?'👤 Custom':'📦 JSON'}</td>
      <td><div class="flex gap-8">
        <button class="btn btn-outline btn-xs" onclick="window._ad5.editQuestion('${q.id}')">✏️</button>
        ${isCustom?`<button class="btn btn-danger btn-xs" onclick="window._ad5.deleteQuestion('${q.id}')">🗑</button>`:''}
      </div></td>
    </tr>`;
  }).join('')}</tbody></table>`;
}

export function openAddQuestion() { showModal(questionFormHTML(null)); }
export function editQuestion(id) { const q=state.QUESTION_BANK.find(x=>x.id===id); if(q) showModal(questionFormHTML(q)); }

function questionFormHTML(q) {
  const cats=[{v:'verbal',l:'Raisonnement Verbal'},{v:'numerical',l:'Raisonnement Numérique'},{v:'eu_knowledge',l:'Connaissances UE'},{v:'digital',l:'Compétences Numériques'},{v:'managerial',l:'Situations Managériales'}];
  const opts=q?q.options:['','','',''];
  return `<h3>${q?'✏️ Modifier':'+ Nouvelle question QCM'}</h3>
    <div class="form-group"><label class="form-label">Catégorie</label>
      <select class="form-control" id="qf-cat">${cats.map(c=>`<option value="${c.v}" ${q&&q.category===c.v?'selected':''}>${c.l}</option>`).join('')}</select></div>
    <div class="form-group"><label class="form-label">Question</label>
      <textarea class="form-control" id="qf-text" style="min-height:70px">${q?q.text:''}</textarea></div>
    <div class="form-group"><label class="form-label">Options (cochez la correcte)</label>
      ${opts.map((o,i)=>`<div class="flex gap-8" style="margin-bottom:5px;align-items:center">
        <input type="radio" name="qf-correct" value="${i}" id="qfc-${i}" ${q&&q.correct===i?'checked':i===0&&!q?'checked':''}>
        <label for="qfc-${i}" style="font-size:11px;color:var(--gray-600);width:55px;flex-shrink:0">Option ${String.fromCharCode(65+i)} ✓</label>
        <input type="text" class="form-control" id="qf-opt-${i}" value="${o}" placeholder="Option ${String.fromCharCode(65+i)}">
      </div>`).join('')}</div>
    <div class="form-group"><label class="form-label">Explication</label>
      <textarea class="form-control" id="qf-explain" style="min-height:55px">${q?q.explanation:''}</textarea></div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="window._ad5.closeModal()">Annuler</button>
      <button class="btn btn-primary" onclick="window._ad5.saveQuestion('${q?q.id:''}')">💾 Enregistrer</button>
    </div>`;
}

export function saveQuestion(id) {
  const catEl=document.getElementById('qf-cat');
  const cat=catEl.value, catLabel=catEl.options[catEl.selectedIndex].text;
  const text=document.getElementById('qf-text').value.trim();
  const explanation=document.getElementById('qf-explain').value.trim();
  const options=[0,1,2,3].map(i=>document.getElementById(`qf-opt-${i}`).value.trim()).filter(Boolean);
  const correct=parseInt(document.querySelector('input[name="qf-correct"]:checked')?.value)||0;
  if(!text||options.length<2||!explanation){showAlert('Question, 2+ options et explication requis.','danger');return;}
  const ud=getUserData();
  if(id){
    const i=state.QUESTION_BANK.findIndex(x=>x.id===id);
    if(i!==-1) state.QUESTION_BANK[i]={...state.QUESTION_BANK[i],category:cat,categoryLabel:catLabel,text,options,correct,explanation};
    const ci=ud.customQuestions.findIndex(x=>x.id===id);
    if(ci!==-1) ud.customQuestions[ci]=state.QUESTION_BANK[i];
  } else {
    const newQ={id:'cq'+Date.now(),category:cat,categoryLabel:catLabel,text,options,correct,explanation};
    state.QUESTION_BANK.push(newQ);
    ud.customQuestions.push(newQ);
  }
  saveUserData(ud); closeModal(); renderManage(); showToast(id?'Question modifiée ✓':'Question ajoutée ✓'); updateBadges();
}

export function deleteQuestion(id) {
  if(!confirm('Supprimer cette question ?')) return;
  const ud=getUserData();
  ud.customQuestions=ud.customQuestions.filter(x=>x.id!==id);
  state.QUESTION_BANK=state.QUESTION_BANK.filter(x=>x.id!==id);
  saveUserData(ud); filterManage(); updateBadges();
}

export function importQuestionsFromFile() {
  const inp=document.createElement('input'); inp.type='file'; inp.accept='.json,.csv';
  inp.onchange=e=>{
    const file=e.target.files[0]; if(!file) return;
    const r=new FileReader();
    r.onload=ev=>{
      try {
        let questions;
        if(file.name.endsWith('.csv')) {
          questions=parseCSVQuestions(ev.target.result);
        } else {
          questions=JSON.parse(ev.target.result);
        }
        if(!Array.isArray(questions)) throw new Error('Format invalide');
        const ud=getUserData();
        const existIds=new Set(state.QUESTION_BANK.map(q=>q.id));
        const newQs=questions.filter(q=>q.id&&q.text&&q.options&&!existIds.has(q.id));
        newQs.forEach(q=>{ if(!q.categoryLabel) q.categoryLabel=q.category||'Personnalisée'; });
        state.QUESTION_BANK=[...state.QUESTION_BANK,...newQs];
        ud.customQuestions=[...ud.customQuestions,...newQs];
        saveUserData(ud); renderManage(); updateBadges();
        showToast(`${newQs.length} question(s) importée(s) ✓`);
      } catch(err) { showAlert('Fichier invalide: '+err.message,'danger'); }
    };
    r.readAsText(file);
  };
  inp.click();
}

function parseCSVQuestions(csv) {
  const rows=csv.split('\n').slice(1).filter(r=>r.trim());
  return rows.map(row=>{
    const cols=row.split(',').map(c=>c.replace(/^"|"$/g,'').trim());
    if(cols.length<9) return null;
    const CAT_LABELS={verbal:'Raisonnement Verbal',numerical:'Raisonnement Numérique',eu_knowledge:'Connaissances UE',managerial:'Situations Managériales'};
    return {
      id:cols[0]||'csv'+Date.now(), category:cols[1]||'verbal',
      categoryLabel:CAT_LABELS[cols[1]]||cols[1],
      text:cols[2], options:[cols[3],cols[4],cols[5],cols[6]].filter(Boolean),
      correct:parseInt(cols[7])||0, explanation:cols[8]||''
    };
  }).filter(Boolean);
}

export function resetData() {
  if(!confirm('⚠️ Réinitialiser toutes vos données de progression ? (questions custom, historique, notes)')) return;
  const ud=getDefaultUserData();
  saveUserData(ud);
  loadAllData().then(()=>{ renderManage(); updateBadges(); showToast('Données réinitialisées'); });
}

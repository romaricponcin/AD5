/* ============================================================
   UI HELPERS — Modals, toasts, alertes, helpers DRY
   ============================================================ */

export function showModal(html) {
  document.getElementById('modal-container').innerHTML=`
    <div class="modal-overlay" id="modal-overlay-inner">
      <div class="modal-box">${html}</div>
    </div>`;
  document.getElementById('modal-overlay-inner').addEventListener('click', closeOnOverlay);
}

export function closeModal() {
  document.getElementById('modal-container').innerHTML='';
}

export function closeOnOverlay(e) {
  if(e.target.classList.contains('modal-overlay')) closeModal();
}

export function showAlert(msg, type='info') {
  const alertHTML=`<div class="alert alert-${type}">${msg}</div>`;
  const box=document.querySelector('.modal-box');
  if(box){
    let el=box.querySelector('.temp-alert');
    if(!el){el=document.createElement('div');el.className='temp-alert';box.prepend(el);}
    el.innerHTML=alertHTML;
  }
}

export function showToast(msg) {
  const t=document.createElement('div');
  t.style.cssText='position:fixed;bottom:20px;right:20px;z-index:999;background:var(--eu-blue);color:white;padding:10px 18px;border-radius:var(--radius);font-size:13px;font-weight:600;box-shadow:var(--shadow-lg);animation:fadeIn .2s ease';
  t.textContent=msg; document.body.appendChild(t);
  setTimeout(()=>t.remove(),2500);
}

export function tagCls(tag) {
  return ({review:'tag-review',consolidate:'tag-consolidate',mastered:'tag-mastered',unseen:'tag-neutral'})[tag]||'tag-neutral';
}

export function tagLbl(tag) {
  return ({review:'🔴 À revoir',consolidate:'🟡 Consolider',mastered:'🟢 Maîtrisé',unseen:'⬜ Non vue'})[tag]||tag;
}

export function scoreClass(s) {
  return s>=70?'session-score-high':s>=50?'session-score-mid':'session-score-low';
}

export function formatDate(str) {
  if(!str) return '—';
  return new Date(str).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'});
}

export function formatTime(sec) {
  if(!sec) return '—';
  return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;
}

/* DRY helper — barre de progression */
export function progressBarHTML(pct, colorClass='') {
  return `<div class="progress-bar-wrap"><div class="progress-bar-fill ${colorClass}" style="width:${pct}%"></div></div>`;
}

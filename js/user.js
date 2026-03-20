/* ============================================================
   USER MODULE — UUID, login, profil, export/import
   ============================================================ */
import { CFG } from './config.js';
import { state } from './state.js';
import { getUserData, saveUserData, todayStr } from './storage.js';
import { showModal, closeModal, showAlert, showToast, formatDate } from './ui.js';
import { loadAllData } from './data.js';

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random()*16|0;
    return (c==='x'?r:(r&0x3|0x8)).toString(16);
  });
}

export function createUser() {
  const name = (document.getElementById('login-name').value||'').trim();
  if (!name) {
    document.getElementById('login-name').style.borderColor = 'var(--danger)';
    return;
  }
  const uuid = uuidv4();
  const profile = { uuid, name, createdAt: new Date().toISOString() };
  try {
    localStorage.setItem(CFG.USER_PREFIX + uuid, JSON.stringify(profile));
  } catch(e) { alert("Erreur de stockage. Libérez de l'espace dans votre navigateur."); return; }
  loginUser(uuid, name);
}

export async function loginUser(uuid, name) {
  state.CURRENT_USER = uuid;
  window.location.hash = 'u=' + uuid;
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app-shell').classList.remove('hidden');
  updateUserUI(name);
  await loadAllData();
  // updateBadges et navigate sont appelés depuis app.js après loginUser
  // On dispatche un événement pour découpler
  document.dispatchEvent(new CustomEvent('user:login'));
}

export function updateUserUI(name) {
  const initial = (name||'?')[0].toUpperCase();
  document.getElementById('sb-avatar').textContent = initial;
  document.getElementById('sb-uname').textContent = name;
  const ta = document.getElementById('topbar-avatar');
  if(ta) { ta.textContent = initial; ta.title = name + ' — Mon profil'; }
  const mb = document.getElementById('mobile-profile-btn');
  if(mb) mb.textContent = initial;
}

export function loadUserFromHash() {
  const m = window.location.hash.match(/u=([a-f0-9-]+)/i);
  if (!m) return null;
  const uuid = m[1];
  try {
    const raw = localStorage.getItem(CFG.USER_PREFIX + uuid);
    if (!raw) return null;
    return { uuid, ...JSON.parse(raw) };
  } catch(e) { return null; }
}

export function getProfile() {
  if (!state.CURRENT_USER) return null;
  try { return JSON.parse(localStorage.getItem(CFG.USER_PREFIX + state.CURRENT_USER)); } catch(e){ return null; }
}

export function showUserPanel() {
  const profile = getProfile();
  const url = window.location.origin + window.location.pathname + '#u=' + state.CURRENT_USER;
  showModal(`
    <h3>👤 Mon profil</h3>
    <div class="alert alert-info" style="font-size:13px">
      <strong>${profile?.name || '—'}</strong><br>
      Membre depuis : ${profile?.createdAt ? formatDate(profile.createdAt) : '—'}
    </div>
    <div class="form-group">
      <label class="form-label">🔗 Mon lien personnel (à mettre en favori)</label>
      <div class="link-copy-box" id="link-box">${url}</div>
      <button class="btn btn-primary btn-sm" onclick="window._ad5.copyLink('${url}')">📋 Copier le lien</button>
    </div>
    <div class="divider"></div>
    <div class="form-group">
      <label class="form-label">Importer questions depuis URL (GitHub Gist, etc.)</label>
      <div class="flex gap-8">
        <input type="text" class="form-control" id="import-url-input" placeholder="https://raw.githubusercontent.com/…/questions.json">
        <button class="btn btn-outline btn-sm" onclick="window._ad5.importFromURL()">Charger</button>
      </div>
    </div>
    <div class="divider"></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-outline btn-sm" onclick="window._ad5.exportProfile()">📥 Exporter profil JSON</button>
      <button class="btn btn-danger btn-sm" onclick="window._ad5.switchUser()">🔄 Changer d'utilisateur</button>
    </div>
    <div class="modal-footer"><button class="btn btn-outline" onclick="window._ad5.closeModal()">Fermer</button></div>
  `);
}

export function copyLink(url) {
  navigator.clipboard.writeText(url).then(() => showToast('Lien copié ! Mettez-le en favori. ✓'));
}

export function switchUser() {
  closeModal();
  state.CURRENT_USER = null;
  window.location.hash = '';
  document.getElementById('app-shell').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('login-name').value = '';
}

export function exportProfile() {
  const profile = getProfile();
  const ud = getUserData();
  const blob = new Blob([JSON.stringify({profile, userData: ud}, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `eu_ad5_profil_${(profile?.name||'user').replace(/\s/g,'_')}_${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Profil exporté ✓');
  closeModal();
}

export function triggerImportProfile() {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = '.json';
  inp.onchange = e => {
    const file = e.target.files[0]; if(!file) return;
    const r = new FileReader();
    r.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.profile?.uuid || !data.userData) throw new Error('Format invalide');
        const uuid = data.profile.uuid;
        localStorage.setItem(CFG.USER_PREFIX + uuid, JSON.stringify(data.profile));
        localStorage.setItem(CFG.USER_PREFIX + uuid + CFG.DATA_SUFFIX, JSON.stringify(data.userData));
        loginUser(uuid, data.profile.name);
      } catch(e) { alert('Fichier invalide : ' + e.message); }
    };
    r.readAsText(file);
  };
  inp.click();
}

export async function importFromURL() {
  const url = (document.getElementById('import-url-input')?.value||'').trim();
  if (!url) return;
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const questions = await resp.json();
    if (!Array.isArray(questions)) throw new Error('Format attendu : tableau JSON de questions');
    const ud = getUserData();
    const existingIds = new Set([...state.QUESTION_BANK.map(q=>q.id), ...ud.customQuestions.map(q=>q.id)]);
    const newQs = questions.filter(q=>q.id&&!existingIds.has(q.id));
    ud.customQuestions = [...ud.customQuestions, ...newQs];
    saveUserData(ud);
    state.QUESTION_BANK = [...state.QUESTION_BANK, ...newQs];
    showToast(`${newQs.length} question(s) importée(s) depuis l'URL ✓`);
    closeModal();
  } catch(e) { showAlert('Erreur : ' + e.message, 'danger'); }
}

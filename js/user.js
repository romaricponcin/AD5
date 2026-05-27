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

function rememberLastUser(id) {
  try { localStorage.setItem(CFG.LAST_USER_KEY, id); } catch(e) {}
}

export function createUser() {
  const sel = document.getElementById('login-select');
  const selVal = sel ? sel.value : '';
  let id, name;

  if (selVal && selVal !== '__other__') {
    // Utilisateur connu : slug stable
    const known = CFG.KNOWN_USERS.find(u => u.id === selVal);
    if (!known) { if (sel) sel.style.borderColor = 'var(--danger)'; return; }
    id = known.id;
    name = known.name;
    if (!localStorage.getItem(CFG.USER_PREFIX + id)) {
      try {
        localStorage.setItem(CFG.USER_PREFIX + id, JSON.stringify({ uuid: id, name, createdAt: new Date().toISOString() }));
      } catch(e) { alert("Erreur de stockage. Libérez de l'espace dans votre navigateur."); return; }
    }
  } else {
    // Utilisateur libre : UUID aléatoire
    name = (document.getElementById('login-name')?.value || '').trim();
    if (!name) {
      const inp = document.getElementById('login-name');
      if (inp) inp.style.borderColor = 'var(--danger)';
      else if (sel) sel.style.borderColor = 'var(--danger)';
      return;
    }
    id = uuidv4();
    try {
      localStorage.setItem(CFG.USER_PREFIX + id, JSON.stringify({ uuid: id, name, createdAt: new Date().toISOString() }));
    } catch(e) { alert("Erreur de stockage. Libérez de l'espace dans votre navigateur."); return; }
  }
  loginUser(id, name);
}

export async function loginUser(uuid, name) {
  state.CURRENT_USER = uuid;
  rememberLastUser(uuid);
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
  const m = window.location.hash.match(/u=([a-zA-Z0-9_-]+)/);
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
  localStorage.removeItem(CFG.LAST_USER_KEY);
  state.CURRENT_USER = null;
  window.location.hash = '';
  document.getElementById('app-shell').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  const sel = document.getElementById('login-select');
  if (sel) { sel.value = ''; sel.style.borderColor = ''; }
  const inp = document.getElementById('login-name');
  if (inp) { inp.value = ''; inp.classList.add('hidden'); inp.style.borderColor = ''; }
  const btn = document.getElementById('btn-login');
  if (btn) btn.textContent = 'Accéder à mon espace →';
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

export function populateLoginSelect() {
  const sel = document.getElementById('login-select');
  if (!sel) return;
  const other = sel.querySelector('option[value="__other__"]');
  sel.querySelectorAll('option:not([value=""]):not([value="__other__"])').forEach(o => o.remove());
  CFG.KNOWN_USERS.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.id;
    const hasData = !!localStorage.getItem(CFG.USER_PREFIX + u.id);
    opt.textContent = u.name + (hasData ? ' ✓' : '');
    if (hasData) opt.style.color = 'var(--success, #1a7a4a)';
    if (other) sel.insertBefore(opt, other);
    else sel.appendChild(opt);
  });
}

export function onLoginSelectChange() {
  const sel = document.getElementById('login-select');
  const inp = document.getElementById('login-name');
  if (!sel) return;
  if (sel.value === '__other__') {
    if (inp) { inp.classList.remove('hidden'); inp.focus(); }
  } else {
    if (inp) { inp.classList.add('hidden'); inp.value = ''; inp.style.borderColor = ''; }
  }
  _updateLoginBtn(sel.value);
}

function _updateLoginBtn(selVal) {
  const btn = document.getElementById('btn-login');
  if (!btn) return;
  if (selVal && selVal !== '__other__') {
    const hasData = !!localStorage.getItem(CFG.USER_PREFIX + selVal);
    btn.textContent = hasData ? 'Reprendre ma session →' : 'Créer mon espace →';
  } else {
    btn.textContent = 'Accéder à mon espace →';
  }
}

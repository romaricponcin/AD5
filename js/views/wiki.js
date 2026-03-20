/* ============================================================
   VIEW — Fiches de révision Wiki
   ============================================================ */
import { getUserData, saveUserData } from '../storage.js';
import { showModal, closeModal, showAlert, formatDate } from '../ui.js';

export function renderWiki() {
  const el=document.getElementById('page-content');
  const ud=getUserData();
  el.innerHTML=`
  <div class="flex-between" style="margin-bottom:14px">
    <input type="text" class="form-control" id="wiki-search" placeholder="🔍 Rechercher…" oninput="window._ad5.filterWiki()" style="max-width:360px;flex:1">
    <button class="btn btn-primary" onclick="window._ad5.openWikiEditor()">+ Nouvelle fiche</button>
  </div>
  <div class="grid-2">
    <div class="card mb-0">
      <div class="card-title">📚 Fiches (${ud.wikiEntries.length})</div>
      <ul id="wiki-list" style="list-style:none">${renderWikiList(ud.wikiEntries)}</ul>
    </div>
    <div id="wiki-viewer">
      <div class="card" style="background:var(--eu-blue-light);border:1.5px dashed var(--eu-blue);text-align:center;padding:30px;color:var(--eu-blue)">
        <div style="font-size:32px;margin-bottom:8px">📖</div>
        <div style="font-family:var(--font-h);font-size:14px">Sélectionnez une fiche</div>
      </div>
    </div>
  </div>`;
}

function renderWikiList(entries) {
  if(!entries.length) return '<li style="padding:10px;color:var(--gray-400);font-size:13px">Aucune fiche trouvée.</li>';
  return entries.map(e=>`
    <li class="wiki-item" onclick="window._ad5.viewWiki('${e.id}')">
      <span style="font-size:18px">📄</span>
      <div class="wiki-info">
        <div class="wiki-title">${e.title}</div>
        <div class="wiki-meta">${(e.tags||[]).join(' · ')} · ${formatDate(e.updatedAt)}</div>
      </div>
    </li>`).join('');
}

export function filterWiki() {
  const q=document.getElementById('wiki-search').value.toLowerCase();
  const ud=getUserData();
  const f=ud.wikiEntries.filter(e=>e.title.toLowerCase().includes(q)||e.content.toLowerCase().includes(q));
  document.getElementById('wiki-list').innerHTML=renderWikiList(f);
}

export function viewWiki(id) {
  const ud=getUserData();
  const e=ud.wikiEntries.find(x=>x.id===id); if(!e) return;
  document.getElementById('wiki-viewer').innerHTML=`
    <div class="card">
      <div class="flex-between" style="margin-bottom:10px">
        <div class="card-title mb-0" style="border:none;padding:0;font-size:15px">${e.title}</div>
        <div class="flex gap-8">
          <button class="btn btn-outline btn-sm" onclick="window._ad5.openWikiEditor('${e.id}')">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="window._ad5.deleteWiki('${e.id}')">🗑</button>
        </div>
      </div>
      ${e.tags?`<div style="margin-bottom:10px">${e.tags.map(t=>`<span class="tag tag-category" style="margin-right:4px">${t}</span>`).join('')}</div>`:''}
      <div class="divider"></div>
      <div class="wiki-content">${parseMarkdown(e.content)}</div>
    </div>`;
}

function parseMarkdown(t) {
  return t.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/^### (.+)$/gm,'<h4 style="color:var(--eu-blue);margin:10px 0 5px;font-size:12.5px">$1</h4>')
    .replace(/^## (.+)$/gm,'<h3 style="color:var(--eu-blue);margin:12px 0 6px;font-size:14px">$1</h3>')
    .replace(/^# (.+)$/gm,'<h2 style="color:var(--eu-blue);margin:14px 0 8px;font-size:16px;font-family:Georgia">$1</h2>')
    .replace(/^- (.+)$/gm,'<div style="padding-left:14px;margin-bottom:3px">• $1</div>')
    .replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>');
}

export function openWikiEditor(id) {
  const ud=getUserData();
  const e=id?ud.wikiEntries.find(x=>x.id===id):null;
  showModal(`
    <h3>${e?'✏️ Modifier':'+ Nouvelle fiche'}</h3>
    <div class="form-group"><label class="form-label">Titre</label>
      <input type="text" class="form-control" id="wiki-title" value="${e?e.title:''}" placeholder="Ex: La procédure législative ordinaire"></div>
    <div class="form-group"><label class="form-label">Tags (virgules)</label>
      <input type="text" class="form-control" id="wiki-tags" value="${e&&e.tags?e.tags.join(', '):''}"></div>
    <div class="form-group"><label class="form-label">Contenu (Markdown : **gras**, *italique*, # Titre)</label>
      <textarea class="form-control" id="wiki-content" style="min-height:200px">${e?e.content:''}</textarea></div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="window._ad5.closeModal()">Annuler</button>
      <button class="btn btn-primary" onclick="window._ad5.saveWiki('${e?e.id:''}')">💾 Enregistrer</button>
    </div>`);
}

export function saveWiki(id) {
  const title=document.getElementById('wiki-title').value.trim();
  const content=document.getElementById('wiki-content').value.trim();
  const tags=document.getElementById('wiki-tags').value.split(',').map(t=>t.trim()).filter(Boolean);
  if(!title||!content){showAlert('Titre et contenu requis.','danger');return;}
  const ud=getUserData();
  if(id){
    const i=ud.wikiEntries.findIndex(x=>x.id===id);
    if(i!==-1) ud.wikiEntries[i]={...ud.wikiEntries[i],title,content,tags,updatedAt:new Date().toISOString()};
  } else {
    ud.wikiEntries.push({id:'w'+Date.now(),title,content,tags,updatedAt:new Date().toISOString()});
  }
  saveUserData(ud); closeModal(); renderWiki();
}

export function deleteWiki(id) {
  if(!confirm('Supprimer cette fiche ?')) return;
  const ud=getUserData(); ud.wikiEntries=ud.wikiEntries.filter(x=>x.id!==id);
  saveUserData(ud); renderWiki();
}

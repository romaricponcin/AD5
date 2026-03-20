/* ============================================================
   APP — Point d'entrée ES Module
   Importe tous les modules et initialise l'application.
   ============================================================ */
import { state } from './state.js';
import { loadAllData } from './data.js';
import { navigate, updateBadges, registerView } from './router.js';
import { closeModal } from './ui.js';
import {
  createUser, loginUser, updateUserUI, loadUserFromHash,
  showUserPanel, copyLink, switchUser, exportProfile,
  triggerImportProfile, importFromURL
} from './user.js';

import { renderDashboard } from './views/dashboard.js';
import {
  renderQuiz, startQuiz, startAbstractOnly, setExamMode,
  updateQuizDefaults, answerText, answerSVG, tagQ, nextQuestion
} from './views/quiz.js';
import { renderProgress, changeTag } from './views/progress.js';
import { renderWiki, filterWiki, viewWiki, openWikiEditor, saveWiki, deleteWiki } from './views/wiki.js';
import {
  renderPlanner, renderCalendar, selectDay,
  toggleStudied, saveDayNote, saveGoals, changeMonth
} from './views/planner.js';
import {
  renderManage, filterManage, openAddQuestion, editQuestion,
  saveQuestion, deleteQuestion, importQuestionsFromFile, resetData
} from './views/manage.js';

/* ── Enregistrement des vues dans le routeur ── */
registerView('dashboard', 'Tableau de bord',       renderDashboard);
registerView('quiz',      'Entraînement',           renderQuiz);
registerView('progress',  'Progression & Analyse',  renderProgress);
registerView('wiki',      'Fiches de révision UE',  renderWiki);
registerView('planner',   'Planificateur',          renderPlanner);
registerView('manage',    'Gérer les questions',    renderManage);

/* ── Exposition des fonctions pour les handlers inline HTML ──
   Les vues génèrent du HTML avec onclick="window._ad5.xxx()"
   On regroupe ici toutes les fonctions accessibles depuis le DOM.   */
window._ad5 = {
  // Navigation
  navigate,
  // User
  createUser, showUserPanel, copyLink, switchUser,
  exportProfile, triggerImportProfile, importFromURL,
  // UI
  closeModal,
  // Quiz
  renderQuiz, startQuiz, startAbstractOnly, setExamMode,
  updateQuizDefaults, answerText, answerSVG, tagQ, nextQuestion,
  // Progress
  changeTag,
  // Wiki
  filterWiki, viewWiki, openWikiEditor, saveWiki, deleteWiki,
  // Planner
  renderCalendar, selectDay, toggleStudied, saveDayNote, saveGoals, changeMonth,
  // Manage
  filterManage, openAddQuestion, editQuestion, saveQuestion,
  deleteQuestion, importQuestionsFromFile, resetData
};

/* ── Décorer le fond login ── */
function decorateLoginBg() {
  const container = document.getElementById('bg-stars');
  const positions = [[10,15],[80,25],[20,75],[70,60],[45,10],[5,50],[90,80],[55,40],[30,90],[75,5]];
  positions.forEach(([x,y],i)=>{
    const span=document.createElement('span');
    span.textContent='★';
    span.style.cssText=`left:${x}%;top:${y}%;animation-delay:${i*0.4}s`;
    container.appendChild(span);
  });
}

/* ── Initialisation ── */
document.addEventListener('DOMContentLoaded', async () => {
  decorateLoginBg();

  // Auto-login si UUID présent dans le hash
  const userFromHash = loadUserFromHash();
  if (userFromHash) {
    state.CURRENT_USER = userFromHash.uuid;
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');
    updateUserUI(userFromHash.name);
    await loadAllData();
    updateBadges();
    navigate('dashboard');
  }

  // Gérer l'événement login déclenché depuis user.js
  document.addEventListener('user:login', () => {
    updateBadges();
    navigate('dashboard');
  });

  // Navigation sidebar
  document.querySelectorAll('.nav-item').forEach(item=>{
    item.addEventListener('click',()=>navigate(item.dataset.view));
  });

  // Hamburger mobile
  document.getElementById('hamburger').addEventListener('click',()=>{
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('mobile-overlay').classList.toggle('active');
  });
  document.getElementById('mobile-overlay').addEventListener('click',()=>{
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('mobile-overlay').classList.remove('active');
  });

  // Fermer modal avec Escape
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeModal(); });

  console.log('%c🇪🇺 EU AD5 Prep v2 — Multi-utilisateurs + SVG Abstrait', 'color:#003399;font-weight:bold;font-size:13px');
});

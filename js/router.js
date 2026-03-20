/* ============================================================
   ROUTER — Navigation SPA
   Les fonctions render* sont injectées dynamiquement pour
   éviter les dépendances circulaires (views → router → views).
   ============================================================ */
import { state } from './state.js';
import { computeStats, getLast7Scores } from './stats.js';
import { updateStreak } from './storage.js';

// Registre des vues injecté depuis app.js
const VIEWS = {};

export function registerView(name, title, renderFn) {
  VIEWS[name] = { title, render: renderFn };
}

export function navigate(view) {
  state.currentView = view;
  state.quizState = null;
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.toggle('active',el.dataset.view===view));
  document.querySelectorAll('.mbn-item').forEach(el=>el.classList.toggle('active',el.dataset.mbn===view));
  document.getElementById('page-title').textContent = (VIEWS[view]||VIEWS.dashboard).title;
  document.getElementById('page-content').innerHTML='';
  (VIEWS[view]||VIEWS.dashboard).render();
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('mobile-overlay').classList.remove('active');
  window.scrollTo(0,0);
  updateBadges();
}

export function updateBadges() {
  const streak = updateStreak();
  document.getElementById('streak-badge').textContent=`🔥 ${streak} j`;
  document.getElementById('total-q-badge').textContent=`${state.QUESTION_BANK.length} Q`;
  const sf = document.getElementById('sidebar-streak');
  if(sf) sf.textContent=`Série : ${streak} jour(s)`;
}

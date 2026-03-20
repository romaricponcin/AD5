/* ============================================================
   DATA — Chargement des questions JSON
   ============================================================ */
import { CFG, SEED_QUESTIONS } from './config.js';
import { state } from './state.js';
import { getUserData } from './storage.js';

export async function loadAllData() {
  let loaded = [];
  for (const src of CFG.JSON_SOURCES) {
    try {
      const resp = await fetch(src);
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const qs = await resp.json();
      loaded = [...loaded, ...qs];
    } catch(e) {
      console.info(`[DATA] ${src} non disponible (${e.message}) — fallback seeds utilisés`);
    }
  }
  if (loaded.length === 0) {
    loaded = SEED_QUESTIONS;
    console.info('[DATA] Mode offline — questions embarquées utilisées');
  }
  const ud = getUserData();
  const existIds = new Set(loaded.map(q=>q.id));
  const customs = (ud.customQuestions||[]).filter(q=>!existIds.has(q.id));
  state.QUESTION_BANK = [...loaded, ...customs];
  console.info(`[DATA] ${state.QUESTION_BANK.length} questions chargées (${loaded.length} JSON + ${customs.length} custom)`);
}

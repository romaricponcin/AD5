/* ============================================================
   STORAGE — Persistance des données par utilisateur
   ============================================================ */
import { CFG, SEED_WIKI } from './config.js';
import { state } from './state.js';

export function getDefaultUserData() {
  return {
    version: CFG.VERSION,
    questionProgress: {}, // { qId: { tag, timesCorrect, timesWrong, lastSeen } }
    sessions: [],
    customQuestions: [],
    wikiEntries: JSON.parse(JSON.stringify(SEED_WIKI)),
    calendarStudied: {},
    calendarNotes: {},
    goals: { dailyQuestions: 20 },
    streak: 0,
    lastStudiedDate: null
  };
}

export function getUserData() {
  if (!state.CURRENT_USER) return getDefaultUserData();
  const key = CFG.USER_PREFIX + state.CURRENT_USER + CFG.DATA_SUFFIX;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return getDefaultUserData();
    const d = JSON.parse(raw);
    return { ...getDefaultUserData(), ...d };
  } catch(e) { return getDefaultUserData(); }
}

export function saveUserData(data) {
  if (!state.CURRENT_USER) return false;
  const key = CFG.USER_PREFIX + state.CURRENT_USER + CFG.DATA_SUFFIX;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch(e) {
    if (e.name === 'QuotaExceededError') {
      data.sessions = (data.sessions||[]).slice(-30);
      try { localStorage.setItem(key, JSON.stringify(data)); return true; } catch(e2) {}
    }
    console.error('[STORAGE]', e);
    return false;
  }
}

export function getProgress(qId) {
  const ud = getUserData();
  return ud.questionProgress[qId] || { tag:'unseen', timesCorrect:0, timesWrong:0, lastSeen:null };
}

export function updateProgress(qId, isCorrect) {
  const ud = getUserData();
  const p = ud.questionProgress[qId] || { tag:'unseen', timesCorrect:0, timesWrong:0, lastSeen:null };
  if (isCorrect) p.timesCorrect++;
  else p.timesWrong++;
  p.lastSeen = new Date().toISOString();
  if (p.tag === 'unseen') p.tag = isCorrect ? 'consolidate' : 'review';
  ud.questionProgress[qId] = p;
  saveUserData(ud);
  return p;
}

export function todayStr() { return new Date().toISOString().split('T')[0]; }

export function updateStreak() {
  const ud = getUserData();
  let streak = 0;
  const d = new Date();
  for (let i=0; i<365; i++) {
    const s = d.toISOString().split('T')[0];
    if (ud.calendarStudied[s]) { streak++; d.setDate(d.getDate()-1); }
    else break;
  }
  ud.streak = streak;
  saveUserData(ud);
  return streak;
}

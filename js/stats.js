/* ============================================================
   STATS — Calculs de performance
   ============================================================ */
import { state } from './state.js';
import { getUserData, todayStr } from './storage.js';

export function computeStats() {
  const ud = getUserData();
  const total = state.QUESTION_BANK.length;
  let mastered=0, toReview=0, totalCorrect=0, totalAnswered=0;

  Object.values(ud.questionProgress).forEach(p => {
    if (p.tag==='mastered') mastered++;
    if (p.tag==='review' || p.timesWrong > p.timesCorrect) toReview++;
    totalCorrect += p.timesCorrect;
    totalAnswered += p.timesCorrect + p.timesWrong;
  });

  const successRate = totalAnswered>0 ? Math.round((totalCorrect/totalAnswered)*100) : 0;

  const byCategory = {};
  ['verbal','numerical','abstract','eu_knowledge','digital'].forEach(cat => {
    const qs = state.QUESTION_BANK.filter(q=>q.category===cat);
    let c=0, a=0;
    qs.forEach(q => {
      const p = ud.questionProgress[q.id] || {};
      c += p.timesCorrect||0; a += (p.timesCorrect||0)+(p.timesWrong||0);
    });
    byCategory[cat] = { pct: a>0?Math.round((c/a)*100):0, total:qs.length };
  });

  const todaySessions = ud.sessions.filter(s=>s.date.startsWith(todayStr()));
  const todayAnswered = todaySessions.reduce((acc,s)=>acc+s.total,0);

  return { total, mastered, toReview, successRate, byCategory, todayAnswered,
    sessions: ud.sessions, streak: ud.streak||0 };
}

export function getLast7Scores() {
  const ud = getUserData();
  const days=['Di','Lu','Ma','Me','Je','Ve','Sa'];
  return Array.from({length:7},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-(6-i));
    const str = d.toISOString().split('T')[0];
    const sess = ud.sessions.filter(s=>s.date.startsWith(str));
    const avg = sess.length>0 ? Math.round(sess.reduce((a,s)=>a+s.score,0)/sess.length) : 0;
    return { label:days[d.getDay()], avg };
  });
}

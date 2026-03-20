/* ============================================================
   VIEW — Planificateur / Calendrier
   ============================================================ */
import { state } from '../state.js';
import { getUserData, saveUserData, todayStr, updateStreak } from '../storage.js';
import { showToast, formatDate } from '../ui.js';

export function renderPlanner() {
  const el=document.getElementById('page-content');
  el.innerHTML=`
  <div class="grid-2">
    <div class="card">
      <div class="card-title">📅 Calendrier de révision</div>
      <div class="flex-between" style="margin-bottom:10px">
        <button class="btn btn-outline btn-sm" onclick="window._ad5.changeMonth(-1)">← Préc.</button>
        <strong id="cal-month-label"></strong>
        <button class="btn btn-outline btn-sm" onclick="window._ad5.changeMonth(1)">Suiv. →</button>
      </div>
      <div class="calendar-grid" id="calendar-grid"></div>
      <div class="divider"></div>
      <div style="display:flex;gap:12px;font-size:11px;color:var(--gray-600)">
        <span>🟢 Étudié ✓</span><span>⭐ Aujourd'hui</span><span>🔵 Note</span>
      </div>
    </div>
    <div>
      <div class="card"><div class="card-title">📝 Note du jour</div>
        <div id="day-note-area"><div class="text-muted text-sm">Cliquez sur un jour du calendrier.</div></div>
      </div>
      <div class="card"><div class="card-title">🎯 Objectif quotidien</div>
        <div class="form-group"><label class="form-label">Questions / jour</label>
          <input type="number" class="form-control" id="goal-daily" value="${getUserData().goals.dailyQuestions}" min="5" max="100" style="width:100px"></div>
        <button class="btn btn-primary btn-sm" onclick="window._ad5.saveGoals()">Enregistrer</button>
      </div>
      <div class="card"><div class="card-title">📊 Ce mois</div>
        <div id="month-stats"></div></div>
    </div>
  </div>`;
  renderCalendar();
}

export function renderCalendar() {
  const ud=getUserData();
  const year=state.calendarDate.getFullYear(), month=state.calendarDate.getMonth();
  const todayISO=todayStr();
  const months=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  document.getElementById('cal-month-label').textContent=`${months[month]} ${year}`;
  const grid=document.getElementById('calendar-grid');
  const days=['Lu','Ma','Me','Je','Ve','Sa','Di'];
  let html=days.map(d=>`<div class="cal-header">${d}</div>`).join('');
  const firstDay=new Date(year,month,1);
  let startOffset=(firstDay.getDay()+6)%7;
  const daysInMonth=new Date(year,month+1,0).getDate();
  const prevDays=new Date(year,month,0).getDate();
  for(let i=startOffset-1;i>=0;i--) html+=`<div class="cal-day other-month">${prevDays-i}</div>`;
  for(let d=1;d<=daysInMonth;d++){
    const ds=`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const cls=['cal-day',ds===todayISO?'today':'',ud.calendarStudied[ds]?'studied':'',ud.calendarNotes[ds]?'has-note':''].filter(Boolean).join(' ');
    html+=`<div class="${cls}" onclick="window._ad5.selectDay('${ds}')">${d}</div>`;
  }
  const rem=(startOffset+daysInMonth)%7; if(rem>0) for(let d=1;d<=7-rem;d++) html+=`<div class="cal-day other-month">${d}</div>`;
  grid.innerHTML=html;
  const studiedDays=Object.keys(ud.calendarStudied).filter(k=>k.startsWith(`${year}-${String(month+1).padStart(2,'0')}`)).length;
  document.getElementById('month-stats').innerHTML=`<div class="grid-2" style="gap:10px">
    <div class="stat-box success" style="padding:12px"><div class="stat-value" style="font-size:22px">${studiedDays}</div><div class="stat-label">Jours étudiés</div></div>
    <div class="stat-box" style="padding:12px"><div class="stat-value" style="font-size:22px">${ud.streak||0}</div><div class="stat-label">Série actuelle</div></div>
  </div>`;
}

export function selectDay(ds) {
  const ud=getUserData();
  const note=ud.calendarNotes[ds]||'';
  document.getElementById('day-note-area').innerHTML=`
    <div style="font-size:13px;font-weight:600;color:var(--eu-blue);margin-bottom:8px">📅 ${formatDate(ds)}</div>
    <label style="font-size:12.5px;display:flex;align-items:center;gap:6px;cursor:pointer;margin-bottom:10px">
      <input type="checkbox" id="day-studied" ${ud.calendarStudied[ds]?'checked':''} onchange="window._ad5.toggleStudied('${ds}')">
      Marquer comme jour étudié
    </label>
    <textarea class="form-control" id="day-note" style="min-height:70px" placeholder="Objectifs, points travaillés…">${note}</textarea>
    <button class="btn btn-primary btn-sm" style="margin-top:8px" onclick="window._ad5.saveDayNote('${ds}')">💾 Enregistrer</button>`;
}

export function toggleStudied(ds) {
  const ud=getUserData();
  if(document.getElementById('day-studied').checked) ud.calendarStudied[ds]=true;
  else delete ud.calendarStudied[ds];
  saveUserData(ud); updateStreak(); renderCalendar();
}

export function saveDayNote(ds) {
  const note=document.getElementById('day-note').value.trim();
  const ud=getUserData();
  if(note) ud.calendarNotes[ds]=note; else delete ud.calendarNotes[ds];
  saveUserData(ud); renderCalendar(); showToast('Note enregistrée ✓');
}

export function saveGoals() {
  const ud=getUserData(); ud.goals.dailyQuestions=parseInt(document.getElementById('goal-daily').value)||20;
  saveUserData(ud); showToast('Objectif enregistré ✓');
}

export function changeMonth(dir) {
  state.calendarDate.setMonth(state.calendarDate.getMonth()+dir);
  renderCalendar();
}

// ── STORAGE ──────────────────────────────────────────────────
const S = {
  getTemplates:       () => JSON.parse(localStorage.getItem('ft_templates') || '[]'),
  saveTemplates:      v  => localStorage.setItem('ft_templates', JSON.stringify(v)),
  getLogs:            () => JSON.parse(localStorage.getItem('ft_logs') || '[]'),
  saveLogs:           v  => localStorage.setItem('ft_logs', JSON.stringify(v)),
  getCurrent:         () => JSON.parse(localStorage.getItem('ft_current') || 'null'),
  saveCurrent:        v  => localStorage.setItem('ft_current', JSON.stringify(v)),
  clearCurrent:       () => localStorage.removeItem('ft_current'),
};

// ── UTILITIES ─────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function todayISO() { return new Date().toISOString().slice(0, 10); }
function fmtDate(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
function fmtDur(ms) {
  const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000);
  return `${m}:${String(s).padStart(2, '0')}`;
}
function el(id) { return document.getElementById(id); }

// ── ROUTER ────────────────────────────────────────────────────
let activeView = 'dashboard';

function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  el(`view-${id}`)?.classList.add('active');

  const isWorkout = id === 'workout';
  el('main-nav').classList.toggle('hidden', isWorkout);

  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.view === id);
  });

  activeView = id;
  const renders = {
    dashboard:        renderDashboard,
    templates:        renderTemplates,
    calendar:         renderCalendar,
    workout:          renderActiveWorkout,
    'template-editor': () => renderTemplateEditor(),
  };
  renders[id]?.();
}

// ── MODAL (bottom sheet) ──────────────────────────────────────
function openModal(title, bodyHTML) {
  el('modal-title').textContent = title;
  el('modal-body').innerHTML = bodyHTML;
  el('modal-overlay').classList.remove('hidden');
}
function closeModal() { el('modal-overlay').classList.add('hidden'); }

function pickList(title, items, onPick) {
  const html = items.map((item, i) => `
    <div class="modal-item" data-idx="${i}">
      <span class="modal-item-label">${item.label}</span>
      ${item.sub ? `<span class="modal-item-sub">${item.sub}</span>` : ''}
    </div>`).join('');
  openModal(title, html);
  el('modal-body').querySelectorAll('.modal-item').forEach(row => {
    row.addEventListener('click', () => { closeModal(); onPick(items[+row.dataset.idx].value); });
  });
}

// ── REST TIMER ────────────────────────────────────────────────
let rest = { iv: null, remaining: 0, total: 0 };

function startRest(secs) {
  stopRest();
  rest.total = secs;
  rest.remaining = secs;
  el('rest-timer-strip').classList.remove('hidden');
  tickRest();
  rest.iv = setInterval(tickRest, 1000);
}
function tickRest() {
  el('rest-countdown').textContent = rest.remaining + 's';
  el('rest-progress-fill').style.width = (rest.remaining / rest.total * 100) + '%';
  if (rest.remaining <= 0) { stopRest(); beep(); return; }
  rest.remaining--;
}
function stopRest() {
  if (rest.iv) { clearInterval(rest.iv); rest.iv = null; }
  el('rest-timer-strip').classList.add('hidden');
}
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 200, 400].forEach(delay => {
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.frequency.value = 880;
      const t = ctx.currentTime + delay / 1000;
      g.gain.setValueAtTime(0.25, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.start(t); osc.stop(t + 0.25);
    });
  } catch (_) {}
}

// ── ELAPSED TIMER ─────────────────────────────────────────────
let elapsedIv = null;
function startElapsed(startTime) {
  if (elapsedIv) clearInterval(elapsedIv);
  const tick = () => {
    const e = el('elapsed-timer');
    if (e) e.textContent = fmtDur(Date.now() - startTime);
  };
  tick();
  elapsedIv = setInterval(tick, 1000);
}
function stopElapsed() { if (elapsedIv) { clearInterval(elapsedIv); elapsedIv = null; } }

// ── DASHBOARD ─────────────────────────────────────────────────
function nextTemplate() {
  const templates = S.getTemplates();
  if (!templates.length) return null;
  const sorted = [...templates].sort((a, b) => a.rotationOrder - b.rotationOrder);
  const logs = S.getLogs();
  if (!logs.length) return sorted[0];
  const lastId = logs[logs.length - 1].templateId;
  const idx = sorted.findIndex(t => t.id === lastId);
  return sorted[(idx + 1) % sorted.length];
}

function renderDashboard() {
  const current = S.getCurrent();
  const next = nextTemplate();
  const logs = S.getLogs();
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  let html = `
    <div id="dash-head">
      <h2 style="font-size:28px">FitTrack</h2>
      <div id="dash-date">${dateStr}</div>
    </div>`;

  if (current) {
    const mins = Math.floor((Date.now() - current.startTime) / 60000);
    html += `
      <div class="resume-card mt-12">
        <div class="resume-card-label">Workout in progress · ${mins}m</div>
        <div style="font-size:17px;font-weight:600;margin:4px 0 12px">${current.templateName}</div>
        <button class="btn btn-primary btn-full" onclick="showView('workout')">Resume →</button>
      </div>`;
  }

  if (!current) {
    if (next) {
      html += `
        <div class="next-card ${logs.length ? 'mt-12' : ''}">
          <div class="next-card-label">Next Workout</div>
          <div class="next-card-name">${next.name}</div>
          <div class="next-card-meta">${next.exercises.length} exercise${next.exercises.length !== 1 ? 's' : ''} · rotation #${next.rotationOrder}</div>
          <button class="btn btn-primary btn-full" onclick="startWorkout('${next.id}')">Start →</button>
        </div>`;
    } else {
      html += `
        <div class="card mt-12" style="text-align:center;padding:28px">
          <p class="text-muted" style="margin-bottom:14px">Create a template to get started.</p>
          <button class="btn btn-primary" onclick="showView('templates')">Go to Templates</button>
        </div>`;
    }
  }

  if (logs.length) {
    html += `<div class="section-label mt-16">Recent</div><div class="card" style="padding:0 16px">`;
    [...logs].reverse().slice(0, 6).forEach(log => {
      const dur = log.endTime ? Math.round((log.endTime - log.startTime) / 60000) : null;
      html += `
        <div class="recent-item" onclick="showLogDetail('${log.id}')">
          <div>
            <div class="recent-item-name">${log.templateName}</div>
            <div class="recent-item-meta">${fmtDate(log.date)}${dur ? ` · ${dur}m` : ''} · ${log.exercises.length} exercises</div>
          </div>
          <span class="recent-chevron">›</span>
        </div>`;
    });
    html += `</div>`;
  }

  el('dashboard-content').innerHTML = html;
}

function showLogDetail(logId) {
  const log = S.getLogs().find(l => l.id === logId);
  if (!log) return;
  const dur = log.endTime ? Math.round((log.endTime - log.startTime) / 60000) : null;
  const items = log.exercises.map(ex => ({
    label: ex.exerciseName,
    sub: `${ex.sets.length} sets`,
    value: null,
  }));
  pickList(`${log.templateName} — ${fmtDate(log.date)}${dur ? ` (${dur}m)` : ''}`, items, () => {});
}

// ── ACTIVE WORKOUT ────────────────────────────────────────────
function startWorkout(templateId) {
  const tpl = S.getTemplates().find(t => t.id === templateId);
  if (!tpl) return;
  const workout = {
    id: uid(),
    templateId: tpl.id,
    templateName: tpl.name,
    date: todayISO(),
    startTime: Date.now(),
    endTime: null,
    exercises: tpl.exercises.map(ex => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      muscleGroup: ex.muscleGroup,
      restSeconds: ex.restSeconds || 90,
      sets: Array.from({ length: ex.sets }, () => ({
        weight: ex.weight || 0,
        reps: ex.reps || 10,
        done: false,
      })),
    })),
  };
  S.saveCurrent(workout);
  showView('workout');
}

function renderActiveWorkout() {
  const w = S.getCurrent();
  if (!w) { showView('dashboard'); return; }
  el('workout-title-bar').textContent = w.templateName;
  startElapsed(w.startTime);
  buildExerciseList(w);
}

function buildExerciseList(w) {
  const container = el('exercise-list');
  container.innerHTML = '';
  w.exercises.forEach((ex, ei) => {
    const card = document.createElement('div');
    card.className = 'ex-card';
    card.id = `ex-card-${ei}`;

    let rows = ex.sets.map((set, si) => `
      <tr>
        <td class="set-num">${si + 1}</td>
        <td>
          <input type="number" inputmode="decimal" value="${set.weight || ''}" placeholder="lbs"
            oninput="patchSet(${ei},${si},'weight',this.value)">
        </td>
        <td>
          <input type="number" inputmode="numeric" value="${set.reps || ''}" placeholder="reps"
            oninput="patchSet(${ei},${si},'reps',this.value)">
        </td>
        <td>
          <button class="btn-check ${set.done ? 'done' : ''}"
            onclick="toggleDone(${ei},${si})">✓</button>
        </td>
      </tr>`).join('');

    card.innerHTML = `
      <div class="ex-card-head">
        <div style="flex:1">
          <div class="ex-card-name">${ex.exerciseName}</div>
          <span class="muscle-chip">${ex.muscleGroup}</span>
        </div>
        <button class="btn-swap" onclick="openSwap(${ei})">Swap</button>
      </div>
      <table class="sets-table">
        <thead>
          <tr>
            <th style="width:28px">#</th>
            <th>Weight</th>
            <th>Reps</th>
            <th style="width:42px">✓</th>
          </tr>
        </thead>
        <tbody id="tbody-${ei}">${rows}</tbody>
      </table>
      <button class="btn-add-set" onclick="addSet(${ei})">+ Add Set</button>`;

    container.appendChild(card);
  });
}

function patchSet(ei, si, field, val) {
  const w = S.getCurrent();
  w.exercises[ei].sets[si][field] = field === 'weight' ? parseFloat(val) || 0 : parseInt(val) || 0;
  S.saveCurrent(w);
}

function toggleDone(ei, si) {
  const w = S.getCurrent();
  const set = w.exercises[ei].sets[si];
  set.done = !set.done;
  S.saveCurrent(w);
  const btn = el(`tbody-${ei}`)?.querySelectorAll('tr')[si]?.querySelector('.btn-check');
  if (btn) btn.classList.toggle('done', set.done);
  if (set.done) startRest(w.exercises[ei].restSeconds || 90);
  else stopRest();
}

function addSet(ei) {
  const w = S.getCurrent();
  const sets = w.exercises[ei].sets;
  const last = sets[sets.length - 1] || { weight: 0, reps: 10, done: false };
  sets.push({ weight: last.weight, reps: last.reps, done: false });
  S.saveCurrent(w);
  buildExerciseList(w);
}

function openSwap(ei) {
  const w = S.getCurrent();
  const ex = w.exercises[ei];
  const seen = new Set();
  const items = [];
  S.getTemplates().forEach(t =>
    t.exercises.forEach(e => {
      if (e.muscleGroup === ex.muscleGroup && !seen.has(e.name)) {
        seen.add(e.name);
        items.push({ label: e.name, sub: e.muscleGroup, value: e });
      }
    })
  );
  if (!items.length) {
    openModal('No Alternatives', '<p class="text-muted" style="padding:16px 0">Add more exercises with the same muscle group to your templates.</p>');
    return;
  }
  pickList(`Swap: ${ex.exerciseName}`, items, sel => {
    const cur = S.getCurrent();
    cur.exercises[ei] = {
      exerciseId: sel.id,
      exerciseName: sel.name,
      muscleGroup: sel.muscleGroup,
      restSeconds: sel.restSeconds || 90,
      sets: cur.exercises[ei].sets.map(s => ({ ...s, done: false })),
    };
    S.saveCurrent(cur);
    buildExerciseList(cur);
  });
}

function openAddExerciseModal() {
  const seen = new Set();
  const items = [];
  S.getTemplates().forEach(t =>
    t.exercises.forEach(e => {
      if (!seen.has(e.name)) {
        seen.add(e.name);
        items.push({ label: e.name, sub: e.muscleGroup, value: e });
      }
    })
  );
  if (!items.length) {
    openModal('No Exercises', '<p class="text-muted" style="padding:16px 0">Add exercises to your templates first.</p>');
    return;
  }
  pickList('Add Exercise', items, sel => {
    const w = S.getCurrent();
    w.exercises.push({
      exerciseId: sel.id,
      exerciseName: sel.name,
      muscleGroup: sel.muscleGroup,
      restSeconds: sel.restSeconds || 90,
      sets: [{ weight: sel.weight || 0, reps: sel.reps || 10, done: false }],
    });
    S.saveCurrent(w);
    buildExerciseList(w);
  });
}

function finishWorkout() {
  if (!confirm('Finish and save this workout?')) return;
  const w = S.getCurrent();
  w.endTime = Date.now();
  const logs = S.getLogs();
  logs.push(w);
  S.saveLogs(logs);
  S.clearCurrent();
  stopElapsed();
  stopRest();
  showView('dashboard');
}

// ── TEMPLATES LIST ────────────────────────────────────────────
function renderTemplates() {
  const templates = S.getTemplates().sort((a, b) => a.rotationOrder - b.rotationOrder);
  let html = `
    <div class="view-header">
      <h2>Templates</h2>
      <button class="btn btn-primary btn-sm" onclick="openTemplateEditor(null)">+ New</button>
    </div>`;

  if (!templates.length) {
    html += `<div class="empty-state"><p>No templates yet.</p>
      <button class="btn btn-primary" onclick="openTemplateEditor(null)">Create First Template</button></div>`;
  } else {
    templates.forEach(t => {
      html += `
        <div class="tpl-item">
          <div class="tpl-order">${t.rotationOrder}</div>
          <div class="tpl-info">
            <div class="tpl-name">${t.name}</div>
            <div class="tpl-meta">${t.exercises.length} exercise${t.exercises.length !== 1 ? 's' : ''}</div>
          </div>
          <button class="btn-ghost" onclick="openTemplateEditor('${t.id}')">Edit</button>
        </div>`;
    });
  }

  el('template-list-content').innerHTML = html;
}

// ── TEMPLATE EDITOR ───────────────────────────────────────────
let editingTpl = null;

function openTemplateEditor(id) {
  if (id) {
    editingTpl = JSON.parse(JSON.stringify(S.getTemplates().find(t => t.id === id)));
  } else {
    editingTpl = { id: uid(), name: '', rotationOrder: S.getTemplates().length + 1, exercises: [] };
  }
  showView('template-editor');
}

function renderTemplateEditor() {
  const t = editingTpl;
  const isNew = !S.getTemplates().find(x => x.id === t.id);

  let exHtml = t.exercises.length
    ? t.exercises.map((ex, i) => `
        <div class="editor-ex-item">
          <div class="editor-ex-info">
            <div class="editor-ex-name">${ex.name}</div>
            <div class="editor-ex-meta">${ex.muscleGroup} · ${ex.sets}×${ex.reps} · ${ex.weight}lbs · ${ex.restSeconds}s rest</div>
          </div>
          <button class="btn-icon" onclick="editTplEx(${i})" title="Edit">✎</button>
          <button class="btn-icon text-danger" onclick="removeTplEx(${i})" title="Remove">✕</button>
        </div>`).join('')
    : '<p class="text-muted" style="font-size:14px;padding:6px 0 10px">No exercises yet.</p>';

  el('template-editor-content').innerHTML = `
    <div class="view-header">
      <button class="btn-ghost" onclick="showView('templates')">← Back</button>
      <button class="btn btn-primary btn-sm" onclick="saveTemplate()">Save</button>
    </div>

    <div class="form-group">
      <label>Template Name</label>
      <input id="tpl-name" type="text" value="${t.name}" placeholder="e.g. Push Day A">
    </div>
    <div class="form-group">
      <label>Rotation Order <span class="text-muted">(1 = first in cycle)</span></label>
      <input id="tpl-order" type="number" inputmode="numeric" min="1" value="${t.rotationOrder}">
    </div>

    <div class="section-label mt-16">Exercises</div>
    <div id="tpl-ex-list">${exHtml}</div>
    <button class="btn btn-secondary btn-full" onclick="addTplEx()">+ Add Exercise</button>

    ${!isNew ? `<button class="btn btn-danger btn-full mt-16" onclick="deleteTemplate('${t.id}')">Delete Template</button>` : ''}
  `;
}

function addTplEx()       { showExForm(null,  ex => { editingTpl.exercises.push(ex); renderTemplateEditor(); }); }
function editTplEx(i)     { showExForm(editingTpl.exercises[i], ex => { editingTpl.exercises[i] = ex; renderTemplateEditor(); }); }
function removeTplEx(i)   { editingTpl.exercises.splice(i, 1); renderTemplateEditor(); }

let exFormCb = null;
const MUSCLE_GROUPS = ['chest','back','shoulders','biceps','triceps','legs','glutes','core','calves','cardio'];

function showExForm(ex, cb) {
  exFormCb = cb;
  const e = ex || { id: uid(), name: '', muscleGroup: 'chest', sets: 3, reps: 10, weight: 0, restSeconds: 90 };
  const opts = MUSCLE_GROUPS.map(g =>
    `<option value="${g}" ${g === e.muscleGroup ? 'selected' : ''}>${g.charAt(0).toUpperCase() + g.slice(1)}</option>`
  ).join('');

  openModal(ex ? 'Edit Exercise' : 'Add Exercise', `
    <div class="form-group">
      <label>Exercise Name</label>
      <input id="ex-name" type="text" value="${e.name}" placeholder="e.g. Bench Press">
    </div>
    <div class="form-group">
      <label>Muscle Group</label>
      <select id="ex-muscle">${opts}</select>
    </div>
    <div class="two-col">
      <div class="form-group">
        <label>Sets</label>
        <input id="ex-sets" type="number" inputmode="numeric" min="1" value="${e.sets}">
      </div>
      <div class="form-group">
        <label>Default Reps</label>
        <input id="ex-reps" type="number" inputmode="numeric" min="1" value="${e.reps}">
      </div>
      <div class="form-group">
        <label>Default Weight (lbs)</label>
        <input id="ex-weight" type="number" inputmode="decimal" min="0" step="2.5" value="${e.weight}">
      </div>
      <div class="form-group">
        <label>Rest (seconds)</label>
        <input id="ex-rest" type="number" inputmode="numeric" min="0" step="15" value="${e.restSeconds}">
      </div>
    </div>
    <button class="btn btn-primary btn-full mt-12" onclick="submitExForm('${e.id}')">
      ${ex ? 'Update' : 'Add Exercise'}
    </button>
  `);
}

function submitExForm(id) {
  const name = el('ex-name').value.trim();
  if (!name) { alert('Enter an exercise name'); return; }
  const ex = {
    id,
    name,
    muscleGroup: el('ex-muscle').value,
    sets:        parseInt(el('ex-sets').value)   || 3,
    reps:        parseInt(el('ex-reps').value)   || 10,
    weight:      parseFloat(el('ex-weight').value) || 0,
    restSeconds: parseInt(el('ex-rest').value)   || 90,
  };
  closeModal();
  exFormCb?.(ex);
}

function saveTemplate() {
  const name = el('tpl-name').value.trim();
  if (!name) { alert('Enter a template name'); return; }
  editingTpl.name = name;
  editingTpl.rotationOrder = parseInt(el('tpl-order').value) || 1;

  const all = S.getTemplates();
  const idx = all.findIndex(t => t.id === editingTpl.id);
  if (idx >= 0) all[idx] = editingTpl; else all.push(editingTpl);
  S.saveTemplates(all);
  showView('templates');
}

function deleteTemplate(id) {
  if (!confirm('Delete this template?')) return;
  S.saveTemplates(S.getTemplates().filter(t => t.id !== id));
  showView('templates');
}

// ── CALENDAR ──────────────────────────────────────────────────
let calYear  = new Date().getFullYear();
let calMonth = new Date().getMonth();

function renderCalendar() {
  const logs = S.getLogs();
  const logMap = {};
  logs.forEach(l => { logMap[l.date] = l; });

  const todayStr = todayISO();
  const firstDow = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const monthLabel = new Date(calYear, calMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  let gridHtml = ['Su','Mo','Tu','We','Th','Fr','Sa']
    .map(d => `<div class="cal-dow">${d}</div>`).join('');

  for (let i = 0; i < firstDow; i++) gridHtml += `<div class="cal-day empty"></div>`;

  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const cls = [
      'cal-day',
      iso === todayStr ? 'today' : '',
      logMap[iso] ? 'has-workout' : '',
    ].filter(Boolean).join(' ');
    gridHtml += `<div class="${cls}" onclick="selectDay('${iso}',event)">${d}</div>`;
  }

  el('calendar-content').innerHTML = `
    <div class="cal-nav">
      <button class="btn btn-secondary btn-sm" onclick="calMove(-1)">←</button>
      <div class="cal-month">${monthLabel}</div>
      <button class="btn btn-secondary btn-sm" onclick="calMove(1)">→</button>
    </div>
    <div class="cal-grid">${gridHtml}</div>
    <div id="cal-detail"></div>`;
}

function calMove(dir) {
  calMonth += dir;
  if (calMonth < 0) { calMonth = 11; calYear--; }
  if (calMonth > 11) { calMonth = 0;  calYear++; }
  renderCalendar();
}

function selectDay(iso, e) {
  document.querySelectorAll('.cal-day').forEach(d => d.classList.remove('selected'));
  e.currentTarget.classList.add('selected');

  const log = S.getLogs().find(l => l.date === iso);
  const detail = el('cal-detail');

  if (!log) {
    detail.innerHTML = `<div class="card text-muted" style="text-align:center">${fmtDate(iso)} — no workout</div>`;
    return;
  }
  const dur = log.endTime ? Math.round((log.endTime - log.startTime) / 60000) : null;
  const exRows = log.exercises.map(ex => `
    <div class="cal-detail-ex">
      <span>${ex.exerciseName}</span>
      <span class="text-muted">${ex.sets.length} sets</span>
    </div>`).join('');

  detail.innerHTML = `
    <div class="card">
      <div style="font-weight:700;font-size:17px;margin-bottom:2px">${log.templateName}</div>
      <div class="text-muted" style="font-size:13px;margin-bottom:12px">
        ${fmtDate(iso)}${dur ? ` · ${dur} min` : ''}
      </div>
      ${exRows}
    </div>`;
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-btn').forEach(btn =>
    btn.addEventListener('click', () => showView(btn.dataset.view))
  );

  el('btn-close-modal').addEventListener('click', closeModal);
  el('modal-overlay').addEventListener('click', e => {
    if (e.target === el('modal-overlay')) closeModal();
  });

  el('btn-finish-workout').addEventListener('click', finishWorkout);
  el('btn-skip-rest').addEventListener('click', stopRest);

  // Resume in-progress workout if one exists
  if (S.getCurrent()) {
    // Stay on dashboard — the resume card handles it
  }

  showView('dashboard');
});

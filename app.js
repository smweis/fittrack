// ── AUTH ──────────────────────────────────────────────────────
const AUTH_PW = 'stronglikebull';

function checkAuth() {
  if (localStorage.getItem('ft_auth') === '1') {
    el('auth-gate').classList.add('hidden');
  }
}
function submitAuth() {
  if (el('auth-input').value === AUTH_PW) {
    localStorage.setItem('ft_auth', '1');
    el('auth-gate').classList.add('hidden');
    el('auth-error').textContent = '';
  } else {
    el('auth-error').textContent = 'Wrong password';
    el('auth-input').value = '';
    el('auth-input').focus();
  }
}

// ── CONSTANTS ─────────────────────────────────────────────────
const EQUIPMENT_LIST = [
  'barbell','dumbbell','cable','machine','bodyweight',
  'bench','pull-up-bar','kettlebell','resistance-band',
];

const PUSH_MUSCLES = ['chest','shoulders','triceps'];
const PULL_MUSCLES = ['back','biceps'];
const LEG_MUSCLES  = ['legs','glutes','calves'];
const CORE_MUSCLES = ['core'];
const ALL_MUSCLES  = [...PUSH_MUSCLES, ...PULL_MUSCLES, ...LEG_MUSCLES, ...CORE_MUSCLES, 'cardio'];

const BUILTIN_WARMUP = [
  { id:'wu-jj', name:'Jumping Jacks',   muscleGroup:'cardio',     equipment:['bodyweight'], sets:2, reps:30, weight:0, restSeconds:30 },
  { id:'wu-ac', name:'Arm Circles',     muscleGroup:'shoulders',  equipment:['bodyweight'], sets:1, reps:20, weight:0, restSeconds:20 },
  { id:'wu-ls', name:'Leg Swings',      muscleGroup:'legs',       equipment:['bodyweight'], sets:1, reps:15, weight:0, restSeconds:20 },
  { id:'wu-iw', name:'Inchworm',        muscleGroup:'core',       equipment:['bodyweight'], sets:1, reps:8,  weight:0, restSeconds:30 },
  { id:'wu-hc', name:'Hip Circles',     muscleGroup:'legs',       equipment:['bodyweight'], sets:1, reps:10, weight:0, restSeconds:20 },
  { id:'wu-hr', name:'High Knees',      muscleGroup:'cardio',     equipment:['bodyweight'], sets:1, reps:20, weight:0, restSeconds:30 },
];
const BUILTIN_COOLDOWN = [
  { id:'cd-qs', name:'Standing Quad Stretch',    muscleGroup:'legs',     equipment:['bodyweight'], sets:1, reps:30, weight:0, restSeconds:0 },
  { id:'cd-hs', name:'Seated Hamstring Stretch', muscleGroup:'legs',     equipment:['bodyweight'], sets:1, reps:30, weight:0, restSeconds:0 },
  { id:'cd-cp', name:"Child's Pose",             muscleGroup:'back',     equipment:['bodyweight'], sets:1, reps:30, weight:0, restSeconds:0 },
  { id:'cd-cs', name:'Doorway Chest Stretch',    muscleGroup:'chest',    equipment:['bodyweight'], sets:1, reps:30, weight:0, restSeconds:0 },
  { id:'cd-ts', name:'Tricep Stretch',           muscleGroup:'triceps',  equipment:['bodyweight'], sets:1, reps:30, weight:0, restSeconds:0 },
  { id:'cd-pr', name:'Pigeon Stretch',           muscleGroup:'glutes',   equipment:['bodyweight'], sets:1, reps:30, weight:0, restSeconds:0 },
];

// ── STORAGE ──────────────────────────────────────────────────
const S = {
  getTemplates: () => JSON.parse(localStorage.getItem('ft_templates') || '[]'),
  saveTemplates: v  => localStorage.setItem('ft_templates', JSON.stringify(v)),
  getLogs:      () => JSON.parse(localStorage.getItem('ft_logs') || '[]'),
  saveLogs:     v  => localStorage.setItem('ft_logs', JSON.stringify(v)),
  getCurrent:   () => JSON.parse(localStorage.getItem('ft_current') || 'null'),
  saveCurrent:  v  => localStorage.setItem('ft_current', JSON.stringify(v)),
  clearCurrent: () => localStorage.removeItem('ft_current'),
};

// ── UTILITIES ─────────────────────────────────────────────────
function uid()     { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function todayISO(){ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function fmtDate(iso) {
  return new Date(iso+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
}
function fmtDur(ms){ const m=Math.floor(ms/60000),s=Math.floor((ms%60000)/1000); return `${m}:${String(s).padStart(2,'0')}`; }
function el(id)    { return document.getElementById(id); }
function shuffle(a){ const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; }

// ── EXERCISE HISTORY ──────────────────────────────────────────
function getLastExerciseState(exId) {
  const logs = S.getLogs();
  for (let i = logs.length - 1; i >= 0; i--) {
    const found = logs[i].exercises.find(e => e.exerciseId === exId);
    if (found?.sets?.length) {
      return {
        sets: found.sets.map(s => ({ weight: s.weight, reps: s.reps, done: false })),
        restSeconds: found.restSeconds ?? 90,
      };
    }
  }
  return null;
}

function getExerciseMaxWeightHistory(exId) {
  const out = [];
  S.getLogs().forEach(log => {
    const found = log.exercises.find(e => e.exerciseId === exId);
    if (found?.sets?.length) {
      const maxW = Math.max(...found.sets.map(s => s.weight || 0));
      if (maxW > 0) out.push({ date: log.date, value: maxW });
    }
  });
  return out.sort((a,b) => a.date.localeCompare(b.date));
}

// ── LINE CHART ────────────────────────────────────────────────
function drawLineChart(canvas, points) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const PAD = { t:24, r:18, b:38, l:46 };
  const iW = W - PAD.l - PAD.r, iH = H - PAD.t - PAD.b;

  ctx.clearRect(0, 0, W, H);

  if (!points.length) {
    ctx.fillStyle = '#555';
    ctx.font = '14px -apple-system,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No history yet', W/2, H/2);
    return;
  }

  const vals  = points.map(p => p.value);
  const lo    = Math.max(0, Math.min(...vals) - Math.min(...vals) * 0.1);
  const hi    = Math.max(...vals) * 1.1;
  const range = hi - lo || 1;

  const X = i  => PAD.l + (points.length > 1 ? i/(points.length-1) : 0.5) * iW;
  const Y = v  => PAD.t + (1 - (v - lo) / range) * iH;

  // grid
  ctx.lineWidth = 1;
  for (let g = 0; g <= 3; g++) {
    const y   = PAD.t + (g/3) * iH;
    const val = hi - (g/3) * range;
    ctx.strokeStyle = '#2a2a2a';
    ctx.beginPath(); ctx.moveTo(PAD.l, y); ctx.lineTo(W - PAD.r, y); ctx.stroke();
    ctx.fillStyle = '#555';
    ctx.font = '11px -apple-system,sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(val), PAD.l - 5, y + 4);
  }

  // x labels
  const li = points.length === 1 ? [0]
           : points.length === 2 ? [0,1]
           : [0, Math.floor((points.length-1)/2), points.length-1];
  ctx.fillStyle = '#555';
  ctx.textAlign = 'center';
  li.forEach(i => ctx.fillText(points[i].date.slice(5), X(i), H - 8));

  // fill
  if (points.length > 1) {
    ctx.beginPath();
    ctx.moveTo(X(0), Y(points[0].value));
    points.forEach((p,i) => { if(i) ctx.lineTo(X(i), Y(p.value)); });
    ctx.lineTo(X(points.length-1), PAD.t+iH);
    ctx.lineTo(X(0), PAD.t+iH);
    ctx.closePath();
    ctx.fillStyle = 'rgba(91,143,255,0.12)';
    ctx.fill();
  }

  // line
  if (points.length > 1) {
    ctx.beginPath();
    ctx.strokeStyle = '#5b8fff';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    points.forEach((p,i) => i===0 ? ctx.moveTo(X(i),Y(p.value)) : ctx.lineTo(X(i),Y(p.value)));
    ctx.stroke();
  }

  // dots
  points.forEach((p,i) => {
    const r = i === points.length-1 ? 5 : 3;
    ctx.beginPath();
    ctx.arc(X(i), Y(p.value), r, 0, Math.PI*2);
    ctx.fillStyle = '#5b8fff';
    ctx.fill();
    ctx.strokeStyle = '#0f0f0f';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // latest label
  const last = points[points.length-1];
  ctx.fillStyle = '#f0f0f0';
  ctx.font = 'bold 12px -apple-system,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${last.value}`, X(points.length-1), Y(last.value) - 11);
}

function showExerciseChart(exId, exName) {
  const history = getExerciseMaxWeightHistory(exId);
  const pr      = history.length ? Math.max(...history.map(p => p.value)) : 0;
  const recent  = history.length ? history[history.length-1].value : 0;

  const statsHtml = history.length ? `
    <div class="chart-stats">
      <div class="chart-stat">
        <div class="chart-stat-val">${pr} lbs</div>
        <div class="chart-stat-label">All-time PR</div>
      </div>
      <div class="chart-stat">
        <div class="chart-stat-val">${recent} lbs</div>
        <div class="chart-stat-label">Last session</div>
      </div>
      <div class="chart-stat">
        <div class="chart-stat-val">${history.length}</div>
        <div class="chart-stat-label">Sessions</div>
      </div>
    </div>` : '';

  openModal(exName, `
    ${statsHtml}
    <div class="chart-wrap">
      <canvas id="ex-chart" height="200"></canvas>
    </div>
  `);

  requestAnimationFrame(() => {
    const canvas = el('ex-chart');
    if (!canvas) return;
    canvas.width  = el('modal-sheet').clientWidth - 44;
    canvas.height = 200;
    drawLineChart(canvas, history.slice(-20));
  });
}

// ── ROUTER ────────────────────────────────────────────────────
let activeView = 'dashboard';

function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  el(`view-${id}`)?.classList.add('active');
  el('main-nav').classList.toggle('hidden', id === 'workout');
  document.querySelectorAll('.nav-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.view === id)
  );
  activeView = id;
  ({ dashboard: renderDashboard, templates: renderTemplates, calendar: renderCalendar,
     workout: renderActiveWorkout, 'template-editor': renderTemplateEditor })[id]?.();
}

// ── MODAL ─────────────────────────────────────────────────────
function openModal(title, bodyHTML) {
  el('modal-title').textContent = title;
  el('modal-body').innerHTML = bodyHTML;
  el('modal-overlay').classList.remove('hidden');
}
function closeModal() { el('modal-overlay').classList.add('hidden'); }

function pickList(title, items, onPick) {
  const html = items.map((item,i) => `
    <div class="modal-item" data-idx="${i}">
      <span class="modal-item-label">${item.label}</span>
      ${item.sub ? `<span class="modal-item-sub">${item.sub}</span>` : ''}
    </div>`).join('');
  openModal(title, html);
  el('modal-body').querySelectorAll('.modal-item').forEach(row =>
    row.addEventListener('click', () => { closeModal(); onPick(items[+row.dataset.idx].value); })
  );
}

// ── REST TIMER ────────────────────────────────────────────────
let rest = { iv:null, remaining:0, total:0 };

function startRest(secs) {
  stopRest();
  rest.total = secs; rest.remaining = secs;
  el('rest-timer-strip').classList.remove('hidden');
  tickRest();
  rest.iv = setInterval(tickRest, 1000);
}
function tickRest() {
  if (rest.remaining <= 0) { stopRest(); beep(); return; }
  el('rest-countdown').textContent = rest.remaining + 's';
  el('rest-progress-fill').style.width = (rest.remaining / rest.total * 100) + '%';
  rest.remaining--;
}
function stopRest() {
  if (rest.iv) { clearInterval(rest.iv); rest.iv = null; }
  el('rest-timer-strip').classList.add('hidden');
}
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0,200,400].forEach(delay => {
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.frequency.value = 880;
      const t = ctx.currentTime + delay/1000;
      g.gain.setValueAtTime(0.25,t);
      g.gain.exponentialRampToValueAtTime(0.001, t+0.25);
      osc.start(t); osc.stop(t+0.25);
    });
  } catch(_) {}
}

// ── ELAPSED TIMER ─────────────────────────────────────────────
let elapsedIv = null;
function startElapsed(startTime) {
  if (elapsedIv) clearInterval(elapsedIv);
  const tick = () => { const e = el('elapsed-timer'); if(e) e.textContent = fmtDur(Date.now()-startTime); };
  tick();
  elapsedIv = setInterval(tick, 1000);
}
function stopElapsed() { if(elapsedIv){ clearInterval(elapsedIv); elapsedIv=null; } }

// ── DASHBOARD ─────────────────────────────────────────────────
function nextTemplate() {
  const templates = S.getTemplates();
  if (!templates.length) return null;
  const sorted = [...templates].sort((a,b) => a.rotationOrder - b.rotationOrder);
  const logs = S.getLogs();
  if (!logs.length) return sorted[0];
  const idx = sorted.findIndex(t => t.id === logs[logs.length-1].templateId);
  return sorted[(idx+1) % sorted.length];
}

function renderDashboard() {
  const current = S.getCurrent();
  const next    = nextTemplate();
  const logs    = S.getLogs();
  const dateStr = new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});

  let html = `<div id="dash-head"><h2 style="font-size:28px">FitTrack</h2><div id="dash-date">${dateStr}</div></div>`;

  if (current) {
    const mins = Math.floor((Date.now() - current.startTime) / 60000);
    html += `<div class="resume-card mt-12">
      <div class="resume-card-label">Workout in progress · ${mins}m</div>
      <div style="font-size:17px;font-weight:600;margin:4px 0 12px">${current.templateName}</div>
      <button class="btn btn-primary btn-full" onclick="showView('workout')">Resume →</button>
    </div>`;
  }

  if (!current) {
    if (next) {
      html += `<div class="next-card mt-12">
        <div class="next-card-label">Next Workout</div>
        <div class="next-card-name">${next.name}</div>
        <div class="next-card-meta">${next.exercises.length} exercise${next.exercises.length!==1?'s':''} · rotation #${next.rotationOrder}</div>
        <button class="btn btn-primary btn-full" onclick="startWorkout('${next.id}')">Start →</button>
      </div>`;
    } else {
      html += `<div class="card mt-12" style="text-align:center;padding:28px">
        <p class="text-muted" style="margin-bottom:14px">Create a template to get started.</p>
        <button class="btn btn-primary" onclick="showView('templates')">Go to Templates</button>
      </div>`;
    }

    html += `<button class="btn btn-secondary btn-full mt-12" onclick="openRandomWorkout()">🎲 Random Workout</button>`;
  }

  if (logs.length) {
    html += `<div class="section-label mt-16">Recent</div><div class="card" style="padding:0 16px">`;
    [...logs].reverse().slice(0,6).forEach(log => {
      const dur = log.endTime ? Math.round((log.endTime-log.startTime)/60000) : null;
      html += `<div class="recent-item" onclick="showLogDetail('${log.id}')">
        <div>
          <div class="recent-item-name">${log.templateName}</div>
          <div class="recent-item-meta">${fmtDate(log.date)}${dur?` · ${dur}m`:''} · ${log.exercises.length} exercises</div>
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
  const dur = log.endTime ? Math.round((log.endTime-log.startTime)/60000) : null;

  const exRows = log.exercises.map(ex => {
    const safeName = ex.exerciseName.replace(/'/g, "\\'");
    const maxW = Math.max(...ex.sets.map(s => s.weight || 0));
    const sub = maxW > 0 ? `${ex.sets.length} sets · max ${maxW} lbs` : `${ex.sets.length} sets`;
    return `<div class="modal-item" onclick="showExerciseChart('${ex.exerciseId}','${safeName}')">
      <div>
        <div class="modal-item-label">${ex.exerciseName}</div>
        <div class="modal-item-sub">${sub}</div>
      </div>
      <span style="color:var(--accent);font-size:13px">↗</span>
    </div>`;
  }).join('');

  openModal(
    `${log.templateName} — ${fmtDate(log.date)}${dur ? ` (${dur}m)` : ''}`,
    `${exRows}
    <div style="display:flex;gap:8px;margin-top:16px">
      <button class="btn btn-secondary" style="flex:1" onclick="editLog('${logId}')">Edit</button>
      <button class="btn btn-danger"    style="flex:1" onclick="deleteLog('${logId}')">Delete</button>
    </div>`
  );
}

function editLog(id) {
  const log = S.getLogs().find(l => l.id === id);
  if (!log) return;
  editingLogId = id;
  S.saveCurrent({
    ...log,
    exercises: log.exercises.map(ex => ({
      ...ex,
      sets: ex.sets.map(s => ({ ...s, done: true })),
    })),
  });
  closeModal();
  showView('workout');
}

function deleteLog(id) {
  if (!confirm("Delete this workout? This can't be undone.")) return;
  S.saveLogs(S.getLogs().filter(l => l.id !== id));
  closeModal();
  if (activeView === 'calendar') renderCalendar();
  else renderDashboard();
}

// ── RANDOM WORKOUT ────────────────────────────────────────────
function classifyWorkout(exercises) {
  const groups  = exercises.map(e => e.muscleGroup);
  const push    = groups.filter(g => PUSH_MUSCLES.includes(g)).length;
  const pull    = groups.filter(g => PULL_MUSCLES.includes(g)).length;
  const legs    = groups.filter(g => LEG_MUSCLES.includes(g)).length;
  if (legs >= Math.max(push, pull)) return 'legs';
  if (push >= pull) return 'push';
  return 'pull';
}

function nextWorkoutType(lastType) {
  return { push:'pull', pull:'legs', legs:'push' }[lastType] ?? 'push';
}

function openRandomWorkout() {
  const selected = new Set(['bodyweight']);
  const chipsHtml = EQUIPMENT_LIST.map(eq => `
    <button class="chip ${eq==='bodyweight'?'selected':''}" data-eq="${eq}"
      onclick="this.classList.toggle('selected')">${eq.replace(/-/g,' ')}</button>`
  ).join('');

  openModal('Random Workout', `
    <p style="font-size:14px;color:var(--muted);margin-bottom:12px">
      What equipment do you have available?
    </p>
    <div class="chip-grid">${chipsHtml}</div>
    <button class="btn btn-primary btn-full mt-16" onclick="generateRandomWorkout()">Generate →</button>
  `);
}

function generateRandomWorkout() {
  const available = new Set(
    [...el('modal-body').querySelectorAll('.chip.selected')].map(c => c.dataset.eq)
  );
  available.add('bodyweight');

  const logs = S.getLogs();
  let workoutType = 'push';
  if (logs.length) {
    const lastType = classifyWorkout(logs[logs.length-1].exercises);
    workoutType = nextWorkoutType(lastType);
  }

  const targetMuscles = {
    push: [...PUSH_MUSCLES, ...CORE_MUSCLES],
    pull: [...PULL_MUSCLES, ...CORE_MUSCLES],
    legs: [...LEG_MUSCLES, ...CORE_MUSCLES],
  }[workoutType];

  // Gather all unique exercises from templates
  const byMuscle = {};
  const seen = new Set();
  S.getTemplates().forEach(t => t.exercises.forEach(ex => {
    if (seen.has(ex.id)) return;
    seen.add(ex.id);
    const eq = ex.equipment || [];
    const ok = !eq.length || eq.some(e => available.has(e));
    if (!ok) return;
    if (!byMuscle[ex.muscleGroup]) byMuscle[ex.muscleGroup] = [];
    byMuscle[ex.muscleGroup].push(ex);
  }));

  const mainExercises = [];
  targetMuscles.forEach(muscle => {
    const candidates = byMuscle[muscle] || [];
    if (candidates.length) mainExercises.push(candidates[Math.floor(Math.random() * candidates.length)]);
  });

  if (!mainExercises.length) {
    openModal('No Matches', `<p class="text-muted" style="padding:16px 0">
      No exercises found for the selected equipment. Add exercises with equipment tags to your templates first.
    </p>`);
    return;
  }

  const warmup   = shuffle(BUILTIN_WARMUP).slice(0,3);
  const cooldown = shuffle(BUILTIN_COOLDOWN).slice(0,3);
  const label    = workoutType.charAt(0).toUpperCase() + workoutType.slice(1);

  const makeRows = (list) => list.map(ex => `
    <div class="rand-ex-row">
      <span class="rand-ex-name">${ex.name}</span>
      <span class="rand-ex-meta">${ex.sets}×${ex.reps}${ex.weight?` · ${ex.weight}lbs`:''}</span>
    </div>`).join('');

  openModal(`Random: ${label} Day`, `
    <div class="rand-section-label">Warm Up</div>
    ${makeRows(warmup)}
    <div class="rand-section-label">Main</div>
    ${makeRows(mainExercises)}
    <div class="rand-section-label">Cool Down</div>
    ${makeRows(cooldown)}
    <div style="display:flex;gap:10px;margin-top:18px">
      <button class="btn btn-secondary" style="flex:1" onclick="generateRandomWorkout()">↺ Regenerate</button>
      <button class="btn btn-primary"   style="flex:2"
        onclick="startCustomWorkout(${JSON.stringify([...warmup,...mainExercises,...cooldown]
          .map((ex,i) => ({...ex, _section: i<warmup.length?'Warm Up': i<warmup.length+mainExercises.length?'Main':'Cool Down'})))
          .replace(/"/g,'&quot;')},\`Random: ${label} Day\`)">
        Start →
      </button>
    </div>
  `);
}

function startCustomWorkout(exercises, name) {
  // exercises may arrive as a JSON string if called from inline onclick
  if (typeof exercises === 'string') {
    try { exercises = JSON.parse(exercises); } catch(_) { return; }
  }
  const workout = {
    id: uid(),
    templateId: 'random',
    templateName: name,
    date: todayISO(),
    startTime: Date.now(),
    endTime: null,
    exercises: exercises.map(ex => {
      const last = getLastExerciseState(ex.id);
      return {
        exerciseId:   ex.id,
        exerciseName: ex.name,
        muscleGroup:  ex.muscleGroup,
        restSeconds:  last?.restSeconds ?? ex.restSeconds ?? 90,
        section:      ex._section || 'Main',
        sets: last?.sets ?? Array.from({length: ex.sets}, () =>
          ({ weight: ex.weight || 0, reps: ex.reps || 10, done: false })
        ),
      };
    }),
  };
  S.saveCurrent(workout);
  closeModal();
  showView('workout');
}

// ── ACTIVE WORKOUT ────────────────────────────────────────────
let editingLogId = null;

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
    exercises: tpl.exercises.map(ex => {
      const last = getLastExerciseState(ex.id);
      return {
        exerciseId:   ex.id,
        exerciseName: ex.name,
        muscleGroup:  ex.muscleGroup,
        restSeconds:  last?.restSeconds ?? ex.restSeconds ?? 90,
        section:      ex.section || 'Main',
        sets: last?.sets ?? Array.from({length: ex.sets}, () =>
          ({ weight: ex.weight || 0, reps: ex.reps || 10, done: false })
        ),
      };
    }),
  };
  S.saveCurrent(workout);
  showView('workout');
}

function renderActiveWorkout() {
  const w = S.getCurrent();
  if (!w) { showView('dashboard'); return; }

  if (editingLogId) {
    el('workout-title-bar').textContent = `Edit: ${w.templateName}`;
    el('btn-finish-workout').textContent = 'Save';
    el('btn-finish-workout').className = 'btn btn-primary btn-sm';
    el('btn-discard-workout').textContent = 'Cancel';
    el('elapsed-timer').textContent = fmtDate(w.date);
    el('elapsed-timer').style.fontSize = '12px';
    stopElapsed();
  } else {
    el('workout-title-bar').textContent = w.templateName;
    el('btn-finish-workout').textContent = 'Finish';
    el('btn-finish-workout').className = 'btn btn-success btn-sm';
    el('btn-discard-workout').textContent = '✕';
    el('elapsed-timer').style.fontSize = '18px';
    startElapsed(w.startTime);
  }

  buildExerciseList(w);
}

function buildExerciseList(w) {
  const container = el('exercise-list');
  container.innerHTML = '';
  let lastSection = null;

  w.exercises.forEach((ex, ei) => {
    const section = ex.section || 'Main';
    if (section !== lastSection) {
      const div = document.createElement('div');
      div.className = 'section-divider';
      div.innerHTML = `<span>${section}</span>`;
      container.appendChild(div);
      lastSection = section;
    }

    const card = document.createElement('div');
    card.className = 'ex-card';
    card.id = `ex-card-${ei}`;

    const rows = ex.sets.map((set,si) => `
      <tr>
        <td class="set-num">${si+1}</td>
        <td><input type="number" inputmode="decimal" value="${set.weight||''}" placeholder="lbs"
          oninput="patchSet(${ei},${si},'weight',this.value)"></td>
        <td><input type="number" inputmode="numeric" value="${set.reps||''}" placeholder="reps"
          oninput="patchSet(${ei},${si},'reps',this.value)"></td>
        <td><button class="btn-check ${set.done?'done':''}" onclick="toggleDone(${ei},${si})">✓</button></td>
      </tr>`).join('');

    // Safely encode exercise name for use in onclick
    const safeId   = CSS.escape ? ex.exerciseId : ex.exerciseId;
    const safeName = ex.exerciseName.replace(/'/g,"\\'");

    card.innerHTML = `
      <div class="ex-card-head">
        <div style="flex:1">
          <div class="ex-card-name" style="cursor:pointer"
            onclick="showExerciseChart('${ex.exerciseId}','${safeName}')">${ex.exerciseName}
            <span style="font-size:11px;color:var(--accent);margin-left:4px">↗</span>
          </div>
          <span class="muscle-chip">${ex.muscleGroup}</span>
        </div>
        <button class="btn-swap" onclick="openSwap(${ei})">Swap</button>
      </div>
      <table class="sets-table">
        <thead><tr>
          <th style="width:28px">#</th><th>Weight</th><th>Reps</th><th style="width:42px">✓</th>
        </tr></thead>
        <tbody id="tbody-${ei}">${rows}</tbody>
      </table>
      <button class="btn-add-set" onclick="addSet(${ei})">+ Add Set</button>`;

    container.appendChild(card);
  });
}

function patchSet(ei, si, field, val) {
  const w = S.getCurrent();
  w.exercises[ei].sets[si][field] = field==='weight' ? parseFloat(val)||0 : parseInt(val)||0;
  S.saveCurrent(w);
}

function toggleDone(ei, si) {
  const w   = S.getCurrent();
  const set = w.exercises[ei].sets[si];
  set.done  = !set.done;
  S.saveCurrent(w);
  const btn = el(`tbody-${ei}`)?.querySelectorAll('tr')[si]?.querySelector('.btn-check');
  if (btn) btn.classList.toggle('done', set.done);
  if (set.done) startRest(w.exercises[ei].restSeconds || 90);
  else stopRest();
}

function addSet(ei) {
  const w    = S.getCurrent();
  const sets = w.exercises[ei].sets;
  const last = sets[sets.length-1] || {weight:0,reps:10};
  sets.push({weight:last.weight, reps:last.reps, done:false});
  S.saveCurrent(w);
  buildExerciseList(w);
}

function openSwap(ei) {
  const w  = S.getCurrent();
  const ex = w.exercises[ei];
  const seen = new Set(), items = [];
  S.getTemplates().forEach(t => t.exercises.forEach(e => {
    if (e.muscleGroup === ex.muscleGroup && !seen.has(e.name)) {
      seen.add(e.name);
      items.push({label:e.name, sub:e.muscleGroup, value:e});
    }
  }));
  if (!items.length) {
    openModal('No Alternatives', '<p class="text-muted" style="padding:16px 0">No other exercises with the same muscle group in your templates.</p>');
    return;
  }
  pickList(`Swap: ${ex.exerciseName}`, items, sel => {
    const cur = S.getCurrent();
    const last = getLastExerciseState(sel.id);
    cur.exercises[ei] = {
      exerciseId:   sel.id,
      exerciseName: sel.name,
      muscleGroup:  sel.muscleGroup,
      restSeconds:  last?.restSeconds ?? sel.restSeconds ?? 90,
      section:      cur.exercises[ei].section || 'Main',
      sets: last?.sets ?? cur.exercises[ei].sets.map(s => ({...s, done:false})),
    };
    S.saveCurrent(cur);
    buildExerciseList(cur);
  });
}

function openAddExerciseModal() {
  const seen = new Set(), items = [];
  S.getTemplates().forEach(t => t.exercises.forEach(e => {
    if (!seen.has(e.name)) { seen.add(e.name); items.push({label:e.name,sub:e.muscleGroup,value:e}); }
  }));
  if (!items.length) {
    openModal('No Exercises','<p class="text-muted" style="padding:16px 0">Add exercises to your templates first.</p>');
    return;
  }
  pickList('Add Exercise', items, sel => {
    const w    = S.getCurrent();
    const last = getLastExerciseState(sel.id);
    w.exercises.push({
      exerciseId:   sel.id,
      exerciseName: sel.name,
      muscleGroup:  sel.muscleGroup,
      restSeconds:  last?.restSeconds ?? sel.restSeconds ?? 90,
      section:      'Main',
      sets: last?.sets ?? [{weight:sel.weight||0, reps:sel.reps||10, done:false}],
    });
    S.saveCurrent(w);
    buildExerciseList(w);
  });
}

function finishWorkout() {
  const isEditing = !!editingLogId;
  if (!confirm(isEditing ? 'Save changes to this workout?' : 'Finish and save this workout?')) return;

  const w = S.getCurrent();
  if (!isEditing) w.endTime = Date.now();

  // Only keep sets the user checked off
  w.exercises = w.exercises
    .map(ex => ({ ...ex, sets: ex.sets.filter(s => s.done) }))
    .filter(ex => ex.sets.length > 0);

  const logs = S.getLogs();
  if (isEditing) {
    const idx = logs.findIndex(l => l.id === editingLogId);
    if (idx >= 0) logs[idx] = w; else logs.push(w);
  } else {
    logs.push(w);
  }

  S.saveLogs(logs);
  S.clearCurrent();
  editingLogId = null;
  stopElapsed();
  stopRest();
  showView('dashboard');
}

function discardWorkout() {
  const isEditing = !!editingLogId;
  const msg = isEditing
    ? 'Cancel editing? Your changes won\'t be saved.'
    : 'Discard this workout? All progress will be lost.';
  if (!confirm(msg)) return;
  S.clearCurrent();
  editingLogId = null;
  stopElapsed();
  stopRest();
  showView('dashboard');
}

// ── TEMPLATES LIST ────────────────────────────────────────────
function renderTemplates() {
  const templates = S.getTemplates().sort((a,b) => a.rotationOrder - b.rotationOrder);
  let html = `<div class="view-header"><h2>Templates</h2>
    <button class="btn btn-primary btn-sm" onclick="openTemplateEditor(null)">+ New</button>
  </div>`;

  if (!templates.length) {
    html += `<div class="empty-state"><p>No templates yet.</p>
      <button class="btn btn-primary" onclick="openTemplateEditor(null)">Create First Template</button></div>`;
  } else {
    templates.forEach(t => {
      html += `<div class="tpl-item">
        <div class="tpl-order">${t.rotationOrder}</div>
        <div class="tpl-info">
          <div class="tpl-name">${t.name}</div>
          <div class="tpl-meta">${t.exercises.length} exercise${t.exercises.length!==1?'s':''}</div>
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
  editingTpl = id
    ? JSON.parse(JSON.stringify(S.getTemplates().find(t => t.id === id)))
    : { id:uid(), name:'', rotationOrder: S.getTemplates().length+1, exercises:[] };
  showView('template-editor');
}

function renderTemplateEditor() {
  const t     = editingTpl;
  const isNew = !S.getTemplates().find(x => x.id === t.id);

  const exHtml = t.exercises.length
    ? t.exercises.map((ex,i) => {
        const eqLabel = (ex.equipment||[]).join(', ') || 'bodyweight';
        const secBadge = (ex.section && ex.section !== 'Main')
          ? ` · <span style="color:var(--accent)">${ex.section}</span>` : '';
        return `<div class="editor-ex-item">
          <div class="editor-ex-info">
            <div class="editor-ex-name">${ex.name}</div>
            <div class="editor-ex-meta">${ex.muscleGroup} · ${ex.sets}×${ex.reps} · ${ex.weight}lbs · ${ex.restSeconds}s rest · ${eqLabel}${secBadge}</div>
          </div>
          <button class="btn-icon" onclick="editTplEx(${i})">✎</button>
          <button class="btn-icon text-danger" onclick="removeTplEx(${i})">✕</button>
        </div>`;
      }).join('')
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

function addTplEx()     { showExForm(null, ex => { editingTpl.exercises.push(ex); renderTemplateEditor(); }); }
function editTplEx(i)   { showExForm(editingTpl.exercises[i], ex => { editingTpl.exercises[i]=ex; renderTemplateEditor(); }); }
function removeTplEx(i) { editingTpl.exercises.splice(i,1); renderTemplateEditor(); }

let exFormCb = null;
const MUSCLE_GROUPS = ['chest','back','shoulders','biceps','triceps','legs','glutes','core','calves','cardio'];

function showExForm(ex, cb) {
  exFormCb = cb;
  const e = ex || {id:uid(), name:'', muscleGroup:'chest', section:'Main', sets:3, reps:10, weight:0, restSeconds:90, equipment:[]};
  const muscleOpts = MUSCLE_GROUPS.map(g =>
    `<option value="${g}" ${g===e.muscleGroup?'selected':''}>${g.charAt(0).toUpperCase()+g.slice(1)}</option>`
  ).join('');
  const sectionOpts = ['Warm Up','Main','Cool Down'].map(s =>
    `<option value="${s}" ${(e.section||'Main')===s?'selected':''}>${s}</option>`
  ).join('');
  const chips = EQUIPMENT_LIST.map(eq =>
    `<button class="chip ${(e.equipment||[]).includes(eq)?'selected':''}" data-eq="${eq}"
      onclick="this.classList.toggle('selected')">${eq.replace(/-/g,' ')}</button>`
  ).join('');

  openModal(ex ? 'Edit Exercise' : 'Add Exercise', `
    <div class="form-group">
      <label>Exercise Name</label>
      <input id="ex-name" type="text" value="${e.name}" placeholder="e.g. Bench Press">
    </div>
    <div class="two-col">
      <div class="form-group">
        <label>Muscle Group</label>
        <select id="ex-muscle">${muscleOpts}</select>
      </div>
      <div class="form-group">
        <label>Section</label>
        <select id="ex-section">${sectionOpts}</select>
      </div>
    </div>
    <div class="two-col">
      <div class="form-group"><label>Sets</label>
        <input id="ex-sets" type="number" inputmode="numeric" min="1" value="${e.sets}"></div>
      <div class="form-group"><label>Default Reps</label>
        <input id="ex-reps" type="number" inputmode="numeric" min="1" value="${e.reps}"></div>
      <div class="form-group"><label>Default Weight (lbs)</label>
        <input id="ex-weight" type="number" inputmode="decimal" min="0" step="2.5" value="${e.weight}"></div>
      <div class="form-group"><label>Rest (seconds)</label>
        <input id="ex-rest" type="number" inputmode="numeric" min="0" step="15" value="${e.restSeconds}"></div>
    </div>
    <div class="form-group">
      <label>Equipment</label>
      <div class="chip-grid" id="eq-chips">${chips}</div>
    </div>
    <button class="btn btn-primary btn-full mt-12" onclick="submitExForm('${e.id}')">
      ${ex ? 'Update' : 'Add Exercise'}
    </button>
  `);
}

function submitExForm(id) {
  const name = el('ex-name').value.trim();
  if (!name) { alert('Enter an exercise name'); return; }
  const equipment = [...document.querySelectorAll('#eq-chips .chip.selected')].map(c => c.dataset.eq);
  const ex = {
    id,
    name,
    muscleGroup: el('ex-muscle').value,
    section:     el('ex-section').value || 'Main',
    sets:        parseInt(el('ex-sets').value)    || 3,
    reps:        parseInt(el('ex-reps').value)    || 10,
    weight:      parseFloat(el('ex-weight').value) || 0,
    restSeconds: parseInt(el('ex-rest').value)    || 90,
    equipment,
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
let calYear = new Date().getFullYear(), calMonth = new Date().getMonth();

function renderCalendar() {
  const logs    = S.getLogs();
  const logMap  = {};
  logs.forEach(l => { logMap[l.date] = l; });
  const todayStr   = todayISO();
  const firstDow   = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
  const monthLabel  = new Date(calYear, calMonth, 1)
    .toLocaleDateString('en-US',{month:'long',year:'numeric'});

  let gridHtml = ['Su','Mo','Tu','We','Th','Fr','Sa']
    .map(d => `<div class="cal-dow">${d}</div>`).join('');
  for (let i = 0; i < firstDow; i++) gridHtml += `<div class="cal-day empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const cls = ['cal-day', iso===todayStr?'today':'', logMap[iso]?'has-workout':''].filter(Boolean).join(' ');
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
  if (calMonth < 0) { calMonth=11; calYear--; }
  if (calMonth > 11) { calMonth=0; calYear++; }
  renderCalendar();
}

function selectDay(iso, e) {
  document.querySelectorAll('.cal-day').forEach(d => d.classList.remove('selected'));
  e.currentTarget.classList.add('selected');
  const log    = S.getLogs().find(l => l.date === iso);
  const detail = el('cal-detail');
  if (!log) {
    detail.innerHTML = `<div class="card text-muted" style="text-align:center">${fmtDate(iso)} — no workout</div>`;
    return;
  }
  const dur = log.endTime ? Math.round((log.endTime-log.startTime)/60000) : null;
  const exRows = log.exercises.map(ex => `
    <div class="cal-detail-ex">
      <span>${ex.exerciseName}</span>
      <span class="text-muted">${ex.sets.length} sets</span>
    </div>`).join('');
  detail.innerHTML = `<div class="card" style="cursor:pointer" onclick="showLogDetail('${log.id}')">
    <div style="font-weight:700;font-size:17px;margin-bottom:2px">${log.templateName}</div>
    <div class="text-muted" style="font-size:13px;margin-bottom:12px">${fmtDate(iso)}${dur?` · ${dur} min`:''}</div>
    ${exRows}
    <div style="color:var(--accent);font-size:13px;margin-top:10px">Tap to open →</div>
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
  el('btn-discard-workout').addEventListener('click', discardWorkout);
  el('btn-skip-rest').addEventListener('click', stopRest);
  el('auth-btn').addEventListener('click', submitAuth);
  el('auth-input').addEventListener('keydown', e => { if (e.key === 'Enter') submitAuth(); });
  checkAuth();
  showView('dashboard');
});

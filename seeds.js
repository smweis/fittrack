// Seed data — auto-runs once on first load if no templates exist
(function () {

// ── EXERCISE LIBRARY ─────────────────────────────────────────
// equipment: tag the PRIMARY gear that makes the exercise possible.
// Multi-tag means "this OR that works" (e.g. cable OR band).
// Bodyweight-only exercises list ['bodyweight'].
const E = {

  // ── WARMUP / MOBILITY ──────────────────────────────────────
  ARM_CIRCLES:    { id:'ex-arm-circles',    name:'Arm Circles',            muscleGroup:'shoulders', equipment:['bodyweight'],               sets:1, reps:20, weight:0,  restSeconds:15 },
  SHOULDER_ROLLS: { id:'ex-shoulder-rolls', name:'Shoulder Rolls',         muscleGroup:'shoulders', equipment:['bodyweight'],               sets:1, reps:20, weight:0,  restSeconds:15 },
  BAND_PULL_APT:  { id:'ex-band-pull-apt',  name:'Band Pull-Apart',        muscleGroup:'shoulders', equipment:['resistance-band'],          sets:2, reps:15, weight:0,  restSeconds:20 },
  JUMPING_JACKS:  { id:'ex-jumping-jacks',  name:'Jumping Jacks',          muscleGroup:'cardio',    equipment:['bodyweight'],               sets:2, reps:30, weight:0,  restSeconds:20 },
  HIGH_KNEES:     { id:'ex-high-knees',     name:'High Knees',             muscleGroup:'cardio',    equipment:['bodyweight'],               sets:1, reps:20, weight:0,  restSeconds:20 },
  HIP_CIRCLES:    { id:'ex-hip-circles',    name:'Hip Circles',            muscleGroup:'legs',      equipment:['bodyweight'],               sets:1, reps:15, weight:0,  restSeconds:15 },
  LEG_SWINGS:     { id:'ex-leg-swings',     name:'Leg Swings',             muscleGroup:'legs',      equipment:['bodyweight'],               sets:1, reps:15, weight:0,  restSeconds:15 },
  INCHWORM:       { id:'ex-inchworm',       name:'Inchworm',               muscleGroup:'core',      equipment:['bodyweight'],               sets:1, reps:8,  weight:0,  restSeconds:30 },
  CAT_COW:        { id:'ex-cat-cow',        name:'Cat-Cow Stretch',        muscleGroup:'back',      equipment:['bodyweight'],               sets:1, reps:12, weight:0,  restSeconds:20 },
  HIP_HINGE:      { id:'ex-hip-hinge',      name:'Hip Hinge Drill',        muscleGroup:'glutes',    equipment:['bodyweight'],               sets:1, reps:10, weight:0,  restSeconds:20 },
  DEAD_BUG_WARM:  { id:'ex-dead-bug-warm',  name:'Dead Bug (activation)',  muscleGroup:'core',      equipment:['bodyweight'],               sets:1, reps:10, weight:0,  restSeconds:20 },
  BW_SQUAT_WARM:  { id:'ex-bw-squat-warm',  name:'Bodyweight Squat',       muscleGroup:'legs',      equipment:['bodyweight'],               sets:2, reps:15, weight:0,  restSeconds:20 },

  // ── CHEST ──────────────────────────────────────────────────
  PUSHUP:         { id:'ex-pushup',         name:'Push-Up',                muscleGroup:'chest',     equipment:['bodyweight'],               sets:3, reps:20, weight:0,  restSeconds:60  },
  WIDE_PUSHUP:    { id:'ex-wide-pushup',    name:'Wide Push-Up',           muscleGroup:'chest',     equipment:['bodyweight'],               sets:3, reps:15, weight:0,  restSeconds:60  },
  DECLINE_PUSHUP: { id:'ex-decline-pushup', name:'Decline Push-Up',        muscleGroup:'chest',     equipment:['bodyweight'],               sets:3, reps:15, weight:0,  restSeconds:60  },
  INCLINE_PUSHUP: { id:'ex-incline-pushup', name:'Incline Push-Up',        muscleGroup:'chest',     equipment:['bodyweight'],               sets:3, reps:15, weight:0,  restSeconds:45  },
  DB_BENCH:       { id:'ex-db-bench',       name:'Flat DB Press',          muscleGroup:'chest',     equipment:['dumbbell'],                 sets:3, reps:10, weight:35, restSeconds:90  },
  DB_INC_PRESS:   { id:'ex-db-inc-press',   name:'Incline DB Press',       muscleGroup:'chest',     equipment:['dumbbell'],                 sets:3, reps:10, weight:30, restSeconds:90  },
  DB_FLY:         { id:'ex-db-fly',         name:'Dumbbell Fly',           muscleGroup:'chest',     equipment:['dumbbell'],                 sets:3, reps:12, weight:20, restSeconds:75  },
  BAND_CHEST:     { id:'ex-band-chest',     name:'Band Chest Press',       muscleGroup:'chest',     equipment:['resistance-band'],          sets:3, reps:15, weight:0,  restSeconds:60  },
  BB_BENCH:       { id:'ex-bb-bench',       name:'Barbell Bench Press',    muscleGroup:'chest',     equipment:['barbell'],                  sets:4, reps:8,  weight:0,  restSeconds:120 },
  BB_INC_PRESS:   { id:'ex-bb-inc-press',   name:'Incline Barbell Press',  muscleGroup:'chest',     equipment:['barbell'],                  sets:3, reps:8,  weight:0,  restSeconds:120 },
  CABLE_FLY:      { id:'ex-cable-fly',      name:'Cable Fly',              muscleGroup:'chest',     equipment:['cable'],                    sets:3, reps:12, weight:0,  restSeconds:75  },
  MACHINE_CHEST:  { id:'ex-machine-chest',  name:'Machine Chest Press',    muscleGroup:'chest',     equipment:['machine'],                  sets:3, reps:12, weight:0,  restSeconds:75  },

  // ── BACK ───────────────────────────────────────────────────
  PULLUP:         { id:'ex-pullup',         name:'Pull-Up',                muscleGroup:'back',      equipment:['pull-up-bar'],              sets:4, reps:6,  weight:0,  restSeconds:120 },
  CHINUP:         { id:'ex-chinup',         name:'Chin-Up',                muscleGroup:'biceps',    equipment:['pull-up-bar'],              sets:3, reps:6,  weight:0,  restSeconds:120 },
  WIDE_PULLUP:    { id:'ex-wide-pullup',    name:'Wide-Grip Pull-Up',      muscleGroup:'back',      equipment:['pull-up-bar'],              sets:3, reps:5,  weight:0,  restSeconds:120 },
  INV_ROW:        { id:'ex-inv-row',        name:'Inverted Row',           muscleGroup:'back',      equipment:['pull-up-bar'],              sets:3, reps:12, weight:0,  restSeconds:75  },
  DB_ROW:         { id:'ex-db-row',         name:'Dumbbell Row',           muscleGroup:'back',      equipment:['dumbbell'],                 sets:3, reps:10, weight:40, restSeconds:75  },
  DB_SINGLE_ROW:  { id:'ex-db-single-row',  name:'Single-Arm DB Row',      muscleGroup:'back',      equipment:['dumbbell'],                 sets:3, reps:10, weight:35, restSeconds:75  },
  BAND_ROW:       { id:'ex-band-row',       name:'Band Row',               muscleGroup:'back',      equipment:['resistance-band'],          sets:3, reps:15, weight:0,  restSeconds:60  },
  BB_ROW:         { id:'ex-bb-row',         name:'Barbell Row',            muscleGroup:'back',      equipment:['barbell'],                  sets:4, reps:8,  weight:0,  restSeconds:120 },
  CABLE_ROW:      { id:'ex-cable-row',      name:'Seated Cable Row',       muscleGroup:'back',      equipment:['cable'],                    sets:3, reps:12, weight:0,  restSeconds:90  },
  LAT_PULLDOWN:   { id:'ex-lat-pulldown',   name:'Lat Pulldown',           muscleGroup:'back',      equipment:['cable'],                    sets:3, reps:12, weight:0,  restSeconds:90  },
  MACHINE_ROW:    { id:'ex-machine-row',    name:'Machine Row',            muscleGroup:'back',      equipment:['machine'],                  sets:3, reps:12, weight:0,  restSeconds:90  },
  SUPERMAN:       { id:'ex-superman',       name:'Superman',               muscleGroup:'back',      equipment:['bodyweight'],               sets:3, reps:15, weight:0,  restSeconds:45  },
  BACK_EXT:       { id:'ex-back-ext',       name:'Back Extension',         muscleGroup:'back',      equipment:['bodyweight'],               sets:3, reps:15, weight:0,  restSeconds:45  },
  FACE_PULL:      { id:'ex-face-pull',      name:'Face Pull',              muscleGroup:'shoulders', equipment:['cable','resistance-band'],   sets:3, reps:15, weight:0,  restSeconds:60  },

  // ── SHOULDERS ──────────────────────────────────────────────
  PIKE_PUSHUP:    { id:'ex-pike-pushup',    name:'Pike Push-Up',           muscleGroup:'shoulders', equipment:['bodyweight'],               sets:3, reps:12, weight:0,  restSeconds:60  },
  DB_SHOULDER:    { id:'ex-db-shoulder',    name:'DB Shoulder Press',      muscleGroup:'shoulders', equipment:['dumbbell'],                 sets:3, reps:10, weight:25, restSeconds:90  },
  DB_LATERAL:     { id:'ex-db-lateral',     name:'Lateral Raise',          muscleGroup:'shoulders', equipment:['dumbbell'],                 sets:3, reps:12, weight:15, restSeconds:60  },
  DB_FRONT_RAISE: { id:'ex-db-front-raise', name:'Front Raise',            muscleGroup:'shoulders', equipment:['dumbbell'],                 sets:3, reps:12, weight:12, restSeconds:60  },
  DB_ARNOLD:      { id:'ex-db-arnold',      name:'Arnold Press',           muscleGroup:'shoulders', equipment:['dumbbell'],                 sets:3, reps:10, weight:20, restSeconds:90  },
  DB_REAR_DELT:   { id:'ex-db-rear-delt',   name:'Rear Delt Fly',          muscleGroup:'shoulders', equipment:['dumbbell'],                 sets:3, reps:15, weight:12, restSeconds:60  },
  BAND_LATERAL:   { id:'ex-band-lateral',   name:'Band Lateral Raise',     muscleGroup:'shoulders', equipment:['resistance-band'],          sets:3, reps:15, weight:0,  restSeconds:60  },
  BAND_OHP:       { id:'ex-band-ohp',       name:'Band Overhead Press',    muscleGroup:'shoulders', equipment:['resistance-band'],          sets:3, reps:15, weight:0,  restSeconds:60  },
  BB_OHP:         { id:'ex-bb-ohp',         name:'Barbell Overhead Press', muscleGroup:'shoulders', equipment:['barbell'],                  sets:4, reps:8,  weight:0,  restSeconds:120 },
  CABLE_LATERAL:  { id:'ex-cable-lateral',  name:'Cable Lateral Raise',    muscleGroup:'shoulders', equipment:['cable'],                    sets:3, reps:12, weight:0,  restSeconds:60  },

  // ── BICEPS ─────────────────────────────────────────────────
  DB_CURL:        { id:'ex-db-curl',        name:'Dumbbell Curl',          muscleGroup:'biceps',    equipment:['dumbbell'],                 sets:3, reps:12, weight:20, restSeconds:60  },
  HAMMER_CURL:    { id:'ex-hammer-curl',    name:'Hammer Curl',            muscleGroup:'biceps',    equipment:['dumbbell'],                 sets:3, reps:12, weight:20, restSeconds:60  },
  CONC_CURL:      { id:'ex-conc-curl',      name:'Concentration Curl',     muscleGroup:'biceps',    equipment:['dumbbell'],                 sets:3, reps:12, weight:20, restSeconds:60  },
  INC_CURL:       { id:'ex-inc-curl',       name:'Incline DB Curl',        muscleGroup:'biceps',    equipment:['dumbbell'],                 sets:3, reps:10, weight:15, restSeconds:60  },
  BAND_CURL:      { id:'ex-band-curl',      name:'Band Curl',              muscleGroup:'biceps',    equipment:['resistance-band'],          sets:3, reps:15, weight:0,  restSeconds:60  },
  BB_CURL:        { id:'ex-bb-curl',        name:'Barbell Curl',           muscleGroup:'biceps',    equipment:['barbell'],                  sets:3, reps:10, weight:0,  restSeconds:75  },
  CABLE_CURL:     { id:'ex-cable-curl',     name:'Cable Curl',             muscleGroup:'biceps',    equipment:['cable'],                    sets:3, reps:12, weight:0,  restSeconds:60  },

  // ── TRICEPS ────────────────────────────────────────────────
  DIAMOND_PUSHUP: { id:'ex-diamond-pushup', name:'Diamond Push-Up',        muscleGroup:'triceps',   equipment:['bodyweight'],               sets:3, reps:12, weight:0,  restSeconds:60  },
  BENCH_DIP:      { id:'ex-bench-dip',      name:'Bench Dip',              muscleGroup:'triceps',   equipment:['bodyweight'],               sets:3, reps:15, weight:0,  restSeconds:60  },
  OVH_EXT:        { id:'ex-ovh-ext',        name:'Overhead Tricep Ext',    muscleGroup:'triceps',   equipment:['dumbbell'],                 sets:3, reps:12, weight:20, restSeconds:75  },
  KICKBACK:       { id:'ex-kickback',       name:'Tricep Kickback',        muscleGroup:'triceps',   equipment:['dumbbell'],                 sets:3, reps:12, weight:15, restSeconds:60  },
  BAND_TRICEP:    { id:'ex-band-tricep',    name:'Band Tricep Extension',  muscleGroup:'triceps',   equipment:['resistance-band'],          sets:3, reps:15, weight:0,  restSeconds:60  },
  TRICEP_PUSH:    { id:'ex-tricep-push',    name:'Tricep Pushdown',        muscleGroup:'triceps',   equipment:['cable'],                    sets:3, reps:12, weight:0,  restSeconds:75  },
  SKULL_CRUSHER:  { id:'ex-skull-crusher',  name:'Skull Crusher',          muscleGroup:'triceps',   equipment:['barbell'],                  sets:3, reps:10, weight:0,  restSeconds:90  },
  CABLE_OVH_EXT:  { id:'ex-cable-ovh-ext',  name:'Cable Overhead Ext',    muscleGroup:'triceps',   equipment:['cable'],                    sets:3, reps:12, weight:0,  restSeconds:75  },

  // ── LEGS ───────────────────────────────────────────────────
  LUNGE:          { id:'ex-lunge',          name:'Walking Lunge',          muscleGroup:'legs',      equipment:['bodyweight'],               sets:3, reps:12, weight:0,  restSeconds:60  },
  SPLIT_SQUAT:    { id:'ex-split-squat',    name:'Split Squat',            muscleGroup:'legs',      equipment:['bodyweight'],               sets:3, reps:12, weight:0,  restSeconds:60  },
  JUMP_SQUAT:     { id:'ex-jump-squat',     name:'Jump Squat',             muscleGroup:'legs',      equipment:['bodyweight'],               sets:3, reps:15, weight:0,  restSeconds:60  },
  NORDIC_CURL:    { id:'ex-nordic-curl',    name:'Nordic Curl',            muscleGroup:'legs',      equipment:['bodyweight'],               sets:3, reps:8,  weight:0,  restSeconds:90  },
  GOBLET_SQUAT:   { id:'ex-goblet-squat',   name:'Goblet Squat',           muscleGroup:'legs',      equipment:['dumbbell'],                 sets:4, reps:10, weight:35, restSeconds:90  },
  BSS:            { id:'ex-bss',            name:'Bulgarian Split Squat',  muscleGroup:'legs',      equipment:['dumbbell'],                 sets:3, reps:10, weight:20, restSeconds:90  },
  DB_LUNGE:       { id:'ex-db-lunge',       name:'Dumbbell Lunge',         muscleGroup:'legs',      equipment:['dumbbell'],                 sets:3, reps:10, weight:20, restSeconds:75  },
  BAND_SQUAT:     { id:'ex-band-squat',     name:'Band Squat',             muscleGroup:'legs',      equipment:['resistance-band'],          sets:3, reps:15, weight:0,  restSeconds:60  },
  BB_SQUAT:       { id:'ex-bb-squat',       name:'Barbell Squat',          muscleGroup:'legs',      equipment:['barbell'],                  sets:4, reps:8,  weight:0,  restSeconds:150 },
  LEG_PRESS:      { id:'ex-leg-press',      name:'Leg Press',              muscleGroup:'legs',      equipment:['machine'],                  sets:3, reps:12, weight:0,  restSeconds:90  },
  LEG_EXT:        { id:'ex-leg-ext',        name:'Leg Extension',          muscleGroup:'legs',      equipment:['machine'],                  sets:3, reps:12, weight:0,  restSeconds:75  },
  LEG_CURL:       { id:'ex-leg-curl',       name:'Lying Leg Curl',         muscleGroup:'legs',      equipment:['machine'],                  sets:3, reps:12, weight:0,  restSeconds:75  },
  HACK_SQUAT:     { id:'ex-hack-squat',     name:'Hack Squat',             muscleGroup:'legs',      equipment:['machine'],                  sets:3, reps:10, weight:0,  restSeconds:90  },

  // ── GLUTES ─────────────────────────────────────────────────
  GLUTE_BRIDGE:   { id:'ex-glute-bridge',   name:'Glute Bridge',           muscleGroup:'glutes',    equipment:['bodyweight'],               sets:3, reps:20, weight:0,  restSeconds:60  },
  HIP_THRUST_BW:  { id:'ex-hip-thrust-bw',  name:'Hip Thrust',             muscleGroup:'glutes',    equipment:['bodyweight'],               sets:3, reps:20, weight:0,  restSeconds:60  },
  DONKEY_KICK:    { id:'ex-donkey-kick',    name:'Donkey Kick',            muscleGroup:'glutes',    equipment:['bodyweight'],               sets:3, reps:15, weight:0,  restSeconds:45  },
  CLAMSHELL:      { id:'ex-clamshell',      name:'Clamshell',              muscleGroup:'glutes',    equipment:['bodyweight','resistance-band'], sets:3, reps:20, weight:0, restSeconds:45 },
  BAND_WALK:      { id:'ex-band-walk',      name:'Lateral Band Walk',      muscleGroup:'glutes',    equipment:['resistance-band'],          sets:3, reps:15, weight:0,  restSeconds:45  },
  RDL_DB:         { id:'ex-rdl-db',         name:'Romanian Deadlift (DB)', muscleGroup:'glutes',    equipment:['dumbbell'],                 sets:3, reps:12, weight:35, restSeconds:90  },
  HIP_THRUST_BB:  { id:'ex-hip-thrust-bb',  name:'Barbell Hip Thrust',     muscleGroup:'glutes',    equipment:['barbell'],                  sets:3, reps:10, weight:0,  restSeconds:90  },
  RDL_BB:         { id:'ex-rdl-bb',         name:'Romanian Deadlift',      muscleGroup:'glutes',    equipment:['barbell'],                  sets:3, reps:10, weight:0,  restSeconds:120 },
  CABLE_KICKBACK: { id:'ex-cable-kickback', name:'Cable Kickback',         muscleGroup:'glutes',    equipment:['cable'],                    sets:3, reps:12, weight:0,  restSeconds:60  },

  // ── CALVES ─────────────────────────────────────────────────
  CALF_RAISE:     { id:'ex-calf-raise',     name:'Calf Raise',             muscleGroup:'calves',    equipment:['bodyweight'],               sets:4, reps:20, weight:0,  restSeconds:45  },
  SINGLE_CALF:    { id:'ex-single-calf',    name:'Single-Leg Calf Raise',  muscleGroup:'calves',    equipment:['bodyweight'],               sets:3, reps:15, weight:0,  restSeconds:45  },
  SEATED_CALF:    { id:'ex-seated-calf',    name:'Seated Calf Raise',      muscleGroup:'calves',    equipment:['machine','dumbbell'],        sets:3, reps:15, weight:0,  restSeconds:60  },

  // ── CORE ───────────────────────────────────────────────────
  PLANK:          { id:'ex-plank',          name:'Plank',                  muscleGroup:'core',      equipment:['bodyweight'],               sets:3, reps:45, weight:0,  restSeconds:60  },
  SIDE_PLANK:     { id:'ex-side-plank',     name:'Side Plank',             muscleGroup:'core',      equipment:['bodyweight'],               sets:2, reps:30, weight:0,  restSeconds:45  },
  BICYCLE:        { id:'ex-bicycle',        name:'Bicycle Crunch',         muscleGroup:'core',      equipment:['bodyweight'],               sets:3, reps:20, weight:0,  restSeconds:45  },
  LEG_RAISE:      { id:'ex-leg-raise',      name:'Leg Raise',              muscleGroup:'core',      equipment:['bodyweight'],               sets:3, reps:15, weight:0,  restSeconds:60  },
  RUSSIAN_TWIST:  { id:'ex-russian-twist',  name:'Russian Twist',          muscleGroup:'core',      equipment:['dumbbell','bodyweight'],     sets:3, reps:20, weight:10, restSeconds:60  },
  DEAD_BUG:       { id:'ex-dead-bug',       name:'Dead Bug',               muscleGroup:'core',      equipment:['bodyweight'],               sets:3, reps:10, weight:0,  restSeconds:45  },
  MTN_CLIMBER:    { id:'ex-mtn-climber',    name:'Mountain Climbers',      muscleGroup:'core',      equipment:['bodyweight'],               sets:3, reps:20, weight:0,  restSeconds:45  },
  HOLLOW_HOLD:    { id:'ex-hollow-hold',    name:'Hollow Hold',            muscleGroup:'core',      equipment:['bodyweight'],               sets:3, reps:30, weight:0,  restSeconds:60  },
  FLUTTER_KICK:   { id:'ex-flutter-kick',   name:'Flutter Kicks',          muscleGroup:'core',      equipment:['bodyweight'],               sets:3, reps:30, weight:0,  restSeconds:45  },
  VUP:            { id:'ex-vup',            name:'V-Up',                   muscleGroup:'core',      equipment:['bodyweight'],               sets:3, reps:15, weight:0,  restSeconds:60  },

  // ── CARDIO ─────────────────────────────────────────────────
  BURPEE:         { id:'ex-burpee',         name:'Burpee',                 muscleGroup:'cardio',    equipment:['bodyweight'],               sets:4, reps:12, weight:0,  restSeconds:60  },
  SPRINT:         { id:'ex-sprint',         name:'Sprint Intervals',       muscleGroup:'cardio',    equipment:['bodyweight'],               sets:6, reps:1,  weight:0,  restSeconds:90  },
  BOX_JUMP:       { id:'ex-box-jump',       name:'Box Jump',               muscleGroup:'cardio',    equipment:['bodyweight'],               sets:4, reps:8,  weight:0,  restSeconds:75  },
  SKIP:           { id:'ex-skip',           name:'Jump Rope',              muscleGroup:'cardio',    equipment:['bodyweight'],               sets:3, reps:60, weight:0,  restSeconds:45  },
};

// Helper: tag exercise with a workout section
function w(ex) { return { ...ex, section:'Warm Up'  }; }
function m(ex) { return { ...ex, section:'Main'     }; }

const SEED_TEMPLATES = [

  // ── 1. PUSH — HOME ─────────────────────────────────────────
  // Equipment: incline bench, 50lb adjustable DBs, resistance bands, pull-up-bar, bodyweight
  {
    id:'tpl-push-home', name:'Push — Home', rotationOrder:1,
    exercises:[
      w(E.ARM_CIRCLES),
      w(E.JUMPING_JACKS),
      w({ ...E.INCLINE_PUSHUP, sets:2, reps:12 }),

      m(E.DB_INC_PRESS),
      m(E.DB_FLY),
      m(E.BAND_CHEST),
      m(E.DB_SHOULDER),
      m(E.DB_LATERAL),
      m(E.BAND_LATERAL),
      m(E.OVH_EXT),
      m(E.BAND_TRICEP),
      m(E.DIAMOND_PUSHUP),
    ],
  },

  // ── 2. PULL — HOME ─────────────────────────────────────────
  {
    id:'tpl-pull-home', name:'Pull — Home', rotationOrder:2,
    exercises:[
      w(E.ARM_CIRCLES),
      w(E.BAND_PULL_APT),
      w(E.SHOULDER_ROLLS),

      m(E.PULLUP),
      m(E.WIDE_PULLUP),
      m(E.INV_ROW),
      m(E.DB_SINGLE_ROW),
      m(E.BAND_ROW),
      m({ ...E.FACE_PULL, equipment:['resistance-band'] }),
      m(E.DB_REAR_DELT),
      m(E.HAMMER_CURL),
      m(E.DB_CURL),
      m(E.BAND_CURL),
    ],
  },

  // ── 3. LOWER — HOME ────────────────────────────────────────
  {
    id:'tpl-lower-home', name:'Lower — Home', rotationOrder:3,
    exercises:[
      w(E.HIP_CIRCLES),
      w(E.LEG_SWINGS),
      w(E.HIP_HINGE),

      m(E.GOBLET_SQUAT),
      m(E.BSS),
      m(E.DB_LUNGE),
      m(E.RDL_DB),
      m(E.HIP_THRUST_BW),
      m(E.BAND_WALK),
      m(E.CLAMSHELL),
      m(E.CALF_RAISE),
      m(E.RUSSIAN_TWIST),
    ],
  },

  // ── 4. PUSH — GYM ──────────────────────────────────────────
  {
    id:'tpl-push-gym', name:'Push — Gym', rotationOrder:4,
    exercises:[
      w(E.ARM_CIRCLES),
      w(E.BAND_PULL_APT),
      w({ ...E.PUSHUP, sets:2, reps:15 }),

      m(E.BB_BENCH),
      m(E.BB_INC_PRESS),
      m(E.CABLE_FLY),
      m(E.MACHINE_CHEST),
      m(E.BB_OHP),
      m(E.DB_LATERAL),
      m(E.CABLE_LATERAL),
      m(E.FACE_PULL),
      m(E.TRICEP_PUSH),
      m(E.SKULL_CRUSHER),
    ],
  },

  // ── 5. PULL — GYM ──────────────────────────────────────────
  {
    id:'tpl-pull-gym', name:'Pull — Gym', rotationOrder:5,
    exercises:[
      w(E.ARM_CIRCLES),
      w(E.BAND_PULL_APT),
      w(E.CAT_COW),

      m(E.PULLUP),
      m(E.BB_ROW),
      m(E.LAT_PULLDOWN),
      m(E.CABLE_ROW),
      m(E.DB_SINGLE_ROW),
      m(E.FACE_PULL),
      m(E.DB_REAR_DELT),
      m(E.BB_CURL),
      m(E.HAMMER_CURL),
      m(E.CABLE_CURL),
    ],
  },

  // ── 6. LOWER — GYM ─────────────────────────────────────────
  {
    id:'tpl-lower-gym', name:'Lower — Gym', rotationOrder:6,
    exercises:[
      w(E.HIP_CIRCLES),
      w(E.LEG_SWINGS),
      w(E.HIP_HINGE),

      m(E.BB_SQUAT),
      m(E.LEG_PRESS),
      m(E.HACK_SQUAT),
      m(E.RDL_BB),
      m(E.LEG_CURL),
      m(E.LEG_EXT),
      m(E.HIP_THRUST_BB),
      m(E.CABLE_KICKBACK),
      m(E.SEATED_CALF),
      m(E.PLANK),
    ],
  },

  // ── 7. BEACH — UPPER ───────────────────────────────────────
  // Bodyweight only: push/pull mix (can't isolate pull without a bar)
  {
    id:'tpl-beach-upper', name:'Beach — Upper', rotationOrder:7,
    exercises:[
      w(E.JUMPING_JACKS),
      w(E.ARM_CIRCLES),
      w(E.INCHWORM),

      m(E.PUSHUP),
      m(E.WIDE_PUSHUP),
      m(E.DECLINE_PUSHUP),
      m(E.PIKE_PUSHUP),
      m(E.DIAMOND_PUSHUP),
      m(E.SUPERMAN),
      m(E.BACK_EXT),
      m(E.SIDE_PLANK),
      m(E.HOLLOW_HOLD),
    ],
  },

  // ── 8. BEACH — LOWER ───────────────────────────────────────
  {
    id:'tpl-beach-lower', name:'Beach — Lower', rotationOrder:8,
    exercises:[
      w(E.HIP_CIRCLES),
      w(E.LEG_SWINGS),
      w({ ...E.LUNGE, sets:1, reps:10 }),

      m(E.JUMP_SQUAT),
      m(E.LUNGE),
      m(E.SPLIT_SQUAT),
      m(E.NORDIC_CURL),
      m(E.GLUTE_BRIDGE),
      m(E.DONKEY_KICK),
      m(E.CLAMSHELL),
      m(E.CALF_RAISE),
      m(E.FLUTTER_KICK),
      m(E.VUP),
    ],
  },

  // ── 9. CARDIO / HIIT ───────────────────────────────────────
  {
    id:'tpl-cardio', name:'Cardio / HIIT', rotationOrder:9,
    exercises:[
      w(E.JUMPING_JACKS),
      w(E.HIGH_KNEES),
      w(E.DEAD_BUG_WARM),

      m(E.BURPEE),
      m(E.JUMP_SQUAT),
      m(E.MTN_CLIMBER),
      m(E.HIGH_KNEES),
      m(E.SPRINT),
      m(E.HOLLOW_HOLD),
      m(E.FLUTTER_KICK),
    ],
  },

];

// ── SEED ON FIRST LOAD ────────────────────────────────────────
if (!localStorage.getItem('ft_seeded_v1')) {
  const existing = JSON.parse(localStorage.getItem('ft_templates') || '[]');
  if (!existing.length) {
    localStorage.setItem('ft_templates', JSON.stringify(SEED_TEMPLATES));
  }
  localStorage.setItem('ft_seeded_v1', '1');
}

})();

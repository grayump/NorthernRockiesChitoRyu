/* ============================================================
   Data + Store for the 28-Day Chitō-Ryū Karate PWA.
   Plain globals (no modules/build). Loaded before app.js.

   Two selectable axes (each beginner/intermediate/advanced):
     SKILL   = content  → which techniques / kata you drill
     FITNESS = intensity → how much volume is layered on top
   A "plan" is one skill × fitness selection; progress is
   tracked per plan. New plans drop in by adding a SKILL_TRACKS
   entry — nothing else needs to change.
   ============================================================ */
"use strict";

const TOTAL_DAYS = 28;

/* ------------------------------------------------------------
   SKILL_TRACKS — the *content* axis.
   Each track is a self-contained 28-day program: its own week
   themes, day-type rotation, per-type colours, and 4 weeks of
   technique content per day-type. baseSets is the volume the
   FITNESS modifier adjusts; reps stay as authored.
   ------------------------------------------------------------ */
const SKILL_TRACKS = {
  /* ===================== BEGINNER ===================== */
  beginner: {
    name: "White–Yellow Belt",
    blurb: "Stances, basic strikes/blocks, and your first kata.",
    weekThemes: [
      { label: "Week 1", theme: "Stance & Breath", color: "#4A7C59", light: "#E8F2EC" },
      { label: "Week 2", theme: "Basics", color: "#2C5F8A", light: "#E3EEF7" },
      { label: "Week 3", theme: "Combinations", color: "#9B2D20", light: "#F5E6E3" },
      { label: "Week 4", theme: "First Kata", color: "#6E6E9E", light: "#E8E8F0" },
    ],
    rotation: ["KIHON", "KATA", "KICKS", "CONDITIONING"],
    dayTypes: {
      KIHON: { label: "KIHON", short: "KIHON", color: "#E65100" },
      KATA: { label: "KATA", short: "KATA", color: "#1565C0" },
      KICKS: { label: "GERI", short: "KICKS", color: "#6A1B9A" },
      CONDITIONING: { label: "TANREN", short: "COND", color: "#2E7D32" },
    },
    workouts: {
      KIHON: [
        { week: 1, items: [
          { name: "Seisan-dachi stance holds", baseSets: 3, reps: "30 sec" },
          { name: "Choku-zuki (straight punch)", baseSets: 3, reps: "20" },
          { name: "Gedan-barai (low block)", baseSets: 3, reps: "15 each" },
          { name: "Age-uke (rising block)", baseSets: 3, reps: "15 each" },
          { name: "Hikite drill (pull-hand) slow", baseSets: 2, reps: "20" },
        ] },
        { week: 2, items: [
          { name: "Zenkutsu-dachi step-through", baseSets: 3, reps: "10 each" },
          { name: "Oi-zuki (lunge punch)", baseSets: 3, reps: "12 each" },
          { name: "Soto-uke (outside block)", baseSets: 3, reps: "15 each" },
          { name: "Uchi-uke (inside block)", baseSets: 3, reps: "15 each" },
          { name: "Kiba-dachi punches", baseSets: 3, reps: "20" },
        ] },
        { week: 3, items: [
          { name: "Kihon-Dosa Ichi (basic movements I)", baseSets: 3, reps: "2 run-throughs" },
          { name: "Block–counter (uke + gyaku-zuki)", baseSets: 3, reps: "12 each" },
          { name: "Gyaku-zuki (reverse punch)", baseSets: 3, reps: "15 each" },
          { name: "Shuto-uke (knife-hand block)", baseSets: 3, reps: "12 each" },
          { name: "Kime focus punches (snap + tension)", baseSets: 3, reps: "10" },
        ] },
        { week: 4, items: [
          { name: "Kihon-Dosa Ichi at speed", baseSets: 3, reps: "3 run-throughs" },
          { name: "Sanbon-zuki (triple punch)", baseSets: 4, reps: "10 each" },
          { name: "Block combination flow", baseSets: 3, reps: "12 each" },
          { name: "Oi-zuki + gyaku-zuki combo", baseSets: 3, reps: "12 each" },
          { name: "Kiai punches (max focus)", baseSets: 3, reps: "8" },
        ] },
      ],
      KATA: [
        { week: 1, items: [
          { name: "Kihon-Dosa Ichi — learn sequence", baseSets: 4, reps: "1 slow pass" },
          { name: "Stance transitions (zenkutsu↔kiba)", baseSets: 3, reps: "10" },
          { name: "Turns (180° pivots in stance)", baseSets: 3, reps: "10 each" },
          { name: "Rei / posture & focus drill", baseSets: 2, reps: "1 min" },
        ] },
        { week: 2, items: [
          { name: "Heian/Pinan Shodan — first half", baseSets: 4, reps: "2 passes" },
          { name: "Down-block + step (opening sequence)", baseSets: 3, reps: "10 each" },
          { name: "Stance depth check (mirror)", baseSets: 3, reps: "8 each" },
          { name: "Slow kata with breath count", baseSets: 2, reps: "1 pass" },
        ] },
        { week: 3, items: [
          { name: "Heian/Pinan Shodan — full kata", baseSets: 4, reps: "3 passes" },
          { name: "Embusen (floor pattern) accuracy", baseSets: 3, reps: "2 passes" },
          { name: "Block–punch timing within kata", baseSets: 3, reps: "10" },
          { name: "Kiai points drill", baseSets: 2, reps: "6" },
        ] },
        { week: 4, items: [
          { name: "Heian/Pinan Shodan — performance pace", baseSets: 4, reps: "3 passes" },
          { name: "Heian/Pinan Nidan — opening", baseSets: 3, reps: "2 passes" },
          { name: "Kata at speed with kime", baseSets: 3, reps: "2 passes" },
          { name: "Self-review vs. video/mirror", baseSets: 2, reps: "1 pass" },
        ] },
      ],
      KICKS: [
        { week: 1, items: [
          { name: "Hip-flexor & hamstring mobility", baseSets: 2, reps: "45 sec each" },
          { name: "Knee-chamber holds (hiza)", baseSets: 3, reps: "20 sec each" },
          { name: "Mae-geri (front kick) slow", baseSets: 3, reps: "10 each" },
          { name: "Balance on one leg", baseSets: 3, reps: "30 sec each" },
        ] },
        { week: 2, items: [
          { name: "Mae-geri keage (snap front kick)", baseSets: 3, reps: "12 each" },
          { name: "Front kick + recoil to chamber", baseSets: 3, reps: "10 each" },
          { name: "Standing knee raises", baseSets: 3, reps: "15 each" },
          { name: "Hip rotation drill (wall)", baseSets: 3, reps: "12 each" },
        ] },
        { week: 3, items: [
          { name: "Mae-geri stepping forward", baseSets: 3, reps: "12 each" },
          { name: "Yoko-geri keage (side snap) intro", baseSets: 3, reps: "10 each" },
          { name: "Kick + punch combination", baseSets: 3, reps: "10 each" },
          { name: "Dynamic leg swings", baseSets: 3, reps: "15 each" },
        ] },
        { week: 4, items: [
          { name: "Mae-geri height + speed", baseSets: 4, reps: "12 each" },
          { name: "Yoko-geri keage controlled", baseSets: 3, reps: "12 each" },
          { name: "Double front kick (chamber-chamber)", baseSets: 3, reps: "8 each" },
          { name: "Kick balance flow", baseSets: 3, reps: "30 sec each" },
        ] },
      ],
      CONDITIONING: [
        { week: 1, items: [
          { name: "Push-ups (knuckle if able)", baseSets: 3, reps: "10" },
          { name: "Squats (kiba-dachi depth)", baseSets: 3, reps: "20" },
          { name: "Plank (core for kime)", baseSets: 3, reps: "30 sec" },
          { name: "Sit-ups", baseSets: 3, reps: "15" },
          { name: "Shadow karate (free technique)", baseSets: 1, reps: "3 min" },
        ] },
        { week: 2, items: [
          { name: "Knuckle push-ups", baseSets: 3, reps: "12" },
          { name: "Squats", baseSets: 3, reps: "25" },
          { name: "Plank", baseSets: 3, reps: "40 sec" },
          { name: "Leg raises", baseSets: 3, reps: "12" },
          { name: "Shadow karate rounds", baseSets: 2, reps: "2 min" },
        ] },
        { week: 3, items: [
          { name: "Push-ups", baseSets: 4, reps: "12" },
          { name: "Jump squats", baseSets: 3, reps: "12" },
          { name: "Plank + shoulder taps", baseSets: 3, reps: "40 sec" },
          { name: "Bicycle crunches", baseSets: 3, reps: "20" },
          { name: "Shadow karate rounds", baseSets: 3, reps: "2 min" },
        ] },
        { week: 4, items: [
          { name: "Push-ups", baseSets: 4, reps: "15" },
          { name: "Jump squats", baseSets: 3, reps: "15" },
          { name: "Plank", baseSets: 3, reps: "60 sec" },
          { name: "V-ups", baseSets: 3, reps: "12" },
          { name: "Shadow karate rounds", baseSets: 3, reps: "3 min" },
        ] },
      ],
    },
    cooldowns: {
      KIHON: "Wrist & forearm stretch · Shoulder rolls · Neck rolls · Deep breathing (kokyu)",
      KATA: "Standing forward fold · Hip-opener lunge · Spinal twist · Seiza breathing",
      KICKS: "Quad stretch · Hip-flexor lunge · Hamstring floor stretch · Butterfly stretch",
      CONDITIONING: "Walk 2 min · Chest doorway stretch · Cat-cow · Full-body stretch circuit",
    },
  },

  /* ===================== INTERMEDIATE ===================== */
  intermediate: {
    name: "Green–Brown Belt",
    blurb: "Sharper basics, combination work, kumite drills, deeper kata.",
    weekThemes: [
      { label: "Week 1", theme: "Sharpen Basics", color: "#4A7C59", light: "#E8F2EC" },
      { label: "Week 2", theme: "Combinations", color: "#2C5F8A", light: "#E3EEF7" },
      { label: "Week 3", theme: "Kumite Drills", color: "#9B2D20", light: "#F5E6E3" },
      { label: "Week 4", theme: "Kata Depth", color: "#6E6E9E", light: "#E8E8F0" },
    ],
    rotation: ["KIHON", "KATA", "KICKS", "CONDITIONING"],
    dayTypes: {
      KIHON: { label: "KIHON", short: "KIHON", color: "#E65100" },
      KATA: { label: "KATA", short: "KATA", color: "#1565C0" },
      KICKS: { label: "GERI", short: "KICKS", color: "#6A1B9A" },
      CONDITIONING: { label: "TANREN", short: "COND", color: "#2E7D32" },
    },
    workouts: {
      KIHON: [
        { week: 1, items: [
          { name: "Kihon-Dosa Ni (basic movements II)", baseSets: 3, reps: "2 passes" },
          { name: "Sanbon-zuki advancing", baseSets: 4, reps: "10 each" },
          { name: "Uke flow (age/soto/uchi/gedan)", baseSets: 3, reps: "12 cycles" },
          { name: "Gyaku-zuki with hip drive", baseSets: 4, reps: "15 each" },
          { name: "Shuto-uke + nukite", baseSets: 3, reps: "12 each" },
        ] },
        { week: 2, items: [
          { name: "Block–counter combinations", baseSets: 4, reps: "12 each" },
          { name: "Kizami-zuki + gyaku-zuki", baseSets: 4, reps: "12 each" },
          { name: "Empi-uchi (elbow strike)", baseSets: 3, reps: "12 each" },
          { name: "Uraken (back-fist) snaps", baseSets: 3, reps: "15 each" },
          { name: "Neko-ashi-dachi transitions", baseSets: 3, reps: "10 each" },
        ] },
        { week: 3, items: [
          { name: "3-technique combinations (renzoku)", baseSets: 4, reps: "10 each" },
          { name: "Block → strike → kick flow", baseSets: 4, reps: "10 each" },
          { name: "Tai-sabaki (body shifting) + counter", baseSets: 3, reps: "12 each" },
          { name: "Hammer-fist / tettsui", baseSets: 3, reps: "15 each" },
          { name: "Speed punches (focus mitts or air)", baseSets: 3, reps: "20" },
        ] },
        { week: 4, items: [
          { name: "Kihon-Dosa Ni at speed", baseSets: 4, reps: "3 passes" },
          { name: "Combination to failure (form intact)", baseSets: 3, reps: "Max clean" },
          { name: "Counter-attack drill both sides", baseSets: 4, reps: "12 each" },
          { name: "Power line drill (linked kime)", baseSets: 3, reps: "12" },
          { name: "Kiai combinations", baseSets: 3, reps: "8" },
        ] },
      ],
      KATA: [
        { week: 1, items: [
          { name: "Heian/Pinan Sandan — full", baseSets: 4, reps: "3 passes" },
          { name: "Heian/Pinan Yondan — learn", baseSets: 3, reps: "2 passes" },
          { name: "Bunkai (application) walkthrough", baseSets: 3, reps: "5 reps" },
          { name: "Embusen accuracy run", baseSets: 2, reps: "2 passes" },
        ] },
        { week: 2, items: [
          { name: "Heian/Pinan Yondan — full", baseSets: 4, reps: "3 passes" },
          { name: "Heian/Pinan Godan — opening", baseSets: 3, reps: "2 passes" },
          { name: "Kime + timing pass", baseSets: 3, reps: "2 passes" },
          { name: "Slow-motion control pass", baseSets: 2, reps: "1 pass" },
        ] },
        { week: 3, items: [
          { name: "Heian/Pinan Godan — full", baseSets: 4, reps: "3 passes" },
          { name: "Seisan — learn opening", baseSets: 3, reps: "2 passes" },
          { name: "Kata bunkai with partner/air", baseSets: 3, reps: "6 reps" },
          { name: "Performance pace + kiai", baseSets: 2, reps: "2 passes" },
        ] },
        { week: 4, items: [
          { name: "Seisan — build full kata", baseSets: 4, reps: "3 passes" },
          { name: "Choose kata: full performance", baseSets: 3, reps: "3 passes" },
          { name: "Breath/tension (Seisan emphasis)", baseSets: 3, reps: "2 passes" },
          { name: "Self-review vs. video", baseSets: 2, reps: "1 pass" },
        ] },
      ],
      KICKS: [
        { week: 1, items: [
          { name: "Dynamic mobility flow", baseSets: 2, reps: "1 min" },
          { name: "Mae-geri kekomi (thrust)", baseSets: 3, reps: "12 each" },
          { name: "Mawashi-geri (roundhouse) chamber", baseSets: 3, reps: "12 each" },
          { name: "Yoko-geri kekomi (side thrust)", baseSets: 3, reps: "10 each" },
        ] },
        { week: 2, items: [
          { name: "Mawashi-geri full + recoil", baseSets: 3, reps: "12 each" },
          { name: "Kick combinations (mae→mawashi)", baseSets: 3, reps: "10 each" },
          { name: "Skip/step side kick", baseSets: 3, reps: "10 each" },
          { name: "Kick + reverse punch", baseSets: 3, reps: "12 each" },
        ] },
        { week: 3, items: [
          { name: "Ushiro-geri (back kick)", baseSets: 3, reps: "10 each" },
          { name: "Mawashi at 3 heights", baseSets: 3, reps: "9 each" },
          { name: "Kick–kick–punch combos", baseSets: 3, reps: "10 each" },
          { name: "Switch-stance kicking", baseSets: 3, reps: "12 each" },
        ] },
        { week: 4, items: [
          { name: "Speed kicking (any, clean form)", baseSets: 4, reps: "15 each" },
          { name: "Jump front kick (tobi mae-geri)", baseSets: 3, reps: "8 each" },
          { name: "3-kick combination flow", baseSets: 3, reps: "8 each" },
          { name: "Balance & height hold", baseSets: 3, reps: "30 sec each" },
        ] },
      ],
      CONDITIONING: [
        { week: 1, items: [
          { name: "Knuckle push-ups", baseSets: 4, reps: "15" },
          { name: "Jump squats", baseSets: 3, reps: "15" },
          { name: "Burpees", baseSets: 3, reps: "10" },
          { name: "Plank", baseSets: 3, reps: "50 sec" },
          { name: "Shadow karate (combos)", baseSets: 2, reps: "3 min" },
        ] },
        { week: 2, items: [
          { name: "Push-ups (varied grip)", baseSets: 4, reps: "15" },
          { name: "Lunge jumps", baseSets: 3, reps: "12 each" },
          { name: "Burpees", baseSets: 3, reps: "12" },
          { name: "Hollow-body hold", baseSets: 3, reps: "40 sec" },
          { name: "Shadow karate rounds", baseSets: 3, reps: "2 min" },
        ] },
        { week: 3, items: [
          { name: "Explosive push-ups", baseSets: 4, reps: "10" },
          { name: "Squat + front-kick combo", baseSets: 3, reps: "15 each" },
          { name: "Mountain climbers", baseSets: 4, reps: "40 sec" },
          { name: "Russian twists", baseSets: 3, reps: "20" },
          { name: "Shadow karate (continuous)", baseSets: 3, reps: "3 min" },
        ] },
        { week: 4, items: [
          { name: "Push-ups to failure (form intact)", baseSets: 3, reps: "Max" },
          { name: "Burpee + jump-kick", baseSets: 3, reps: "10" },
          { name: "HIIT: 30s on / 30s off", baseSets: 6, reps: "rounds" },
          { name: "V-ups", baseSets: 3, reps: "15" },
          { name: "Shadow karate rounds", baseSets: 3, reps: "3 min" },
        ] },
      ],
    },
    cooldowns: {
      KIHON: "Forearm/wrist stretch · Shoulder & chest opener · Neck rolls · Kokyu breathing",
      KATA: "Standing fold · Deep lunge hip-opener · Seated twist · Seiza breathing",
      KICKS: "Quad · Hip-flexor · Hamstring · Butterfly · Pigeon stretch",
      CONDITIONING: "Walk 2–3 min · Chest/shoulder stretch · Cat-cow · Full-body circuit",
    },
  },

  /* ===================== ADVANCED ===================== */
  advanced: {
    name: "Black Belt",
    blurb: "Power, advanced kicks, free kumite, and senior kata.",
    weekThemes: [
      { label: "Week 1", theme: "Power & Speed", color: "#4A7C59", light: "#E8F2EC" },
      { label: "Week 2", theme: "Advanced Kicks", color: "#2C5F8A", light: "#E3EEF7" },
      { label: "Week 3", theme: "Free Kumite", color: "#9B2D20", light: "#F5E6E3" },
      { label: "Week 4", theme: "Senior Kata", color: "#6E6E9E", light: "#E8E8F0" },
    ],
    rotation: ["KIHON", "KATA", "KICKS", "KUMITE"],
    dayTypes: {
      KIHON: { label: "KIHON", short: "KIHON", color: "#E65100" },
      KATA: { label: "KATA", short: "KATA", color: "#1565C0" },
      KICKS: { label: "GERI", short: "KICKS", color: "#6A1B9A" },
      KUMITE: { label: "KUMITE", short: "KUMITE", color: "#C62828" },
    },
    workouts: {
      KIHON: [
        { week: 1, items: [
          { name: "Power line drill (full kinetic chain)", baseSets: 4, reps: "12 each" },
          { name: "Sanbon-zuki explosive", baseSets: 4, reps: "12 each" },
          { name: "Block–counter at speed both sides", baseSets: 4, reps: "12 each" },
          { name: "Empi / uraken / tettsui flow", baseSets: 3, reps: "15 each" },
          { name: "Nukite + shuto combinations", baseSets: 3, reps: "12 each" },
        ] },
        { week: 2, items: [
          { name: "4-technique combinations", baseSets: 4, reps: "10 each" },
          { name: "Tai-sabaki + simultaneous counter", baseSets: 4, reps: "12 each" },
          { name: "Speed punch burst", baseSets: 4, reps: "20" },
          { name: "Close-range elbows & knees", baseSets: 3, reps: "12 each" },
          { name: "Neko-ashi → forward attack", baseSets: 3, reps: "10 each" },
        ] },
        { week: 3, items: [
          { name: "Renzoku-waza (long combinations)", baseSets: 4, reps: "8 each" },
          { name: "Counter to multiple attacks", baseSets: 4, reps: "10 each" },
          { name: "Power + speed alternating sets", baseSets: 4, reps: "12 each" },
          { name: "Open-hand techniques flow", baseSets: 3, reps: "15 each" },
          { name: "Kime under fatigue", baseSets: 3, reps: "10" },
        ] },
        { week: 4, items: [
          { name: "Full basics gauntlet (all techniques)", baseSets: 4, reps: "3 passes" },
          { name: "Max-power combinations", baseSets: 4, reps: "8 each" },
          { name: "Reaction counter drill", baseSets: 4, reps: "12 each" },
          { name: "Combination to failure (form intact)", baseSets: 3, reps: "Max clean" },
          { name: "Kiai power sets", baseSets: 3, reps: "8" },
        ] },
      ],
      KATA: [
        { week: 1, items: [
          { name: "Bassai (Bassai-Dai) — full", baseSets: 4, reps: "3 passes" },
          { name: "Seisan — performance pace", baseSets: 3, reps: "3 passes" },
          { name: "Bunkai deep-dive", baseSets: 3, reps: "8 reps" },
          { name: "Power + breath integration", baseSets: 3, reps: "2 passes" },
        ] },
        { week: 2, items: [
          { name: "Chintō — full kata", baseSets: 4, reps: "3 passes" },
          { name: "Bassai — refine timing/kime", baseSets: 3, reps: "3 passes" },
          { name: "Jumping/turning sections drill", baseSets: 3, reps: "10 reps" },
          { name: "Performance pace + kiai", baseSets: 3, reps: "2 passes" },
        ] },
        { week: 3, items: [
          { name: "Niseishi (Niju-Shi-Ho) — build", baseSets: 4, reps: "3 passes" },
          { name: "Chintō — performance", baseSets: 3, reps: "3 passes" },
          { name: "Bunkai with resistance/partner", baseSets: 3, reps: "8 reps" },
          { name: "Two kata back-to-back (stamina)", baseSets: 2, reps: "2 rounds" },
        ] },
        { week: 4, items: [
          { name: "Sanchin — breath & tension (Chito-Ryu)", baseSets: 4, reps: "3 passes" },
          { name: "Tournament kata: full performance", baseSets: 3, reps: "3 passes" },
          { name: "All senior kata rotation", baseSets: 3, reps: "1 each" },
          { name: "Self-review vs. video", baseSets: 2, reps: "1 pass" },
        ] },
      ],
      KICKS: [
        { week: 1, items: [
          { name: "Dynamic mobility + active splits", baseSets: 2, reps: "90 sec" },
          { name: "Mawashi-geri full power", baseSets: 4, reps: "12 each" },
          { name: "Ushiro-geri (back kick)", baseSets: 3, reps: "12 each" },
          { name: "Ushiro-mawashi (spinning hook)", baseSets: 3, reps: "8 each" },
        ] },
        { week: 2, items: [
          { name: "Tobi mae-geri (jump front kick)", baseSets: 3, reps: "10 each" },
          { name: "Tobi mawashi-geri (jump round)", baseSets: 3, reps: "8 each" },
          { name: "Spinning back kick combos", baseSets: 3, reps: "8 each" },
          { name: "Fast low-high kick combos", baseSets: 4, reps: "10 each" },
        ] },
        { week: 3, items: [
          { name: "4-kick combination flow", baseSets: 3, reps: "6 each" },
          { name: "Counter-kick off slip", baseSets: 3, reps: "10 each" },
          { name: "Jump spinning kick", baseSets: 3, reps: "6 each" },
          { name: "Kicking under fatigue (form intact)", baseSets: 3, reps: "12 each" },
        ] },
        { week: 4, items: [
          { name: "Max-power kicks (all types)", baseSets: 4, reps: "10 each" },
          { name: "Flying kick to failure (clean)", baseSets: 3, reps: "Max" },
          { name: "Combination gauntlet", baseSets: 3, reps: "5 each" },
          { name: "Head-height hold + control", baseSets: 3, reps: "30 sec each" },
        ] },
      ],
      KUMITE: [
        { week: 1, items: [
          { name: "Footwork & distance (ma-ai) drill", baseSets: 3, reps: "2 min" },
          { name: "Ippon kumite (one-step) both sides", baseSets: 4, reps: "10 each" },
          { name: "Kizami → gyaku entry", baseSets: 4, reps: "12 each" },
          { name: "Counter timing (de-ai) drill", baseSets: 3, reps: "12 each" },
          { name: "Shadow sparring rounds", baseSets: 3, reps: "2 min" },
        ] },
        { week: 2, items: [
          { name: "Jiyu-ippon (semi-free) drill", baseSets: 4, reps: "10 each" },
          { name: "Combination attacks on the move", baseSets: 4, reps: "10 each" },
          { name: "Slip + counter", baseSets: 3, reps: "12 each" },
          { name: "Kick-entry to combination", baseSets: 3, reps: "10 each" },
          { name: "Shadow sparring rounds", baseSets: 3, reps: "2.5 min" },
        ] },
        { week: 3, items: [
          { name: "Free kumite rounds (controlled)", baseSets: 4, reps: "2 min" },
          { name: "Pressure drill (continuous attack)", baseSets: 3, reps: "90 sec" },
          { name: "Counter-for-counter exchange", baseSets: 3, reps: "12 each" },
          { name: "Broken-rhythm attacks", baseSets: 3, reps: "10 each" },
          { name: "Conditioning sparring rounds", baseSets: 3, reps: "2 min" },
        ] },
        { week: 4, items: [
          { name: "Free kumite (tournament pace)", baseSets: 5, reps: "2 min" },
          { name: "Scramble / reset drill", baseSets: 3, reps: "90 sec" },
          { name: "Finish-the-point combinations", baseSets: 4, reps: "8 each" },
          { name: "Defensive survival round", baseSets: 3, reps: "90 sec" },
          { name: "Cool-down shadow rounds", baseSets: 2, reps: "2 min" },
        ] },
      ],
    },
    cooldowns: {
      KIHON: "Forearm/wrist · Shoulder & chest opener · Thoracic rotation · Kokyu breathing",
      KATA: "Standing fold · Deep lunge · Seated twist · Sanchin-style breath down-regulation",
      KICKS: "Quad · Hip-flexor · Hamstring · Pigeon · Seated/standing splits hold",
      KUMITE: "Walk 3 min · Shoulder/neck release · Hip & hamstring stretch · Box breathing",
    },
  },
};

/* ------------------------------------------------------------
   FITNESS_LEVELS — the *intensity* axis.
   Adjusts sets, rest, and an optional finisher; authored reps
   are left intact. Applied at render time in getDayData().
   ------------------------------------------------------------ */
const FITNESS_LEVELS = {
  beginner: {
    label: "Easier",
    note: "Build the habit — quality over quantity.",
    setsDelta: 0,
    rest: "Rest 75–90 sec between sets",
    finisher: null,
  },
  intermediate: {
    label: "Standard",
    note: "The recommended dose for steady progress.",
    setsDelta: 1,
    rest: "Rest 60 sec between sets",
    finisher: { name: "Finisher: burpees + shadow karate", baseSets: 1, reps: "2 rounds" },
  },
  advanced: {
    label: "Hard",
    note: "High volume — only with solid recovery.",
    setsDelta: 2,
    rest: "Rest 30–45 sec between sets",
    finisher: { name: "Finisher: burpees + shadow karate", baseSets: 1, reps: "4 rounds" },
  },
};

/* ------------------------------------------------------------
   DURATIONS — the *session length* axis.
   Controls how much of the day's list you do (breadth), kept
   distinct from FITNESS (intensity). Applied in getDayData().
   ------------------------------------------------------------ */
const DURATIONS = {
  short: {
    label: "30 min",
    note: "Tight session — the core drills only.",
    maxExercises: 4,
    extra: null,
  },
  standard: {
    label: "30–45 min",
    note: "The full session as written.",
    maxExercises: null,
    extra: null,
  },
  long: {
    label: "60 min",
    note: "Extended session with an extra circuit.",
    maxExercises: null,
    extra: { name: "Extra circuit: repeat any 2 drills", baseSets: 1, reps: "2 rounds" },
  },
};

const SKILL_ORDER = ["beginner", "intermediate", "advanced"];
const FITNESS_ORDER = ["beginner", "intermediate", "advanced"];
const DURATION_ORDER = ["short", "standard", "long"];

const TIPS = [
  "Form first. A clean technique beats a fast sloppy one — kihon is forever.",
  "Breathe out on impact (kiai). Tension at the moment of focus, relaxed before and after.",
  "Hikite matters — pull the opposite hand back hard to power the strike.",
  "Hydrate before, during, and after — at least 500ml per session.",
  "Sink into your stance. Low, stable hips are the root of every technique.",
  "Sleep 7–9 hours. Skill consolidates while you rest, not just while you train.",
  "Consistency beats perfection. A short clean session beats no session.",
];

/* getDayData — resolve a 0-based day index for a given plan
   (skill track + fitness modifier) to its week/type/workout.
   Defaults keep it usable without arguments. */
function getDayData(dayIndex, skill, fitness, duration) {
  const track = SKILL_TRACKS[skill] || SKILL_TRACKS.beginner;
  const mod = FITNESS_LEVELS[fitness] || FITNESS_LEVELS.beginner;
  const dur = DURATIONS[duration] || DURATIONS.standard;
  const weekIndex = Math.floor(dayIndex / 7);
  const type = track.rotation[dayIndex % track.rotation.length];
  const content = track.workouts[type][weekIndex];

  // Breadth (duration) first: trim the core list before adding extras.
  let items = content.items;
  if (dur.maxExercises) items = items.slice(0, dur.maxExercises);

  const exercises = items.map((it) => ({
    name: it.name,
    sets: String(Math.max(1, it.baseSets + mod.setsDelta)),
    reps: it.reps,
  }));
  if (mod.finisher) {
    exercises.push({
      name: mod.finisher.name,
      sets: String(Math.max(1, mod.finisher.baseSets)),
      reps: mod.finisher.reps,
    });
  }
  if (dur.extra) {
    exercises.push({
      name: dur.extra.name,
      sets: String(Math.max(1, dur.extra.baseSets)),
      reps: dur.extra.reps,
    });
  }

  return {
    day: dayIndex + 1,
    week: weekIndex + 1,
    weekData: track.weekThemes[weekIndex],
    type,
    dayType: track.dayTypes[type],
    exercises,
    cooldown: track.cooldowns[type],
    rest: mod.rest,
    trackName: track.name,
    fitnessLabel: mod.label,
    durationLabel: dur.label,
  };
}

/* projectFinish — estimate the finish date from current pace.
   Returns { pending } | { done } | { date: Date }. */
function projectFinish(startDateISO, completedCount) {
  if (completedCount >= TOTAL_DAYS) return { done: true };
  if (completedCount === 0) return { pending: true };
  const elapsed = Math.max(1, Math.round((Date.now() - new Date(startDateISO)) / 86400000));
  const pace = completedCount / elapsed; // days completed per calendar day
  const finish = new Date(Date.now() + Math.ceil((TOTAL_DAYS - completedCount) / pace) * 86400000);
  return { date: finish };
}

/* ============================================================
   Store — in-memory state mirrored to localStorage, with a
   separate progress bucket per plan (skill × fitness). The
   single place that touches persistence; swap the body for a
   .NET API later without changing app.js.
   ============================================================ */
const Store = (function () {
  const STORAGE_KEY = "martial-arts-workout/v1";
  let S = { skill: "beginner", fitness: "beginner", duration: "standard", plans: {} };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved === "object") S = Object.assign(S, saved);
  } catch (e) { /* fresh start */ }
  if (!S.plans || typeof S.plans !== "object") S.plans = {};
  if (!SKILL_ORDER.includes(S.skill)) S.skill = "beginner";
  if (!FITNESS_ORDER.includes(S.fitness)) S.fitness = "beginner";
  if (!DURATION_ORDER.includes(S.duration)) S.duration = "standard";

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); } catch (e) { /* ignore quota */ }
  }

  function key() { return S.skill + "/" + S.fitness; }

  // Ensure the active plan bucket exists, stamping its start date on first touch.
  function bucket() {
    const k = key();
    if (!S.plans[k]) {
      S.plans[k] = { completedDays: [], startDate: new Date().toISOString() };
      persist();
    }
    return S.plans[k];
  }

  bucket(); // initialise the default plan

  return {
    get skill() { return S.skill; },
    get fitness() { return S.fitness; },
    get duration() { return S.duration; },
    setSkill(s) { if (SKILL_ORDER.includes(s)) { S.skill = s; bucket(); persist(); } },
    setFitness(f) { if (FITNESS_ORDER.includes(f)) { S.fitness = f; bucket(); persist(); } },
    // Duration is a session preference, not part of the progress key.
    setDuration(d) { if (DURATION_ORDER.includes(d)) { S.duration = d; persist(); } },

    get completedDays() { return new Set(bucket().completedDays); },
    get completedCount() { return bucket().completedDays.length; },
    get startDate() { return bucket().startDate; },
    isDone(day) { return bucket().completedDays.indexOf(day) !== -1; },
    toggle(day) {
      const b = bucket();
      const i = b.completedDays.indexOf(day);
      if (i === -1) b.completedDays.push(day); else b.completedDays.splice(i, 1);
      persist();
      return i === -1;
    },
    reset() {
      S.plans[key()] = { completedDays: [], startDate: new Date().toISOString() };
      persist();
    },
  };
})();

window.Store = Store;

/* ============================================================
   Data + Store for the 28-Day Military Conditioning PWA.
   Plain globals (no modules/build). Loaded before app.js.
   ============================================================ */
"use strict";

const WEEKS = [
  { label: "Week 1", theme: "Foundation", color: "#7B1113", light: "#F3E3E3" },
  { label: "Week 2", theme: "Build", color: "#9B2D20", light: "#F5E6E3" },
  { label: "Week 3", theme: "Intensity", color: "#7A3B2E", light: "#F5EAE7" },
  { label: "Week 4", theme: "Peak", color: "#6E6E9E", light: "#E8E8F0" },
];

const ROTATION = ["PUSH", "PULL", "LEGS", "CONDITIONING"];

const DAY_COLORS = {
  PUSH: { bg: "#FFF3E0", border: "#E65100", label: "#E65100" },
  PULL: { bg: "#E3F2FD", border: "#1565C0", label: "#1565C0" },
  LEGS: { bg: "#F3E5F5", border: "#6A1B9A", label: "#6A1B9A" },
  CONDITIONING: { bg: "#E8F5E9", border: "#2E7D32", label: "#2E7D32" },
};

// Workouts scale in volume each week
const WORKOUTS = {
  PUSH: [
    {
      week: 1,
      exercises: [
        { name: "Push-ups", sets: "3", reps: "12–15" },
        { name: "Pike Push-ups", sets: "3", reps: "8–10" },
        { name: "Tricep Dips (chair/bar)", sets: "3", reps: "10" },
        { name: "Dumbbell Shoulder Press", sets: "3", reps: "10" },
        { name: "Plank", sets: "3", reps: "30 sec" },
      ],
    },
    {
      week: 2,
      exercises: [
        { name: "Push-ups", sets: "4", reps: "15–18" },
        { name: "Pike Push-ups", sets: "3", reps: "10–12" },
        { name: "Tricep Dips", sets: "3", reps: "12" },
        { name: "Dumbbell Shoulder Press", sets: "3", reps: "12" },
        { name: "Diamond Push-ups", sets: "3", reps: "8" },
        { name: "Plank", sets: "3", reps: "40 sec" },
      ],
    },
    {
      week: 3,
      exercises: [
        { name: "Push-ups", sets: "4", reps: "18–20" },
        { name: "Decline Push-ups", sets: "3", reps: "12" },
        { name: "Tricep Dips", sets: "4", reps: "12" },
        { name: "Dumbbell Shoulder Press", sets: "4", reps: "12" },
        { name: "Diamond Push-ups", sets: "3", reps: "10" },
        { name: "Plank", sets: "3", reps: "50 sec" },
      ],
    },
    {
      week: 4,
      exercises: [
        { name: "Push-ups to Failure", sets: "3", reps: "Max" },
        { name: "Decline Push-ups", sets: "4", reps: "15" },
        { name: "Tricep Dips", sets: "4", reps: "15" },
        { name: "Dumbbell Shoulder Press", sets: "4", reps: "15" },
        { name: "Diamond Push-ups", sets: "3", reps: "12" },
        { name: "Plank", sets: "3", reps: "60 sec" },
      ],
    },
  ],
  PULL: [
    {
      week: 1,
      exercises: [
        { name: "Pull-ups (or band-assisted)", sets: "3", reps: "5–8" },
        { name: "Dumbbell Bent-Over Row", sets: "3", reps: "10 each" },
        { name: "Inverted Row (under table/bar)", sets: "3", reps: "10" },
        { name: "Dumbbell Bicep Curl", sets: "3", reps: "10" },
        { name: "Dead Hang", sets: "3", reps: "20 sec" },
      ],
    },
    {
      week: 2,
      exercises: [
        { name: "Pull-ups", sets: "4", reps: "6–10" },
        { name: "Dumbbell Bent-Over Row", sets: "3", reps: "12 each" },
        { name: "Inverted Row", sets: "3", reps: "12" },
        { name: "Dumbbell Bicep Curl", sets: "3", reps: "12" },
        { name: "Face Pulls (band)", sets: "3", reps: "15" },
        { name: "Dead Hang", sets: "3", reps: "25 sec" },
      ],
    },
    {
      week: 3,
      exercises: [
        { name: "Pull-ups", sets: "4", reps: "8–12" },
        { name: "Dumbbell Bent-Over Row", sets: "4", reps: "12 each" },
        { name: "Inverted Row", sets: "4", reps: "12" },
        { name: "Hammer Curl", sets: "3", reps: "12 each" },
        { name: "Face Pulls (band)", sets: "3", reps: "15" },
        { name: "Dead Hang", sets: "3", reps: "30 sec" },
      ],
    },
    {
      week: 4,
      exercises: [
        { name: "Pull-ups to Failure", sets: "3", reps: "Max" },
        { name: "Dumbbell Bent-Over Row", sets: "4", reps: "15 each" },
        { name: "Inverted Row", sets: "4", reps: "15" },
        { name: "Hammer Curl", sets: "3", reps: "15 each" },
        { name: "Face Pulls (band)", sets: "4", reps: "15" },
        { name: "Dead Hang", sets: "3", reps: "40 sec" },
      ],
    },
  ],
  LEGS: [
    {
      week: 1,
      exercises: [
        { name: "Air Squats", sets: "3", reps: "20" },
        { name: "Forward Lunges", sets: "3", reps: "10 each" },
        { name: "Glute Bridges", sets: "3", reps: "15" },
        { name: "Calf Raises", sets: "3", reps: "20" },
        { name: "Flutter Kicks", sets: "3", reps: "20 sec" },
      ],
    },
    {
      week: 2,
      exercises: [
        { name: "Air Squats", sets: "4", reps: "25" },
        { name: "Reverse Lunges", sets: "3", reps: "12 each" },
        { name: "Glute Bridges", sets: "3", reps: "20" },
        { name: "Jump Squats", sets: "3", reps: "10" },
        { name: "Calf Raises", sets: "3", reps: "25" },
        { name: "Flutter Kicks", sets: "3", reps: "30 sec" },
      ],
    },
    {
      week: 3,
      exercises: [
        { name: "Goblet Squat (dumbbell)", sets: "4", reps: "15" },
        { name: "Walking Lunges", sets: "3", reps: "12 each" },
        { name: "Single-Leg Glute Bridge", sets: "3", reps: "12 each" },
        { name: "Jump Squats", sets: "3", reps: "15" },
        { name: "Calf Raises", sets: "4", reps: "25" },
        { name: "Flutter Kicks", sets: "3", reps: "40 sec" },
      ],
    },
    {
      week: 4,
      exercises: [
        { name: "Goblet Squat (dumbbell)", sets: "4", reps: "20" },
        { name: "Walking Lunges", sets: "4", reps: "15 each" },
        { name: "Single-Leg Glute Bridge", sets: "4", reps: "15 each" },
        { name: "Jump Squats", sets: "4", reps: "15" },
        { name: "Sumo Squat (dumbbell)", sets: "3", reps: "15" },
        { name: "Flutter Kicks", sets: "3", reps: "50 sec" },
      ],
    },
  ],
  CONDITIONING: [
    {
      week: 1,
      exercises: [
        { name: "Burpees", sets: "3", reps: "8" },
        { name: "Mountain Climbers", sets: "3", reps: "20 sec" },
        { name: "High Knees", sets: "3", reps: "20 sec" },
        { name: "Sit-ups", sets: "3", reps: "15" },
        { name: "Run or Brisk Walk", sets: "1", reps: "15 min" },
      ],
    },
    {
      week: 2,
      exercises: [
        { name: "Burpees", sets: "4", reps: "10" },
        { name: "Mountain Climbers", sets: "3", reps: "30 sec" },
        { name: "High Knees", sets: "3", reps: "30 sec" },
        { name: "Sit-ups", sets: "3", reps: "20" },
        { name: "Jumping Jacks", sets: "3", reps: "30" },
        { name: "Run", sets: "1", reps: "20 min" },
      ],
    },
    {
      week: 3,
      exercises: [
        { name: "Burpees", sets: "4", reps: "12" },
        { name: "Mountain Climbers", sets: "4", reps: "30 sec" },
        { name: "HIIT Sprints (30s on / 30s off)", sets: "6", reps: "rounds" },
        { name: "Sit-ups", sets: "4", reps: "20" },
        { name: "Bear Crawl", sets: "3", reps: "20 m" },
        { name: "Run", sets: "1", reps: "20 min" },
      ],
    },
    {
      week: 4,
      exercises: [
        { name: "Burpees to Failure", sets: "3", reps: "Max" },
        { name: "Mountain Climbers", sets: "4", reps: "40 sec" },
        { name: "HIIT Sprints (30s on / 20s off)", sets: "8", reps: "rounds" },
        { name: "Sit-ups", sets: "4", reps: "25" },
        { name: "Bear Crawl", sets: "4", reps: "20 m" },
        { name: "Run", sets: "1", reps: "25 min" },
      ],
    },
  ],
};

const TIPS = [
  "Rest 60–90 sec between sets. Keep it tight.",
  "Hydrate before, during, and after — at least 500ml per session.",
  "Warm up 5 min: arm circles, leg swings, hip rotations.",
  "Cool down 5 min: stretch major muscle groups worked today.",
  "Sleep 7–9 hours. That's when adaptation happens.",
  "If a session feels too easy, add a set. If too hard, drop reps.",
  "Consistency beats perfection. A bad workout beats no workout.",
];

const COOLDOWNS = {
  PUSH: "Chest doorframe stretch · Tricep overhead stretch · Child's pose",
  PULL: "Lat stretch (arm overhead) · Bicep wall stretch · Neck rolls",
  LEGS: "Quad stretch · Hip flexor lunge · Hamstring floor stretch · Calf stretch",
  CONDITIONING: "Walk 2–3 min · Deep breathing · Full-body stretch circuit",
};

const TOTAL_DAYS = 28;

/* getDayData — resolve a 0-based day index to its week/type/workout. */
function getDayData(dayIndex) {
  const weekIndex = Math.floor(dayIndex / 7);
  const rotation = ROTATION[dayIndex % 4];
  return {
    day: dayIndex + 1,
    week: weekIndex + 1,
    weekData: WEEKS[weekIndex],
    type: rotation,
    workout: WORKOUTS[rotation][weekIndex],
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
   Store — in-memory state mirrored to localStorage.
   The single place that touches persistence; swap the body
   for a .NET API later without changing app.js.
   ============================================================ */
const Store = (function () {
  const STORAGE_KEY = "military-workout/v1";
  let S = { completedDays: [], startDate: null };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved === "object") S = Object.assign(S, saved);
  } catch (e) { /* fresh start */ }

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); } catch (e) { /* ignore quota */ }
  }

  // Stamp the program start on first ever launch.
  if (!S.startDate) { S.startDate = new Date().toISOString(); persist(); }

  return {
    get completedDays() { return new Set(S.completedDays); },
    get completedCount() { return S.completedDays.length; },
    get startDate() { return S.startDate; },
    isDone(day) { return S.completedDays.indexOf(day) !== -1; },
    toggle(day) {
      const i = S.completedDays.indexOf(day);
      if (i === -1) S.completedDays.push(day); else S.completedDays.splice(i, 1);
      persist();
      return i === -1;
    },
    reset() {
      S = { completedDays: [], startDate: new Date().toISOString() };
      persist();
    },
  };
})();

window.Store = Store;

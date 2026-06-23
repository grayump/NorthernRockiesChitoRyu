/* Data layer for Reps — single localStorage document, no dependencies.
   Exposed as a global `Store` so app.js (and node tests) can use it. */
(function (global) {
  'use strict';

  const KEY = 'reps.v1';

  // ---- date helpers (local calendar days) ----

  function dayKey(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function localIso(d) {
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${dayKey(d)}T${h}:${min}:${s}`;
  }

  // ---- persistence ----

  function seed() {
    return {
      version: 1,
      exercises: [
        { id: 'pushups', name: 'Pushups', defaultReps: 25, dailyGoal: 25, archived: false },
        { id: 'squats', name: 'Squats', defaultReps: 25, dailyGoal: 25, archived: false },
      ],
      entries: [],
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d && Array.isArray(d.exercises) && Array.isArray(d.entries)) return d;
      }
    } catch (e) {
      console.error('Reps: failed to load saved data', e);
    }
    const d = seed();
    save(d);
    return d;
  }

  function save(d) {
    localStorage.setItem(KEY, JSON.stringify(d));
  }

  let data = load();

  function uid() {
    return (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : Date.now() + '-' + Math.random().toString(36).slice(2);
  }

  function slugify(name) {
    let base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'exercise';
    let id = base, n = 2;
    while (data.exercises.some((e) => e.id === id)) id = `${base}-${n++}`;
    return id;
  }

  // ---- exercises ----

  function exercises(includeArchived) {
    return includeArchived ? data.exercises.slice() : data.exercises.filter((e) => !e.archived);
  }

  function getExercise(id) {
    return data.exercises.find((e) => e.id === id) || null;
  }

  function addExercise(name, defaultReps, dailyGoal) {
    const ex = {
      id: slugify(name),
      name: name.trim(),
      defaultReps: Math.max(1, Math.round(defaultReps) || 1),
      dailyGoal: Math.max(0, Math.round(dailyGoal) || 0),
      archived: false,
    };
    data.exercises.push(ex);
    save(data);
    return ex;
  }

  function updateExercise(id, patch) {
    const ex = getExercise(id);
    if (!ex) return null;
    if (patch.name !== undefined) ex.name = String(patch.name).trim() || ex.name;
    if (patch.defaultReps !== undefined) ex.defaultReps = Math.max(1, Math.round(patch.defaultReps) || ex.defaultReps);
    if (patch.dailyGoal !== undefined) ex.dailyGoal = Math.max(0, Math.round(patch.dailyGoal) || 0);
    if (patch.archived !== undefined) ex.archived = !!patch.archived;
    save(data);
    return ex;
  }

  // ---- entries ----

  function addEntry(exerciseId, reps, when) {
    const entry = {
      id: uid(),
      exerciseId,
      reps: Math.max(1, Math.round(reps)),
      ts: localIso(when || new Date()),
    };
    data.entries.push(entry);
    save(data);
    return entry;
  }

  function deleteEntry(id) {
    const i = data.entries.findIndex((e) => e.id === id);
    if (i === -1) return false;
    data.entries.splice(i, 1);
    save(data);
    return true;
  }

  /* Remove the most recent entry for this exercise logged today. */
  function undoLast(exerciseId) {
    const today = dayKey(new Date());
    let last = null;
    for (const e of data.entries) {
      if (e.exerciseId === exerciseId && e.ts.slice(0, 10) === today && (!last || e.ts >= last.ts)) last = e;
    }
    return last ? deleteEntry(last.id) : false;
  }

  function entriesForDay(day) {
    return data.entries
      .filter((e) => e.ts.slice(0, 10) === day)
      .sort((a, b) => a.ts.localeCompare(b.ts));
  }

  /* { exerciseId: total } for one day. */
  function totalsForDay(day) {
    const totals = {};
    for (const e of data.entries) {
      if (e.ts.slice(0, 10) === day) totals[e.exerciseId] = (totals[e.exerciseId] || 0) + e.reps;
    }
    return totals;
  }

  /* Unique day keys with at least one entry, newest first. */
  function days() {
    const set = new Set(data.entries.map((e) => e.ts.slice(0, 10)));
    return Array.from(set).sort().reverse();
  }

  /* Consecutive days meeting the goal, ending today (or yesterday if today
     isn't met yet — today being incomplete shouldn't break the streak). */
  function streak(exerciseId) {
    const ex = getExercise(exerciseId);
    if (!ex || ex.dailyGoal <= 0) return 0;
    const totals = {};
    for (const e of data.entries) {
      if (e.exerciseId === exerciseId) {
        const d = e.ts.slice(0, 10);
        totals[d] = (totals[d] || 0) + e.reps;
      }
    }
    const cursor = new Date();
    if ((totals[dayKey(cursor)] || 0) < ex.dailyGoal) cursor.setDate(cursor.getDate() - 1);
    let n = 0;
    while ((totals[dayKey(cursor)] || 0) >= ex.dailyGoal) {
      n++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return n;
  }

  /* Last `n` days of totals for one exercise, oldest first: [{ day, total }]. */
  function recentTotals(exerciseId, n) {
    const out = [];
    const cursor = new Date();
    cursor.setDate(cursor.getDate() - (n - 1));
    for (let i = 0; i < n; i++) {
      const day = dayKey(cursor);
      let total = 0;
      for (const e of data.entries) {
        if (e.exerciseId === exerciseId && e.ts.slice(0, 10) === day) total += e.reps;
      }
      out.push({ day, total });
      cursor.setDate(cursor.getDate() + 1);
    }
    return out;
  }

  // ---- export / import ----

  function exportJson() {
    return JSON.stringify(data, null, 2);
  }

  function validateDoc(d) {
    return d && d.version === 1 && Array.isArray(d.exercises) && Array.isArray(d.entries)
      && d.exercises.every((e) => e.id && e.name && typeof e.defaultReps === 'number')
      && d.entries.every((e) => e.id && e.exerciseId && typeof e.reps === 'number' && typeof e.ts === 'string');
  }

  /* mode: 'replace' overwrites everything; 'merge' adds unknown exercises and
     entries by id, keeping existing records untouched. Throws on bad input. */
  function importJson(text, mode) {
    const incoming = JSON.parse(text);
    if (!validateDoc(incoming)) throw new Error('Not a valid Reps backup file.');
    if (mode === 'replace') {
      data = incoming;
    } else {
      const exIds = new Set(data.exercises.map((e) => e.id));
      for (const ex of incoming.exercises) if (!exIds.has(ex.id)) data.exercises.push(ex);
      const entryIds = new Set(data.entries.map((e) => e.id));
      for (const en of incoming.entries) if (!entryIds.has(en.id)) data.entries.push(en);
    }
    save(data);
  }

  global.Store = {
    dayKey, exercises, getExercise, addExercise, updateExercise,
    addEntry, deleteEntry, undoLast,
    entriesForDay, totalsForDay, days, streak, recentTotals,
    exportJson, importJson,
  };
})(typeof window !== 'undefined' ? window : globalThis);

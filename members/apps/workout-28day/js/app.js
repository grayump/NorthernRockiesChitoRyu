/* ============================================================
   App — renders the plan selector, calendar, and day views into
   #app, driven by a minimal hash router so the back button works
   in the PWA. Reads/writes progress through Store (js/data.js).
   ============================================================ */
"use strict";

const app = document.getElementById("app");

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

function fmtDate(d) {
  return d.toLocaleDateString(undefined, {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
  });
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- Projection line ---------- */
function projectionHtml() {
  const p = projectFinish(Store.startDate, Store.completedCount);
  if (p.done) {
    return `<div class="projection done">PROGRAM COMPLETE 🥋</div>`;
  }
  if (p.pending) {
    return `<div class="projection">Complete your first day to see your projection.</div>`;
  }
  return `<div class="projection">
    <span class="proj-label">ON TRACK TO FINISH:</span>
    <span class="proj-date">${esc(fmtDate(p.date))}</span>
  </div>`;
}

/* ---------- Plan selector (skill × fitness × duration) ---------- */
// items: [{ id, label }]
function segRow(label, items, current, action) {
  const btns = items.map(({ id, label: l }) => {
    const isOn = id === current;
    return `<button class="seg-btn${isOn ? " active" : ""}" data-${action}="${id}">${esc(l)}</button>`;
  }).join("");
  return `
    <div class="seg-block">
      <div class="seg-label">${esc(label)}</div>
      <div class="seg">${btns}</div>
    </div>`;
}

function selectorHtml() {
  const track = SKILL_TRACKS[Store.skill];
  const fit = FITNESS_LEVELS[Store.fitness];
  const dur = DURATIONS[Store.duration];

  const skillItems = SKILL_ORDER.map((id) => ({ id, label: cap(id) }));
  const fitnessItems = FITNESS_ORDER.map((id) => ({ id, label: cap(id) }));
  const durationItems = DURATION_ORDER.map((id) => ({ id, label: DURATIONS[id].label }));

  return `
    <div class="plan-selector">
      ${segRow("SKILL", skillItems, Store.skill, "skill")}
      ${segRow("FITNESS", fitnessItems, Store.fitness, "fitness")}
      ${segRow("DURATION", durationItems, Store.duration, "duration")}
    </div>
    <div class="plan-summary">
      <span class="plan-name">${esc(track.name)}</span>
      <span class="plan-sep">·</span>
      <span class="plan-fit">${esc(fit.label)}</span>
      <span class="plan-sep">·</span>
      <span class="plan-dur">${esc(dur.label)}</span>
      <div class="plan-blurb">${esc(track.blurb)} ${esc(fit.note)} ${esc(dur.note)}</div>
    </div>`;
}

/* ---------- Calendar view ---------- */
function renderCalendar() {
  const track = SKILL_TRACKS[Store.skill];
  const done = Store.completedDays;
  const pct = (done.size / TOTAL_DAYS) * 100;

  const kicker = `28-Day Program · ${cap(Store.skill)} Skill · ${FITNESS_LEVELS[Store.fitness].label} Pace · ${DURATIONS[Store.duration].label}`;

  const themeChips = track.weekThemes.map((w) =>
    `<span style="color:${w.color}">${esc(w.label)}: ${esc(w.theme)}</span>`).join("");

  const legend = Object.entries(track.dayTypes).map(([type, c]) => `
    <div class="legend-item">
      <span class="legend-dot" style="--c:${c.color}"></span>
      <span>${esc(c.label)}</span>
    </div>`).join("");

  const weeks = track.weekThemes.map((week, wi) => {
    const days = Array.from({ length: 7 }).map((_, di) => {
      const dayIndex = wi * 7 + di;
      const d = getDayData(dayIndex, Store.skill, Store.fitness, Store.duration);
      const isDone = done.has(dayIndex);
      return `
        <a class="day-btn${isDone ? " done" : ""}" href="#/day/${dayIndex}" style="--c:${d.dayType.color}">
          <span class="day-num">D${d.day}</span>
          <span class="day-type">${esc(d.dayType.short)}</span>
          ${isDone ? `<span class="day-check">✓</span>` : ""}
        </a>`;
    }).join("");
    return `
      <div class="week-block">
        <div class="week-head">
          <span class="week-label" style="color:${week.color}">${esc(week.label.toUpperCase())}</span>
          <span class="week-theme-sm">${esc(week.theme.toUpperCase())}</span>
        </div>
        <div class="day-grid">${days}</div>
      </div>`;
  }).join("");

  app.innerHTML = `
    <div class="kicker">${esc(kicker)}</div>
    <div class="week-themes">${themeChips}</div>

    ${selectorHtml()}

    <div class="progress-section">
      <div class="progress-head">
        <span>PROGRESS</span>
        <span>${done.size} / ${TOTAL_DAYS} days</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>

    ${projectionHtml()}

    <div class="legend">${legend}</div>

    ${weeks}

    <div class="field-note">
      <div class="field-note-label">FIELD NOTE</div>
      <div class="field-note-text">${esc(TIPS[done.size % TIPS.length])}</div>
    </div>

    <div class="reset-row">
      <button class="reset-link" id="resetBtn">Reset this plan's progress</button>
    </div>`;

  // Selector wiring — switch plan then re-render.
  app.querySelectorAll("[data-skill]").forEach((b) => {
    b.onclick = () => { Store.setSkill(b.dataset.skill); renderCalendar(); };
  });
  app.querySelectorAll("[data-fitness]").forEach((b) => {
    b.onclick = () => { Store.setFitness(b.dataset.fitness); renderCalendar(); };
  });
  app.querySelectorAll("[data-duration]").forEach((b) => {
    b.onclick = () => { Store.setDuration(b.dataset.duration); renderCalendar(); };
  });

  document.getElementById("resetBtn").onclick = () => {
    if (confirm("Reset progress and start date for this plan only?")) {
      Store.reset();
      renderCalendar();
    }
  };

  window.scrollTo(0, 0);
}

/* ---------- Day view ---------- */
function renderDay(dayIndex) {
  const d = getDayData(dayIndex, Store.skill, Store.fitness, Store.duration);
  const c = d.dayType;
  const isDone = Store.isDone(dayIndex);

  const exercises = d.exercises.map((ex, i) => `
    <div class="exercise-row${i === 0 ? " first" : ""}" style="--c:${c.color};--c-soft:${c.color}44">
      <div class="exercise-left">
        <span class="exercise-num">${String(i + 1).padStart(2, "0")}</span>
        <span class="exercise-name">${esc(ex.name)}</span>
      </div>
      <div class="exercise-meta">
        <span class="exercise-sets">${esc(ex.sets)} sets</span>
        <span class="exercise-reps">× ${esc(ex.reps)}</span>
      </div>
    </div>`).join("");

  app.innerHTML = `
    <a class="back-btn" href="#/">← Back to Calendar</a>

    <div class="day-header">
      <div class="day-eyebrow">
        DAY ${d.day} · ${esc(d.weekData.label.toUpperCase())} — ${esc(d.weekData.theme.toUpperCase())}
      </div>
      <h2 class="day-title" style="--c:${c.color}">${esc(c.label)} DAY</h2>
      <div class="day-meta">${esc(d.durationLabel)} · ${esc(d.trackName)} (${esc(d.fitnessLabel)}) · ${esc(d.rest)}</div>
    </div>

    <div class="panel">
      <div class="panel-label">WARM-UP · 5 MIN</div>
      <div class="panel-text">Joint rotations (neck → ankles) · Light shadow technique · Dynamic leg swings · Hip openers</div>
    </div>

    <div class="section-label">TRAINING</div>
    <div class="exercise-list">${exercises}</div>

    <div class="panel">
      <div class="panel-label cool">COOL-DOWN · 5 MIN</div>
      <div class="panel-text">${esc(d.cooldown)}</div>
    </div>

    <button class="complete-btn${isDone ? " done" : ""}" id="completeBtn">
      ${isDone ? "MARK INCOMPLETE" : "✓ MARK DAY COMPLETE"}
    </button>`;

  document.getElementById("completeBtn").onclick = () => {
    Store.toggle(dayIndex);
    location.hash = "#/";
  };

  window.scrollTo(0, 0);
}

/* ---------- Router ---------- */
function route() {
  const m = location.hash.match(/^#\/day\/(\d+)$/);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 0 && n < TOTAL_DAYS) { renderDay(n); return; }
  }
  renderCalendar();
}

window.addEventListener("hashchange", route);
route();

/* ---------- Theme switcher ---------- */
(function setupTheme() {
  const THEME_KEY = "martial-arts-workout/theme";
  const META_COLORS = { dark: "#0D0D0D", light: "#F4F4EF" };
  const btns = document.querySelectorAll(".theme-btn");
  const meta = document.querySelector('meta[name="theme-color"]');

  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    if (meta) meta.setAttribute("content", META_COLORS[theme] || META_COLORS.dark);
    btns.forEach((b) => b.classList.toggle("active", b.dataset.setTheme === theme));
  }

  btns.forEach((b) => { b.onclick = () => apply(b.dataset.setTheme); });
  apply(document.documentElement.getAttribute("data-theme") || "dark");
})();

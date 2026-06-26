/* ============================================================
   App — renders the calendar and day views into #app, driven
   by a minimal hash router so the back button works in the PWA.
   Reads/writes progress through Store (js/data.js).
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

/* ---------- Projection line ---------- */
function projectionHtml() {
  const p = projectFinish(Store.startDate, Store.completedCount);
  if (p.done) {
    return `<div class="projection done">PROGRAM COMPLETE 🎖</div>`;
  }
  if (p.pending) {
    return `<div class="projection">Complete your first day to see your projection.</div>`;
  }
  return `<div class="projection">
    <span class="proj-label">ON TRACK TO FINISH:</span>
    <span class="proj-date">${esc(fmtDate(p.date))}</span>
  </div>`;
}

/* ---------- Calendar view ---------- */
function renderCalendar() {
  const done = Store.completedDays;
  const pct = (done.size / TOTAL_DAYS) * 100;

  const legend = Object.entries(DAY_COLORS).map(([type, c]) => `
    <div class="legend-item">
      <span class="legend-dot" style="--c:${c.border}"></span>
      <span>${type}</span>
    </div>`).join("");

  const weeks = WEEKS.map((week, wi) => {
    const days = Array.from({ length: 7 }).map((_, di) => {
      const dayIndex = wi * 7 + di;
      const { type, day } = getDayData(dayIndex);
      const c = DAY_COLORS[type];
      const isDone = done.has(dayIndex);
      return `
        <a class="day-btn${isDone ? " done" : ""}" href="#/day/${dayIndex}" style="--c:${c.border}">
          <span class="day-num">D${day}</span>
          <span class="day-type">${type === "CONDITIONING" ? "COND" : type}</span>
          ${isDone ? `<span class="day-check">✓</span>` : ""}
        </a>`;
    }).join("");
    return `
      <div class="week-block">
        <div class="week-head">
          <span class="week-label" style="color:${week.color}">${week.label.toUpperCase()}</span>
          <span class="week-theme-sm">${week.theme.toUpperCase()}</span>
        </div>
        <div class="day-grid">${days}</div>
      </div>`;
  }).join("");

  app.innerHTML = `
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
      <button class="reset-link" id="resetBtn">Reset progress</button>
    </div>`;

  document.getElementById("resetBtn").onclick = () => {
    if (confirm("Reset all progress and start date?")) {
      Store.reset();
      renderCalendar();
    }
  };

  window.scrollTo(0, 0);
}

/* ---------- Day view ---------- */
function renderDay(dayIndex) {
  const d = getDayData(dayIndex);
  const c = DAY_COLORS[d.type];
  const isDone = Store.isDone(dayIndex);

  const exercises = d.workout.exercises.map((ex, i) => `
    <div class="exercise-row${i === 0 ? " first" : ""}" style="--c:${c.border};--c-soft:${c.border}44">
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
        DAY ${d.day} · ${d.weekData.label.toUpperCase()} — ${d.weekData.theme.toUpperCase()}
      </div>
      <h2 class="day-title" style="--c:${c.border}">${d.type} DAY</h2>
      <div class="day-meta">30–45 min · Intermediate · Rest 60–90 sec between sets</div>
    </div>

    <div class="panel">
      <div class="panel-label">WARM-UP · 5 MIN</div>
      <div class="panel-text">Arm circles · Leg swings · Hip rotations · 2 min light jog in place</div>
    </div>

    <div class="section-label">EXERCISES</div>
    <div class="exercise-list">${exercises}</div>

    <div class="panel">
      <div class="panel-label cool">COOL-DOWN · 5 MIN</div>
      <div class="panel-text">${esc(COOLDOWNS[d.type])}</div>
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
  const THEME_KEY = "military-workout/theme";
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

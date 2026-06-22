/* UI for Reps — renders the four tabs and wires events. No dependencies. */
(function () {
  'use strict';

  const view = document.getElementById('view');
  const title = document.getElementById('view-title');
  const toast = document.getElementById('toast');

  const state = {
    tab: 'today',
    chartExercise: null,   // exercise id shown on the Chart tab
    expandedDay: null,     // day key expanded on the History tab
  };

  const TITLES = { today: 'Today', history: 'History', chart: 'Last 30 Days', settings: 'Settings' };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  let toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.hidden = false;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
      toast.hidden = true;
    }, 1400);
  }

  function fmtDay(day) {
    const d = new Date(day + 'T12:00:00');
    const today = Store.dayKey(new Date());
    const yest = new Date(); yest.setDate(yest.getDate() - 1);
    if (day === today) return 'Today';
    if (day === Store.dayKey(yest)) return 'Yesterday';
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  // ---- Today ----

  function renderToday() {
    const today = Store.dayKey(new Date());
    const totals = Store.totalsForDay(today);
    const cards = Store.exercises().map((ex) => {
      const total = totals[ex.id] || 0;
      const met = ex.dailyGoal > 0 && total >= ex.dailyGoal;
      const streak = Store.streak(ex.id);
      return `
        <section class="card" data-ex="${ex.id}">
          <div class="card-head">
            <span class="ex-name">${esc(ex.name)}</span>
            ${streak > 0 ? `<span class="streak" title="streak">&#128293; ${streak}</span>` : ''}
          </div>
          <div class="progress ${met ? 'met' : ''}">${total} / ${ex.dailyGoal}${met ? ' &#10003;' : ''}</div>
          <button class="big-btn" data-act="log">+${ex.defaultReps} ${esc(ex.name)}</button>
          <div class="row-small">
            <button class="small-btn" data-act="custom">+ custom&#8230;</button>
            <button class="small-btn" data-act="undo">Undo</button>
          </div>
        </section>`;
    });
    view.innerHTML = cards.join('') ||
      '<p class="empty">No exercises yet — add one in Settings.</p>';
  }

  function onTodayClick(e) {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const exId = btn.closest('[data-ex]').dataset.ex;
    const ex = Store.getExercise(exId);
    if (btn.dataset.act === 'log') {
      Store.addEntry(exId, ex.defaultReps);
      showToast(`Logged ${ex.defaultReps} ${ex.name}`);
    } else if (btn.dataset.act === 'custom') {
      const v = parseInt(prompt(`How many ${ex.name}?`, ex.defaultReps), 10);
      if (!v || v < 1) return;
      Store.addEntry(exId, v);
      showToast(`Logged ${v} ${ex.name}`);
    } else if (btn.dataset.act === 'undo') {
      if (Store.undoLast(exId)) showToast('Removed last set');
      else showToast('Nothing to undo today');
    }
    renderToday();
  }

  // ---- History ----

  function renderHistory() {
    const days = Store.days();
    if (!days.length) {
      view.innerHTML = '<p class="empty">No entries yet. Log a set on the Today tab.</p>';
      return;
    }
    const rows = days.map((day) => {
      const totals = Store.totalsForDay(day);
      const parts = Object.entries(totals).map(([exId, total]) => {
        const ex = Store.getExercise(exId);
        const met = ex && ex.dailyGoal > 0 && total >= ex.dailyGoal;
        return `${esc(ex ? ex.name : exId)} ${total}${met ? ' &#10003;' : ''}`;
      }).join(' &middot; ');
      const expanded = state.expandedDay === day;
      let detail = '';
      if (expanded) {
        const sets = Store.entriesForDay(day).map((en) => {
          const ex = Store.getExercise(en.exerciseId);
          return `
            <li class="set-row">
              <span>${en.ts.slice(11, 16)} &mdash; ${en.reps} ${esc(ex ? ex.name : en.exerciseId)}</span>
              <button class="small-btn danger" data-del="${en.id}">Delete</button>
            </li>`;
        }).join('');
        detail = `<ul class="set-list">${sets}</ul>`;
      }
      return `
        <section class="card history-day ${expanded ? 'expanded' : ''}" data-day="${day}">
          <div class="card-head clickable">
            <span class="ex-name">${fmtDay(day)}</span>
            <span class="day-totals">${parts}</span>
          </div>
          ${detail}
        </section>`;
    });
    view.innerHTML = rows.join('');
  }

  function onHistoryClick(e) {
    const del = e.target.closest('button[data-del]');
    if (del) {
      if (confirm('Delete this set?')) {
        Store.deleteEntry(del.dataset.del);
        renderHistory();
      }
      return;
    }
    const head = e.target.closest('.card-head');
    if (head) {
      const day = head.closest('[data-day]').dataset.day;
      state.expandedDay = state.expandedDay === day ? null : day;
      renderHistory();
    }
  }

  // ---- Chart ----

  function renderChart() {
    const list = Store.exercises();
    if (!list.length) {
      view.innerHTML = '<p class="empty">No exercises to chart.</p>';
      return;
    }
    if (!state.chartExercise || !Store.getExercise(state.chartExercise)) {
      state.chartExercise = list[0].id;
    }
    const ex = Store.getExercise(state.chartExercise);
    const data = Store.recentTotals(ex.id, 30);

    const W = 340, H = 220, padL = 30, padB = 22, padT = 12;
    const plotW = W - padL - 6, plotH = H - padT - padB;
    const maxVal = Math.max(ex.dailyGoal, ...data.map((d) => d.total), 1) * 1.1;
    const barW = plotW / data.length;

    const bars = data.map((d, i) => {
      const h = (d.total / maxVal) * plotH;
      const met = ex.dailyGoal > 0 && d.total >= ex.dailyGoal;
      const x = padL + i * barW;
      return `<rect x="${(x + 1).toFixed(1)}" y="${(padT + plotH - h).toFixed(1)}"
        width="${Math.max(barW - 2, 1).toFixed(1)}" height="${h.toFixed(1)}"
        class="${met ? 'bar-met' : 'bar-miss'}" rx="1"><title>${d.day}: ${d.total}</title></rect>`;
    }).join('');

    const labels = data.map((d, i) => {
      if (i % 7 !== 0 && i !== data.length - 1) return '';
      const x = padL + i * barW + barW / 2;
      return `<text x="${x.toFixed(1)}" y="${H - 6}" class="axis-label" text-anchor="middle">${d.day.slice(5)}</text>`;
    }).join('');

    const goalY = padT + plotH - (ex.dailyGoal / maxVal) * plotH;
    const goalLine = ex.dailyGoal > 0
      ? `<line x1="${padL}" y1="${goalY.toFixed(1)}" x2="${W - 6}" y2="${goalY.toFixed(1)}" class="goal-line"/>
         <text x="${padL - 4}" y="${(goalY + 4).toFixed(1)}" class="axis-label" text-anchor="end">${ex.dailyGoal}</text>`
      : '';

    const picker = list.map((e) =>
      `<option value="${e.id}" ${e.id === ex.id ? 'selected' : ''}>${esc(e.name)}</option>`).join('');

    view.innerHTML = `
      <section class="card">
        <select id="chart-ex" class="select">${picker}</select>
        <svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="30-day totals for ${esc(ex.name)}">
          ${goalLine}${bars}${labels}
        </svg>
        <p class="chart-caption">Green bars met the daily goal of ${ex.dailyGoal}.</p>
      </section>`;

    document.getElementById('chart-ex').addEventListener('change', (e) => {
      state.chartExercise = e.target.value;
      renderChart();
    });
  }

  // ---- Settings ----

  function renderSettings() {
    const rows = Store.exercises(true).map((ex) => `
      <li class="ex-row ${ex.archived ? 'archived' : ''}" data-ex="${ex.id}">
        <div class="ex-row-info">
          <span class="ex-name">${esc(ex.name)}</span>
          <span class="ex-meta">+${ex.defaultReps} per tap &middot; goal ${ex.dailyGoal}/day</span>
        </div>
        <div class="ex-row-actions">
          <button class="small-btn" data-act="edit">Edit</button>
          <button class="small-btn" data-act="archive">${ex.archived ? 'Restore' : 'Archive'}</button>
        </div>
      </li>`).join('');

    view.innerHTML = `
      <section class="card">
        <h2>Exercises</h2>
        <ul class="ex-list">${rows}</ul>
        <form id="add-form" class="add-form">
          <input name="name" placeholder="New exercise (e.g. Lunges)" required maxlength="40">
          <div class="add-form-row">
            <label>Per tap <input name="reps" type="number" min="1" value="25" required></label>
            <label>Daily goal <input name="goal" type="number" min="0" value="25" required></label>
            <button type="submit" class="small-btn primary">Add</button>
          </div>
        </form>
      </section>
      <section class="card">
        <h2>Data</h2>
        <button id="export-btn" class="big-btn secondary">Export backup (JSON)</button>
        <div class="import-row">
          <label class="small-btn file-btn">Import file&#8230;<input id="import-file" type="file" accept=".json,application/json" hidden></label>
          <label><input type="radio" name="import-mode" value="merge" checked> Merge</label>
          <label><input type="radio" name="import-mode" value="replace"> Replace all</label>
        </div>
        <p id="storage-status" class="storage-status"></p>
      </section>`;

    document.getElementById('add-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      Store.addExercise(f.name.value, +f.reps.value, +f.goal.value);
      renderSettings();
      showToast('Exercise added');
    });

    document.getElementById('export-btn').addEventListener('click', () => {
      const blob = new Blob([Store.exportJson()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `reps-backup-${Store.dayKey(new Date())}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    });

    document.getElementById('import-file').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const mode = view.querySelector('input[name="import-mode"]:checked').value;
      if (mode === 'replace' && !confirm('Replace ALL current data with this file?')) return;
      try {
        Store.importJson(await file.text(), mode);
        showToast('Import complete');
        renderSettings();
      } catch (err) {
        alert('Import failed: ' + err.message);
      }
    });

    const status = document.getElementById('storage-status');
    if (navigator.storage && navigator.storage.persisted) {
      navigator.storage.persisted().then((p) => {
        status.textContent = p
          ? 'Storage is persistent — the browser won’t auto-clear your data.'
          : 'Storage is best-effort — export backups occasionally.';
      });
    }
  }

  function onSettingsClick(e) {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const row = btn.closest('[data-ex]');
    if (!row) return;
    const ex = Store.getExercise(row.dataset.ex);
    if (btn.dataset.act === 'archive') {
      Store.updateExercise(ex.id, { archived: !ex.archived });
      renderSettings();
    } else if (btn.dataset.act === 'edit') {
      const name = prompt('Exercise name:', ex.name);
      if (name === null) return;
      const reps = parseInt(prompt('Reps per tap:', ex.defaultReps), 10);
      const goal = parseInt(prompt('Daily goal (0 for none):', ex.dailyGoal), 10);
      Store.updateExercise(ex.id, {
        name,
        defaultReps: isNaN(reps) ? undefined : reps,
        dailyGoal: isNaN(goal) ? undefined : goal,
      });
      renderSettings();
    }
  }

  // ---- tab routing ----

  const renderers = { today: renderToday, history: renderHistory, chart: renderChart, settings: renderSettings };
  const clickHandlers = { today: onTodayClick, history: onHistoryClick, settings: onSettingsClick };

  function setTab(tab) {
    state.tab = tab;
    title.textContent = TITLES[tab];
    document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
    renderers[tab]();
  }

  view.addEventListener('click', (e) => {
    const handler = clickHandlers[state.tab];
    if (handler) handler(e);
  });

  document.querySelector('.tab-bar').addEventListener('click', (e) => {
    const btn = e.target.closest('.tab');
    if (btn) setTab(btn.dataset.tab);
  });

  if (navigator.storage && navigator.storage.persist) navigator.storage.persist();

  setTab('today');
})();

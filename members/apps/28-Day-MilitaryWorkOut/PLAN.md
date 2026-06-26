# Plan: Military Workout → no-build, installable PWA (nrkd-prototype pattern)

## Context

`military-workout.jsx` is a single React component: a 28-day program with a calendar grid (4 weeks ×
7 days), a per-day workout detail view, completion toggling, and a progress bar. All state is in
`useState` (`completedDays: Set`, `selectedDay`, `view`), so **progress is lost on every refresh**.
There is no `package.json` or tooling — it can't actually run on its own.

We want: **localStorage persistence**, a new **"On track to finish on: \<date\>"** projection (no
streaks), and a **true installable / offline PWA**, developable in Visual Studio with a clean path to
.NET 10 later.

Decision (after comparing the user's other apps `learn-solar` and `nrkd-prototype`): build it the
**`nrkd-prototype` way** — plain HTML/CSS/JS, **no npm, no build step**, hand-written
`manifest.webmanifest` + `sw.js`. This matches the existing projects, drops straight into an ASP.NET
Core `wwwroot` later, and `nrkd-prototype` already proves the pattern scales. Accepted cost: porting
the one React component to vanilla DOM, and maintaining the `sw.js` asset list by hand.

Reference files to mirror while implementing:
- `C:\data\claudeCode\nrkd-prototype\sw.js` — cache-first service worker (copy almost verbatim).
- `C:\data\claudeCode\nrkd-prototype\js\store.js` — localStorage-mirrored state module + `reset()`.
- `nrkd-prototype\index.html` lines 112–118 — service-worker registration snippet.
- `nrkd-prototype\manifest.webmanifest` — manifest shape.

## Target structure

```
28-Day_MilitaryWorkOut/
  index.html              app shell; links css, manifest; registers sw; loads js
  manifest.webmanifest    name, icons, theme, display:standalone
  sw.js                   cache-first SW (copied from nrkd, asset list swapped)
  css/theme.css           ported from the JSX inline styles (dark military theme)
  js/
    data.js               WEEKS / ROTATION / DAY_COLORS / WORKOUTS / TIPS  +  Store (localStorage)
    app.js                render calendar + day views, events, progress, projection
  icons/
    icon-192.png
    icon-512.png
  military-workout.jsx     kept as the design reference (not shipped); can delete later
```

## 1. `js/data.js` — workout data + Store

Port the existing constants verbatim from the JSX (`WEEKS`, `ROTATION`, `DAY_COLORS`, `WORKOUTS`,
`TIPS`). Then add a `Store` module in the style of `nrkd/js/store.js` (IIFE → `window.Store`), owning
**all** `localStorage` access — the single seam a future .NET API would replace.

```js
const STORAGE_KEY = "military-workout/v1";

const Store = (function () {
  let S = { completedDays: [], startDate: null };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved === "object") S = Object.assign(S, saved);
  } catch (e) { /* fresh start */ }

  if (!S.startDate) { S.startDate = new Date().toISOString(); persist(); } // stamp on first launch

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); } catch (e) {}
  }
  return {
    get completedDays() { return new Set(S.completedDays); },
    get startDate() { return S.startDate; },
    isDone(day) { return S.completedDays.includes(day); },
    toggle(day) {
      const i = S.completedDays.indexOf(day);
      if (i === -1) S.completedDays.push(day); else S.completedDays.splice(i, 1);
      persist();
      return i === -1;
    },
    reset() { S = { completedDays: [], startDate: new Date().toISOString() }; persist(); }
  };
})();
window.Store = Store;
```

Pure helpers as plain functions: `getDayData(dayIndex)` (unchanged from the JSX) and the projection:

```js
function projectFinish(startDateISO, completedCount) {
  const TOTAL = 28;
  if (completedCount >= TOTAL) return { done: true };
  if (completedCount === 0)    return { pending: true };
  const elapsed = Math.max(1, Math.round((Date.now() - new Date(startDateISO)) / 86400000));
  const pace = completedCount / elapsed;                 // days done per calendar day
  const finish = new Date(Date.now() + Math.ceil((TOTAL - completedCount) / pace) * 86400000);
  return { date: finish };
}
```

## 2. `js/app.js` — rendering + navigation

Two vanilla render functions writing to `#app` (the `nrkd-prototype` screen-module style), with a
**minimal hash router** so the phone/PWA back button works:

- `#/`         → `renderCalendar()`
- `#/day/<n>`  → `renderDay(n)`

`renderCalendar()` builds (template strings + `innerHTML`): progress bar
(`Store.completedDays.size / 28`); the **projection line** under it with three states from
`projectFinish(...)` —
- pending → "Complete your first day to see your projection."
- in progress → **"ON TRACK TO FINISH: Sat, Jul 18, 2026"** (`toLocaleDateString`)
- done → **"PROGRAM COMPLETE 🎖"**;

then the legend, the 4 week grids of 7 day-buttons (each `<a href="#/day/N">`), and the FIELD NOTE tip.

`renderDay(n)` builds the back link, day header, warm-up, exercise list (`getDayData(n).workout`),
cool-down, and the mark-complete button → `Store.toggle(n)` then back to `#/`.

Wire `window.addEventListener("hashchange", route)` and call `route()` on load. Add an optional
**Reset progress** link (`Store.reset()` + re-render), mirroring nrkd's "Reset demo data".

## 3. `css/theme.css`

Port the JSX inline styles into a small set of classes (`.day-btn`, `.day-btn.done`, `.progress`,
`.exercise-row`, `.field-note`, `.kicker`, …). Keep the palette — bg `#0D0D0D`, accent `#4A7C59`, text
`#E8E0D0`, the per-type `DAY_COLORS`, monospace `'Courier New'`. Data-driven per-type colours can stay
as inline `style` / CSS custom properties on the element.

## 4. `manifest.webmanifest`

```json
{
  "name": "28-Day Military Conditioning",
  "short_name": "28-Day Workout",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "background_color": "#0D0D0D",
  "theme_color": "#0D0D0D",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

Icons: two PNGs (192 + 512) — dark `#0D0D0D` tile with a green `#4A7C59` "28"/chevron motif.

## 5. `sw.js`

Copy `nrkd-prototype/sw.js` almost verbatim (cache-first install/activate/fetch). Set `CACHE` to
`'military-workout-v1'` and `ASSETS` to our files:

```
'./', './index.html', './manifest.webmanifest',
'./css/theme.css', './js/data.js', './js/app.js',
'./icons/icon-192.png', './icons/icon-512.png'
```

Maintenance rule (per nrkd's comment): **bump `CACHE` and update `ASSETS` whenever files change** —
the manual cost accepted vs. Vite.

## 6. `index.html`

`<head>` links `css/theme.css`, `<link rel="manifest">`, `<meta name="theme-color" content="#0D0D0D">`,
`<link rel="apple-touch-icon" href="icons/icon-192.png">`. Body has `<div id="app"></div>`, loads
`js/data.js` before `js/app.js`, then the nrkd SW-registration snippet:

```html
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () =>
      navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
</script>
```

## Future .NET 10 path (not built now)

Plain static files, so a later ASP.NET Core (.NET 10) project serves them from `wwwroot` unchanged. To
add a backend, swap the body of `Store` (load/`persist`) to call a Minimal API (`GET/PUT
/api/progress`), keeping localStorage as the offline cache — no other file changes.

## Verification

Service workers need `http://`, not `file://`:

1. `npx serve .` (or VS Code → right-click `index.html` → **Open with Live Server**); open the URL.
2. Mark days complete; **refresh** → persists; projection date moves as more complete; 28/28 →
   "PROGRAM COMPLETE 🎖".
3. DevTools ▸ Application: manifest valid, service worker registered; toggle **Offline** + reload →
   still loads with saved progress.
4. Lighthouse ▸ PWA → "installable"; confirm "Add to Home Screen".
5. **Reset progress** → back to day 0 with a fresh start date.

## Decisions / open items

- Start date stamped on first launch (vs. first completed day) — assumed first launch.
- Keep the FIELD NOTE tip block alongside the new projection — assumed yes.
- `military-workout.jsx` kept as a design reference, not shipped; delete once parity is confirmed.
- Icon art: generated dark/green "28" mark unless brand assets are provided.

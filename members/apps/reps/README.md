# Reps — Exercise Tracker

A tiny zero-dependency PWA for one-tap daily bodyweight exercise tracking.
Log sets with a single tap, track daily goals and streaks, browse history,
see a 30-day chart, and back up your data as JSON. All data lives on your
device in `localStorage` — nothing is sent anywhere.

## Run locally

Any static file server works, e.g.:

```
python -m http.server 8000
```

then open http://localhost:8000.

## Deploy / update (GitHub Pages)

The app is plain static files served from the repo root via GitHub Pages.
To ship a change:

1. Edit the files.
2. **Bump the `CACHE` version string in `sw.js`** (e.g. `reps-v1` → `reps-v2`) —
   the service worker is cache-first, so without this, installed apps keep
   the old assets.
3. Commit and push to `main`. Pages redeploys automatically.

## Install on a phone

Open the GitHub Pages URL in the phone browser and use
"Add to Home Screen" / "Install app".

## Data

- Stored under the `localStorage` key `reps.v1` on the device where you log.
- Settings → Export downloads a JSON backup; Import restores it
  (merge keeps existing records, replace overwrites everything).
- Persistent storage is requested on load so the browser won't auto-evict data.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static marketing website for the **Northern Rockies PG Chito-Ryu Karate Club** (a karate dojo in Prince George, BC), served at `https://pgchitoryu.com/`. It is a plain hand-edited HTML/CSS site — there is **no build step, no test suite, no package manager, and no server-side code**, despite the ASP.NET scaffolding (`Web.config`, `.vs/`, `lib/` copied from a Visual Studio template).

## Running / previewing

Open any `.html` file directly in a browser, or serve the folder statically:

```sh
python -m http.server 8000   # then visit http://localhost:8000/index.html
```

Deployment is a straight file copy to the web host; there is nothing to compile.

## Architecture & conventions

- **Pages are standalone HTML files** at the repo root: `index.html`, `about.html`, `classes.html`, `faq.html`, `contact.html`, `instructors.html`. Each is a complete document.
- **There is no shared layout / master page.** The `<head>`, navbar (`<header><nav>…`), and `<footer>` are **copy-pasted into every page**. When changing navigation, branding, the footer, or CDN includes, you must edit *every* HTML file to keep them consistent. (Migrating to includes/a generator is a known, deliberately-deferred option — see `options.md`.)
- **Styling**: Bootstrap 5.3.3 + jQuery 3.7.1 are loaded from CDN in each page. Site-specific overrides live in `css/site.css`, which defines the black/dark-red dojo theme (key colors: `#c72727` text/links, `#800` borders/buttons, dark gradient `body` background). `js/site.js` is currently empty.
- **`lib/`** holds local copies of Bootstrap, jQuery, and jQuery-validation from the original project template. They are **not referenced** by the pages (which use CDN links instead) — don't assume editing `lib/` changes the live site.
- The `instructors.html` link is intentionally commented out of the nav on every page (the page exists but is temporarily hidden).

## Companion docs (read these before larger changes)

- `SEO.md` — detailed SEO plan and the canonical source for business facts (address `180 Tabor Blvd S`, phone `(250) 640-1099`, class schedule, LocalBusiness schema, meta-tag templates). Use it when editing page metadata or contact info so details stay consistent.
- `options.md` — backlog of known issues and improvement ideas (HTML validation errors, duplicate `<meta description>` tags, missing active-nav state, etc.).
- `development-guidelines.md` — the project's working philosophy: YAGNI / KISS, avoid premature abstraction and over-engineering. **Match solutions to this small site's actual scale** — prefer simple, direct edits over introducing frameworks, build tooling, or abstractions unless explicitly requested.

## Known issues to be aware of when editing

These exist in current pages (catalogued in `options.md` / `SEO.md`) — avoid reintroducing them:
- `index.html` has duplicate `<meta name="description">` tags and invalid nesting (`<h3>` inside `<p>`).
- Several pages have a redundant nested `<div class="container">` inside `<main>`.
- The Google verification meta tag uses an old `UA-`-style value; there is no GA4 tracking yet.

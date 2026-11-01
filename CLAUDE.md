# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The SkiTag "Netzwerk-Buch" (network book): a static HTML/CSS/JS reference book documenting the network layer (chip → LoRa gateway → server → app) of SkiTag, a rental chip that sends location-tagged emergency calls in ski areas without a phone or mobile network. Lukas (repo owner, GitHub `@Lukcoderc`) owns networking; a teammate owns hardware/chip firmware, another owns the app and business side. The book's purpose: a teammate should be able to answer a network question from the book without asking Lukas. See `PRODUCT.md` for full product context and `DESIGN.md` for the complete design system.

- **Stack:** plain HTML, CSS and vanilla JS, no build step, no package manager, no framework.
- **Hosting:** GitHub Pages, published from `Netzwerk Buch/docs/` on `main` by `.github/workflows/pages.yml`.
- **Content language:** German. All book text, headings and commit-visible content must stay German; this file and `PRODUCT.md`/`DESIGN.md` are English.
- **Live URL:** https://lukcoderc.github.io/SKI-TAG/

## Commands

There is no build, lint or package-install step. Checks run with Node from `Netzwerk Buch/tools/`: `node "Netzwerk Buch/tools/pruefe-buch.mjs"` (structure, links, versions), `node "Netzwerk Buch/tools/pruefe-rechnung.mjs"` (the book's numbers) and `node "Netzwerk Buch/tools/abdeckung-tabelle.mjs"` (chapter 10 against `Netzwerk Buch/docs/assets/abdeckung-daten.js`, `--schreiben` regenerates the tables). To work on a chapter, open the `.html` file directly in a browser (or serve `Netzwerk Buch/docs/` with any static file server) and reload.

```
git status / add / commit   # normal git workflow, see "Push policy" below
```

## Push policy

**Never push or commit unless explicitly instructed to.** Chapters are routinely written and left staged/uncommitted locally for review before the owner says to push. Don't assume "finished" means "push".

## Architecture: how a chapter page is assembled

Every chapter in `Netzwerk Buch/docs/kapitel-NN.html` is built from the same fixed recipe (also documented in `DESIGN.md` under "Chapter Page"). When adding or editing a chapter, follow it exactly — there are no per-chapter layout decisions to make:

1. **Boilerplate head/body:** copy the `<svg>` symbol defs (status marks `mark-fest`/`mark-entschieden`/`mark-geschaetzt`/`mark-offen`), the `.seil` header, and the `.buch` grid (`.kapitel-nav` / `<main>` / `.seiten-nav`) verbatim from an existing chapter (e.g. `Netzwerk Buch/docs/kapitel-06.html` or `kapitel-07.html`). These shells are populated client-side by `assets/book.js`, not hand-written per page.
2. **Rope position:** set `data-station` on `<body>` to the emergency-call step the chapter is about: `knopf`, `chip`, `empfaenger`, `server`, `app`, or `rueckweg`. This parks the "gondola" on the shared rope diagram that appears on every page.
3. **Register in the chapter list:** add/update the chapter's entry in the shared `KAPITEL` array in `Netzwerk Buch/docs/assets/book.js`. An entry needs `datei` to become a real nav link; omitting it keeps it listed but unlinked ("noch nicht geschrieben").
4. **Heading block:** `<h1>` title, then `<p class="stand">Kapitel N · Stand [date]</p>` directly below (never above).
5. **Opening:** one `<p class="einstieg">` lead paragraph inside a `.lesen` wrapper, then normal body paragraphs.
6. **Sections:** each `<h2>` needs an `id`; give it `data-kurz="..."` when the heading text is long. The page-contents sidebar and mobile fold are built automatically from these by `book.js` — don't hand-write that nav.
7. **Wide material:** tables (`.tabelle` wrapping `<table>`, add `.stapel` for 3-column tables that need to stack on phones, `data-spalte` on cells for the stacked labels), status conclusions (`.urteil`), and interactive widgets live outside the `.lesen` column; everything else (including status marks `svg.mark` with `<use href="#mark-...">`) stays inside it.
8. **Status marks:** every claim is tagged Fest / Entschieden / Geschätzt / Offen (fixed / decided / estimated / open) using the shared SVG symbols — shape carries the meaning, always paired with its word. Keep estimates labelled as estimates until something is actually measured; this project has not yet been tested on real hardware.
9. **Open-points tables:** use `<tr class="zeile-offen">` for rows marked Offen.
10. **Start page:** `Netzwerk Buch/docs/index.html` lists every chapter by hand with one sentence and a status mark. Update it when a chapter is added, renamed or changes status.
11. **Ending:** `<div class="blaettern">` with Zurück/Weiter links. Link to a next/previous chapter only if it exists; otherwise use a plain `<span>` with "(noch nicht geschrieben)".
12. **Cache-busting versions:** `assets/book.css`, `assets/druck.css` (print only) and `assets/book.js` are referenced with `?v=N` on every chapter page. **Whenever you edit either file, bump `N` in every single `Netzwerk Buch/docs/kapitel-*.html` file and in `Netzwerk Buch/docs/index.html` to the same new value** — GitHub Pages lets browsers cache for ~10 minutes, and a stale script against a new page breaks the rope/nav JS. Per-chapter widget scripts (see below) carry their own independent `?v=N` and only need bumping on pages that load them.

## Shared JS/CSS

- `assets/book.js` is the only script loaded on every page. It builds the rope/gondola animation, the chapter nav, and the page-contents nav purely from the DOM (`KAPITEL`/`STATIONEN` arrays plus `<h2 id>`s) — there is no per-page nav markup to maintain.
- `assets/book.css` holds all design tokens as CSS custom properties (colors, spacing, type) per `DESIGN.md`. Don't introduce new colors/sizes/radii inline; add a token if something is genuinely missing.
- Each chapter-specific interactive widget (SF-Rechner, Kapazitätsrechner, Paket-Bauplan, Wartezeit-Regler, Funkbögen, Hangszene, Checkliste) is its own file in `Netzwerk Buch/docs/assets/` (`sf-rechner.js`, `kapazitaet.js`, `paket.js`, `wartezeit.js`, `funk.js`, `szene.js`, `signalweg.js`, `checkliste.js`) and is `<script defer>`-included only on the chapter(s) that use it. Follow this pattern for new interactive elements rather than growing `book.js`.
- Fonts (Barlow Semi Condensed, Source Sans 3) are self-hosted as woff2 under `Netzwerk Buch/docs/assets/fonts/` specifically so the page makes no requests to Google — don't switch to a CDN font.
- Every interactive widget needs a no-JS fallback (a plain table marked `nur-ohne-js`), per the existing pattern in e.g. `kapitel-06.html`.

## Design system

`DESIGN.md` (YAML frontmatter + prose) is the single source of truth for the "Blue Hour on a Ropeway" visual language: twilight-blue tonal planes, amber as the only accent, red reserved strictly for emergencies/failures/open points, status told by shape not color alone, square corners except on the rope's circular stations and the amber "cabin". Read its "Do's and Don'ts" before touching layout or color. `.impeccable/design.json` is a machine-generated mirror of this file (from the Impeccable design-QA tool) — edit `DESIGN.md`, not the JSON.

## Content ground rules (from `PRODUCT.md`)

- Chapter 7 (`#stufen`) is the single definition of ACK, Zustellung and HELP 1 to 3. Use these words everywhere: ACK is never a human, Übernahme is HELP 1.
- Firmware, server code and `proto.h` were not available when the book was written. Describe them as stated in the handover, never as verified.

- Distinguish explicitly between what's **fixed**, **decided**, and still **open** — never blur the three.
- Explain the path of a real signal/event rather than listing components.
- This repo is public: never commit keys, passwords, or personal contact details (use first names only).
- Reference the hardware/chip and app/business domains, don't redefine them — those are other teammates' chapters.
- Primary source material (handoff doc, pitch presentation) lives outside this repo in the author's Obsidian vault (`10_Projekte/Skitag`), not here — don't invent measurements, photos, or facts not present in that source material or already written into earlier chapters.

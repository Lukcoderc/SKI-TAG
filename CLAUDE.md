# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The SkiTag "Netzwerk-Buch" (network book): a static HTML/CSS/JS reference book documenting the network layer (chip → LoRa gateway → server → app) of SkiTag, a rental chip that sends location-tagged emergency calls in ski areas without a phone or mobile network. Lukas (repo owner, GitHub `@Lukcoderc`) owns networking; a teammate owns hardware/chip firmware, another owns the app and business side. The book's purpose: a teammate should be able to answer a network question from the book without asking Lukas. See `PRODUCT.md` for full product context and `DESIGN.md` for the complete design system.

- **Stack:** plain HTML, CSS and vanilla JS, no build step, no package manager, no framework.
- **Hosting:** GitHub Pages, published from `Netzwerk Buch/docs/` on `main` by `.github/workflows/pages.yml`. The same workflow also publishes the company website from `Website/site/` under `/website/` (https://lukcoderc.github.io/SKI-TAG/website/). The website has its own `Website/PRODUCT.md` and `Website/DESIGN.md`; the root files describe only the book.
- **Content language:** German. All book text, headings and commit-visible content must stay German; this file and `PRODUCT.md`/`DESIGN.md` are English.
- **Live URL:** https://lukcoderc.github.io/SKI-TAG/

## Commands

There is no build, lint or package-install step. Checks run with Node from `Netzwerk Buch/tools/`: `node "Netzwerk Buch/tools/pruefe-buch.mjs"` (structure, links, versions, chapter order, chapter numbers in links, Baut-auf lines, Kurz-gesagt boxes, Ergebnis sections, glossary, terms, mark counts, search data), `node "Netzwerk Buch/tools/pruefe-rechnung.mjs"` (the book's numbers) and `node "Netzwerk Buch/tools/abdeckung-tabelle.mjs"` (chapter 9 against `Netzwerk Buch/docs/assets/abdeckung-daten.js`, `--schreiben` regenerates the tables, including the circle table). The relief maps (`assets/karte-relief.png` for dark, `assets/karte-relief-hell.png` for light, `assets/karte-daten.js`) is drawn by `node "Netzwerk Buch/tools/karte-zeichnen.mjs" <Ordner>` from the folder that `tools/abdeckung-holen.mjs <Ordner>` fills; rerun `abdeckung-tabelle.mjs --schreiben` afterwards). After changing chapter text or status marks run `node "Netzwerk Buch/tools/zaehle-marken.mjs" --schreiben` (counts on the start page) and `node "Netzwerk Buch/tools/suchindex.mjs" --schreiben` (`assets/suche-daten.js`). To work on a chapter, open the `.html` file directly in a browser (or serve `Netzwerk Buch/docs/` with any static file server) and reload.

```
git status / add / commit   # normal git workflow, see "Push policy" below
```

## Push policy

**Never push or commit unless explicitly instructed to.** Chapters are routinely written and left staged/uncommitted locally for review before the owner says to push. Don't assume "finished" means "push".

## Architecture: how a chapter page is assembled

Every chapter in `Netzwerk Buch/docs/kapitel-NN.html` is built from the same fixed recipe (also documented in `DESIGN.md` under "Chapter Page"). When adding or editing a chapter, follow it exactly — there are no per-chapter layout decisions to make:

1. **Boilerplate head/body:** copy the `<svg>` symbol defs (status marks `mark-fest`/`mark-entschieden`/`mark-geschaetzt`/`mark-offen`), the `.kopf` header and the `.buch` grid (`.kapitel-nav` / `<main>` / `.seiten-nav`) verbatim from an existing chapter (e.g. `Netzwerk Buch/docs/kapitel-06.html` or `kapitel-07.html`). These shells are populated client-side by `assets/book.js`, not hand-written per page.
2. **Chapter head:** copy the inline theme script from the `<head>` of an existing page. Since the night redesign of 2026-11-03 every page starts with `<header class="kopf"><div class="kopf-innen">` holding the book name link (`.buch-marke`) and a `<div class="kopf-titel">` with the heading block (step 4). `book.js` adds the beacon line (`.bake`, the part of the book) itself. The `<article>` starts directly with the `.lesen` opening.
3. **Register in the chapter list:** add/update the chapter's entry in the shared `KAPITEL` array in `Netzwerk Buch/docs/assets/book.js`, in reading order and with its group in `teil`. An entry needs `datei` to become a real nav link; omitting it keeps it listed but unlinked ("noch nicht geschrieben").
4. **Heading block (inside `.kopf-titel`, not in the article):** `<h1>` title, then `<p class="stand">Kapitel N · Stand [date]</p>` directly below (never above), then `<p class="vorwissen">Baut auf: ...</p>` with links to the earlier chapters it relies on (not on chapter 1). The book builds up: a chapter must be readable with only what comes before it, and forward references only point to where a topic is deepened.
5. **Opening:** one `<p class="einstieg">` lead paragraph inside a `.lesen` wrapper, directly followed by a `<div class="kurz">` box („Kurz gesagt“: at most three points plus the most important open question), then normal body paragraphs.
6. **Sections:** each `<h2>` needs an `id`; give it `data-kurz="..."` when the heading text is long. The page-contents sidebar and mobile fold are built automatically from these by `book.js` — don't hand-write that nav.
7. **Wide material:** tables (`.tabelle` wrapping `<table>`, add `.stapel` for 3-column tables that need to stack on phones, `data-spalte` on cells for the stacked labels), status conclusions (`.urteil`), and interactive widgets live outside the `.lesen` column; everything else (including status marks `svg.mark` with `<use href="#mark-...">`) stays inside it.
8. **Status marks:** every claim is tagged Fest / Entschieden / Geschätzt / Offen (fixed / decided / estimated / open) using the shared SVG symbols — shape carries the meaning, always paired with its word. Keep estimates labelled as estimates until something is actually measured; this project has not yet been tested on real hardware.
9. **Open-points tables:** use `<tr class="zeile-offen">` for rows marked Offen.
10. **Start page:** `Netzwerk Buch/docs/index.html` lists every page by hand with one sentence. The counted status marks below each chapter come from `tools/zaehle-marken.mjs`, never write them by hand. Update the page when a chapter is added or renamed. Open points live in `kapitel-entscheidungen.html`, not in the appendix.
11. **Ending:** `<div class="blaettern">` with Zurück/Weiter links. Link to a next/previous chapter only if it exists; otherwise use a plain `<span>` with "(noch nicht geschrieben)".
12. **Cache-busting versions:** `assets/book.css`, `assets/druck.css` (print only) and `assets/book.js` are referenced with `?v=N` on every chapter page. **Whenever you edit either file, bump `N` in every single `Netzwerk Buch/docs/kapitel-*.html` file and in `Netzwerk Buch/docs/index.html` to the same new value** — GitHub Pages lets browsers cache for ~10 minutes, and a stale script against a new page breaks the nav JS. Per-chapter widget scripts (see below) carry their own independent `?v=N` and only need bumping on pages that load them.

## Shared JS/CSS

- `assets/book.js` is the only script loaded on every page. It builds the grouped chapter nav and the page-contents nav purely from the DOM (`KAPITEL` array plus `<h2 id>`s) — there is no per-page nav markup to maintain. It also declares `SVG_NS` and `ohneBewegung`, which chapter widgets use as globals.
- `assets/book.css` holds all design tokens as CSS custom properties (colors, spacing, type) per `DESIGN.md`. Don't introduce new colors/sizes/radii inline; add a token if something is genuinely missing.
- The search (`suche.js`, `suche-daten.js`) is loaded by `book.js` on first focus of the search field. Each chapter-specific interactive widget (SF-Rechner, Kapazitätsrechner, Paket-Bauplan, Wartezeit-Regler, Funkbögen, Hangszene, Checkliste, Abdeckungskarte) is its own file in `Netzwerk Buch/docs/assets/` (`sf-rechner.js`, `kapazitaet.js`, `paket.js`, `wartezeit.js`, `funk.js`, `szene.js`, `signalweg.js`, `checkliste.js`, `abdeckung.js` with `abdeckung-daten.js`, `abdeckung-wahl.js`, `reichweite-wahl.js` and `karte-daten.js`) and is `<script defer>`-included only on the chapter(s) that use it. Follow this pattern for new interactive elements rather than growing `book.js`.
- Fonts (Archivo as one variable file, Source Sans 3) are self-hosted as woff2 under `Netzwerk Buch/docs/assets/fonts/` specifically so the page makes no requests to Google — don't switch to a CDN font.
- Every interactive widget needs a no-JS fallback (a plain table marked `nur-ohne-js`), per the existing pattern in e.g. `kapitel-06.html`.

## Design system

`DESIGN.md` (YAML frontmatter + prose) is the single source of truth for the "Pistenraupe bei Nacht" visual language (since 2026-11-03): near-black night ground, snow-white text, turquoise (dark) and petrol blue (light) as the only accent, a plain grey chapter head (`--kopf-grund`, no texture or picture), a light mode via `data-thema="hell"` on `<html>` (set before paint by a one-line inline script in every page head, toggled by the `.thema` button that `book.js` adds; the slope scene has its own day colours and the coverage map switches to `assets/karte-relief-hell.png`), red reserved strictly for emergencies/failures/open points, status told by shape not color alone, rounded planes (one token, `--rundung`). Read its "Do's and Don'ts" before touching layout or color. `.impeccable/design.json` is a machine-generated mirror of this file (from the Impeccable design-QA tool) — edit `DESIGN.md`, not the JSON.

## Content ground rules (from `PRODUCT.md`)

- Chapter 13 (`#stufen`) is the single definition of ACK, Zustellung and HELP 1 to 3. In running text use the German names: Empfangsbestätigung (ACK, never a human), Übernahme-Meldung (HELP 1), Vor-Ort-Meldung (HELP 2), Erledigt-Meldung (HELP 3). The protocol names ACK and HELP appear only in brackets at the first mention per page, in the protocol table of chapter 4, the stage table of chapter 13, the glossary and the FAQ; `pruefe-buch.mjs` enforces this. „Rückmeldung der App“ is the app telling the server it displayed an alarm. The button in the app is called „Annehmen“; tapping it is the Übernahme.
- Firmware, server code and `proto.h` exist as the first-test version in `skitag-test.zip` (outside this repo, never commit it: it holds the example key). It is not the final firmware. The code was read but not run, so never describe it as tested or verified.

- Distinguish explicitly between what's **fixed**, **decided**, and still **open** — never blur the three.
- Explain the path of a real signal/event rather than listing components.
- This repo is public: never commit keys, passwords, or personal contact details (use first names only).
- Reference the hardware/chip and app/business domains, don't redefine them — those are other teammates' chapters.
- Primary source material (handoff doc, pitch presentation) lives outside this repo in the author's Obsidian vault (`10_Projekte/Skitag`), not here — don't invent measurements, photos, or facts not present in that source material or already written into earlier chapters.

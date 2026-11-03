---
name: SkiTag Netzwerk-Buch
description: The written account of one emergency call, read at night on a freshly groomed slope, with a day variant.
colors:
  dunkel: "#070b12"
  flaeche: "#0e141e"
  flaeche-hell: "#18212e"
  flaeche-hover: "#243044"
  feld-klar: "#4a5d7a"
  linie: "#1f2937"
  schnee: "#eef2f6"
  text-2: "#cdd5df"
  dunst: "#97a3b5"
  licht: "#2dd4bf"
  licht-hover: "#5eead4"
  notruf: "#ff5468"
  kopf-grund: "#14181e"
  kopf-linie: "#232a33"
  hell-dunkel: "#f4f7fa"
  hell-flaeche: "#ffffff"
  hell-flaeche-hell: "#e4eaf0"
  hell-flaeche-hover: "#d3dde7"
  hell-feld-klar: "#7d9bbd"
  hell-linie: "#dbe3ea"
  hell-schnee: "#111a24"
  hell-text-2: "#2c3b4a"
  hell-dunst: "#556477"
  hell-licht: "#0e6f8f"
  hell-licht-hover: "#0a5873"
  hell-notruf: "#c4223a"
  hell-kopf-grund: "#e8ebee"
  hell-kopf-linie: "#d5dade"
typography:
  display:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(2.5rem, 4.4vw, 3.8rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.015em"
    fontVariation: "\"wdth\" 112"
  headline:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "32px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.01em"
    fontVariation: "\"wdth\" 106"
  title:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.2
  title-box:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "19px"
    fontWeight: 700
    lineHeight: 1.2
    fontVariation: "\"wdth\" 104"
  subtitle:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "19px"
    fontWeight: 700
    lineHeight: 1.25
  brand:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "19px"
    fontWeight: 800
    lineHeight: 1.2
    fontVariation: "\"wdth\" 114"
  value:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.2
    fontFeature: "\"tnum\" 1"
  lead:
    fontFamily: "Source Sans 3, Segoe UI, sans-serif"
    fontSize: "21px"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Source Sans 3, Segoe UI, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.65
  body-table:
    fontFamily: "Source Sans 3, Segoe UI, sans-serif"
    fontSize: "16.5px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "\"tnum\" 1"
  label-stand:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.35
    fontVariation: "\"wdth\" 86"
  label-nav:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.3
    fontVariation: "\"wdth\" 86"
  label-table-head:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.3
    fontVariation: "\"wdth\" 86"
  label-strong:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.2
  label-toggle:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "14.5px"
    fontWeight: 600
    lineHeight: 1.2
    fontVariation: "\"wdth\" 92"
rounded:
  fokus: "2px"
  klein: "3px"
  knopf: "6px"
  rundung: "8px"
  voll: "50%"
spacing:
  eng: "6px"
  inline: "10px"
  absatz: "14px"
  anschluss: "18px"
  box: "20px"
  innen: "24px"
  spalte: "32px"
  buch-oben: "40px"
  abschnitt: "72px"
  kapitelende: "80px"
  seitenende: "96px"
components:
  button-primary:
    backgroundColor: "{colors.licht}"
    textColor: "{colors.dunkel}"
    typography: "{typography.label-strong}"
    rounded: "{rounded.knopf}"
    padding: "9px 16px"
  button-primary-hover:
    backgroundColor: "{colors.licht-hover}"
  button-secondary:
    backgroundColor: "{colors.flaeche}"
    textColor: "{colors.schnee}"
    typography: "{typography.label-strong}"
    rounded: "{rounded.knopf}"
    padding: "9px 16px"
  button-secondary-on-plane:
    backgroundColor: "{colors.flaeche-hell}"
    textColor: "{colors.schnee}"
  button-secondary-hover:
    backgroundColor: "{colors.flaeche-hover}"
  button-toggle-on:
    backgroundColor: "{colors.schnee}"
    textColor: "{colors.dunkel}"
  tab:
    backgroundColor: "{colors.flaeche-hell}"
    textColor: "{colors.schnee}"
    padding: "10px 12px"
  tab-selected:
    backgroundColor: "{colors.flaeche}"
    textColor: "{colors.licht}"
  search-input:
    backgroundColor: "{colors.flaeche}"
    textColor: "{colors.schnee}"
    rounded: "{rounded.knopf}"
    padding: "8px 12px"
  table-header:
    backgroundColor: "{colors.flaeche-hell}"
    textColor: "{colors.dunst}"
    typography: "{typography.label-table-head}"
    padding: "13px 16px"
  table-cell:
    backgroundColor: "{colors.flaeche}"
    textColor: "{colors.text-2}"
    typography: "{typography.body-table}"
    padding: "13px 16px"
  table-row-name:
    textColor: "{colors.schnee}"
  short-summary-box:
    backgroundColor: "{colors.flaeche}"
    textColor: "{colors.schnee}"
    rounded: "{rounded.rundung}"
    padding: "20px 24px"
  status-panel:
    backgroundColor: "{colors.flaeche}"
    textColor: "{colors.schnee}"
    rounded: "{rounded.rundung}"
    padding: "20px 24px"
  packet-field-readable:
    backgroundColor: "{colors.feld-klar}"
    textColor: "{colors.schnee}"
    padding: "8px 6px"
  packet-field-selected:
    backgroundColor: "{colors.licht}"
    textColor: "{colors.dunkel}"
  theme-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.schnee}"
    typography: "{typography.label-toggle}"
    rounded: "{rounded.knopf}"
    padding: "6px 12px"
  theme-toggle-hover:
    backgroundColor: "{colors.flaeche-hell}"
  chapter-head:
    backgroundColor: "{colors.kopf-grund}"
    textColor: "{colors.schnee}"
    padding: "20px 0 30px"
  to-contents-button:
    backgroundColor: "{colors.licht}"
    textColor: "{colors.dunkel}"
    rounded: "{rounded.knopf}"
    padding: "10px 18px"
---

# Design System: SkiTag Netzwerk-Buch

## Overview

**Creative North Star: "Pistenraupe bei Nacht"**

The book is read at night on a freshly groomed slope. Everything is dark and calm, and light falls only where there is something to see. The ground is near black with a blue cast, text is snow, secondary text is a grey-blue haze, and one glacier-turquoise beacon is the only thing that glows. The chapter head is a plain, slightly grey band, a little less blue than the page, closed by a fine line; the title stands in it without texture, picture or gradient. The only landscape in the book is the slope scene and the relief map, where they explain something.

Night is the identity; the day variant ("helle Ansicht") is the same world in snow light. It swaps every token for a pale set and keeps structure, type, shapes and rules unchanged. Drawings follow the view too: the slope scene turns to a day slope and the coverage map to a pale relief.

The system is built for reading first. Density is that of a well-set reference book: a 68-character column at 18px, side lists in a condensed cut of the same display family, and wide material (tables, status, calculators, the walkthrough) stepping out of the column only when it needs the width. Depth comes from flat tonal planes a few steps above the night ground. Tables are lit rows on that ground, and status comes from shape, so fixed, decided, estimated and open stay apart without colour.

The system refuses the dark docs template of grey panels and a generic blue accent, and it refuses light-on-everything: a lit thing is lit because the reader is there or can act there.

**Key Characteristics:**
- Near-black night ground with a blue cast, raised by flat tonal planes; a pale day variant on the same tokens.
- One accent, glacier turquoise by night and petrol by day, meaning "here" and "act here".
- Emergency red reserved for emergency, failure and open points.
- A plain neutral-grey head band: no texture, picture or gradient.
- Archivo's width axis as a voice: condensed to navigate, wide to announce.
- Status told by form: filled, ringed, dashed, diamond.
- German text, self-hosted fonts, no build step.

## Colors

A night palette: blue-black planes close together in value, snow and haze for text, one cold light, one warning. The day palette mirrors every role on the same token names; the frontmatter lists it under the `hell-` prefix, applied by `[data-thema="hell"]` on the root element.

### Primary
- **Glacier Turquoise** (`licht`): the current chapter and section, text links, the beacon dot in the head, the Kurz-gesagt dot, the selected walkthrough tab, the main button, the fixed „Inhalt“ button, focus rings, text selection, the caret, range and checkbox accents, calculator outputs, the hover outline of packet fields and every signal in drawings. **Glacier Glow** (`licht-hover`) is its hover tone on filled turquoise controls only. In the day palette the same role is **Petrol** (`hell-licht`), a deep blue-green that holds as text on the pale planes (at least 4.7:1 on ground, planes and head), with **Petrol Deep** (`hell-licht-hover`) as its hover.

### Secondary
- **Emergency Red** (`notruf`): the Offen mark and word, open table rows, the open-status heading, failure headings in the walkthrough, the guest's chip and the failure diamond in the slope scene, coverage gaps on the map. It is a signal, not a second accent.

### Neutral
- **Night** (`dunkel`): the page ground, drawing grounds (slope scene sky, calculator curve, map), the text colour on turquoise and on snow fills, and the halo stroke behind scene labels.
- **Night Plane** (`flaeche`): the first raised plane: table bodies, the Kurz-gesagt box, status panels, calculators, the packet plan, diagrams, test cases, the start page chapter list, the search field.
- **Upper Plane** (`flaeche-hell`): the second raised plane: table header bands, the walkthrough tab strip and control row, secondary buttons on a plane, inline code, the hatching partner of encrypted fields.
- **Plane Hover** (`flaeche-hover`): hover of secondary buttons and the search border, and the scrollbar thumb. A state, not a fourth plane.
- **Lit Field** (`feld-klar`): readable fields in the packet plan and its legend swatch. It exists only to show what can be read in the clear.
- **Hairline** (`linie`): the 1px rule between table rows, above the page-turn line, the page-contents rail and the search border at rest.
- **Snow** (`schnee`): body text, headings, the first column of tables, part names, inline status marks other than Offen, and the fill of a switched-on toggle.
- **Pale Snow** (`text-2`): table cells after the first column and source lists. One step below Snow so the row name leads.
- **Haze** (`dunst`): chapter list links, the stand and Baut-auf lines, the beacon line, table header text, captions, the page-turn line and legend text.
- **Head Grey** (`kopf-grund`): the flat fill of the chapter head, a neutral grey deliberately less blue than the page planes, one step lighter than Night at night and one step darker than the ground by day. Head only.
- **Head Line** (`kopf-linie`): the 1px rule under the chapter head and the outline of the view toggle. Head only.

### Named Rules

**The One Beacon Rule.** The accent (turquoise by night, petrol by day; "turquoise" elsewhere in this file means this accent in either view) is the only accent. If something carries it, it is where the reader is or what the reader can act on. A second accent hue is not available.

**The Signal Rule.** Red marks an emergency, a failure or an open point, and nothing else. It never decorates and never marks plain importance.

**The Red Stays Low Rule.** Red text sits on Night, the Night Plane or the Upper Plane (at least 5.2:1 at night, 4.7:1 by day), never on Plane Hover or the Lit Field.

**The Both Views Rule.** Every drawing follows the active view: the slope scene, the diagrams and the coverage map all switch with the page. Text never names a colour that holds in only one view; it calls the accent "blaugrün", which fits both turquoise and petrol, and red "rot", and names nothing else by colour, only by shape or fill ("ausgefüllte Rauten", "kleinere ohne Farbe", "feine Linien").

**The Lit Row Rule.** In a table the first column is the row's name and carries Snow at weight 600; every other cell steps down to Pale Snow. The reader scans names first.

## Typography

**Display Font:** Archivo variable (with Arial Narrow, sans-serif), self-hosted, width 62 to 125%, weight 400 to 800
**Body Font:** Source Sans 3 (with Segoe UI, sans-serif), self-hosted in weights 400 and 600

**Character:** Archivo is the groomer's stencil: the same family set condensed for everything the reader navigates by and set wide and heavy for everything that announces a place in the book. Source Sans 3 is open and patient and carries everything the reader reads as a sentence.

### Hierarchy
- **Display** (800, fluid 2.5 to 3.8rem, 1.02, width 112%, -0.015em, balanced wrap; 2.1 to 2.6rem on phones): the chapter title in the head. One per page.
- **Headline** (800, 32px, 1.15, width 106%, -0.01em, balanced wrap; 28px on phones): chapter sections. Each one has an id and appears in the page contents.
- **Brand** (800, 19px, 1.2, width 114%): the book name top left in the head.
- **Title** (700, 24px, 1.2): step headings and sub-sections; status panel headings at 21px, packet and checklist headings at 22px.
- **Title Box** (700, 19px, 1.2, width 104%): the Kurz-gesagt title.
- **Subtitle** (700, 19px, 1.25): failure headings and fourth-level headings.
- **Value** (700, 26px, 1.2, tabular): calculator readouts.
- **Lead** (400, 21px, 1.55; 19px on phones): the single opening paragraph.
- **Body** (400, 18px, 1.65; 17px on phones): reading text, held to 68ch.
- **Body Table** (400, 16.5px, 1.5, tabular): table cells.
- **Label Stand** (600, 16px, 1.35, width 86%): the stand and Baut-auf lines below the title. The Stand column of tables uses the same voice at 15.5px, width 90%.
- **Label Nav** (500, 16px, 1.3, width 86%): chapter list and page contents, tabular chapter numbers. Part names and the page-contents heading go to 700 at width 108%.
- **Label Table Head** (600, 15px, 1.3, width 86%): table headers, in Haze on the Upper Plane.
- **Label Strong** (700, 17px, 1.2): buttons, the page-turn line (600) and the start page status counts.
- **Label Toggle** (600, 14.5px, 1.2, width 92%): the view toggle in the head.

No uppercase is set anywhere. Tracking is only ever negative and only on Display and Headline.

### Named Rules

**The Width Is The Voice Rule.** Condensed Archivo (86 to 90%) navigates and labels: lists, table headers, stand lines. Wide Archivo (104 to 114%) announces: book name, title, sections, the summary title. Nothing in between invents a third width.

**The Two Families Rule.** Archivo navigates and announces, Source Sans reads. Anything read as a sentence is Source Sans.

**The Measure Rule.** Running text never exceeds 68ch, even where the column is wider.

## Layout

The page is a full-width chapter head above a three-column book. Both share one grid: chapter list (250px), main column (up to 860px, centred) and page contents (230px), with 32px gaps. The side margin grows with the window: at least 20px, otherwise a quarter of the width beyond 1360px plus 22px.

**Chapter head.** About 150 to 200px tall, 20px top and 30px bottom padding, on Head Grey, closed by a 1px Head Line. Row one holds the book name (left column) and the view toggle (right edge of the last column). Row two holds the beacon line (turquoise dot plus the part of the book, built by `book.js`) at the bottom of the left column, and the title block across the main and page-contents columns, starting at the main column's left edge so the title can stay on one line. The stand line and the Baut-auf line sit directly below the title. The head scrolls away with the page; it is not sticky.

**Book.** 40px top, 96px bottom. Both side lists stick 24px from the top and scroll on their own. The reading column is 68ch; tables, status panels, the Kurz-gesagt box, calculators and diagrams take the full main column.

**Rhythm.** 72px before a section heading, 18 to 20px from text to the wide object it introduces, 14px between paragraphs, 10px between inline neighbours, 6 to 8px between stacked panels so the night shows through as the divider, 20px by 24px inside panels. The chapter ends with an 80px gap before the page-turn line. Anchors land 24px below the top.

**Below 1180px** the page contents leave the right edge and become a fold on the Night Plane at the top of the main column; the chapter list narrows to 220px and the title spans only the main column.

**Below 820px** the head and the book become one column with 16px margins. The head puts book name and view toggle on the first row, the beacon line on its own row, and the title below with 30px air. Chapters and page contents fold into one Night Plane panel above the text, closed by default; the search field moves onto the Upper Plane inside it. Sections tighten to 56px, panel insets to 16px, table cells to 10px by 12px, stacked tables become cards, the page-turn links also appear above the text, and a fixed turquoise „Inhalt“ button sits bottom right.

## Elevation & Depth

There is no cast elevation. Depth is tonal: Night, Night Plane, Upper Plane, each a small step lighter than the one below. A raised thing is simply a lighter plane. The only gradient is a drawn material: the hatching of encrypted packet fields. The chapter head is a flat fill. The only `box-shadow` values are inset 1px lines that act as drawn strokes (the page-contents rail, packet field outlines), not depth.

### Named Rules

**The Plain Head Rule.** The chapter head is one flat band of Head Grey with a 1px Head Line below it. No texture, picture, silhouette or gradient goes into it, and it carries only the book name, the view toggle, the beacon line and the title block.

**The Plane Before Frame Rule.** Containers are separated by tone, not frames. The structural lines are 1px: Hairlines between table rows, above the page-turn line and as the page-contents rail, and the Head Line under the head.

## Shapes

Planes are gently rounded (8px, the single token `--rundung`): tables, the Kurz-gesagt box, status panels, calculators, the packet plan, diagrams, test cases, the start page list, the folds. Boxes inside diagrams and the terrain profile take 0.7 of it. Controls (buttons, the search field, the view toggle, the „Inhalt“ button) take a softer 6px corner; inline code and selects 3px; focus outlines 2px. The chapter head, the side lists and the packet fields stay square. Setting `--rundung` to 0 squares every plane in one place.

The status marks are the system's silhouette vocabulary, drawn on a 16-unit grid with a 2-unit stroke:

- **Fest** (fixed): a filled disc.
- **Entschieden** (decided): a ring with a filled core.
- **Geschätzt** (estimated): a dashed ring.
- **Offen** (open): a diamond outline.

Other drawn shapes recur: round dots (the beacon, the Kurz-gesagt title) mean "here"; folds open with a drawn 7px chevron in Haze that turns from pointing right to pointing down; the view toggle carries a 16px stroked sun or moon. No glyph or font icons are used.

### Named Rules

**The Status As Form Rule.** Certainty is told by shape, always with its word beside it. Only Offen also changes colour; the other three marks stay Snow.

## Components

Quiet, square-shouldered and stencil-like. Controls read as labels on a plane until they are hovered, selected or current.

### Chapter Page

Every chapter is assembled the same way, so a new chapter needs no layout decisions.

1. **Chapter list:** add the chapter to the shared list in `book.js` with its part (`teil`), in reading order. An entry without a file name stays a muted, unlinked entry.
2. **Head:** the book name link, then the title block: the title, then the stand line in the form "Kapitel N · Stand [date]", below the title and never above it, then the line "Baut auf: Kapitel X, Kapitel Y" with links to earlier chapters only. Chapter 1 has none. The beacon line and the view toggle are added by script; never write them by hand. Every page carries the one-line inline script in its `<head>` that sets the view before paint.
3. **Opening:** one Lead paragraph in the reading column, then the „Kurz gesagt“ box, then Body.
4. **Sections:** each section heading has an `id`, and a short `data-kurz` label when the heading is long. The page contents build themselves from these.
5. **Wide material:** tables, status conclusions and widgets sit outside the reading column; everything else, including inline marks, stays inside it.
6. **Ending:** the page-turn line in Haze above a Hairline.
7. **Versions:** links to CSS and JS carry `?v=N`. Raise N on every change to those files on every page, because GitHub Pages lets browsers keep old copies for ten minutes and a new page with an old script breaks.

### Chapter Head

A plain, flat band of Head Grey with a 1px Head Line below (see The Plain Head Rule), neutral and a little less blue than the page in both views. The beacon dot (10px, turquoise) is steady; nothing in the head moves. On the start page the book name turns turquoise as the current entry. In print the band and its line are dropped.

### Short Summary Box

„Kurz gesagt“ sits directly below the Lead in every chapter: a Night Plane panel, 20px by 24px, a Title Box heading led by a 9px turquoise dot, at most three points with Haze bullets, and one line „Offen:“ in red, led by a drawn 9px outlined diamond, naming the most important open question. It repeats what the chapter says and adds no new claim.

### View Toggle
A button at the top right of the head, built by `book.js`: a stroked 16px sun with „Hell“ at night, a moon with „Dunkel“ by day, in Label Toggle, transparent with a 1px Head Line outline and 6px corners, Upper Plane on hover. Hidden in print. It sets `data-thema` on the root element and stores the choice in `localStorage` („thema“). Without a stored choice the inline head script follows `prefers-color-scheme`; without JavaScript the page is dark and shows no toggle.

### Buttons
- **Shape:** softened corners (6px), 9px by 16px padding, no border, Label Strong.
- **Primary:** Glacier Turquoise fill with Night text, at least 188px wide in the walkthrough. One per control group, for the main action. Hover lifts to the accent hover tone.
- **Secondary:** Night Plane fill with Snow text; on a plane it takes the Upper Plane. Hover goes to Plane Hover.
- **Toggle on:** Snow fill with Night text, for a switched mode such as the failure view or the chosen packet.
- **Focus:** 2px turquoise outline at 2px offset (3px for links and fields).
- **Disabled:** 50% opacity, default cursor.

### Tabs
- **Style:** a strip on the Upper Plane attached to the top of its panel, 500 at 17px, 10px by 12px, no gaps.
- **Selected:** takes the panel's Night Plane fill so it merges with the panel, turquoise at 700.
- **Hover / Focus:** turquoise text; 2px turquoise outline inset by 2px. Below 1000px unselected tabs shrink to their number.

### Inputs / Fields
- **Search:** Night Plane field with a 1px Hairline border, 6px corners, 8px by 12px, Archivo 500; the border goes to Plane Hover on hover; placeholder in Haze. Results replace the chapter list while there is a query, the section title in turquoise, the chapter in Haze below.
- **Range, checkbox:** native controls with a turquoise accent colour.
- **Select:** Upper Plane, no border, 3px corners, Archivo 700.

### Tables
- **Style:** full column width on the Night Plane with 8px corners. A header band on the Upper Plane with Label Table Head in Haze; body rows on the Night Plane split by 1px Hairlines; cells 13px by 16px, left and top aligned. The first column is Snow at 600, the rest Pale Snow. Rows lift by a faint snow veil on hover.
- **Stand column:** kept as narrow as its content, a 15px mark beside its word in Snow; an open row (`zeile-offen`) turns mark and word red.
- **Overflow:** the table scrolls inside its own wrapper.
- **Stacked tables:** tables carrying `stapel` become one card per row below 820px: the header is hidden, the first cell becomes a 17px Archivo 700 card title, and each further cell is labelled by its `data-spalte` in 13.5px Archivo Haze above it. The Stand cell drops its label.

### Status Marks and Panels
- **Panels:** a stack of Night Plane panels, 20px by 24px, 8px apart, in the order Fest, Entschieden, Geschätzt, Offen. Headings at 21px with a 20px mark beside them; the Offen heading is red.
- **Inline mark:** a 16px mark at the start of a claim in the reading column, in Snow; only Offen is red, and it is labelled for screen readers.
- **Conclusion (`urteil`):** a Night Plane panel closing a section with the result.

### Navigation
- **Chapter list:** parts as Snow names at 700, chapters in Label Nav in Haze with a 28px number column; hover to Snow; the current chapter turquoise at 700; unwritten chapters listed at 70% opacity as text, not links.
- **Page contents:** a small "Auf dieser Seite" heading in Snow; Haze links indented 14px from a 1px Hairline rail; the section in view turns Snow at 700 and its stretch of the rail becomes a 1px turquoise segment.
- **Text links:** turquoise, 1px underline at 3px offset, 2px on hover.
- **Folds:** a drawn chevron in place of the default marker, as described under Shapes and Layout.

### Calculator
A Night Plane panel with a labelled range input (turquoise output), a Night drawing with a turquoise curve, four Value readouts with Haze labels (two per row on phones) and one plain sentence on what the setting means. It updates instantly. Without JavaScript a table marked `nur-ohne-js` stands in.

### Packet Plan
A Night Plane panel: a switch between packets, a wrapping row of field buttons grown by byte size with 3px gaps, and one explanation area. Readable fields are lit: the Lit Field fill, Snow text and a 1px Haze inset outline. Encrypted fields are hatched at 135° in Night and Upper Plane stripes with the same outline. Hover draws a 2px turquoise inset outline. The selected field turns turquoise with Night text. A legend repeats both swatches. Without JavaScript a table stands in.

### Diagram
A static inline SVG on the Night Plane with a Haze caption: zones on Night, boxes on the Upper Plane, Archivo labels at 16, 17 and 20px, 2px Haze lines, a turquoise line for the path of an emergency call. Red appears only as the Offen mark and its text. Below 820px the drawing keeps a 720px width and scrolls inside its wrapper, with a hint in the caption.

### Coverage Map
A two-column panel (map 3, controls 2; stacked on phones). The relief comes as two palette-indexed rasters from the same shading, both written by `tools/karte-zeichnen.mjs` with an embedded origin record: `assets/karte-relief.png` in the night ramp (#070b12 to #8f9bad) and `assets/karte-relief-hell.png` in the day ramp (#869ab0 to #ffffff). `abdeckung.js` places both as SVG images; the stylesheet shows the one matching the view. Pistes in faint Snow, lifts dashed Haze, good coverage turquoise, marginal Snow, gaps red and thicker. Gateway sites are diamonds: unselected hollow with a 2px Haze stroke, selected filled with Snow. Place names carry a Night halo. A terrain profile below shows the line of sight in dashed turquoise and a blocking ridge in red.

### Test Case
A Night Plane block per test: an Archivo 700 heading with its number, then labelled rows for Ausgangslage, Durchführung, Erwartet and Bestanden, split by Upper Plane hairlines, labels in Haze. Below 820px the labels stack above their text.

### Guide
A how-to chapter uses numbered stages as sections, command blocks on the Night Plane and a Checklist with turquoise ticks and a turquoise progress line, whose state stays in the browser. Commands are shown only when a source confirms them.

### Start Page
`index.html` is the book's front door with the same head and side lists, the book name as the current entry. Title, stand line, lead, one main button, the system diagram, the status legend in two columns, then the chapters in their parts: one Night Plane list, rows split by Upper Plane hairlines, each with a Haze number, a 20px title link, one sentence and the counted status marks (Offen in red) generated by `tools/zaehle-marken.mjs`.

### Emergency Walkthrough
The signature interaction of Chapter 1: one emergency call stepped through in six steps.

- **Structure:** Upper Plane tab strip, slope scene, control row on the Upper Plane, then one Night Plane panel per step. A press scrolls tabs and scene fully into view. The panel keeps the height of its tallest state, so nothing jumps.
- **Failure view:** each step has a second state, reached with a toggle button, opened under a red Subtitle.
- **Stepping:** the main button reads "Start: Knopf drücken", then "Weiter zu Schritt N: [step sentence]", and "Nochmal von vorn" at the end. Tabs, step headings and buttons use the same short names: subject plus verb, such as "Chip sendet". Each press plays one step once and holds its last frame. Nothing advances on its own except "Ganzen Ablauf ansehen", which plays all steps with a one second pause and stops on "Anhalten" or any other control. Nothing plays on load: a step named in the address shows its last frame at once.
- **Slope scene:** a flat illustration that follows the view. At night it is drawn in the book's planes: a Night sky, mountain layers from Night Plane to Plane Hover with Haze peaks, a faint snow piste, Night firs, a Haze ropeway, the server house with its rack, the receiver at the gondola station. By day the landscape takes its own fixed fills: sky #dbe8f3, far mountains #b4c5d6, snow caps #ffffff, ridges #9cb0c4, slope #ffffff, firs #2f4b5c, house walls #cfd9e3, roofs #3b4c5e, doors, rack slots, phone and legs #2c3b4a. Accent waves, the red chip and diamond, labels and the message bubble follow the tokens in both views. Labels are bold Snow text with a 5px Night halo (enlarged to 30px with an 8px halo below 600px), not boxed tags. Signal exists only while something is sent: radio as turquoise wave arcs growing toward the target, cable as a turquoise pulse. Red stays on the guest's chip, the staff message and the failure diamond. With reduced motion each step shows its final frame.
- **Deep links:** every step and failure view has a shareable address.
- **Without JavaScript:** all steps and failure views are shown in sequence.

### Print
`assets/druck.css` loads with `media="print"` only. It swaps the tokens for its own light palette (white ground, dark blue ink, a darkened accent and red), drops the head band, hides the side lists, beacon line, view toggle and controls, shows every walkthrough step and the `nur-ohne-js` tables instead of calculators, and prints source URLs.

## Do's and Don'ts

### Do:
- **Do** assemble every chapter from the Chapter Page steps, and let it rest only on chapters before it.
- **Do** keep running text at 68ch, and let only wide material take the full main column.
- **Do** use the tokens in this file for every value; a new chapter should add no colour, size or radius.
- **Do** mark every statement of certainty with its status mark and its word, and keep estimates labelled as estimates until measured.
- **Do** separate things with tone: Night, Night Plane, Upper Plane, in that order of height.
- **Do** give tables a named first column in Snow and let the other cells step down to Pale Snow.
- **Do** use condensed Archivo for navigation and labels and wide Archivo for announcements.
- **Do** keep 2px turquoise focus outlines on everything interactive.
- **Do** honour reduced motion: smooth scrolling off and the scene at its end state.
- **Do** check every new value in both views; a colour exists only as a token with a night and a day value.
- **Do** draw every graphic for both views, and describe its colours in text only as "blaugrün", "rot", or by shape or fill.
- **Do** keep unwritten chapters visible but unlinked in the chapter list.

### Don't:
- **Don't** add a second accent colour. Turquoise by night and petrol by day are the one accent.
- **Don't** use red for emphasis, decoration or anything that is not an emergency, a failure or an open point.
- **Don't** put texture, pictures, silhouettes, gradients or glows into the chapter head, or anywhere outside the drawings that explain something.
- **Don't** add cast shadows or blur; depth is tone.
- **Don't** put a frame around a container. Use a plane; Hairlines are for rows and edges only.
- **Don't** tell status by colour alone, or show a mark without its word or label.
- **Don't** add fades, slides or hover transitions. States change instantly; only the slope scene moves. The head is still.
- **Don't** put a small label directly above a heading. The stand line goes below the chapter title, and sections have none.
- **Don't** set uppercase or positive letter-spacing.
- **Don't** use glyph or font icons; marks, dots and chevrons are drawn.
- **Don't** give a plane any radius other than `--rundung`, or a control any radius other than the 6px control corner.
- **Don't** stage photos or invent measurements. Until real ones exist, the slope scene, the relief map and the marks are the book's picture language.

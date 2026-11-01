---
name: SkiTag Netzwerk-Buch
description: The written account of one emergency call, told along a ropeway at blue hour.
colors:
  dunkel: "#13233a"
  flaeche: "#1c3350"
  flaeche-hell: "#27425f"
  flaeche-hover: "#33527a"
  schnee: "#eaf0f5"
  dunst: "#bccad8"
  licht: "#f2b544"
  licht-hover: "#ffc964"
  notruf: "#ff7d70"
typography:
  display:
    fontFamily: "Barlow Semi Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(2.5rem, 5vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.05
  headline:
    fontFamily: "Barlow Semi Condensed, Arial Narrow, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1.15
  title:
    fontFamily: "Barlow Semi Condensed, Arial Narrow, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.2
  title-status:
    fontFamily: "Barlow Semi Condensed, Arial Narrow, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.2
  subtitle:
    fontFamily: "Barlow Semi Condensed, Arial Narrow, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.2
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
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.45
  label-station:
    fontFamily: "Barlow Semi Condensed, Arial Narrow, sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.2
  label:
    fontFamily: "Barlow Semi Condensed, Arial Narrow, sans-serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: 1.3
  label-strong:
    fontFamily: "Barlow Semi Condensed, Arial Narrow, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.25
  label-nav:
    fontFamily: "Barlow Semi Condensed, Arial Narrow, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.3
rounded:
  fokus: "2px"
  knopf: "3px"
  voll: "50%"
spacing:
  eng: "6px"
  inline: "10px"
  absatz: "14px"
  anschluss: "18px"
  rand: "24px"
  spalte: "32px"
  abschnitt-schmal: "48px"
  abschnitt: "64px"
  kapitelende: "72px"
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
    backgroundColor: "{colors.flaeche-hell}"
    textColor: "{colors.schnee}"
    typography: "{typography.label-strong}"
    rounded: "{rounded.knopf}"
    padding: "9px 16px"
  button-secondary-hover:
    backgroundColor: "{colors.flaeche-hover}"
  button-toggle-on:
    backgroundColor: "{colors.schnee}"
    textColor: "{colors.dunkel}"
  tab:
    backgroundColor: "{colors.flaeche-hell}"
    textColor: "{colors.schnee}"
    typography: "{typography.label}"
    padding: "12px 16px"
  tab-selected:
    backgroundColor: "{colors.flaeche}"
    textColor: "{colors.licht}"
  table-header:
    backgroundColor: "{colors.flaeche-hell}"
    textColor: "{colors.schnee}"
    typography: "{typography.label-strong}"
    padding: "11px 14px"
  table-cell:
    backgroundColor: "{colors.flaeche}"
    textColor: "{colors.schnee}"
    typography: "{typography.body-table}"
    padding: "11px 14px"
  status-panel:
    backgroundColor: "{colors.flaeche}"
    textColor: "{colors.schnee}"
    padding: "18px 20px"
  rope-band:
    backgroundColor: "{colors.flaeche}"
    textColor: "{colors.schnee}"
    height: "176px"
---

# Design System: SkiTag Netzwerk-Buch

## Overview

**Creative North Star: "Blue Hour on a Ropeway"**

One rope runs through the whole book: chip, receiver, server, app. It hangs across the top of every chapter page, a single line sagging between four stations, with one lit cabin parked at the place the chapter is about. The page below is the dusk around it: twilight blue that never reaches black, snow white text, and the warm light of the cabin as the only thing that glows. A reader always knows where a topic sits on the signal path, because the path never leaves the screen.

The system is built for reading first. Density is that of a well-set reference book: a 68-character column at a comfortable 18px, side lists in a tighter condensed face, and wide material (tables, status, the walkthrough) stepping out of the column only when it needs the width. Depth comes from three flat tonal planes, and status comes from shape, so the difference between fixed, decided, estimated and open survives without colour.

Chapters and page contents sit left and right of the text, and they stay quiet. The rope is the orientation; the side lists only serve it. The system refuses the dark docs template in which sidebar, text and a glowing blue accent are the whole idea.

**Key Characteristics:**
- Twilight blue ground in three flat tonal steps, never black.
- One accent, cabin amber, meaning "here" and "act here".
- Signal red reserved for emergency, failure and open points.
- A rope band on every page, with the cabin at the chapter's station.
- Status told by form: filled, ringed, dashed, diamond.
- Instant state changes; only the cabin and the walkthrough's slope scene move.
- German text, self-hosted fonts, no build step.

## Colors

A dusk palette: blue neutrals close together in value, one warm light, one warning.

### Primary
- **Cabin Amber** (#f2b544, `licht`): the lit cabin and its hanger, the current station, the current chapter and section, text links, the selected walkthrough tab, focus rings, text selection and the text caret. Lifts to Bright Amber (#ffc964, `licht-hover`) only as the hover of the main button.

### Secondary
- **Signal Red** (#ff7d70, `notruf`): a disturbed station, failure headings in the walkthrough, the heading of the open-points panel, the inline open mark. It is a signal, not a second accent.

### Neutral
- **Deep Twilight** (#13233a, `dunkel`): the page ground, and the text colour on amber and on snow fills.
- **Twilight Plane** (#1c3350, `flaeche`): the first raised plane: rope band, table bodies, status panels, walkthrough body, collapsed folds.
- **Upper Plane** (#27425f, `flaeche-hell`): the second raised plane: table headers, the walkthrough tab strip, secondary buttons, the hairline between table rows, scrollbar thumb.
- **Upper Plane Hover** (#33527a, `flaeche-hover`): hover of secondary buttons only. It is a state, not a fourth plane.
- **Snow** (#eaf0f5, `schnee`): body text, headings, the idle rope stations, and the fill of a switched-on toggle.
- **Haze** (#bccad8, `dunst`): the rope itself, side-list links, the chapter stamp line and the page-turn line.

### Named Rules

**The Never Black Rule.** The darkest colour in the book is Deep Twilight. Nothing is darker, and there is no pure black anywhere, including text on amber.

**The One Cabin Rule.** Amber is the only accent. If something is amber, it is where the reader is or what the reader can act on. A second accent hue is not available.

**The Signal Rule.** Red marks an emergency, a failure or an open point, and nothing else. It never decorates, and it never marks plain importance.

**The Red Stays Low Rule.** Red text sits on Deep Twilight (6.33:1) or the Twilight Plane (5.14:1). On the Upper Plane it falls to 4.15:1, so red text never goes there.

## Typography

**Display Font:** Barlow Semi Condensed (with Arial Narrow, sans-serif), self-hosted in weights 500 and 700
**Body Font:** Source Sans 3 (with Segoe UI, sans-serif), self-hosted in weights 400 and 600

**Character:** Barlow Semi Condensed has the upright, compact voice of station signage and carries everything the reader navigates by. Source Sans 3 is open and patient, and carries everything the reader reads.

### Hierarchy
- **Display** (700, fluid between 2.5rem and 3.75rem, 1.05, balanced wrap): the chapter title. One per page.
- **Headline** (700, 34px, 1.15, balanced wrap; 30px at phone width): chapter sections. Each one has an id and appears in the page contents.
- **Title** (700, 26px, 1.2): walkthrough step headings; the book name in the rope band uses the same setting.
- **Title Status** (700, 22px, 1.2): status panel headings, with the mark beside them.
- **Subtitle** (700, 20px, 1.2): failure headings inside the walkthrough.
- **Lead** (400, 21px, 1.55; 19px at phone width): the single opening paragraph of a chapter.
- **Body** (400, 18px, 1.65; 17px at phone width): reading text, held to 68ch.
- **Body Table** (400, 17px, 1.45): table cells.
- **Label Station** (500, 18px, 1.2; 15px at phone width): station names on the rope. The current one goes to 700.
- **Label** (500, 17px, 1.3): the stamp line under the title and walkthrough tabs (tabs tighten to 1.2). The page-turn line uses the same voice at 18px.
- **Label Strong** (700, 17px, 1.25): table headers and buttons (buttons tighten to 1.2).
- **Label Nav** (500, 16px, 1.3): chapter list and page contents, with tabular numerals on chapter numbers. The current entry goes to 700.

No letter-spacing and no uppercase are set anywhere.

### Named Rules

**The Two Voices Rule.** Barlow navigates, Source Sans reads. Headings, labels, tabs, table headers, buttons and side lists are Barlow. Anything a reader reads as a sentence is Source Sans.

**The Measure Rule.** Running text never exceeds 68ch, even where the column is wider. Only tables, status panels and the walkthrough take the full column.

## Layout

The page is a rope band above a three-column book: chapters (250px), reading column (fluid), page contents (230px), with a 32px gap, inside a 1360px maximum and 24px page margins. Top padding is 44px, bottom padding 96px. Both side lists stick below the rope and scroll on their own if they overflow.

The rope band is 176px tall and scrolls up by its top row until only the 112px rope strip stays stuck, so the rope is always on screen. Anchors land 24px below it.

The vertical rhythm is built from a short set of steps: 64px before a section heading, 18px from text to the wide object it introduces, 14px between paragraphs, 10px between inline neighbours such as buttons and a mark and its heading, 6px between stacked status panels, so the page ground shows through as the divider. Inside the walkthrough, panels hold a 24px inset. The chapter ends with a 72px gap before the page-turn line.

**Below 1180px** the page contents leave the right edge and become a fold at the top of the main column; the chapter list narrows to 220px.

**Below 820px** the book is a single column with 16px side margins. The rope strip becomes 100px and is the whole band, because the book name is hidden. Chapters and page contents fold together into one panel above the title, closed by default. Section spacing tightens to 48px, the walkthrough inset to 16px, table cells to 9px by 10px, and the walkthrough tabs spread across the width.

### Named Rules

**The Rope Stays Rule.** The rope strip is on screen at every scroll position, at every width. No chapter hides, replaces or re-routes it.

## Elevation & Depth

There is no elevation. Depth is three flat tonal planes stacked by value: Deep Twilight, Twilight Plane, Upper Plane, each about 1.2:1 against the next. A raised thing is simply a lighter blue. The one `box-shadow` in the build is inset, and it paints the cabin's window; it is drawing, not depth.

### Named Rules

**The Flat Dusk Rule.** No cast shadows, no glows, no gradients, no blur. If two things need separating, put them on different planes.

**The Plane Before Line Rule.** Containers are separated by tone, not frames. The one structural line is the 1px Upper Plane hairline between table rows; the rope, station rings, status marks and focus rings are figures and states, not frames.

## Shapes

Corners are almost absent. Planes (band, panels, tables, tab strip) are square. Buttons take a barely softened corner (3px), focus outlines 2px. Roundness is kept for the world's own objects: the circular stations, and the cabin (3px at the top, 5px at the bottom).

The status marks are the system's silhouette vocabulary, drawn on a 16-unit grid with a 2-unit stroke:

- **Fest** (fixed): a filled disc.
- **Entschieden** (decided): a ring with a filled core.
- **Geschätzt** (estimated): a dashed ring.
- **Offen** (open): a diamond outline.

A disturbed station turns from circle to diamond, the same shape as Offen, so one silhouette carries one meaning across rope and text.

### Named Rules

**The Status As Form Rule.** Certainty is told by shape and always with its word beside it. Only Offen also changes colour; the other three stay in the text colour.

## Components

Quiet, square and signage-like. Controls read as labels on a plane until they are hovered or current.

### Rope Band

The signature of the book, present on every chapter page.

- **Structure:** Twilight Plane band with the book name top left and the rope strip below. The rope is a 2px Haze line in three sagging spans that climb from left to right, keeping its stroke width at any page width.
- **Stations:** the six steps of an emergency call: 1. Knopf drücken, 2. Chip sendet, 3. Gateway leitet weiter, 4. Server entscheidet, 5. Mitarbeiter wird alarmiert, 6. Bestätigung kommt zurück, spread from 6% to 94% across, with more room before the last station for its long label. Each is a label above an 18px ring (15px at phone width), with a Twilight Plane fill and a 2px Snow border. They link to the matching step of the Chapter 1 walkthrough. Below 1280px the rope shows numbers only, and the name sits in the tab. The first and last labels align inward so they stay on screen.
- **Hover:** the ring turns amber.
- **Current:** name and ring turn amber, and the name goes to weight 700.
- **Cabin:** a 36px by 22px amber cabin (30px by 19px at phone width) on a 2px hanger, with a Twilight Plane window, hanging under the rope at the current station.
- **Disturbed:** the station turns red and its ring becomes a diamond with a 3px border. The rope from that station onward becomes a dotted Haze line at 55% opacity.
- **Progress:** every span behind the current station turns amber, so the rope shows how far the call has come.
- **Motion:** the cabin travels along the rope in 900ms, ease-out cubic. With reduced motion it jumps.

### Chapter Page

Every chapter is assembled the same way, so a new chapter needs no layout decisions.

1. **Rope position:** set the page's station (`data-station` on the body) to the station the chapter is about: `knopf`, `chip`, `empfaenger`, `server`, `app` or `rueckweg`. An unset or unknown value parks the cabin at the first station.
2. **Chapter list:** add the file name to the chapter's entry in the shared list in `book.js`. That turns it from a muted, unlinked entry into a link.
3. **Heading block:** the title, then the stamp line in the form "Kapitel N · Stand [date]", below the title and never above it.
4. **Opening:** one Lead paragraph in the reading column, then Body.
5. **Sections:** each section heading has an `id`, and a short `data-kurz` label when the heading is long. The page contents build themselves from these.
6. **Wide material:** tables, status panels and walkthroughs sit outside the reading column; everything else stays inside it.
7. **Ending:** the page-turn line in Haze.
8. **Versions:** links to CSS and JS carry `?v=N`. Raise N on every change to those files, because GitHub Pages lets browsers keep old copies for ten minutes and a new page with an old script breaks.

### Buttons
- **Shape:** barely softened corners (3px), 9px by 16px padding, no border.
- **Primary:** Cabin Amber fill with Deep Twilight text. One per control group, for the main action.
- **Secondary:** Upper Plane fill with Snow text.
- **Toggle on:** Snow fill with Deep Twilight text, for a switched mode such as the failure view.
- **Hover / Focus:** an instant fill change to the hover tone; 2px amber outline at 2px offset.
- **Disabled:** 50% opacity, default cursor.

### Tabs
- **Style:** a strip on the Upper Plane attached to the top of its panel, Label type, 12px by 16px padding, no gaps.
- **Selected:** takes the panel's Twilight Plane fill, so it merges with the panel, in amber at weight 700.
- **Hover / Focus:** amber text; 2px amber outline inset by 2px.

### Start Page

`docs/index.html` is the book's front door: the rope band and page contents stay, the chapter list is hidden because the page itself is the contents. Title, stamp line, lead, one main button, the system diagram, the status legend, then the chapters in thematic groups. Each chapter is one row on the Twilight Plane with number, title link, one sentence and the status mark that prevails in it. Rows, not cards. The page is static HTML, so it works without JavaScript.

### Diagram

A static inline SVG on the Twilight Plane with a caption, built from zones in Deep Twilight, boxes on the Upper Plane, Barlow labels at 16, 17 and 20px and 2px Haze lines. An amber line is the path of an emergency call. Red appears only as the Offen mark and its text, and red text never sits on the Upper Plane. Anything that is only a proposal carries the Offen mark. Below 820px the drawing keeps a 720px width and scrolls inside its own wrapper, with a hint in the caption.

### Calculator

A Twilight Plane panel with a labelled range input, a Deep Twilight drawing, four values in Title weight with tabular numerals and one plain sentence on what the setting means. It updates instantly. Without JavaScript a small table stands in, marked `nur-ohne-js`.

### Packet Plan

A Twilight Plane panel: a switch between packets, a wrapping row of field buttons grown by byte size, and one explanation area. Readable fields sit on Deep Twilight, encrypted ones on the Upper Plane, the selected one turns amber. Without JavaScript a table stands in.

### Guide

A how-to chapter uses numbered stages as sections, command blocks on the Twilight Plane and a Checklist panel whose ticks stay in the browser. Commands are shown only when a source confirms them.

### Status Panels

- **Style:** a stack of square Twilight Plane panels with 18px by 20px padding, 6px apart, in the fixed order Fest, Entschieden, Geschätzt, Offen.
- **Heading:** Title Status with a 20px mark beside it. The Offen heading and its mark are red.
- **Table status:** a Stand column with a 16px mark beside its word, in Label Strong. The Offen row turns mark and word red.
- **Inline mark:** a 16px Offen mark at the start of a paragraph, red, labelled for screen readers as "Offen". It is built for Offen only.

### Tables
- **Style:** full column width on the Twilight Plane, Upper Plane header row, Label Strong headers, left-aligned and top-aligned cells, 11px by 14px padding, hairlines between body rows.
- **Overflow:** the table scrolls horizontally inside its own wrapper.
- **Stacked tables:** wide tables with three text columns carry `stapel`. At phone width each row becomes a block, with `data-spalte` naming a cell's column where the reader needs it.

### Navigation
- **Chapter list:** Label Nav in Haze with a 26px number column. Current chapter in amber at 700. Unwritten chapters stay listed at 78% opacity, as text, not links.
- **Page contents:** a small "Auf dieser Seite" heading in Snow, Haze links, Snow on hover, amber at 700 for the section in view.
- **Text links:** amber, 1px underline with 3px offset, 2px underline on hover.
- **Folds:** at narrower widths both lists move into Twilight Plane folds, as described under Layout.

### Emergency Walkthrough

The signature interaction of Chapter 1: one emergency call stepped through along the rope.

- **Structure:** Upper Plane tab strip, slope scene, control row, then one Twilight Plane panel per step. The controls sit directly under the scene, and a press scrolls the tabs and scene fully into view. The panel keeps the height of its tallest state, so nothing jumps between steps.
- **Failure view:** each step has a second state, reached with a toggle button, opened under a red Subtitle.
- **Rope link:** every step moves the cabin one station on; the failure view disturbs the station.
- **Stepping:** the main button reads "Start: Knopf drücken", then "Weiter zu Schritt N: [step sentence]", and "Nochmal von vorn" at the end, which returns to the start. Tabs, rope stations, step headings and buttons all use the same short step names: subject plus verb, such as "Chip sendet". Each press plays one step once and holds its last frame. Nothing advances on its own except through the "Ganzen Ablauf ansehen" button, which plays all six steps with a one second pause between them and stops on "Anhalten" or any other control. Nothing plays on page load: a step named in the address shows its last frame at once.
- **Slope scene:** a flat illustration above the text in the book's tones: mountain layers, a valley with the server house and its rack, a slope with piste, firs and ropeway, and the receiver at the gondola station. Labels are Deep Twilight tags. Signal exists only while something is sent: radio travels as a group of amber wave arcs that grow toward the target, cable travels as an amber pulse along the line. Scene steps run for 1.3 to 4 seconds, and the emergency red stays on the guest, the staff message and the failure diamond. With reduced motion each step shows its final frame.
- **Deep links:** every step and failure view has a shareable address.
- **Without JavaScript:** all steps and failure views are simply shown in sequence.

The script is wired to these five steps and exists once per page. A later chapter should show its own sequence with this same grammar rather than load this script as is.

## Do's and Don'ts

### Do:
- **Do** assemble every chapter from the Chapter Page steps, and set its station so the cabin sits where the topic sits.
- **Do** keep running text at 68ch, and let only tables, status panels and walkthroughs take the full column.
- **Do** use the tokens in this file for every value; a new chapter should add no colour, size or radius.
- **Do** mark every statement of certainty with its status mark and its word, and keep estimates labelled as estimates until measured.
- **Do** separate things with tone: Deep Twilight, Twilight Plane, Upper Plane, in that order of height.
- **Do** keep 2px amber focus outlines on everything interactive.
- **Do** honour reduced motion: the cabin jumps, and smooth scrolling is off.
- **Do** keep unwritten chapters visible but unlinked in the chapter list.

### Don't:
- **Don't** add a second accent colour or any glowing blue. Amber is the only accent.
- **Don't** use red for emphasis, decoration or anything that is not an emergency, a failure or an open point.
- **Don't** use pure black, cast shadows, glows, gradients or blur.
- **Don't** put a frame around a container. Use a plane. Table row hairlines stay; they are the single exception.
- **Don't** let the side lists become the orientation. They serve the rope, and a page without the rope band is not a book page.
- **Don't** tell status by colour alone, or show a mark without its word or label.
- **Don't** add fades, slides or hover transitions. States change instantly; the cabin and the walkthrough's slope scene are what move, along with smooth anchor scrolling.
- **Don't** put a small label above a heading. The stamp line goes below the chapter title, and sections have none.
- **Don't** set uppercase or letter-spaced labels.
- **Don't** round planes, or give a control any radius other than the button corner.
- **Don't** stage photos or invent measurements. Until real ones exist, the rope and the marks are the book's picture language.

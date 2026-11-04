---
name: SkiTag Website
description: Neuschnee. The rental chip shown like an object on fresh snow on a bright morning.
colors:
  snow-canvas: "#f4f8fb"
  snow-surface: "#ffffff"
  glacier-drift: "#eef3f8"
  slate-ink: "#1b2430"
  slate-ink-hover: "#2c3a4c"
  slate-soft: "#4a586a"
  drawing-label-ink: "#3d4b5c"
  line-slate: "#5d6f84"
  terrain-blue: "#8fa3b8"
  cold-shadow: "#a9bfd6"
  hairline-blue: "#c7d4e2"
  glacier-ice: "#dde7f1"
  cast-shadow-core: "rgba(122, 152, 186, 0.55)"
  cast-shadow: "rgba(122, 152, 186, 0.45)"
  emergency-red: "#d83a2c"
  mask-opaque: "#000"
  mask-fade: "rgba(0,0,0,0.55)"
typography:
  display:
    fontFamily: "Funnel Display, Funnel Sans, system-ui, sans-serif"
    fontSize: "clamp(2.7rem, 1.4rem + 5.6vw, 6rem)"
    fontWeight: 560
    lineHeight: 0.94
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Funnel Display, Funnel Sans, system-ui, sans-serif"
    fontSize: "clamp(2.8rem, 1.9rem + 4.2vw, 5rem)"
    fontWeight: 560
    lineHeight: 0.94
    letterSpacing: "-0.035em"
  headline-sm:
    fontFamily: "Funnel Display, Funnel Sans, system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 1.6rem + 2.4vw, 3.4rem)"
    fontWeight: 480
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Funnel Display, Funnel Sans, system-ui, sans-serif"
    fontSize: "clamp(1.2rem, 1.1rem + 0.5vw, 1.5rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  lede:
    fontFamily: "Funnel Sans, system-ui, sans-serif"
    fontSize: "clamp(1.2rem, 1.1rem + 0.5vw, 1.5rem)"
    fontWeight: 400
    lineHeight: 1.4
  body:
    fontFamily: "Funnel Sans, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.96rem + 0.22vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.62
  label:
    fontFamily: "Funnel Sans, system-ui, sans-serif"
    fontSize: "clamp(0.875rem, 0.84rem + 0.18vw, 0.95rem)"
    fontWeight: 400
    lineHeight: 1.45
  caption:
    fontFamily: "Funnel Sans, system-ui, sans-serif"
    fontSize: "clamp(0.75rem, 0.72rem + 0.15vw, 0.82rem)"
    fontWeight: 400
    letterSpacing: "0.02em"
rounded:
  plane: "14px"
  pill: "999px"
  circle: "50%"
spacing:
  sc-1: "0.25rem"
  sc-2: "0.5rem"
  sc-3: "0.75rem"
  sc-4: "1rem"
  sc-5: "1.5rem"
  sc-6: "2rem"
  sc-7: "3rem"
  sc-8: "4rem"
  sc-9: "6rem"
  gutter: "clamp(1.25rem, 5vw, 5.5rem)"
  maxw: "82rem"
components:
  button-primary:
    backgroundColor: "{colors.slate-ink}"
    textColor: "{colors.snow-surface}"
    rounded: "{rounded.pill}"
    padding: "0 1.25rem"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "{colors.slate-ink-hover}"
  button-secondary:
    backgroundColor: "{colors.snow-surface}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.pill}"
    padding: "0 1.1rem"
    height: "2.75rem"
  button-back-to-top:
    backgroundColor: "{colors.slate-ink}"
    textColor: "{colors.snow-surface}"
    rounded: "{rounded.circle}"
    size: "3rem"
  button-back-to-top-hover:
    backgroundColor: "{colors.slate-ink-hover}"
  demo-badge:
    backgroundColor: "{colors.snow-surface}"
    textColor: "{colors.slate-soft}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "0.2rem 0.65rem"
  footer:
    textColor: "{colors.slate-soft}"
    typography: "{typography.caption}"
    padding: "2rem clamp(1.25rem, 5vw, 5.5rem)"
---

# Design System: SkiTag Website

## Overview

**Creative North Star: "Neuschnee"**

The page is a bright winter morning. High-key snow white and pale glacier blue carry every surface; the only dark is slate ink, used for words, line drawings and the one action. Objects (the chip, the receiver, the charging drawer) stand on that snow as flat line drawings with a cold blue cast shadow underneath, the way a thing lies on fresh powder. Mountain footage (Mixkit stock) is scrubbed by scroll and dissolves downward into the white ground through a mask, never a drawn edge; falling snow on a canvas is the atmosphere of the first viewport.

Density is low and the air is generous. Each act of the scroll does one thing: a centred headline in the sky, staggered lines of doubt, a held button and a signal path, a photo with a rule list, a horizontal rail of objects, then the team with a plan. The page is an introduction only: it ends with the team act and a plain footer, and has no rental or purchase surface. Honesty is a visual element: placeholders are labelled in a small caption directly under the thing they stand for, and the interactive demo carries a pill that says it is a demonstration.

The world refuses the dark gadget page with a glowing device and three feature cards. Colour is not decoration here: there is no accent hue at all, only ink-dark for action and a single emergency red that belongs to the alarm.

The scroll mechanism is the ScrollCraft engine (`scrollcraft.css`/`.js`, unchanged). This system is the set of overrides of its `--sc-*` tokens plus the page's own tokens and classes in `seite.css`; the engine's spacing and type scales are inherited as they are.

**Key Characteristics:**
- High-key snow grounds, slate ink, no accent hue.
- Emergency red appears only where the emergency itself is shown.
- Objects as flat slate line drawings standing on a ground line with a blurred cold blue shadow.
- Footage masked into the white ground; snowfall as atmosphere, removed under reduced motion.
- Soft, blue-tinted, offset shadows; hairlines in shadow blue.
- Every placeholder labelled where it stands.

## Colors

A cold, high-key palette: whites tinted toward glacier blue, one deep slate ink, and red held in reserve.

### Primary
- **Slate Ink** (`slate-ink`): headlines, body emphasis, the dark pill action, the back-to-top circle, the hold-button ring as it fills, the signal path in the drawing, plan-timeline dot outlines, selection highlight and focus outlines. The engine accent (`--sc-accent`) is set to this same ink, so "accent" means dark, never a hue.
- **Slate Ink Hover** (`slate-ink-hover`): the dark pill and the back-to-top circle under a fine pointer.

### Neutral
- **Snow Canvas** (`snow-canvas`): the page ground, the first viewport's sky and the team act; also the tint of the hero scrim that keeps the headline legible over footage.
- **Snow Surface** (`snow-surface`): the scrolled header bar, secondary buttons, the demo badge, line-drawing fills, arrow and text on ink.
- **Glacier Drift** (`glacier-drift`): the cooler section drift on the group act and the low end of the hero gradient.
- **Slate Soft** (`slate-soft`): body copy (`.sc-body`), definition keys, captions, the stage line, the footer. Darker than the contract's #4f5d6e; the build value stands.
- **Drawing Label Ink** (`drawing-label-ink`): the small labels inside the signal drawing and the text on the staff phone. A step lighter than slate ink so labels read as part of the drawing, still well above body contrast on white.
- **Line Slate** (`line-slate`): strokes of the object line drawings and the return path in the signal drawing.
- **Terrain Blue** (`terrain-blue`): near terrain lines, lift cable.
- **Cold Shadow** (`cold-shadow`): ground lines under objects, dashed placeholder borders, the soft outer stop of the hero chip's cast shadow. The engine shadow hue is the same family (`--sc-shadow-color: 211 38% 52%`).
- **Cast Shadow** (`cast-shadow`) and **Cast Shadow Core** (`cast-shadow-core`): the translucent centre of the radial ground cast, the same cold hue at 45% under rail objects and 55% under the larger hero chip. Used only inside the cast ellipse.
- **Hairline Blue** (`hairline-blue`): every 1px divider and control border: header bottom edge, group rule list, plan rule, footer top edge, secondary-button and badge borders.
- **Glacier Ice** (`glacier-ice`): the empty track of the hold-button ring.

### Tertiary
- **Emergency Red** (`emergency-red`): the alarm only. The chip LED while the button is held, the ring during the five-second cancel window, the red point and "NOTRUF" on the staff phone in the signal drawing, the alarm point on the phone object in the system rail.

### Mask Stops (not paint)
- **Mask Opaque** (`mask-opaque`) and **Mask Fade** (`mask-fade`): luminance/alpha stops in the `mask-image` gradient that dissolves the hero footage into the snow ground. They never render as colour; nothing on the page is painted black.

### Named Rules
**The No Accent Rule.** There is no brand hue. Action is slate ink on snow; nothing is turquoise, blue-filled or gradient-lit.

**The Red Is The Alarm Rule.** Emergency red marks the emergency and nothing else: not links, not errors, not prices, not decoration. If a surface does not depict an emergency call, it has no red.

## Typography

**Display Font:** Funnel Display (with Funnel Sans, system-ui)
**Body Font:** Funnel Sans (with system-ui)

**Character:** One family in two cuts. The display cut is wide-shouldered and tightly tracked at mid weights (480 to 640), so headlines read crisp and calm rather than loud; the text cut stays plain and open. Both are self-hosted woff2 variable files (300 to 800) in `site/assets/fonts`.

### Hierarchy
- **Display** (560, fluid up to 6rem, 0.94): the single hero headline, centred in the sky.
- **Headline** (560, the engine's 3xl step up to 5rem, 0.94): act titles, short sentences ending in a full stop ("Das sind wir."), held to 11 to 14ch.
- **Headline Small** (480 to 520, 2xl step): the staggered doubt lines, the second hero line, mobile act titles. A 600 weight at up to 9rem is used once for the single word that closes the doubt act.
- **Title** (600, lg step, -0.02em): object names, team first names (2xl), plan dates, rule terms.
- **Lede** (400, lg step, 1.4): the sentence under the hero headline, max 34ch, balanced.
- **Body** (400, base step, 1.62): running copy in slate soft, measure 62ch.
- **Label** (400, sm step): definition-list keys, the stage line, status lines, the honesty paragraph, button text (560 dark, 520 light).
- **Caption** (400, xs step, +0.02em): placeholder notes, footer, demo badge.

### Named Rules
**The Mid-Weight Rule.** Display weights stay between 480 and 640; hierarchy comes from size and tracking, never from 800-weight shouting.

**The Sentence Headline Rule.** Headlines are short declarative German sentences with a full stop. No kicker or eyebrow above them.

## Layout

ScrollCraft acts carry the structure: scrubbed (`scrub`) for the hero footage, pinned (`pin`) for the hold-button act, horizontal pan (`pan`) for the system rail, and plain flow for prose acts (doubt, group, team). Each act sets a `data-sc-drift` background between snow canvas, white and glacier drift, so the ground shifts by a shade, never by a contrast block. The last act is the team; the footer sits after `<main>`, outside the acts, on the page ground.

Content sits inside the engine container (max 82rem) with a fluid gutter. Two-column acts use asymmetric or even grids (0.9fr / 1.25fr for button and drawing, 1fr / 1fr for group photo and text and for the team heading and its sentence) and collapse to one column at 860px, where the drawing moves above the button. The doubt act staggers its lines with growing left indents (up to 8rem and 16rem) and then leaves a tall empty pause before the closing word. The plan runs as four columns on a hairline, two on phones. Spacing uses the engine scale (`sc-1` to `sc-9`); section padding is fluid (about 3 to 6rem top on flow acts).

Fixed chrome is the header bar at the top and the back-to-top circle at the bottom right (inset clamp(1rem, 3vw, 2rem), respecting the safe area). Anchored targets under the fixed header carry a scroll margin (the team heading: 9rem). Below 860px the footer gets extra bottom padding (5.5rem) so the back-to-top circle never covers its text.

**The Air Rule.** One idea per viewport. If an act needs a second idea, it gets its own scroll distance rather than a denser grid.

## Elevation & Depth

Depth is real but soft: layered, offset, blurred shadows tinted with the cold shadow hue, at half the density of the engine defaults. Objects that stand on the ground get a separate radial cast shadow (an ellipse under the object), not a box shadow.

### Shadow Vocabulary
- **Low** (`--sc-e1`): the dark pill button.
- **Mid** (`--sc-e2`): the floating back-to-top circle.
- **High** (`--sc-e3`): the group photo.
- **Ground cast**: radial ellipse under the hero chip (cast shadow core fading through cold shadow) and under each rail object (cast shadow to transparent).

### Named Rules
**The Cold Shadow Rule.** Shadows are blue, never black or grey, and they fall downward with blur. Hard offset shadows do not exist in this world.

**The Standing Object Rule.** A thing on the page stands on a ground: a 1.5px cold-shadow line and a blurred ellipse beneath it.

## Shapes

Gently rounded planes (14px) for photos and placeholder panels. Every action and badge is a full pill; the back-to-top button and the plan-timeline dots are full circles. The hold button is a soft squircle (30% radius) echoing the chip body, and object line drawings use rounded caps and joins at 1.6px. Placeholders that stand for missing photos use a 1.5px dashed cold-shadow border on a white-to-glacier gradient.

## Components

### Buttons
Quiet and solid; one dark action per view.
- **Shape:** full pill, min height 2.75rem.
- **Primary:** slate ink fill, white text at 560, Low shadow. The header pill "Das sind wir" is a link to the team heading.
- **Hover / Active:** hover to slate ink hover on fine pointers only; press nudges 1px down and scales to 0.98.
- **Secondary:** white pill with a hairline border; hover darkens the border to ink. Used for "Abbrechen" and "Nochmal" in the demo.

### Back to Top
A 3rem slate-ink circle fixed bottom right with a white arrow-up stroke icon (1.25rem, 2px round stroke) and the Mid shadow. Hidden until the visitor has scrolled past 1.2 viewports, then fades in and slides up 0.5rem over the base duration. Hover goes to slate ink hover, press scales to 0.96, focus shows a 2px ink outline at 3px offset. Activation scrolls smoothly to the top (instantly under reduced motion, where only a 160ms opacity fade remains) and moves focus to the wordmark.

### Navigation
A fixed bar with the wordmark (display cut at 640, chip glyph) left and the single "Das sind wir" dark pill right. Transparent over the hero; once scrolled it turns white with a 1px hairline bottom edge.

### Footer
Plain and outside the acts: a hairline top edge, caption-size slate-soft text and links in a wrapping row (company placeholder left, legal placeholders, book link and stock credit right), within the 82rem container.

### Hold Button (signature)
A large squircle drawing of the chip. Holding it for three seconds (pointer, touch or Space) fills an ink ring over a glacier-ice track; the five-second cancel window turns the ring and LED red; then the signal path draws itself across a slate line drawing of the slope (dotted for radio, solid for cable and internet) to a staff phone showing the red point. Scroll alone drives the same path. A "Vorführung" caption pill marks it as a demonstration.

### Object on the Ground
Rail item: a line drawing standing on the ground line with its cast ellipse, a placeholder caption under it, then a title and a Was/Stand definition list. Items fade from 55% to full opacity as the pan reaches them.

### Placeholder Caption
Caption-size slate-soft text directly beneath the object it stands in for ("Platzhalter: Foto folgt"). Every placeholder carries one.

## Do's and Don'ts

### Do:
- **Do** keep every ground in the snow family (`snow-canvas`, `snow-surface`, `glacier-drift`) and let acts drift between them.
- **Do** make the one action a slate ink pill; there is one per view. The back-to-top circle is fixed chrome, not a second action.
- **Do** set objects on a ground line with a cold blue cast ellipse.
- **Do** dissolve footage into the white ground with a mask, and label stock and placeholders honestly.
- **Do** tint every shadow with the cold shadow hue and keep it blurred and offset downward.
- **Do** remove snowfall, give drawn paths their end state and make scrolling instant under reduced motion.

### Don't:
- **Don't** introduce an accent hue; the engine accent stays slate ink.
- **Don't** use emergency red for anything that is not the emergency itself.
- **Don't** build a dark gadget page with a glowing device or a row of three feature cards.
- **Don't** put kickers or eyebrows above headlines.
- **Don't** use black or grey shadows, hard offset shadows, or drawn snowbanks; black exists only as a mask stop.
- **Don't** show a placeholder object or team image without its placeholder caption.

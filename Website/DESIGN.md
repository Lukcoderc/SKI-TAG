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
  drawing-label: "#2d3a4b"
  drawing-label-ink: "#3d4b5c"
  line-slate: "#5d6f84"
  terrain-blue: "#8fa3b8"
  terrain-far: "#c3d0de"
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
  rider-panel:
    textColor: "{colors.slate-ink}"
    typography: "{typography.body}"
    width: "clamp(17rem, 26vw, 23rem)"
  footer:
    textColor: "{colors.slate-soft}"
    typography: "{typography.caption}"
    padding: "2rem clamp(1.25rem, 5vw, 5.5rem)"
---

# Design System: SkiTag Website

## Overview

**Creative North Star: "Neuschnee"**

The page is a bright winter morning. High-key snow white and pale glacier blue carry every surface; the only dark is slate ink, used for words, line drawings and the one action. The chip stands on that snow as a flat line drawing with a cold blue cast shadow underneath, the way a thing lies on fresh powder. Mountain footage (Mixkit stock) is scrubbed by scroll and dissolves downward into the white ground through a mask, never a drawn edge; a light snowfall on a canvas is the atmosphere of the first viewport.

Density is low and the air is generous. Each act of the scroll does one thing: a centred headline in the sky, staggered lines of doubt, the chip to try with a slope drawing that answers the press, a framed photo of a group on the mountain, the app sketched in a phone outline, a horizontal rail of typographic rider panels, then the team with a plan. The page is an introduction only: it ends with the team act and a plain footer, and has no rental or purchase surface. Honesty is a visual element: placeholders and sketches are labelled in a small caption directly under the thing they stand for, and the interactive demo carries a pill that says it is a demonstration.

The world refuses the dark gadget page with a glowing device and three feature cards. Colour is not decoration here: there is no accent hue at all, only ink-dark for action and a single emergency red that belongs to the alarm.

The scroll mechanism is the ScrollCraft engine (`scrollcraft.css`/`.js`, unchanged). This system is the set of overrides of its `--sc-*` tokens plus the page's own tokens and classes in `seite.css`; the engine's spacing and type scales are inherited as they are.

**Key Characteristics:**
- High-key snow grounds, slate ink, no accent hue.
- Emergency red appears only where the emergency itself is shown.
- Flat slate line drawings (chip, slope, phone) with rounded caps; things that stand get a blurred cold blue cast ellipse.
- Footage masked into the white ground; sparse snowfall as atmosphere, removed under reduced motion.
- Soft, blue-tinted, offset shadows; hairlines in shadow blue, a 2px ink rule only for emphasis or the active step.
- Every placeholder and sketch labelled where it stands.

## Colors

A cold, high-key palette: whites tinted toward glacier blue, one deep slate ink, and red held in reserve.

### Primary
- **Slate Ink** (`slate-ink`): headlines, body emphasis, the dark pill action, the back-to-top circle, the hold-button ring as it fills, the emergency path and figures in the slope drawing, the phone outline, route and radius in the app sketch, the active-step underline, the 2px top rule of the "Für alle" panel, plan-timeline dot outlines, selection highlight and focus outlines. The engine accent (`--sc-accent`) is set to this same ink, so "accent" means dark, never a hue.
- **Slate Ink Hover** (`slate-ink-hover`): the dark pill and the back-to-top circle under a fine pointer.

### Neutral
- **Snow Canvas** (`snow-canvas`): the page ground, the first viewport's sky, the rider rail and the team act, the screen of the app sketch; also the tint of the hero scrim that keeps the headline legible over footage.
- **Snow Surface** (`snow-surface`): the scrolled header bar, the app act, secondary buttons, the demo badge, line-drawing fills, arrow and text on ink.
- **Glacier Drift** (`glacier-drift`): the cooler drift of the "Am ganzen Berg" act and the low end of the hero gradient.
- **Slate Soft** (`slate-soft`): body copy (`.sc-body`), step and panel descriptions, captions, the stage line, the footer. Darker than the contract's #4f5d6e; the build value stands.
- **Drawing Label** (`drawing-label`): the 15px labels on the slope drawing ("Du", "Deine Gruppe", "Liftstation", "Mitarbeiter der Bergbahn"). Near ink so small labels stay legible at drawing scale.
- **Drawing Label Ink** (`drawing-label-ink`): the small text on the staff phone in the slope drawing, a step lighter so it reads as screen content.
- **Line Slate** (`line-slate`): object strokes (lift station, staff phone), the two paths to the own group, the driven track in the app sketch, and the radius once the child has left it.
- **Terrain Blue** (`terrain-blue`): near terrain line, lift cable, the chip's inner outline and resting LED, the lift in the app map.
- **Terrain Far** (`terrain-far`): the far ridge line, the chip's inner button ring, contour lines in the app map.
- **Cold Shadow** (`cold-shadow`): dashed placeholder borders, the soft outer stop of the hero chip's cast shadow, and (at 18%) the fill of the app radius. The engine shadow hue is the same family (`--sc-shadow-color: 211 38% 52%`).
- **Cast Shadow** (`cast-shadow`) and **Cast Shadow Core** (`cast-shadow-core`): the translucent centre of the radial ground cast, the same cold hue at 45% under the app phone sketch and 55% under the larger hero chip. Used only inside the cast ellipse.
- **Hairline Blue** (`hairline-blue`): every 1px divider and control border: header bottom edge, the step list's top rule, rider panel top rules, plan rule, footer top edge, secondary-button and badge borders.
- **Glacier Ice** (`glacier-ice`): the empty track of the hold-button ring and the piste bands in the app map.

### Tertiary
- **Emergency Red** (`emergency-red`): the alarm only. The chip LED from the cancel window on, the ring during the five-second cancel window, the red point and "NOTRUF" on the staff phone in the slope drawing. A short press to the own group shows no red.

### Mask Stops (not paint)
- **Mask Opaque** (`mask-opaque`) and **Mask Fade** (`mask-fade`): luminance/alpha stops in the `mask-image` gradient that dissolves the hero footage into the snow ground. They never render as colour; nothing on the page is painted black.

### Named Rules
**The No Accent Rule.** There is no brand hue. Action is slate ink on snow; nothing is turquoise, blue-filled or gradient-lit.

**The Red Is The Alarm Rule.** Emergency red marks the emergency and nothing else: not links, not errors, not prices, not decoration, not the group call, not a child leaving the radius. If a surface does not depict an emergency call, it has no red.

## Typography

**Display Font:** Funnel Display (with Funnel Sans, system-ui)
**Body Font:** Funnel Sans (with system-ui)

**Character:** One family in two cuts. The display cut is wide-shouldered and tightly tracked at mid weights (480 to 640), so headlines read crisp and calm rather than loud; the text cut stays plain and open. Both are self-hosted woff2 variable files (300 to 800) in `site/assets/fonts`.

### Hierarchy
- **Display** (560, fluid up to 6rem, 0.94): the single hero headline, centred in the sky.
- **Headline** (560, the engine's 3xl step up to 5rem, 0.94): act titles, short sentences ending in a full stop ("Der Chip.", "Die App.", "Das sind wir."), held to 10 to 14ch.
- **Headline Small** (480 to 600, 2xl step): the staggered doubt lines, the second hero line, the app step titles, rider panel names (600, line-height 1), team first names, mobile act titles. A 600 weight at up to 9rem is used once for the single word that closes the doubt act.
- **Title** (600, lg step, -0.02em): the step names in the chip act, the rider panel's use line, plan dates.
- **Lede** (400, lg step, 1.4): the sentence under the hero headline (max 34ch), the line under an act title, the app step text.
- **Body** (400, base step, 1.62): running copy in slate soft, measure 62ch; panel text held to 30ch.
- **Label** (400, sm step): step descriptions, the status line and cancel hint of the demo, the honesty paragraph, button text (560 dark, 520 light).
- **Caption** (400, xs step, +0.02em): placeholder and sketch notes, footer, demo badge.

### Named Rules
**The Mid-Weight Rule.** Display weights stay between 480 and 640; hierarchy comes from size and tracking, never from 800-weight shouting.

**The Sentence Headline Rule.** Headlines are short declarative German sentences with a full stop. Nothing sits above them; supporting lines go below.

## Layout

ScrollCraft acts carry the structure: scrubbed (`scrub`) for the hero footage, pinned (`pin`) for the app act, horizontal pan (`pan`) for the rider rail, and plain flow for the doubt, chip, mountain and team acts. Each act sets a `data-sc-drift` background between snow canvas, white and glacier drift, so the ground shifts by a shade, never by a contrast block. The last act is the team; the footer sits after `<main>`, outside the acts, on the page ground.

Content sits inside the engine container (max 82rem) with a fluid gutter. Two-column acts use asymmetric or even grids: 0.85fr / 1.3fr for the chip (button column sticky at 6rem, drawing and step list right), 1fr / 1fr for the mountain photo and its text and for the team heading and its sentence, 1.1fr / 0.9fr for the app text and its phone sketch. The app act's three steps share one slot and are swapped by scroll cues. The doubt act staggers its lines with growing left indents (up to 8rem and 16rem) and then leaves a tall empty pause before the closing word. The rider rail runs a title block and four fixed-width panels with fluid gaps. The step list and the team trio run as three columns, the plan as four on a hairline.

At 860px everything collapses to one column. The chip act reorders: title, line, badge, drawing, then the button, status, hint and a single-column step list; the drawing swaps to short labels at a larger size. The app act stacks text above a phone sketch held at 46svh. The plan goes to two columns. Spacing uses the engine scale (`sc-1` to `sc-9`); section padding is fluid (about 3 to 6rem top on flow acts).

Fixed chrome is the header bar at the top and the back-to-top circle at the bottom right (inset clamp(1rem, 3vw, 2rem), respecting the safe area). Anchored targets under the fixed header carry a scroll margin (the team heading: 9rem). Below 860px the footer gets extra bottom padding (5.5rem) so the back-to-top circle never covers its text.

**The Air Rule.** One idea per viewport. If an act needs a second idea, it gets its own scroll distance rather than a denser grid.

## Elevation & Depth

Depth is real but soft: layered, offset, blurred shadows tinted with the cold shadow hue, at half the density of the engine defaults. Drawn things that stand (the hero chip, the app phone sketch) get a separate radial cast shadow, an ellipse beneath, not a box shadow. The mountain photo gets depth from parallax inside its frame.

### Shadow Vocabulary
- **Low** (`--sc-e1`): the dark pill button.
- **Mid** (`--sc-e2`): the floating back-to-top circle.
- **High** (`--sc-e3`): the framed mountain photo.
- **Ground cast**: radial ellipse under the hero chip (cast shadow core fading through cold shadow) and under the app phone sketch (cast shadow to transparent).

### Named Rules
**The Cold Shadow Rule.** Shadows are blue, never black or grey, and they fall downward with blur. Hard offset shadows do not exist in this world.

**The Standing Object Rule.** A drawn thing that stands on the page gets a blurred cold blue ellipse beneath it, never a box shadow.

## Shapes

Gently rounded planes (14px) for the mountain photo frame and the team placeholder strip. Every action and badge is a full pill; the back-to-top button and the plan-timeline dots are full circles. The hold button is a soft squircle (30% radius) echoing the chip body, the phone sketch a 40px-radius outline. Line drawings use rounded caps and joins: 1.6px for objects and terrain, 2.4 to 3.4px for paths, route and track. Placeholders that stand for missing photos use a 1.5px dashed cold-shadow border on a white-to-glacier gradient. Typographic panels have no box at all: a top rule (1px hairline, 2px ink for the closing panel) and air.

## Components

### Buttons
Quiet and solid; one dark action per view.
- **Shape:** full pill, min height 2.75rem.
- **Primary:** slate ink fill, white text at 560, Low shadow. The header pill "Das sind wir" is a link to the team heading.
- **Hover / Active:** hover to slate ink hover on fine pointers only; press nudges 1px down and scales to 0.98.
- **Secondary:** white pill with a hairline border; hover darkens the border to ink. Used for "Nochmal" after the demo ends.

### Back to Top
A 3rem slate-ink circle fixed bottom right with a white arrow-up stroke icon (1.25rem, 2px round stroke) and the Mid shadow. Hidden until the visitor has scrolled past 1.2 viewports, then fades in and slides up 0.5rem over the base duration. Hover goes to slate ink hover, press scales to 0.96, focus shows a 2px ink outline at 3px offset. Activation scrolls smoothly to the top (instantly under reduced motion, where only a 160ms opacity fade remains) and moves focus to the wordmark.

### Navigation
A fixed bar with the wordmark (display cut at 640, chip glyph) left and the single "Das sind wir" dark pill right. Transparent over the hero; once scrolled it turns white with a 1px hairline bottom edge.

### Footer
Plain and outside the acts: a hairline top edge, caption-size slate-soft text and links in a wrapping row (company placeholder left, legal placeholders, book link and stock credit right), within the 82rem container.

### Hold Button (signature)
A large squircle drawing of the chip. A short press draws two slate paths to the own group, whose two figures show vibration marks. Holding for three seconds (pointer, touch or Space) fills an ink ring over a glacier-ice track; the five-second cancel window turns the ring and LED red and a second press cancels; then the emergency path draws itself in ink across the slope via the lift station to a staff phone showing the red point, "NOTRUF" and an ink "Annehmen" pill. The drawing plays on its own after the press, no scrolling needed; under reduced motion it jumps to its end state. A "Vorführung" caption pill marks it as a demonstration.

### Step List
Three columns under a hairline: a title-size step name and a label-size description in slate soft. The step that matches the demo's state gets a 2px ink underline drawn across the top rule over the slow duration (420ms). One column on phones.

### App Sketch
A phone outline in ink (40px radius) on a snow-canvas screen with a contour map, dashed lift and glacier-ice piste bands. Scroll progress of the pinned act (`--sc-p`) draws the route in ink, then the driven track in line slate, then the radius around "Du" with an 18% cold fill; the child dot leaves the radius and the radius stroke turns line slate, never red. Three cued steps beside it name each stage. A cast ellipse sits beneath, a sketch caption below.

### Rider Panel
Typographic only, on the horizontal rail: a 1px hairline top rule, the name in display 600 at the 2xl step, a one-line use in title weight, and a short slate-soft sentence held to 30ch. The closing "Für alle" panel carries a 2px ink top rule instead. Panels fade from 55% to full opacity as the pan reaches them (only with motion allowed).

### Placeholder Caption
Caption-size slate-soft text directly beneath the object it stands in for ("Platzhalter: Foto folgt", "Skizze. Die App ist in Arbeit, Bild folgt."). Every placeholder and sketch carries one.

## Do's and Don'ts

### Do:
- **Do** keep every ground in the snow family (`snow-canvas`, `snow-surface`, `glacier-drift`) and let acts drift between them.
- **Do** make the one action a slate ink pill; there is one per view. The back-to-top circle is fixed chrome, not a second action.
- **Do** set a standing drawn object on a cold blue cast ellipse.
- **Do** dissolve footage into the white ground with a mask, and label stock, sketches and placeholders honestly.
- **Do** tint every shadow with the cold shadow hue and keep it blurred and offset downward.
- **Do** keep snowfall sparse (22 flakes on desktop, 12 on phones); remove it, give drawn paths their end state and make scrolling instant under reduced motion.
- **Do** draw people, group paths and objects in slate line work; ink is the emergency path and the active state.

### Don't:
- **Don't** introduce an accent hue; the engine accent stays slate ink.
- **Don't** use emergency red for anything that is not the emergency itself.
- **Don't** build a dark gadget page with a glowing device or a row of three feature cards; panels are typographic, without boxes.
- **Don't** put kickers or eyebrows above headlines.
- **Don't** use black or grey shadows, hard offset shadows, or drawn snowbanks; black exists only as a mask stop.
- **Don't** show a placeholder object, sketch or team image without its caption.

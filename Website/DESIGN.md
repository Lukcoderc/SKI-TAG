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
  line-slate: "#5d6f84"
  terrain-blue: "#8fa3b8"
  terrain-far: "#c3d0de"
  cold-shadow: "#a9bfd6"
  hairline-blue: "#c7d4e2"
  glacier-ice: "#dde7f1"
  cast-shadow-core: "rgba(122, 152, 186, 0.55)"
  cast-shadow: "rgba(122, 152, 186, 0.45)"
  sky-high: "#e3eef8"
  sky-low: "#f6f9fc"
  ridge-far: "#c9daeb"
  ridge-far-low: "#dfe9f4"
  ridge-mid: "#aec4db"
  ridge-mid-low: "#d3e1ee"
  slope-shade: "#e3ecf6"
  slope-shade-deep: "#d2e0ed"
  tree-blue: "#7d96b0"
  layer-face: "#f2f6fa"
  layer-face-cool: "#e7eef6"
  layer-board: "#dfe9f3"
  layer-edge: "#9fb2c6"
  frost-glass: "rgba(248, 251, 253, 0.66)"
  frost-glass-solid: "rgba(248, 251, 253, 0.97)"
  glass-edge: "rgba(255, 255, 255, 0.7)"
  glass-control: "rgba(255, 255, 255, 0.6)"
  glass-hover: "rgba(255, 255, 255, 0.5)"
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
  title-xl:
    fontFamily: "Funnel Display, Funnel Sans, system-ui, sans-serif"
    fontSize: "clamp(1.6rem, 1.35rem + 1.2vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.025em"
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
  nav-link:
    fontFamily: "Funnel Sans, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.96rem + 0.22vw, 1.125rem)"
    fontWeight: 500
    letterSpacing: "0"
  diagram-label:
    fontFamily: "Funnel Display, Funnel Sans, system-ui, sans-serif"
    fontSize: "21px"
    fontWeight: 560
    letterSpacing: "-0.01em"
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
  button-rail-arrow:
    backgroundColor: "{colors.snow-surface}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.circle}"
    size: "3rem"
  wordmark:
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.plane}"
    padding: "0.35rem 0.5rem 0.35rem 0"
  side-sheet:
    backgroundColor: "{colors.frost-glass}"
    textColor: "{colors.slate-ink}"
    width: "min(21rem, 86vw)"
  side-sheet-link:
    textColor: "{colors.slate-soft}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.plane}"
    padding: "0.55rem 0.8rem"
  side-sheet-link-hover:
    backgroundColor: "{colors.glass-hover}"
    textColor: "{colors.slate-ink}"
  side-sheet-link-current:
    backgroundColor: "{colors.glass-edge}"
    textColor: "{colors.slate-ink}"
  side-sheet-close:
    backgroundColor: "{colors.glass-control}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.circle}"
    size: "2.75rem"
  demo-badge:
    backgroundColor: "{colors.snow-surface}"
    textColor: "{colors.slate-soft}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "0.2rem 0.65rem"
  demo-illustration:
    backgroundColor: "{colors.sky-high}"
    rounded: "{rounded.plane}"
    width: "100%"
  layer-stack:
    backgroundColor: "{colors.snow-surface}"
    textColor: "{colors.slate-ink}"
    typography: "{typography.diagram-label}"
    width: "100%"
  rider-panel:
    textColor: "{colors.slate-ink}"
    typography: "{typography.body}"
    width: "clamp(16rem, 30vw, 24rem)"
  footer:
    textColor: "{colors.slate-soft}"
    typography: "{typography.caption}"
    padding: "2rem clamp(1.25rem, 5vw, 5.5rem)"
---

# Design System: SkiTag Website

## Overview

**Creative North Star: "Neuschnee"**

The page is a bright winter morning. High-key snow white and pale glacier blue carry every surface; the only dark is slate ink, used for words, line drawings and the one action. The chip stands on that snow as a flat line drawing with a cold blue cast shadow underneath, the way a thing lies on fresh powder. Mountain footage (Mixkit stock) is scrubbed by scroll and dissolves downward into the white ground through a mask, never a drawn edge; a light snowfall on a canvas is the atmosphere of the first viewport.

Density is low and the air is generous. Each act of the scroll does one thing: a centred headline in the sky that gives way to a second line assembling itself, the chip to try beside an illustrated slope in soft blues that answers the press, the chip taken apart into its layers, a framed photo of a group on the mountain that wipes up into view, the app sketched in a phone outline, a sideways rail of typographic rider panels the visitor scrolls by hand, then the team. The page is an introduction only: it ends with the team act and a plain footer, and has no rental or purchase surface. Honesty is a visual element: placeholders and sketches are labelled in a small caption directly under the thing they stand for, and the interactive demo carries a pill that says it is a demonstration.

The world refuses the dark gadget page with a glowing device and three feature cards. Colour is not decoration here: there is no accent hue at all, only ink-dark for action and a single emergency red that belongs to the alarm.

The scroll mechanism is the ScrollCraft engine (`scrollcraft.css`/`.js`, unchanged). This system is the set of overrides of its `--sc-*` tokens plus the page's own tokens and classes in `seite.css`; the engine's spacing and type scales are inherited as they are.

**Key Characteristics:**
- High-key snow grounds, slate ink, no accent hue.
- Emergency red appears only where the emergency itself is shown.
- Flat slate line drawings (chip, phone) with rounded caps; things that stand get a blurred cold blue cast ellipse. The demo slope and the layer stack are the filled illustrations, painted only in the snow and soft-blue family.
- Footage masked into the white ground and scrubbed: it zooms gently while the headline lifts and fades, the second line assembles line by line and the chip rises and grows to 1.5 with its cast; sparse snowfall as atmosphere, removed under reduced motion.
- Soft, blue-tinted, offset shadows; hairlines in shadow blue, a 2px ink rule only for emphasis or the active step.
- One frosted-glass plane: the side sheet, translucent snow over the page, never a dark veil.
- Every placeholder and sketch labelled where it stands.

## Colors

A cold, high-key palette: whites tinted toward glacier blue, one deep slate ink, and red held in reserve.

### Primary
- **Slate Ink** (`slate-ink`): headlines, body emphasis, the dark pill action, the back-to-top circle, the hold-button ring as it fills, the emergency path and figures in the slope drawing, the phone outline, route and radius in the app sketch, the active-step underline, the 2px bar of the active app step, the outline of the button layer and the labels of the layer stack, the 2px top rule of the "Für alle" panel, the 2px top rules of the team names, the people and the rescuer in the slope illustration, selection highlight and focus outlines. The engine accent (`--sc-accent`) is set to this same ink, so "accent" means dark, never a hue.
- **Slate Ink Hover** (`slate-ink-hover`): the dark pill and the back-to-top circle under a fine pointer.

### Neutral
- **Snow Canvas** (`snow-canvas`): the page ground, the first viewport's sky, the rider rail and the team act, the screen of the app sketch; also the tint of the hero scrim that keeps the headline legible over footage.
- **Snow Surface** (`snow-surface`): the scrolled header bar, the app act and the "Was drinsteckt" act, secondary buttons, the rail arrows, the demo badge, line-drawing fills, the main slope, groomed piste band, snow caps and station body in the illustration, arrow and text on ink.
- **Glacier Drift** (`glacier-drift`): the cooler drift of the "Am ganzen Berg" act and the low end of the hero gradient.
- **Slate Soft** (`slate-soft`): body copy (`.sc-body`), step and panel descriptions, inactive app step headings, side-sheet links that are not the current section, the lede of the "Was drinsteckt" act, the wordmark chevron at rest, captions, the footer. Darker than the contract's #4f5d6e; the build value stands.
- **Drawing Label** (`drawing-label`): the 15px labels on the slope illustration ("Du", "Deine Gruppe", "Liftstation", "Mitarbeiter der Bergbahn"; 26px short labels on phones). Near ink so small labels stay legible at drawing scale.
- **Line Slate** (`line-slate`): object strokes and the roof, antenna and cabins of the lift station, tree trunks, the signal pings at the station, the two paths to the own group, the driven track in the app sketch, the radius once the child has left it, and the outlines, board chip and leader dots of the layer stack.
- **Terrain Blue** (`terrain-blue`): the rescuer's trail in the slope illustration, the chip's inner outline and resting LED (also the lid LED of the layer stack at rest), the battery cell and leader hairlines of the layer stack, the lift in the app map.
- **Terrain Far** (`terrain-far`): the far ridge line, the chip's inner button ring, contour lines in the app map.
- **Cold Shadow** (`cold-shadow`): dashed placeholder borders, the soft outer stop of the hero chip's cast shadow, and (at 18%) the fill of the app radius. The engine shadow hue is the same family (`--sc-shadow-color: 211 38% 52%`).
- **Cast Shadow** (`cast-shadow`) and **Cast Shadow Core** (`cast-shadow-core`): the translucent centre of the radial ground cast, the same cold hue at 45% under the app phone sketch and 55% under the larger hero chip. Used only inside the cast ellipse.
- **Hairline Blue** (`hairline-blue`): every 1px divider and control border: header bottom edge, the step list's top rule, rider panel top rules, footer top edge, secondary-button, badge, rail-arrow and close-button borders, and the 2px bar of an inactive app step.
- **Glacier Ice** (`glacier-ice`): the empty track of the hold-button ring and the piste bands in the app map.

### Illustration Blues (slope demo only)
The slope illustration is painted from a fixed set of soft, cold blues between snow and terrain blue. They are terrain and sky, never an accent, and appear nowhere else on the page.
- **Sky High / Sky Low** (`sky-high` to `sky-low`): the vertical sky gradient behind the slope.
- **Ridge Far** (`ridge-far` to `ridge-far-low`): the far ridges, with white snow caps.
- **Ridge Mid** (`ridge-mid` to `ridge-mid-low`): the middle ridge, at 75% opacity.
- **Slope Shade** (`slope-shade` to `slope-shade-deep`): the shaded face of the white main slope.
- **Tree Blue** (`tree-blue`): tree crowns, the lift cable and its hangers; in the layer stack, the charging coil rings and board parts.

### Layer Stack Blues (Was drinsteckt only)
The isometric layer stack is painted from the snow family plus four pale blues; like the Illustration Blues they are material, never accent.
- **Layer Face** (`layer-face`), **Layer Face Cool** (`layer-face-cool`), **Layer Board** (`layer-board`): the top faces of the coil, battery, case and board layers (button and lid are snow surface).
- **Layer Edge** (`layer-edge`): the darker thickness edge offset beneath every layer, which gives each slab its depth without a shadow.

### Glass
- **Frost Glass** (`frost-glass`): snow at 66%, the side sheet's ground under a 26px blur with 170% saturation. Where backdrop-filter is unsupported it falls back to **Frost Glass Solid** (`frost-glass-solid`, 97%).
- **Glass Edge** (`glass-edge`): the white 1px hairline on the sheet's right edge.
- **Glass Control** (`glass-control`): white at 60%, the sheet's close button, ringed by slate ink at 12%.
- **Glass Hover** (`glass-hover`): white at 50%, the plane under a side-sheet link on hover. The current link sits on Glass Edge (white at 70%).

### Tertiary
- **Emergency Red** (`emergency-red`): the alarm only. The chip LED from the cancel window on, the ring during the cancel window, the ring that pulses around the fallen person in the slope illustration while the call runs, and the lid LED of the layer stack, which turns red near the end of its act to show the alarm light. A short press to the own group shows no red.

### Mask Stops (not paint)
- **Mask Opaque** (`mask-opaque`) and **Mask Fade** (`mask-fade`): luminance/alpha stops in the `mask-image` gradient that dissolves the hero footage into the snow ground. They never render as colour; nothing on the page is painted black.

### Named Rules
**The No Accent Rule.** There is no brand hue. Action is slate ink on snow; no control, link, text or highlight is turquoise, blue-filled or gradient-lit. The soft blues and gradients of the slope illustration are terrain and sky, not accent.

**The Red Is The Alarm Rule.** Emergency red marks the emergency and nothing else: not links, not errors, not prices, not decoration, not the group call, not a child leaving the radius. If a surface does not depict an emergency call, it has no red.

## Typography

**Display Font:** Funnel Display (with Funnel Sans, system-ui)
**Body Font:** Funnel Sans (with system-ui)

**Character:** One family in two cuts. The display cut is wide-shouldered and tightly tracked at mid weights (480 to 640), so headlines read crisp and calm rather than loud; the text cut stays plain and open. Both are self-hosted woff2 variable files (300 to 800) in `site/assets/fonts`.

### Hierarchy
- **Display** (560, fluid up to 6rem, 0.94): the single hero headline, centred in the sky; the 2xl step on phones.
- **Headline** (560, the engine's 3xl step up to 5rem, 0.94): act titles, short sentences ending in a full stop ("Der Chip.", "Die App.", "Das sind wir."), held to 10 to 14ch.
- **Headline Small** (480 to 600, 2xl step): rider panel names (600, line-height 1), team first names, mobile act titles. The second hero line is a heading of its own (540, the 3xl step, 1.04, -0.03em; the 2xl step on phones), set at headline size but lighter.
- **Title XL** (600, xl step, 1.15, -0.025em): the app step titles (lg on phones).
- **Title** (600, lg step, -0.02em): the step names in the chip act, the rider panel's use line.
- **Lede** (400, lg step, 1.4): the sentence under the hero headline (max 34ch), the line under an act title, the app step text.
- **Body** (400, base step, 1.62): running copy in slate soft, measure 62ch; panel text held to 30ch.
- **Nav Link** (Funnel Sans 500, base step, no tracking): the section links in the side sheet, plain and small.
- **Diagram Label** (Funnel Display 560, 21px in the 640-wide drawing, 26px on phones, -0.01em): the part names of the layer stack, in ink.
- **Label** (400, sm step): step descriptions, the status line and cancel hint of the demo, button text (560 dark, 520 light).
- **Caption** (400, xs step, +0.02em): placeholder and sketch notes, footer, demo badge.

### Named Rules
**The Mid-Weight Rule.** Display weights stay between 480 and 640; hierarchy comes from size and tracking, never from 800-weight shouting.

**The Sentence Headline Rule.** Headlines are short declarative German sentences with a full stop. Nothing sits above them; supporting lines go below.

## Layout

ScrollCraft acts carry the structure. Three acts take over the scroll: the hero scrub (`scrub`, 2.6 viewports, no dwell), the pinned "Was drinsteckt" act (`pin`, 2.2 viewports) and the pinned app act (`pin`, 2.2 viewports). Everything else is plain flow: the chip, mountain, "Für jeden am Berg" and team acts. The order is hero, chip, "Was drinsteckt", mountain, app, "Für jeden am Berg", team. In the hero the headline block lifts and is gone by about a quarter of the act; the second line then holds the sky from roughly 40% to the end, assembling line by line (kinetic lines), without its own rise. Each act sets a `data-sc-drift` background between snow canvas, white and glacier drift, so the ground shifts by a shade, never by a contrast block. The last act is the team; the footer sits after `<main>`, outside the acts, on the page ground.

Content sits inside the engine container (max 82rem) with a fluid gutter. Two-column acts use asymmetric or even grids: 0.85fr / 1.3fr for the chip (button column sticky at 6rem, drawing and step list right), 1fr / 1fr for the mountain photo and its text and for the team heading and its sentence, 1.1fr / 0.9fr for the app text and its phone sketch, 0.8fr / 1.2fr for the "Was drinsteckt" text and its layer stack (vertically centred, stage padded 5.5rem top). The app act's three steps stay listed one under another; scroll progress only moves the active marker. The rider rail is a native, snapping horizontal scroller in a plain flow section; vertical scroll never moves it. Swipe, trackpad, shift + wheel, mouse drag, keyboard focus or the two arrow buttons beside the title move it: a tap on an arrow steps one panel, holding an arrow scrolls slowly and continuously (about 280px per second) with snap off until release. Its padding aligns the first panel with the container edge. The mountain photo frame wipes up into view as its act enters. The rider rail runs four fixed-width panels with fluid gaps (1.5 to 3.5rem). The step list and the team trio run as three columns.

At 860px everything collapses to one column. The chip act reorders: title, line, badge, drawing, then the button, status, hint and a single-column step list; the drawing swaps to short labels at a larger size. The app act stacks text above a phone sketch held at 46svh; "Was drinsteckt" stacks its text above the layer stack held at 58svh, the lede drops to the base step and the labels grow to 26px. The rail arrows move below the rail title. Spacing uses the engine scale (`sc-1` to `sc-9`); section padding is fluid (about 3 to 6rem top on flow acts).

Fixed chrome is the header bar at the top, the side sheet (non-modal, from the left edge, full height; the page stays scrollable beside it) and the back-to-top circle at the bottom right (inset clamp(1rem, 3vw, 2rem), respecting the safe area). Anchored targets under the fixed header carry a scroll margin (the team heading: 9rem). Below 860px the footer gets extra bottom padding (5.5rem) so the back-to-top circle never covers its text.

**The Air Rule.** One idea per viewport. If an act needs a second idea, it gets its own scroll distance rather than a denser grid.

## Elevation & Depth

Depth is real but soft: layered, offset, blurred shadows tinted with the cold shadow hue, at half the density of the engine defaults. Drawn things that stand (the hero chip, the app phone sketch) get a separate radial cast shadow, an ellipse beneath, not a box shadow. The mountain photo gets depth from parallax inside its frame. The layer stack gets depth from geometry alone: each slab carries a darker thickness edge beneath its face, no shadow. The side sheet is the one translucent layer: frosted glass that blurs the page behind it instead of dimming it.

### Shadow Vocabulary
- **Low** (`--sc-e1`): the dark pill button and the rail arrows (dropped when an arrow is disabled).
- **Mid** (`--sc-e2`): the floating back-to-top circle and the framed slope illustration.
- **High** (`--sc-e3`): the framed mountain photo.
- **Sheet** (`18px 0 50px -24px`, cold shadow hue at 40%): the frosted side sheet, thrown sideways to the right because the sheet comes from the left; the cold, blurred rule holds, the offset follows the plane.
- **Ground cast**: radial ellipse under the hero chip (cast shadow core fading through cold shadow) and under the app phone sketch (cast shadow to transparent).

### Named Rules
**The Cold Shadow Rule.** Shadows are blue, never black or grey, and they fall downward with blur (the side sheet's falls away from its edge). Hard offset shadows do not exist in this world.

**The Standing Object Rule.** A drawn thing that stands on the page gets a blurred cold blue ellipse beneath it, never a box shadow.

## Shapes

Gently rounded planes (14px) for the mountain photo frame, the slope illustration's clipped frame and the team placeholder strip. Every action and badge is a full pill; the back-to-top button, the rail arrows and the side sheet's close button are full circles. The wordmark's focus shape is the 14px plane, in the header bar and in the side sheet. The layer stack is drawn isometrically: rounded squares (radius 42 on a 164 slab) and round button discs, rotated 45° and squashed to half height, with 1.6px line-slate outlines (2.4px ink for the button), leaders as short 1.4px hairlines ending in a small dot. Side-sheet links hover and mark the current section as 14px planes. The side sheet itself is a square-edged full-height glass plane flush with the left edge, closed by a 1px white hairline on its right. The hold button is a soft squircle (30% radius) echoing the chip body, the phone sketch a 40px-radius outline. Line drawings use rounded caps and joins: 1.6px for objects and terrain, 2.4 to 3.4px for paths, route and track. Placeholders that stand for missing photos use a 1.5px dashed cold-shadow border on a white-to-glacier gradient. Typographic panels have no box at all: a top rule (1px hairline, 2px ink for the closing panel) and air.

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
A fixed bar with the wordmark (display cut at 640 at the lg step, chip glyph, a small slate-soft chevron after the name) left and the single "Das sind wir" dark pill right. Transparent over the hero; once scrolled it turns white with a 1px hairline bottom edge. The wordmark opens the side sheet: on fine pointers by hovering it (after 90ms; the sheet closes 260ms after the pointer leaves wordmark and sheet), everywhere by click, tap or Enter; its chevron turns ink and nudges down 1px on hover and rotates 180° over the base duration while the sheet is open.

### Side Sheet
A non-modal frosted-glass sheet from the left (min(21rem, 86vw), full height): frost glass under a 26px blur at 170% saturation, a white hairline right edge and the Sheet shadow, with no backdrop or veil. It slides in from the edge over 240ms and out over 200ms on the standard ease, fading from 60%; under reduced motion it simply appears. Head row: the wordmark in display 640 at the lg step, an ink link to the top (14px focus shape), and a round 2.75rem close button (glass control, ink border on hover). Below, an unnumbered list of the page's sections ("Start", then the acts in page order from "Der Chip") in Nav Link type, slate soft, each a 14px plane (0.55rem 0.8rem padding, 2px apart): the section in view turns ink on Glass Edge white, hover on fine pointers turns ink on Glass Hover white; colour and ground change over the fast duration. No bar, no rule. The sheet has these two rows only. Esc, the close button and a press outside close it. Opening by keyboard focuses the current link; closing by Esc or the close button returns focus to the wordmark. The sheet's wordmark closes the sheet and scrolls to the top (instantly under reduced motion); after that jump, hover-open on the header wordmark is suppressed until the pointer has left it.

### Rail Arrows
Two 3rem white circles with a hairline border, the Low shadow and a 1.8px ink chevron, beside the "Für jeden am Berg" title. Hover darkens the border to ink, press scales to 0.96, focus shows the 2px ink outline. At either end of the rail the matching arrow is disabled: 35% opacity, no shadow. A tap moves one panel width, smoothly unless reduced motion is set; holding scrolls continuously until release.

### Footer
Plain and outside the acts: a hairline top edge, caption-size slate-soft text and links in a wrapping row (company placeholder left, legal placeholders and stock credit right), within the 82rem container.

### Hold Button (signature)
A large squircle drawing of the chip beside the slope illustration. A short press draws two slate paths to the own group, whose two figures show vibration marks. Holding (pointer, touch or Space) fills an ink ring over a glacier-ice track; the cancel window turns the ring and LED red and a second press cancels. The demonstration is shortened to a 1 s hold and a 2 s cancel window, and the hint text states the real chip's 3 s and 5 s; then the emergency path draws itself in ink from the fallen person up to the lift station, line-slate pings ring at the station's antenna, a red ring pulses around the fallen person while the call runs, and a rescuer skier (ink silhouette with a white band) rides down a terrain-blue trail to them. The drawing plays on its own after the press, no scrolling needed; under reduced motion it jumps to its end state. A "Vorführung" caption pill marks it as a demonstration.

### Slope Illustration (signature)
An 800 by 470 scene clipped to the 14px plane with the Mid shadow: sky gradient, far ridges with white snow caps, a translucent middle ridge, a white main slope with a blue shaded face and a thin terrain stroke, a white groomed piste band with a faint dashed track, small blue trees with line-slate trunks, a lift line with three cabins rising to a white station with a line-slate roof and antenna. People are small ink silhouettes. All fills come from the Illustration Blues and the snow family; red appears only as the pulsing ring of the call.

### Layer Stack (signature)
The "Was drinsteckt." act: headline left with a slate-soft lede (26ch) and a placeholder caption beneath, right an isometric stack of six chip layers, top to bottom: button, lid with light, radio and GPS board, battery, wireless charging coil, case. The pinned act's progress (`--sc-p`) spreads the layers apart vertically, symmetric around the middle (up to 64px per step at full spread, reached at about 56% of the act); from about 18% each label (ink diagram type with a short terrain-blue hairline leader and a line-slate dot) fades in one after another; from about 62% the lid LED blends from terrain blue to emergency red. Without the scroll engine (no `.sc-ready`) or under reduced motion the stack is shown fully spread with all labels.

### Step List
Three columns under a hairline: a title-size step name and a label-size description in slate soft. The step that matches the demo's state gets a 2px ink underline drawn across the top rule over the slow duration (420ms). One column on phones.

### App Steps
Three steps listed under each other beside the phone sketch, each with a 2px bar at its left edge. Inactive: heading in slate soft, bar in hairline blue. The active step's heading turns ink and its bar ink; steps already passed keep an ink heading. Colour changes run over the slow duration. Nothing fades out.

### App Sketch
A phone outline in ink (40px radius) on a snow-canvas screen with a contour map, dashed lift and glacier-ice piste bands. Scroll progress of the pinned act (`--sc-p`) draws the route in ink, then the driven track in line slate, then the radius around "Du" with an 18% cold fill; the child dot leaves the radius and the radius stroke turns line slate, never red. The step list beside it names each stage. A cast ellipse sits beneath, a sketch caption below.

### Rider Panel
Typographic only, on the horizontal scroller: a 1px hairline top rule, the name in display 600 at the 2xl step, a one-line use in title weight, and a short slate-soft sentence held to 30ch. The closing "Für alle" panel carries a 2px ink top rule instead.

### Team List
The team trio in three columns under the team placeholder strip: each first name in display 600 at the 2xl step with its role in slate soft beneath (26ch). Each item carries a 2px ink rule on top that draws from the left (scaleX 0 to 1, 900ms on the standard ease, staggered 140ms per name, starting 200ms after the list enters); the role then fades in and rises 6px (600ms, 520ms after the rule starts). On fine pointers the name shifts 6px right on hover over the base duration. Under reduced motion rules and roles show their end state.

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
- **Do** draw objects and group paths in slate line work and people as small ink silhouettes; ink is the emergency path and the active state. Fill the slope illustration only from the Illustration Blues and the snow family, the layer stack only from the Layer Stack Blues and the snow family.
- **Do** keep the side sheet non-modal frosted glass with its solid fallback; it blurs the page, it never dims it.

### Don't:
- **Don't** introduce an accent hue; the engine accent stays slate ink.
- **Don't** use emergency red for anything that is not the emergency itself.
- **Don't** build a dark gadget page with a glowing device or a row of three feature cards; panels are typographic, without boxes.
- **Don't** put kickers or eyebrows above headlines.
- **Don't** use black or grey shadows, hard offset shadows, or drawn snowbanks; black exists only as a mask stop.
- **Don't** show a placeholder object, sketch or team image without its caption.

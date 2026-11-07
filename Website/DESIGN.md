---
name: SkiTag Website
description: Neuschnee und Nacht. A bright snow page with night-blue stages; the chip is a signal-orange object, shown in 3D.
colors:
  snow-canvas: "#f4f8fb"
  snow-surface: "#ffffff"
  glacier-drift: "#eef3f9"
  ice: "#eaf1f9"
  ice-line: "#d4dfeb"
  ink: "#0b1226"
  ink-hover: "#26324f"
  ink-soft: "#4a5672"
  night: "#0b1226"
  night-2: "#131d3b"
  night-3: "#1d2a52"
  night-ink: "#f3f6fc"
  night-soft: "#a6b3d0"
  night-accent: "#ff8a5c"
  signal-orange: "#ff5a1c"
  signal-orange-deep: "#e5450d"
  chip-orange-3d: "#ff4a10"
  graphite: "#262b33"
  coverage-blue: "#4f8dff"
  emergency-red: "#ff2d2d"
  frost-glass: "rgba(250, 252, 254, 0.72)"
  night-glass: "rgba(11, 18, 38, 0.66)"
  app-surface: "#edf2fa"
  app-route: "#e5450d"
  app-track: "#ff5b22"
  app-ok: "#16b46b"
  piste-easy: "#1f66d1"
  piste-intermediate: "#e0242f"
  piste-advanced: "#0e0e10"
  app-goal: "#ffd400"
typography:
  hero:
    fontFamily: "Funnel Display, Funnel Sans, system-ui, sans-serif"
    fontSize: "clamp(3rem, 1.2rem + 6.4vw, 7.2rem)"
    fontWeight: 660
    lineHeight: 0.94
    letterSpacing: "-0.05em"
  section-title:
    fontFamily: "Funnel Display, Funnel Sans, system-ui, sans-serif"
    fontSize: "clamp(2.9rem, 1.6rem + 5.4vw, 6.4rem)"
    fontWeight: 640
    lineHeight: 0.96
    letterSpacing: "-0.045em"
  eyebrow:
    fontFamily: "Funnel Sans, system-ui, sans-serif"
    fontSize: "var(--sc-t-sm)"
    fontWeight: 600
    letterSpacing: "0.01em"
  tile-number:
    fontFamily: "Funnel Display, Funnel Sans, system-ui, sans-serif"
    fontSize: "clamp(4rem, 2.6rem + 4.6vw, 7.4rem)"
    fontWeight: 680
    lineHeight: 0.9
    letterSpacing: "-0.06em"
  body:
    fontFamily: "Funnel Sans, system-ui, sans-serif"
    fontSize: "var(--sc-t-base)"
    fontWeight: 400
    lineHeight: 1.5
  app-display:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontWeight: 800
    letterSpacing: "-0.035em"
rounded:
  plane: "14px"
  card: "28px"
  tile-inner: "20px"
  pill: "999px"
---

## Overview

Redesign of 2026-11-06 (Lukas: "modern, krass, but clean, Apple style"). The base stays: a bright snow page, Funnel Display and Funnel Sans, ScrollCraft acts. What changed:

- **Light and night.** Snow sections alternate with night-blue stages (`.nacht`, `#0b1226`, the brand blue of the app). The night stages carry the technical moments: what is inside the chip, how help arrives, and the closing line. Every section paints its own background, so the page never passes through a muddy grey while the engine's background drift catches up; the boundaries between snow and night are hard, as on Apple's product pages.
- **The chip is the hero object.** It is shown in signal orange (decided in the hardware workshop book for visibility in snow) with a graphite TPU sleeve and collar and a white button, never as a flat line drawing again. In the hero and in "Was drinsteckt" it is a real-time three.js model; everywhere else it is the top-view SVG symbol `#chip-oben` (240 × 120, the 2:1 ratio of 120 × 60 mm).
- **Orange is the product, red is the alarm.** Orange marks the chip, eyebrows, the group call and app actions. Red (`#ff2d2d`) stays reserved for the emergency: the LED once a call runs, the cancel ring, the SOS square in the app, the staff alert.
- **Big type, few words.** Each section opens with a small orange eyebrow and a two-line title: the first line in ink, the second either softened (`.leise`, 42% of the current colour) on snow or in the orange gradient (`.verlauf`) on night.

## Sections (top to bottom)

1. **Hero** (`.hang`, scrub, 2.6 viewports): the mountain video as before; the headline block lifts away, the second line assembles. The headline stands alone (the small "SkiTag" eyebrow above it was removed on 2026-11-07). The tag is a clean drawing, no longer a 3D model (`held.js` removed on 2026-11-07): `#chip-tag`, the top view of the chip with a visible graphite edge underneath, so it reads as a solid object seen slightly from the front. It floats gently (6 s, ±10 px, a degree of tilt) above a soft cold-blue contact shadow that shrinks as it rises, and rises and grows with scroll. Reduced motion: still.
2. **Der Chip** (snow, flow, one viewport; merged with the former "So kommt Hilfe" and turned light on 2026-11-07): a daylight panorama of the ski area fills the stage (pale sky with a soft sun, blue-grey ridges with white snow caps, a white slope with pistes and lifts, five white lift stations with slate antennas). People are small ink skier figures (symbol `#n-fahrer`), never dots: "Du" lies on the slope after a fall with the orange chip on the jacket, the two group members stand with an orange chip dot, the staff member carries a white band and the label "Mitarbeiter der Bergbahn" ("Bergbahn" on phones) that travels with him. Labels have a white halo for legibility; a white fade on the left keeps the text column calm. Left: eyebrow, "Ein Knopf. / Zwei Wege." (second line in signal orange) and the three steps (Kurz drücken, Drei Sekunden halten, Hilfe kommt; the active one is lit). Bottom left: the hold button (the orange top-view chip with a ring that fills; red during the cancel window) and the live status line. The demo plays inside the panorama: a short press sends orange waves and paths to the group, who vibrate; holding sends red waves and a red radio path to the nearest station, its antenna lights and pings, a staff alert card ("Notruf · Ein Gast braucht Hilfe · Annehmen") appears, a white dot travels to the person, and finally blue coverage fields bloom around all stations. From 861px the graphic is no longer full-bleed: text, steps and button stand on the left in normal flow, the panorama sits on the right in its own rounded panel (`.knopf__bild`, `--r-gross`) with a narrow right margin; the alert card sits bottom-left inside the panel. The visible slice of the drawing is chosen in `seite.js` from the panel size so that "Du", the group, the station and the staff member stay in view. On phones everything fits one screen as before (the panel has no rules there): The scene is split into a static SVG layer and a small animated layer; nothing is redrawn while the demo rests. The demo is shortened (1 s hold, 2 s cancel) without an on-page note; the steps state the real 3 s and 5 s.
3. **Was drinsteckt** (night, pin, 2.4 viewports): "Klein gedacht. / Groß gebaut." left, the exploded 3D model right (`drinsteckt.js`, see below). A faint blue glow sits behind the model.
4. **Gebaut für den Berg** (glacier drift, flow): a bento of tiles. A wide night tile with an animated ring (white fills for the hold, then red for the cancel window, 3 s + 5 s), "−20 °C" (goal, thermometer), "8 h" (goal, battery draining to 30 %), a full orange "Signalorange." tile, "0 Handys nötig", and a full-width tile with the chip drawing about the soft sleeve and Qi. Numbers count up on entry. Goal tiles carry a "Ziel" badge.
6. **Die App** (pin, 3 viewports): "Dein Tag. / Deine Leute." with three expanding step cards on the left and a CSS-built iPhone on the right (titanium gradient frame, side buttons, Dynamic Island, status bar). Inside, the app is rebuilt after Tobias' app design (night-blue header widget with "Noch offen 5:29 h", weather and battery; light illustrated map with Austrian piste colours; red SOS square; night-blue tab bar with the orange active tab; sheet with Bricolage Grotesque titles). Scroll switches three states: Route (route draws, yellow goal), Gruppe (avatars appear, radius around the child, list with "Ganze Gruppe rufen"), Mein Tag ("Ihr Tag als Video", runs, vertical metres, lifts, a badge and the hut pass). No speed is shown anywhere, following the app's principle. The app speaks "Sie" as in the real app; the website speaks "du".
7. **Für jeden am Berg** (flow): the hand-scrolled rail of 4:5 cards: Familien (photo with a dark fade), Sportliche (night card with an orange track), Skischulen (ice card with a group inside a dashed radius), Für alle (peach card with the chip). Arrows and dragging as before (`schiene.js`).
8. **Fragen** (white, flow): sticky title left, an accordion right (`<details>`), plus-sign discs that turn into a cross. Answers state only what is decided or planned, and point to 140 for severe accidents.
9. **Das sind wir** (flow): three white cards (chip, antenna, phone glyph), names and roles, ordered along the signal path: Maximilian, Lukas, Tobias. The dashed team photo placeholder was removed.
10. **Schluss** (night): the floating chip drawing with an orange glow, "Ein Knopf. / Für alle am Berg.", and an orange pill back to the demo.
11. **Footer** (night): four columns: company placeholder, page links, legal placeholders, credits (Mixkit, three.js, Bricolage Grotesque).

## The 3D chip

`site/assets/chip-modell.js` builds the model in millimetres (scaled 0.01), used only in "Was drinsteckt" since the hero went back to a drawing: Unterteil and Hülle (orange printed tray, graphite TPU sleeve), Qi coil (copper spiral), LiPo 1000 mAh with label, Lade-Modul and vibration motor, perfboard with the RAK radio module, GPS patch antenna, motion sensor and battery gauge, the orange lid with LED and an embossed "SkiTag", and the white button in a graphite collar. Order and names follow Maximilian's exploded drawing; the outer size 120 × 60 × 32 mm and signal orange are decided in the workshop book; inner sizes are illustrative and the page says so. Rendering: three.js r169 self-hosted under `site/assets/vendor/` (import map, no CDN), ACES tone mapping (other tone mappers turned the orange salmon), RoomEnvironment reflections, transparent canvas. The scene renders only while its section is on screen.

"Was drinsteckt" (`drinsteckt.js`) explodes the model in three stages with the scroll progress, the labels (open-3d-skills `explode.js`, patched for one right-hand column) fade in as their part comes loose, the LED glows red near the end, dragging sideways turns the model. Night lighting: a soft top light from behind, a cold blue rim, a warm side light, a dark contact shadow that follows the lowest part. Without WebGL a flat side view after the workshop drawing is shown, in the same colours.

## Layout and motion

- Engine container 82rem, fluid gutter. Section titles up to 6.4rem. Two-column stages: 0.8fr / 1.35fr (demo), 0.8fr / 1.2fr (explode), text / auto (app), sticky title / list (FAQ).
- Header: transparent over the hero, frosted glass once scrolled; over night stages it switches to night glass with white text and a white pill. It holds only the wordmark and "Das sind wir"; no section links (since 2026-11-07).
- Two sheets (since 2026-11-07, at least 1200px wide and 520px tall): the page is a sheet with rounded corners on a cool grey ground (`--rahmen-grund`), inset 1.5rem top, 1.25rem right and bottom, 10rem left. `body` takes that inset as padding, and the fixed `.rahmen` covers everything outside the sheet with a very wide box-shadow, so the scroll still belongs to the window and pins keep working. The sidebar (`.sprungleiste`) is a second sheet of frosted glass in front (white at 50 %, blur 28px, a white hairline and top highlight, so the page shows through where it overlaps): 12.75rem wide, a little higher than the page (top 0.75rem, bottom 2.75rem), overlapping the page sheet by 3.75rem with a soft shadow, like one sheet of paper lying on another. It holds the wordmark, the sections (Der Chip, Was drinsteckt, Gebaut für den Berg, Die App, Für jeden am Berg, Fragen, Das sind wir) right below it, nothing else (the caption at the bottom was removed on 2026-11-08). Hovering draws a 1rem orange stroke in front of the label from the left and nudges the label 3px; the current section keeps a half-length stroke. The scroll progress line is hidden there; the header keeps only the "Das sind wir" pill, top right inside the sheet, without a bar of its own (white over night stages, since 2026-11-08); text inside the sheet starts at least 6rem from its left edge, right of the sidebar. Below that size there is no frame: the header with the wordmark (which opens the side sheet) and "Das sind wir" is the navigation, as before.
- Below 860px everything stacks: the explode labels show names only, the network graphic shifts its world so the slope and the top station stay in frame and shows only the active step under the picture, the app shows only the active step card above a smaller phone.
- Reduced motion: no snowfall, the hero chip still, the explode shown fully apart, the network graphic at its final state, the ring tile static, counters land on their values.

## Do's and Don'ts

- Do show the chip as the orange object, in 3D or as `#chip-oben`. Don't draw it square or as an outline again.
- Do keep red for the emergency only; orange is not a warning colour here.
- Do label goals as goals ("Ziel") inside the tile. No separate small hint captions (removed at Lukas' request, 2026-11-07): no "Platzhalter", "Modell nach …", "Beispieldaten", "Vorführung" pill or footnotes.
- Do give every section its own background colour.
- Don't name a ski area, a partner, a price or a date. Don't show the server, cables or charging stations (Lukas, 2026-11-04).
- Don't show speed or speed rankings in the app screens.
- Don't load fonts, scripts or models from a CDN.

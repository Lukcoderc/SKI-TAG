---
version: 1
slug: "site-index-html"
primary_target: "site/index.html"
related_targets: []
---

## Scope

Single landing page `site/index.html` for the SkiTag GmbH. Visitor mode: Persuade. Audience: guests, families, ski areas, ski schools and partners with equal weight. For now introduction only (user, 2026-11-04): no rental; the header action "Das sind wir" leads to the team heading, and a back-to-top button sits bottom right once the visitor has scrolled. Honest about the stage: nothing is tested on real hardware yet, rental starts with season 27/28 at the earliest, prices are open.

Constraints: German copy; no KitzSki or other partner names; no invented prices, customers, numbers or claims of working or tested; first names only (public repo); chip, gateway, charging drawer, machine, app and team photos are placeholders until real material exists; mountain footage is Mixkit stock under the Mixkit Stock Video Free License.

## Direction contract

THESIS: Neuschnee. The chip is presented like an object on fresh snow on a bright morning, and the page refuses the dark gadget page with a glowing device and three feature cards.

OWN-WORLD: High-key snow white and pale glacier blue grounds, cold blue shadows (#a9bfd6), deep slate ink (#1b2430), slate soft ink (#4f5d6e); no accent hue except the ink-dark action and emergency red (#d83a2c) that appears only in the moment of the emergency call. Funnel Display for headlines, Funnel Sans for text (replaced Geist after the detector flagged Geist as an overused face; Funnel Sans is the text cut of the same family). Emergency red #d83a2c. Soft real shadows with offset and blur, generous air, thin hairlines in shadow blue.

STORY: The visitor understands that one held button replaces a phone call, sees where the signal goes and that the group can be called too, believes that three people build the whole system from chip to charging drawer and are honest about the stage, and ends with the team and the plan.

FIRST VIEWPORT: Full-bleed bright snow scene (stock clip, scrubbed) with the sky as the upper field; wordmark left and the single action "Das sind wir" right in a quiet bar; headline "Ein Knopf statt eines Anrufs." centred in the sky with one sentence below and one quiet stage line (in development, start at the earliest with season 27/28); the footage fades downward into the snow-white ground (mask, no drawn snowbank) and the chip, a flat labelled placeholder line drawing, stands on that ground with its cold blue cast shadow; falling snow as atmosphere.

FORM: Neuschnee, position 1 of my ordered list (Impeccable's pick, chosen by the user in round two after a steer to bright and clean with the chip in focus). seed:59e55ec417e2348f

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Page order (user, 2026-11-04)

Hero, the fall, Der Chip (try it: short press calls the group, hold calls help, the path to the staff member plays automatically without scrolling), Am ganzen Berg (receivers at lift stations, goal: whole ski area covered), Die App (map and route, tracking, radius), Für jeden am Berg (pros, families, ski schools, for everyone safety first), Das sind wir. No server, cable or charging station content.

## Navigation and motion (user feedback, 2026-11-05)

The wordmark opens a left side sheet (dialog) with jump links to every section. The hero scrubs over 1.8 viewports without dwell, the chip grows and rises, the headline slides away and the footage zooms, so scrolling is clearly felt. The app steps stay on screen as a list with the current one highlighted. The rider panels are a native horizontal scroller with arrow buttons and mouse drag, not a scroll-driven pan.

## Feedback 2 (user, 2026-11-05)

Hero back to 2.6 viewports without dwell; the second line assembles line by line (kinetic) and holds for about half of the travel. The fall lines slide in from the left and "Oder:" grows, both driven by --sc-p. The "Am ganzen Berg" photo wipes up. "Für jeden am Berg" is pinned again: vertical scrolling moves the native horizontal scroller, and manual scrolling, dragging and the arrow buttons add an offset. Removed by the user: the honesty paragraph, the plan timeline and the stage line in the side sheet (the hero stage line stays).

## Feedback 3 (user, 2026-11-05)

Side sheet is translucent (frosted glass, backdrop blur) and opens on hover over the wordmark, click and keyboard still work; no backdrop. The hero stage line is gone. The fall act text is new and ends on "Ein Knopf genügt.". The demo drawing is a soft-blue illustration (sky, ridges, groomed piste, trees, lift, station) without the staff phone; after the call a staff member rides down to the fallen person. The rider rail is a plain flow section again: tap an arrow for one card, hold it to scroll slowly. The footer no longer links the network book.

## Feedback 4 (user, 2026-11-05)

The fall act is removed entirely. In its place a pinned act "Was drinsteckt." shows the chip as an isometric layer stack (button, lid with light, radio and GPS board, battery, wireless charging coil, case) that separates as the visitor scrolls, labels arriving one by one, the LED turning red at the end; based on the prototype exploded drawing in the hardware workshop book and labelled as a sketch. Side sheet links are smaller and plainer (text face at base size, soft white pill for the current one).

## Feedback 5 (user, 2026-11-05)

Order: hero, word-reveal sentence (pinned, words turn from hairline blue to ink with scroll), Der Chip, Was drinsteckt, Am ganzen Berg, Die App, Für jeden am Berg, Das sind wir. The demo is shortened to 1 s hold and 2 s cancel window, with a note that the real chip uses 3 s and 5 s.

## Feedback 6 (user, 2026-11-05)

The word-reveal sentence act is removed; the chip demo follows the hero directly. The wordmark inside the side sheet links to the top. In the team act each name gets a 2px ink rule that draws from the left on entry (staggered), the role fades in after; names shift slightly on hover.

## Signature interaction

Hold the chip's button on the page for three seconds (pointer, touch or keyboard). A ring fills, then a five-second cancel window counts down (a second press cancels, like the real chip); after it the signal draws itself automatically across a line drawing of the slope via the lift station to a staff phone that shows a red point. A short press draws the call to the own group instead. Clearly labelled as a demonstration.

## Unresolved

Company name, address and register data; prices; real chip and team photos; hosting and domain; whether full names may appear.

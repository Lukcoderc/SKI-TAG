# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML, CSS and vanilla JS without a build step (user's choice, 2026-11-03). Scroll mechanics from the ScrollCraft engine (`scrollcraft.js`, `scrollcraft.css`, copied unchanged into the build). Fonts self-hosted, no requests to Google or other font CDNs. Hosting is undecided: GitHub Pages of the `SKI-TAG` repo already serves the Netzwerk-Buch, so the website needs its own repo or host.

## Users

Everyone with equal weight (user's choice): guests and families who would wear the chip, ski areas and mountain railways that would run the system, ski schools, and partners. The page has to make sense to a guest on a phone and to a decision maker at a railway alike.

## Product Purpose

The website presents the SkiTag company (a GmbH that does nothing but SkiTag) and the team behind it. For now it is for introduction only, with no rental or booking (user decision, 2026-11-04). It succeeds when a visitor leaves understanding the one-button emergency call, the whole system and who builds it.

## Positioning

SkiTag is a small rental chip worn in the jacket on a ski day. One button replaces the phone call: held down, it sends an emergency call with the position to the nearest staff member of the mountain railway, without a phone, SIM or mobile network on the guest's side. Pressed briefly, it calls the wearer's own group. A passer-by can hold their own chip at an accident site so rescue knows where it is. The company delivers the whole system, not a gadget: chips, the app for guests, ski schools and railway, receivers (gateways) mounted at lift stations including installation, the server, inductive charging drawers and rental machines.

## Operating Context

Three-person team: Tobias (project, business and sales, app), Lukas (network: gateways and server), Maximilian (hardware: chip, button, battery, firmware, housing, charging box). Origin is the HTL Braunau. Planned timeline: prototypes January 2027, a test day with 5 chips on one slope in February or March 2027, talks with mountain rescue and railways in summer 2027, start in a ski area in season 27/28. Later rental per day and online for a whole season is planned (user, 2026-11-03), but not part of the website for now.

## Capabilities and Constraints

Language of all visible content: German. Fixed: one button, short press calls the group (vibration, no alarm at the railway), holding 3 s plus a 5 s cancel window sends the emergency call; LoRa radio from chip to gateways at lift stations, then server, then the app over the internet. Planned, not built yet: online rental and season rental, rental machines, charging drawers in series.

Must not be claimed: that SkiTag works, is tested or available today (nothing has run on real hardware, range is not measured); that the whole chain works without internet (only the guest needs no phone or network); secure encryption or GDPR compliance; target times for the emergency call; that the app alerts staff on a locked phone; that SkiTag replaces 140 or the rescue chain (liability is open). No named ski area or partner: KitzSki must not appear yet, Element3 neither.

## Brand Commitments

Name: SkiTag (the pitch writes "SKI-Tag"; the book and code use SkiTag). The exact company name, seat, register number and contact address are not known yet and must stay visible placeholders. No logo exists. Full names of the team are undecided for the public site; the `SKI-TAG` repo is public and allows first names only.

## Evidence on Hand

Pitch presentation and handoff (Obsidian vault, `10_Projekte/Skitag`), the Netzwerk-Buch (https://lukcoderc.github.io/SKI-TAG/), the hardware workshop book by Maximilian with one exploded drawing of the prototype (button with soft collar, lid with LED, board with radio, GPS and sensors, LiPo 1000 mAh, Qi receiver, base; printed housing). No photos of the chip, team or charging box, no prices, no customers, no testimonials, no measurements. Product imagery stays a placeholder until real material exists. Mountain, slope and night footage may be stock or generated and must be labelled with its origin in the asset metadata.

## Product Principles

- One button, one promise: every section returns to the button and what it sets in motion.
- Honest about the stage: show the plan and the mechanism, never a finished or tested product.
- The whole system, from the chip in the jacket to the charging drawer, is the offer.
- Introduce, do not sell yet: the page ends with the team and the plan, not with a booking.

## Accessibility & Inclusion

WCAG 2.2 AA. Scroll animation must keep meaning with reduced motion. Readable on phones in bright snow light and in the dark.

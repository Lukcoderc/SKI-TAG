# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML, CSS and a little JS without a build step, served by GitHub Pages from `docs/`.

## Users

The SkiTag team: Tobias (project, business, app) and Maximilian (hardware), plus Lukas as author. They use the book as the shared reference for everything between chip and app. Readers open it while working on their own part and need to find what touches them. The first chapters assume no networking knowledge.

## Product Purpose

The Netzwerk-Buch documents the SkiTag network: LoRa receivers, server and everything between chip and app. It records what is fixed, what was decided and why, and what is still open. It succeeds when a teammate can answer a network question from the book without asking Lukas.

## Positioning

SkiTag is a rental chip for ski areas that sends emergency calls with position to the mountain railway and can call the wearer's own group, without phone and without mobile network. The book is the single written account of how a button press in a jacket reaches a staff member's app.

## Operating Context

Project work of a three-person team. Test day with 5 prototype chips and 2 receivers in February/March 2027, prototypes in January 2027, start in a ski area in season 27/28. Target area: KitzSki. Readers on laptops and phones, the link is shared via GitHub Pages.

## Capabilities and Constraints

Language: German. Fixed: LoRa radio, chip to receivers at stations to server to app, no phone, no SIM. Own server on site at KitzSki IT, publicly reachable over the internet. Nothing has been tested on real hardware yet and no range has been measured, so estimates must be labelled as estimates. Open points (no-internet meaning, range, power and network at stations, distance alarm, GDPR) stay marked as open. The repo is public: never publish keys, passwords or personal contact data.

## Evidence on Hand

Handoff document by Tobias (2026-10-29) and pitch presentation, summarised in the Obsidian vault under `10_Projekte/Skitag`. Server self-test 58 of 58 passing, simulator available, both PC only. No photographs, measurements or customer statements exist yet and must not be invented.

## Product Principles

- Say what is fixed, what is decided and what is open, and keep the three apart.
- Explain the path of a real signal instead of listing components.
- Every estimate is labelled as an estimate until it has been measured.
- Maximilian's and Tobias's areas are referenced, not redefined.

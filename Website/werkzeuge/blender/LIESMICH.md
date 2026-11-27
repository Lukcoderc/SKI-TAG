# Chip-Renderbilder (Feedback 131)

Maxis Modell „fertig4“ als Produktfoto aus Blender 4.2 (Cycles). Nicht Teil der veröffentlichten Seite.

1. `export.html` + `GLTFExporter.js` (three.js r169) nach `site/_werkzeug/` legen, Seite über einen lokalen Server öffnen:
   sie baut die Szene aus `assets/chip-seite.js` nach und legt die GLB-Datei als Base64 in `window.__glb`
   (danach `site/_werkzeug/` wieder löschen, es soll nicht veröffentlicht werden).
2. `blender -b --python dreh.py -- <dieser Ordner> chip.glb <ausgabe>`: 30 Drehbilder und `punkte.json`
   (`innen.py`: 25 Bilder der Explosionsansicht, `produkt.py`: liegendes Produktbild). Licht und Materialien in `szene.py`.
   Die Explosionsansicht auf der Chip-Seite macht `oeffnen.py` (1800 x 1350, gestaffelt geöffnet, Wege in `szene.py` unter `STAFFEL`).
   Seit 2026-11-22 mit 192 Bildern auf der Grafikkarte, gleichmäßig in der Zeit verteilt:
   `ZEITKURVE=1 BILDER=192 GERAET=OPTIX PROBEN=64 blender -b --python oeffnen.py -- ...` (RTX 4070 Super: etwa 6 bis 8 s je Bild).
3. `python3 wandeln.py <ausgabe> ../../site/assets/media/chip 900` (Explosion: `... innen 1800 .../innen/m 1100 --zuschnitt --klein-schritt=3`, die Handyfassung hat dann nur jedes dritte Bild),
   `standbild.py` macht `chip-3d.webp`.

Dauer auf 4 Kernen: etwa 1 bis 1,5 Minuten je Bild; auf der Grafikkarte (GERAET=OPTIX) einige Sekunden.

## SkiTag-Ausleihstation oben auf der Chip-Seite (Feedback 159, vorher Automat und Jackentasche)

Ein Wandgerät neben dem Lift in echten Maßen (340 × 520 × 130 mm): hellgraues Gehäuse, eingesetzte Frontplatte in Navy,
Bildschirm hinter Deckglas, Lesefeld, Rückgabeschlitz, Ausgabefach mit dunklem Einsatz und verdecktem Lichtband. Freigestellt
im Studiolicht, eine unsichtbare Wand dahinter fängt nur den Schatten. Der Chip fällt aus einem Schlitz in der Decke des
Fachs und steht am Ende genau wie Bild 9 der Drehfolge (`CHIPBILD=9`), damit der fliegende Chip ohne Sprung übernimmt.
Die Form ist ein Entwurf: im Werkstattbuch und im Vault gibt es dazu keine Angaben.

1. `python automat.py -- <dieser Ordner> chip.glb <ausgabe> 960 64 16`: Bilder `00` bis `15` (960 × 1200, mit Alpha) und
   `lage.json` (die vier Ecken der Frontplatte und der Rahmen des Chips im Fach, als Anteile des Bildes). Die Werte kommen in
   `chip.html` als `data-front` und `data-chip` an die `.station`; `chip-flug.js` legt die HTML-Front daraus mit einer
   perspektivischen Matrix auf das Bild. `... 960 64 16 leer` rendert `leer.png` (Fach ohne Chip, Licht an),
   `... vorschau` ein einzelnes Bild zum Prüfen. Etwa 90 s je Bild auf 4 Kernen.
2. In WebP wandeln (Qualität 82), dabei den Wandschatten zu den Rändern hin auslaufen lassen (rechts und unten), sonst ist
   auf der Seite eine Kante zu sehen. Ziel: `site/assets/media/station/`.

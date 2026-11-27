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

## SkiTag-Automat oben auf der Chip-Seite (Feedback 158, vorher die Jackentasche aus Feedback 157)

Ein Automat vor dem Lift (Säule in Navy, Glasfront, Kopfleiste, Kartenleser, Belegschlitz, Ausgabefach mit Lichtband). Der
Chip kommt aus dem Fach. Die Form des Automaten ist ein Entwurf: im Werkstattbuch und im Vault gibt es dazu keine Angaben.
Bildschirm und Kopfleiste sind im Render dunkles Glas, was sie zeigen, legt die Seite als HTML darüber.

1. Hintergrund: `site/assets/media/foto-lift-morgen.webp` mit Gauß-Unschärfe 9 px als `hinten.png` speichern.
2. `python automat.py -- <dieser Ordner> chip.glb hinten.png <ausgabe> 800 48 24`: Bilder `00` bis `23` (800 × 1176) und
   `lage.json` (Bildschirm, Kopfleiste, Lesefeld, Schlitz, Fach, Chip am Anfang und Ende, als Anteile des Bildes; daraus sind
   die Maße in `chip-seite.css` gerechnet, `.chip-automat__start` zusammen mit dem Rahmen des Chips in Bild 16 des Chipfilms).
   `... 800 48 24 leer` rendert `leer.png` (Fach ohne Chip). Etwa 45 s je Bild auf 4 Kernen.
3. Als WebP nach `site/assets/media/automat/` (Qualität 82), `standbild.webp` ist Bild 0 (für weniger Bewegung).

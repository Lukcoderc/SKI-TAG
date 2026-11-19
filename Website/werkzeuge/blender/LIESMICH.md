# Chip-Renderbilder (Feedback 131)

Maxis Modell „fertig4“ als Produktfoto aus Blender 4.2 (Cycles). Nicht Teil der veröffentlichten Seite.

1. `export.html` + `GLTFExporter.js` (three.js r169) nach `site/_werkzeug/` legen, Seite über einen lokalen Server öffnen:
   sie baut die Szene aus `assets/chip-seite.js` nach und legt die GLB-Datei als Base64 in `window.__glb`
   (danach `site/_werkzeug/` wieder löschen, es soll nicht veröffentlicht werden).
2. `blender -b --python dreh.py -- <dieser Ordner> chip.glb <ausgabe>`: 30 Drehbilder und `punkte.json`
   (`innen.py`: 25 Bilder der Explosionsansicht, `produkt.py`: liegendes Produktbild). Licht und Materialien in `szene.py`.
3. `python3 wandeln.py <ausgabe> ../../site/assets/media/chip 900` (Explosion: `... innen 1200 .../innen/m 700`),
   `standbild.py` macht `chip-3d.webp`.

Dauer auf 4 Kernen: etwa 1 bis 1,5 Minuten je Bild.

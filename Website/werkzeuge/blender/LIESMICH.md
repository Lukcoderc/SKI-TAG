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

## Jackentasche oben auf der Chip-Seite (Feedback 157)

Der Chip steckt in der Brusttasche einer Hardshell-Jacke (verschweißter Reißverschluss) und gleitet beim Scrollen heraus.
Kein Foto: die ganze Szene ist in Blender gebaut, der Stoff der unteren Taschenhälfte wird je Bild simuliert.

1. `python tuch.py -- tuch_alle.npz <t1,...,t24>` (die 24 Stellungen `i/23`) und `python tuch.py -- tuch_leer.npz 1 leer`,
   dann beide zu `tuch_fertig.npz` zusammenlegen (Schlüssel `leer` dazu). Mit `BIEG=1.5` (Biegesteifigkeit).
   Etwa 20 s je Stellung auf 4 Kernen.
2. `TUCH=tuch_fertig.npz python jacke.py -- <dieser Ordner> chip.glb <ausgabe> 800 48 24`: Bilder `00` bis `23`,
   `leer.png` (Tasche ohne Chip) und `lage.json` (wo der Chip im letzten Bild steht; daraus sind die Maße von
   `.chip-tasche__start` in `chip-seite.css` gerechnet, zusammen mit dem Rahmen des Chips in Bild 16 des Chipfilms).
   Etwa 40 s je Bild auf 4 Kernen.
3. Als WebP nach `site/assets/media/tasche/` (Qualität 82), `standbild.webp` ist Bild 12 (für weniger Bewegung).

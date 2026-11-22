# PNG-Renderbilder -> WebP im Projekt; Aufruf: wandeln.py quelle ziel groesse [klein_ziel klein_groesse] [--zuschnitt] [--klein-jedes-zweite]
# Mit --klein-jedes-zweite bekommt die kleine Fassung nur jedes zweite Bild (fortlaufend nummeriert, eigene punkte.json),
# damit das Handy nicht doppelt so viele dekodierte Bilder im Speicher halten muss.
# groesse ist die Breite des ganzen Bildes. Mit --zuschnitt (Explosionsansicht, Feedback 132) wird jedes Bild auf den Bereich
# geschnitten, den der Chip in irgendeinem der Bilder einnimmt (für alle derselbe Ausschnitt); der Ausschnitt steht
# als „ausschnitt“ [x0, y0, x1, y1] (Anteile des ganzen Bildes) in punkte.json, innen-film.js setzt das Bild dorthin.
import sys, os, glob, json
from PIL import Image
args = [a for a in sys.argv[1:] if not a.startswith('--')]; zuschnitt = '--zuschnitt' in sys.argv; zweite = '--klein-jedes-zweite' in sys.argv
q, z, g = args[0], args[1], int(args[2])
klein = (args[3], int(args[4])) if len(args) > 4 else None
os.makedirs(z, exist_ok=True)
bilder = sorted(glob.glob(q + '/[0-9][0-9].png'))
daten = json.load(open(q + '/punkte.json'))
box = (0.0, 0.0, 1.0, 1.0)
if zuschnitt:
    x0 = y0 = 1e9; x1 = y1 = -1
    for p in bilder:
        im = Image.open(p); b = im.getchannel('A').point(lambda a: 255 if a > 2 else 0).getbbox()
        if b: x0, y0, x1, y1 = min(x0, b[0]), min(y0, b[1]), max(x1, b[2]), max(y1, b[3])
    W, H = Image.open(bilder[0]).size; rand = round(W * 0.01)
    x0, y0, x1, y1 = max(0, x0 - rand), max(0, y0 - rand), min(W, x1 + rand), min(H, y1 + rand)
    box = (x0 / W, y0 / H, x1 / W, y1 / H)
    daten['ausschnitt'] = [round(v, 5) for v in box]
def speichern(im, breite, pfad, qual):
    s = breite / im.width   # Maßstab des ganzen Bildes
    teil = im.crop((round(box[0] * im.width), round(box[1] * im.height), round(box[2] * im.width), round(box[3] * im.height)))
    teil = teil.resize((round(teil.width * s), round(teil.height * s)), Image.LANCZOS) if s != 1 else teil
    teil.save(pfad, 'WEBP', quality=qual, method=6, alpha_quality=90)
# kleine Fassung: bei jedem zweiten Bild immer mit dem letzten (ganz offen) enden
wahl = list(range(0, len(bilder), 2)) if zweite else list(range(len(bilder)))
if zweite and wahl[-1] != len(bilder) - 1: wahl.append(len(bilder) - 1)
for k, p in enumerate(bilder):
    n = os.path.basename(p)[:-4]
    im = Image.open(p).convert('RGBA')
    speichern(im, g, f'{z}/{n}.webp', 86)
    if klein and k in wahl:
        os.makedirs(klein[0], exist_ok=True); speichern(im, klein[1], f'{klein[0]}/{wahl.index(k):02d}.webp', 84)
json.dump(daten, open(z + '/punkte.json', 'w'))
if klein and zweite:
    kd = dict(daten); kd['bilder'] = [daten['bilder'][k] for k in wahl]; kd['n'] = len(wahl)
    json.dump(kd, open(klein[0] + '/punkte.json', 'w'))
print(len(glob.glob(z + '/*.webp')), sum(os.path.getsize(f) for f in glob.glob(z + '/*.webp')) // 1024, 'KB', 'Ausschnitt', box)

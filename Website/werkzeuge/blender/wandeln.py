# PNG-Renderbilder -> WebP im Projekt; Aufruf: wandeln.py quelle ziel groesse [klein_ziel klein_groesse]
import sys, os, glob, shutil
from PIL import Image
q, z, g = sys.argv[1], sys.argv[2], int(sys.argv[3])
os.makedirs(z, exist_ok=True)
for p in sorted(glob.glob(q + '/[0-9][0-9].png')):
    n = os.path.basename(p)[:-4]; ziel = f'{z}/{n}.webp'
    if os.path.exists(ziel) and os.path.getmtime(ziel) > os.path.getmtime(p): continue
    im = Image.open(p).convert('RGBA'); im = im.resize((g, round(g * im.height / im.width)), Image.LANCZOS)
    im.save(ziel, 'WEBP', quality=82, method=6, alpha_quality=90)
    if len(sys.argv) > 5:
        os.makedirs(sys.argv[4], exist_ok=True); k = int(sys.argv[5])
        im.resize((k, round(k * im.height / im.width)), Image.LANCZOS).save(f'{sys.argv[4]}/{n}.webp', 'WEBP', quality=80, method=6, alpha_quality=88)
shutil.copy(q + '/punkte.json', z + '/punkte.json')
print(len(glob.glob(z + '/*.webp')), sum(os.path.getsize(f) for f in glob.glob(z + '/*.webp')) // 1024, 'KB')

# Standbild chip-3d.webp im Maß von .chip-bild (Chip = Bildhöhe / 1,3, Mitte bei 45,4 %) aus einem Drehbild
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert('RGBA'); W = im.width
L = W * 66 / (270 * 36 / 105)        # Chiplänge in Pixeln (Kamera 270 mm, 105 mm, Sensor 36 mm)
Hc = 1.3 * L; Wc = Hc * 0.75; top = W / 2 - 0.454 * Hc; left = W / 2 - Wc / 2
im.crop((round(left), round(top), round(left + Wc), round(top + Hc))).resize((900, 1200), Image.LANCZOS).save(sys.argv[2], 'WEBP', quality=84, method=6, alpha_quality=90)

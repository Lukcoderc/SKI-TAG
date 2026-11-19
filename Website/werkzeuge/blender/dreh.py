# Drehfolge des geschlossenen Chips (hochkant) mit den Bildpunkten für Knopf, Ring, LED, Rand und Seite
import sys, json, math, time; sys.path.insert(0, sys.argv[-3])
import bpy, szene as Z
from mathutils import Vector
glb, aus, groesse = sys.argv[-2], sys.argv[-1], 1000
Z.aufbauen(glb, (groesse, groesse), 32)
Z.ruhelage(); Z.oeffnen(0)
E = Z.S['ebenen']
rb = Z.welt_bbox(E['ring']); kb = Z.welt_bbox(E['kappe']); lb = Z.welt_bbox(E['ledstab']); ob = Z.welt_bbox(E['rand']); sb = Z.welt_bbox(E['rueckschale'])
mit = lambda b: (b[0] + b[1]) / 2
knopf = Vector((mit(rb).x, mit(rb).y, max(rb[1].z, kb[1].z) + 0.25))
knopfR = max(rb[1].x - rb[0].x, rb[1].y - rb[0].y) / 2
led = Vector((mit(lb).x, mit(lb).y, lb[1].z))
ledR = max(lb[1].x - lb[0].x, lb[1].y - lb[0].y) / 2
ledAbst = math.hypot(led.x - knopf.x, led.y - knopf.y)
ringM = min(knopfR + 2.4, ledAbst - ledR - 0.5 - 1.2)
rand = Vector((ob[1].x - 3, ob[0].y + (ob[1].y - ob[0].y) * 0.18, ob[1].z - 1.5))
seite = Vector((sb[0].x + (sb[1].x - sb[0].x) * 0.32, sb[0].y + 0.5, mit(sb).z))
kreis = lambda r, n: [knopf + Vector((math.cos(2 * math.pi * i / n) * r, -math.sin(2 * math.pi * i / n) * r, 0)) for i in range(n)]
ring = kreis(ringM, 48); rand_knopf = kreis(knopfR + 2.6, 16); ring_aussen = kreis(knopfR, 32)
print('Knopf', knopf, knopfR, 'Ring', ringM, 'LED', led)
gieren = [round(-0.72 + 0.04 * i, 2) for i in range(30)]
daten = {'gieren': gieren, 'nick': 0.08, 'bilder': []}
def pp(v): x, y = Z.projizieren(Z.S['dreh'].matrix_world @ v); return [round(x, 5), round(y, 5)]
for i, g in enumerate(gieren):
    Z.pose(0.08, g, 0.0); Z.kamera(270)
    b = {'led': pp(led), 'knopf': pp(knopf), 'rand': pp(rand), 'seite': pp(seite),
         'ring': [pp(v) for v in ring], 'knopfRand': [pp(v) for v in rand_knopf]}
    daten['bilder'].append(b)
    t = time.time(); Z.rendern(f'{aus}/{i:02d}.png'); print('Bild', i, round(time.time() - t))
    json.dump(daten, open(f'{aus}/punkte.json', 'w'))

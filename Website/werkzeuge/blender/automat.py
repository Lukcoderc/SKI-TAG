# SkiTag-Automat vor dem Lift: der Chip kommt aus dem Ausgabefach und fliegt auf die Kamera zu (Feedback 158).
# python automat.py -- <ordner mit szene.py> <chip.glb> <hintergrund.png> <ausgabe> [breite] [proben] [bilder] [nur]
# Ausgabe: <ausgabe>/NN.png (Chip kommt heraus), <ausgabe>/lage.json (Bildschirm, Lesefeld, Belegschlitz, Chip am Ende)
# Der Bildschirm bleibt dunkles Glas: was er zeigt, legt die Seite als HTML darüber (scharf und beim Scrollen animiert).
import sys, math, json, os
argv = sys.argv[sys.argv.index('--') + 1:]
sys.path.insert(0, argv[0])
import bpy, bmesh, szene as Z
from mathutils import Vector, Matrix

glb, grund_bild, aus = argv[1], argv[2], argv[3]
BREITE = int(argv[4]) if len(argv) > 4 else 800
PROBEN = int(argv[5]) if len(argv) > 5 else 48
BILDER = int(argv[6]) if len(argv) > 6 else 24
NUR = argv[7] if len(argv) > 7 else ''
HOEHE = round(BREITE / 0.68)
os.makedirs(aus, exist_ok=True)

Z.aufbauen(glb, (BREITE, HOEHE), PROBEN)
Z.ruhelage(); Z.oeffnen(0); Z.pose(0.08, -0.08, 0.0)
sc = Z.S['sc']; sc.render.film_transparent = False
dreh = Z.S['dreh']; GRUND_M = dreh.matrix_world.copy()
lin = Z.lin

def glatt(t): t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)

# ---------------------------------------------------------------- Licht-Verknüpfung wie in jacke.py
chip_sam = bpy.data.collections.new('chipteile'); sc.collection.children.link(chip_sam)
for o in bpy.data.objects['Node_72'].children_recursive:
    if o.type == 'MESH': chip_sam.objects.link(o)
welt_sam = bpy.data.collections.new('automat'); sc.collection.children.link(welt_sam)
def dazu(o):
    if o.name not in welt_sam.objects: welt_sam.objects.link(o)
    return o
for n in ('haupt', 'streif'):
    o = bpy.data.objects[n]; o.light_linking.receiver_collection = chip_sam; o.hide_render = False
for n in ('softbox', 'streifen'): bpy.data.objects[n].hide_render = True
bpy.data.objects['kante'].hide_render = True; bpy.data.objects['kante2'].hide_render = True

# ---------------------------------------------------------------- Materialien
def mat(name, farbe, rau, metall=0.0, spek=0.5, coat=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; I = Z.bsdf(m).inputs
    I['Base Color'].default_value = lin(farbe); I['Roughness'].default_value = rau; I['Metallic'].default_value = metall
    I['Specular IOR Level'].default_value = spek; I['Coat Weight'].default_value = coat; I['Coat Roughness'].default_value = 0.08
    return m

def pulver(name, farbe):
    """Pulverbeschichtung: matt mit feiner Orangenhaut (Rauschen in der Normale)"""
    m = mat(name, farbe, 0.48, 0.0, 0.45, 0.25); Z.rauschen(m, 0.08, 0.9)
    return m

KOERPER = pulver('koerper', '#132650')
GLAS = mat('glas', '#030508', 0.03, 0.0, 0.6, 0.0)
INNEN = mat('innen', '#080b12', 0.75, 0, 0.3)
RAHMEN = mat('rahmen', '#b9c0cc', 0.28, 1.0)          # eloxierter Aluminium-Rahmen um Glas und Fach
LESER = mat('leser', '#0b1120', 0.18, 0, 0.5, 0.6)

def leucht(name, farbe, kraft):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    o = nt.nodes.new('ShaderNodeOutputMaterial'); e = nt.nodes.new('ShaderNodeEmission')
    e.inputs['Color'].default_value = lin(farbe); e.inputs['Strength'].default_value = kraft
    nt.links.new(e.outputs[0], o.inputs['Surface']); return m
LED = leucht('led', '#ff5a1c', 6.0)
BILDSCHIRM = leucht('bildschirm', '#0b1a3a', 0.35)    # schwaches Grundleuchten, das HTML liegt darüber

# ---------------------------------------------------------------- Formen
def kasten(name, x0, x1, y0, y1, z0, z1, m, fase=0.0, seg=4):
    bm = bmesh.new(); r = bmesh.ops.create_cube(bm, size=1.0)
    for v in r['verts']:
        v.co.x = (x0 + x1) / 2 + v.co.x * (x1 - x0); v.co.y = (y0 + y1) / 2 + v.co.y * (y1 - y0); v.co.z = (z0 + z1) / 2 + v.co.z * (z1 - z0)
    if fase:
        # flache Teile: nur die Kanten entlang y runden (Ecken in der Ansicht), sonst zerfällt die Fase
        dick = (y1 - y0) < 2.2 * fase
        kanten = [e for e in bm.edges if not dick or abs(e.verts[0].co.y - e.verts[1].co.y) > 1e-6]
        bmesh.ops.bevel(bm, geom=kanten + ([] if dick else bm.verts[:]), offset=fase, segments=seg, affect='EDGES', profile=0.5,
                        clamp_overlap=True)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o); dazu(o); me.materials.append(m)
    for p in me.polygons: p.use_smooth = True
    return o

def ausschnitt(ziel, schneider):
    """Boolean: schneider aus ziel herausschneiden, schneider danach unsichtbar"""
    b = ziel.modifiers.new('aus_' + schneider.name, 'BOOLEAN'); b.operation = 'DIFFERENCE'; b.object = schneider; b.solver = 'EXACT'
    schneider.hide_render = True; schneider.display_type = 'WIRE'

# Gehäuse: Säule 420 breit, 280 tief; Vorderseite bei y = 0
koerper = kasten('koerper', -210, 210, 0, 280, -1100, 410, KOERPER, 26, 6)
# Glasfront oben (leicht vorstehend) mit dem Bildschirm dahinter
GL = (-178, 178, -30, 312)          # x0, x1, z0, z1 der Glasfläche
BS = (-150, 150, -2, 284)           # Bildschirm hinter dem Glas
rahmen_g = kasten('rahmen_glas', GL[0] - 4, GL[1] + 4, -5, 6, GL[2] - 4, GL[3] + 4, RAHMEN, 6, 4)
glas = kasten('glas', GL[0], GL[1], -6.5, -1, GL[2], GL[3], GLAS, 4, 3)
schirm = kasten('schirm', BS[0], BS[1], -1.2, -0.9, BS[2], BS[3], BILDSCHIRM, 10, 4)
# Kopfleiste über dem Glas: dunkles Glas, darauf legt die Seite den Schriftzug als HTML
KO = (-150, 150, 338, 384)
rahmen_k = kasten('rahmen_kopf', KO[0] - 4, KO[1] + 4, -4, 5, KO[2] - 4, KO[3] + 4, RAHMEN, 6, 4)
kopfglas = kasten('kopfglas', KO[0], KO[1], -5.5, -1, KO[2], KO[3], GLAS, 4, 3)
# Ausgabefach: Öffnung 128 x 150, 110 tief, ein Alu-Rahmen und innen ein Lichtband
FA = (-64, 64, -282, -132)
schneid = kasten('fach_schneider', FA[0], FA[1], -40, 110, FA[2], FA[3], INNEN, 14, 5)
ausschnitt(koerper, schneid)
innen = kasten('fach_innen', FA[0] - 2, FA[1] + 2, 110, 116, FA[2] - 2, FA[3] + 2, INNEN, 0)
# Wände des Fachs als dünne, dunkle Hülle (damit es innen nicht navy, sondern dunkel ist)
for n, (a, b, c, d) in {'w_l': (FA[0] - 3, FA[0], FA[2], FA[3]), 'w_r': (FA[1], FA[1] + 3, FA[2], FA[3]),
                        'w_o': (FA[0], FA[1], FA[3], FA[3] + 3), 'w_u': (FA[0], FA[1], FA[2] - 3, FA[2])}.items():
    kasten(n, a, b, 14, 110, c, d, INNEN, 0)
rahmen_f = kasten('rahmen_fach', FA[0] - 9, FA[1] + 9, -4, 3, FA[2] - 9, FA[3] + 9, RAHMEN, 12, 5)
rs = kasten('rahmen_fach_loch', FA[0], FA[1], -10, 10, FA[2], FA[3], RAHMEN, 12, 5); ausschnitt(rahmen_f, rs)
# Lichtband im Fach: schmaler Streifen ringsum, 14 mm hinter der Kante
led = kasten('led', FA[0] + 1, FA[1] - 1, 16, 19, FA[2] + 1, FA[3] - 1, LED, 12, 4)
ls = kasten('led_loch', FA[0] + 4, FA[1] - 4, 10, 25, FA[2] + 4, FA[3] - 4, LED, 9, 4); ausschnitt(led, ls)
# Kartenleser rechts, Belegschlitz links (zwischen Glas und Fach)
LE = (78, 168, -112, -54)
leser = kasten('leser', LE[0], LE[1], -6, 2, LE[2], LE[3], LESER, 10, 5)
SL = (-168, -78, -86, -80)
schlitz_r = kasten('schlitz_rahmen', SL[0] - 6, SL[1] + 6, -4, 2, SL[2] - 7, SL[3] + 7, RAHMEN, 6, 4)
schlitz = kasten('schlitz', SL[0], SL[1], -8, 30, SL[2], SL[3], INNEN, 1.5, 2)
ausschnitt(schlitz_r, schlitz); schlitz.hide_render = False
ausschnitt(koerper, kasten('schlitz_s', SL[0], SL[1], -10, 30, SL[2], SL[3], INNEN, 1.5, 2))

# Nach den Ausschnitten: gewichtete Normalen, damit die großen Flächen nach dem Schneiden keine Schattenstreifen bekommen
# (Booleans anwenden und scharfe Kanten nach Winkel setzen, sonst laufen Schattenlinien quer über die Front)
dg = bpy.context.evaluated_depsgraph_get()
for o in list(welt_sam.objects):
    if o.type == 'MESH' and any(m.type == 'BOOLEAN' for m in o.modifiers):
        neu = bpy.data.meshes.new_from_object(o.evaluated_get(dg)); o.modifiers.clear(); o.data = neu
        neu.set_sharp_from_angle(angle=math.radians(30))
# ---------------------------------------------------------------- Hintergrund: Foto vom Lift am Morgen, weich
bild = bpy.data.images.load(grund_bild)
hm = bpy.data.materials.new('hinten'); hm.use_nodes = True; nt = hm.node_tree; nt.nodes.clear()
o_ = nt.nodes.new('ShaderNodeOutputMaterial'); em = nt.nodes.new('ShaderNodeEmission'); tx = nt.nodes.new('ShaderNodeTexImage')
tx.image = bild; em.inputs['Strength'].default_value = 1.0
nt.links.new(tx.outputs['Color'], em.inputs['Color']); nt.links.new(em.outputs[0], o_.inputs['Surface'])
bw, bh = bild.size
HD = 2600.0; HB = 2200.0; HH = HB * bh / bw
me = bpy.data.meshes.new('hinten')
me.from_pydata([(-HB / 2, HD, -HH / 2 - 250), (HB / 2, HD, -HH / 2 - 250), (HB / 2, HD, HH / 2 - 250), (-HB / 2, HD, HH / 2 - 250)], [], [(0, 1, 2, 3)])
uv = me.uv_layers.new()
for i, l in enumerate(me.loops): uv.data[i].uv = [(0, 0), (1, 0), (1, 1), (0, 1)][l.vertex_index]
hinten = bpy.data.objects.new('hinten', me); sc.collection.objects.link(hinten); me.materials.append(hm)
hinten.visible_diffuse = False; hinten.visible_glossy = True; hinten.visible_shadow = False

# ---------------------------------------------------------------- Kamera und Licht
cam = Z.S['kamera']; cam.data.lens = 75; cam.data.sensor_fit = 'HORIZONTAL'; cam.data.sensor_width = 36
ZIEL = Vector((0, 0, 55.0)); ABST = 1042
cam.location = ZIEL + Vector((0, -ABST, 0)); cam.rotation_euler = (ZIEL - cam.location).to_track_quat('-Z', 'Y').to_euler()

# Morgenlicht: weich von links oben (kühl), warmes Kantenlicht von rechts hinten wie der Himmel im Foto
key = Z.flaechenlicht('a_key', (-900, -700, 900), (0, 0, -100), 9e6, 700, (0.92, 0.95, 1.0))
warm = Z.flaechenlicht('a_warm', (900, 300, 600), (0, 0, 0), 7e6, 300, (1.0, 0.7, 0.58))
warm2 = Z.flaechenlicht('a_warm2', (-900, 300, 400), (0, 0, 0), 3e6, 300, (1.0, 0.75, 0.65))
fill = Z.flaechenlicht('a_fill', (500, -1200, -200), (0, 0, 0), 1.5e6, 900, (0.85, 0.9, 1.0))
for l in (key, warm, warm2, fill): l.light_linking.receiver_collection = welt_sam
# der Chip bekommt im Fach orangenes Licht vom Lichtband
cl = Z.flaechenlicht('chip_led', (0, -10, -205), (0, 200, -205), 2.0e4, 60, (1.0, 0.45, 0.2))
cl.light_linking.receiver_collection = chip_sam

# ---------------------------------------------------------------- Weg des Chips
# Start: hinten im Fach. Ende: 330 mm vor der Front, etwas höher. Erst schiebt er sich langsam vor, dann kommt er schneller.
START = Vector((0, 52, -206)); ENDE = Vector((0, -430, -70))
def ort_bei(t):
    s = glatt(t / 0.35) * 0.18 + glatt((t - 0.3) / 0.7) * 0.82
    s = min(1.0, s)
    p = START.lerp(ENDE, s)
    p.z += math.sin(min(1.0, s) * math.pi) * 14
    return p
def chip_auf(p):
    m = GRUND_M.copy(); m.translation = p; dreh.matrix_world = m; bpy.context.view_layer.update()

def rahmen_von(objs):
    from bpy_extras.object_utils import world_to_camera_view
    bpy.context.view_layer.update(); xs, ys = [], []
    for o in objs:
        mw = o.matrix_world
        for v in list(o.data.vertices)[::3]:
            p = world_to_camera_view(sc, cam, mw @ v.co); xs.append(p.x); ys.append(1 - p.y)
    return [round(min(xs), 5), round(min(ys), 5), round(max(xs), 5), round(max(ys), 5)]
def flaeche(x0, x1, z0, z1, y):
    from bpy_extras.object_utils import world_to_camera_view
    a = world_to_camera_view(sc, cam, Vector((x0, y, z1))); b = world_to_camera_view(sc, cam, Vector((x1, y, z0)))
    return [round(a.x, 5), round(1 - a.y, 5), round(b.x, 5), round(1 - b.y, 5)]

chip_auf(ort_bei(1.0))
lage = {'groesse': [BREITE, HOEHE], 'bilder': BILDER, 'bildschirm': flaeche(*BS, -1.2), 'glas': flaeche(*GL, -6.5),
        'leser': flaeche(*LE, -6), 'kopf': flaeche(*KO, -5.5), 'schlitz': flaeche(*SL, -4), 'fach': flaeche(*FA, -4),
        'chip_ende': rahmen_von(chip_sam.objects)}
chip_auf(ort_bei(0.0)); lage['chip_start'] = rahmen_von(chip_sam.objects)
json.dump(lage, open(f'{aus}/lage.json', 'w'), indent=1)
print('lage', lage)

def bild(t, pfad):
    chip_auf(ort_bei(t))
    LED.node_tree.nodes['Emission'].inputs['Strength'].default_value = 2.5 + 5.0 * glatt(t / 0.25)
    Z.rendern(pfad)

if NUR == 'leer':
    # leeres Fach (Chip schon draußen), für das Ende der Bildfolge
    for o in chip_sam.objects: o.hide_render = True
    cl.hide_render = True; LED.node_tree.nodes['Emission'].inputs['Strength'].default_value = 7.5
    Z.rendern(f'{aus}/leer.png')
elif NUR:
    for t in NUR.split(','): bild(float(t), f'{aus}/t{t}.png')
else:
    for i in range(BILDER): bild(i / (BILDER - 1), f'{aus}/{i:02d}.png')

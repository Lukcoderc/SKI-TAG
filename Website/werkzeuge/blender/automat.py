# SkiTag-Ausleihstation (Feedback 159, ersetzt den Automaten aus Feedback 158): ein Wandgerät neben dem Lift in echten
# Maßen (340 x 520 x 130 mm), freigestellt im Studiolicht wie ein Produktfoto. Der Chip fällt aus einem Schlitz in der
# Decke des Ausgabefachs und bleibt dort stehen. Er steht am Ende genau so wie Bild K der Chip-Drehfolge (assets/media/chip),
# damit der fliegende Chip auf der Seite ohne Sprung übernehmen kann.
# Bildschirm, Aufdrucke und das Leuchten des Lesefelds legt die Seite als HTML perspektivisch darüber (lage.json: die vier
# Ecken der Frontplatte im Bild).
#
# python automat.py -- <ordner mit szene.py> <chip.glb> <ausgabe> [breite] [proben] [bilder] [nur]
#   nur = 'leer' (Fach ohne Chip) oder 'vorschau' (ein Bild mit Chip am Ende)
import sys, math, json, os
argv = sys.argv[sys.argv.index('--') + 1:]
sys.path.insert(0, argv[0])
import bpy, bmesh, szene as Z
from mathutils import Vector, Matrix

glb, aus = argv[1], argv[2]
BREITE = int(argv[3]) if len(argv) > 3 else 960
PROBEN = int(argv[4]) if len(argv) > 4 else 64
BILDER = int(argv[5]) if len(argv) > 5 else 16
NUR = argv[6] if len(argv) > 6 else ''
HOEHE = round(BREITE * 1.25)                     # 4 : 5
K = int(os.environ.get('CHIPBILD', '9'))          # Bild der Drehfolge, in dem der Chip im Fach steht
GIER = -0.72 + 0.04 * K                           # wie in dreh.py
os.makedirs(aus, exist_ok=True)

Z.aufbauen(glb, (BREITE, HOEHE), PROBEN)
Z.ruhelage(); Z.oeffnen(0)
# In dieser Szene erscheint pose(g) gespiegelt zur Drehfolge (Bild mit -g). Damit der Chip im Fach wie Bild K aussieht,
# bekommt er hier -GIER; das Gerät dreht sich unten gleich mit (gespiegelt gerechnet).
Z.pose(0.08, -GIER, 0.0)
sc = Z.S['sc']; dreh = Z.S['dreh']; ROT = dreh.matrix_world.to_3x3().copy()
lin = Z.lin
def glatt(t): t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)

# Vorderseite des Chips: daraus die Drehung des Geräts (das Fach schaut in dieselbe Richtung wie der Chip)
n = ROT @ (Z.GRUND.transposed() @ Vector((0, -1, 0)))   # Vorderseite im Chipraum ist dort -Y der Grundlage
PSI = -math.atan2(n.x, -n.y)
print('Chip-Normale', n, 'Gerät gedreht um', round(math.degrees(PSI), 1), 'Grad')

# ---------------------------------------------------------------- Licht wie in der Drehfolge, nur für den Chip
chip_sam = bpy.data.collections.new('chipteile'); sc.collection.children.link(chip_sam)
for o in bpy.data.objects['Node_72'].children_recursive:
    if o.type == 'MESH': chip_sam.objects.link(o)
geraet_sam = bpy.data.collections.new('geraet'); sc.collection.children.link(geraet_sam)
for nm in ('haupt', 'streif', 'kante', 'kante2'):
    o = bpy.data.objects[nm]; o.light_linking.receiver_collection = chip_sam; o.light_linking.blocker_collection = chip_sam
for nm in ('softbox', 'streifen'): bpy.data.objects[nm].hide_render = True

# ---------------------------------------------------------------- Materialien
def mat(name, farbe, rau, metall=0.0, spek=0.5, coat=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; I = Z.bsdf(m).inputs
    I['Base Color'].default_value = lin(farbe); I['Roughness'].default_value = rau; I['Metallic'].default_value = metall
    I['Specular IOR Level'].default_value = spek; I['Coat Weight'].default_value = coat; I['Coat Roughness'].default_value = 0.2
    return m
def pulver(name, farbe, rau=0.55):
    m = mat(name, farbe, rau, 0.0, 0.4, 0.0); Z.rauschen(m, 0.05, 2.2)    # feine Orangenhaut der Pulverbeschichtung
    return m
def leucht(name, farbe, kraft):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    o = nt.nodes.new('ShaderNodeOutputMaterial'); e = nt.nodes.new('ShaderNodeEmission')
    e.inputs['Color'].default_value = lin(farbe); e.inputs['Strength'].default_value = kraft
    nt.links.new(e.outputs[0], o.inputs['Surface']); return m

HUELLE = pulver('huelle', '#dfe3ea', 0.5)       # Gehäuse hellgrau
FRONT = pulver('front', '#15294f', 0.46)        # Frontplatte navy
GLAS = mat('glas', '#010203', 0.08, 0.0, 0.32)   # Deckglas des Bildschirms, spiegelt nur den weichen Studioverlauf
LESER = mat('leser', '#1a2130', 0.32, 0.0, 0.45, 0.3)
INNEN = mat('innen', '#0a1126', 0.9, 0.0, 0.08)   # matt und ohne Körnung, sonst Streifen im Fach
GUMMI = mat('gummi', '#262a32', 1.0, 0.0, 0.0)   # Gummi ohne Glanz: sonst spiegelt der Boden im flachen Winkel hell
SCHLITZ = mat('schlitz', '#05070b', 0.8)
LED = leucht('led', '#fff1de', 1.0)

# ---------------------------------------------------------------- Formen (Maße in mm, Gerät: x rechts, z oben, Front bei y = -65)
geraet = bpy.data.objects.new('geraet_wurzel', None); sc.collection.objects.link(geraet)

def rundplatte(name, x0, x1, z0, z1, y0, y1, r, fase, m, seg=10, fseg=3):
    """Platte mit runden Ecken in der Frontansicht (Radius r) und kleiner Fase an Vorder- und Hinterkante"""
    bm = bmesh.new()
    r = min(r, (x1 - x0) / 2 - 0.01, (z1 - z0) / 2 - 0.01)
    pts = []
    for (cx, cz, a0) in ((x1 - r, z1 - r, 0), (x0 + r, z1 - r, 90), (x0 + r, z0 + r, 180), (x1 - r, z0 + r, 270)):
        for i in range(seg + 1):
            a = math.radians(a0 + 90 * i / seg); pts.append((cx + r * math.cos(a), cz + r * math.sin(a)))
    vv = [bm.verts.new((x, y0, z)) for x, z in pts]
    f = bm.faces.new(vv)
    ex = bmesh.ops.extrude_face_region(bm, geom=[f])
    for v in ex['geom']:
        if isinstance(v, bmesh.types.BMVert): v.co.y = y1
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    if fase:
        rand = [e for e in bm.edges if abs(e.verts[0].co.y - e.verts[1].co.y) < 1e-6 and len(e.link_faces) == 2
                and any(len(fc.verts) > 4 for fc in e.link_faces)]
        bmesh.ops.bevel(bm, geom=rand, offset=fase, segments=fseg, affect='EDGES', profile=0.5, clamp_overlap=True)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); geraet_sam.objects.link(o); o.parent = geraet; me.materials.append(m)
    for p in me.polygons: p.use_smooth = True
    return o

def schneiden(ziel, schneider):
    b = ziel.modifiers.new('aus_' + schneider.name, 'BOOLEAN'); b.operation = 'DIFFERENCE'; b.object = schneider; b.solver = 'EXACT'
    schneider.hide_render = True; schneider.hide_viewport = True

YF = -65.0                                      # Vorderseite des Gehäuses
W, H = 340.0, 520.0
huelle = rundplatte('huelle', -W / 2, W / 2, 0, H, YF, 65, 34, 7, HUELLE, 12, 4)
# Frontplatte: navy, 9 mm vom Rand eingerückt, 1,5 mm vorstehend, eigene kleine Fase (sieht aus wie eingesetzt)
EIN = 9.0; YP = YF - 1.5
front = rundplatte('front', -W / 2 + EIN, W / 2 - EIN, EIN, H - EIN, YP, YF + 3, 27, 1.6, FRONT, 12, 3)

# Bildschirm: Deckglas bündig in der Front, 2 mm Fuge
BS = (-128.0, 128.0, 268.0, 436.0)
schneiden(front, rundplatte('bs_loch', BS[0] - 2, BS[1] + 2, BS[2] - 2, BS[3] + 2, YP - 5, YF + 2, 12, 0, FRONT))
glas = rundplatte('glas', BS[0], BS[1], BS[2], BS[3], YP + 0.6, YF + 1, 10, 0.35, GLAS, 10, 2)

# Lesefeld (links) und Rückgabeschlitz (rechts) unter dem Bildschirm
LX, LZ, LR = -74.0, 206.0, 33.0
leser = rundplatte('leser', LX - LR, LX + LR, LZ - LR, LZ + LR, YP - 2.2, YP + 1, LR, 1.2, LESER, 16, 3)
SX, SZ = 74.0, 206.0
schneiden(front, rundplatte('rs_loch', SX - 36, SX + 36, SZ - 4.5, SZ + 4.5, YP - 5, YF + 40, 4.4, 0, FRONT))
schneiden(huelle, rundplatte('rs_loch2', SX - 36, SX + 36, SZ - 4.5, SZ + 4.5, YF - 5, YF + 40, 4.4, 0, FRONT))
rundplatte('rs_innen', SX - 37, SX + 37, SZ - 6, SZ + 6, YF + 38, YF + 40, 4, 0, SCHLITZ)

# Ausgabefach: 128 x 100, 74 tief, innen dunkelblau, Boden mit Gummimatte, oben ein verdecktes Lichtband
FA = (-64.0, 64.0, 46.0, 146.0); TIEF = 74.0
schneiden(front, rundplatte('fa_loch', FA[0], FA[1], FA[2], FA[3], YP - 5, YF + 10, 14, 0, FRONT))
schneiden(huelle, rundplatte('fa_loch2', FA[0], FA[1], FA[2], FA[3], YF - 5, YF + TIEF, 14, 0, FRONT))
innen = rundplatte('fa_hinten', FA[0] - 2, FA[1] + 2, FA[2] - 2, FA[3] + 2, YF + TIEF - 1.5, YF + TIEF + 3, 15, 0, INNEN)   # vor der Schnittfläche des Gehäuses
# Einsatz aus dunklem Kunststoff: Rohr durch Front und Gehäuse mit schmalem Kragen vorne (deckt die Schnittkanten ab)
huelle_fach = rundplatte('fa_wand', FA[0] - 3.5, FA[1] + 3.5, FA[2] - 3.5, FA[3] + 3.5, YP - 1.0, YF + TIEF, 17, 0.9, INNEN, 12, 3)
schneiden(huelle_fach, rundplatte('fa_wand_loch', FA[0] + 1.2, FA[1] - 1.2, FA[2] + 1.2, FA[3] - 1.2, YP - 8, YF + TIEF + 5, 13, 0, INNEN))
matte = rundplatte('fa_matte', FA[0] + 6, FA[1] - 6, FA[2] - 1, FA[2] + 3, YF + 6, YF + TIEF - 2, 2, 0.8, GUMMI)
matte.data.polygons.foreach_set('use_smooth', [False] * len(matte.data.polygons))
# Schlitz in der Decke, aus dem der Chip fällt
schneiden(huelle_fach, rundplatte('fa_schlitz', -30, 30, FA[3] - 6, FA[3] + 6, YF + 14, YF + 44, 3, 0, INNEN))
schneiden(huelle, rundplatte('fa_schlitz2', -30, 30, FA[3] - 6, FA[3] + 40, YF + 14, YF + 44, 3, 0, INNEN))
rundplatte('fa_schacht', -32, 32, FA[3] + 40, FA[3] + 42, YF + 12, YF + 46, 2, 0, SCHLITZ)
# Lichtband: schmaler Streifen an der Decke direkt hinter der Kante, von vorne nicht zu sehen
led = rundplatte('fa_led', FA[0] + 12, FA[1] - 12, FA[3] - 2.5, FA[3] - 0.5, YF + 9, YF + 12, 0.9, 0, LED)
led_licht = bpy.data.lights.new('fa_licht', 'AREA'); led_licht.shape = 'RECTANGLE'; led_licht.size = 96; led_licht.size_y = 4
led_licht.energy = 0.0; led_licht.color = (1.0, 0.93, 0.85)
lo = bpy.data.objects.new('fa_licht', led_licht); sc.collection.objects.link(lo); lo.parent = geraet
lo.location = (0, YF + 11, FA[3] - 3); lo.rotation_euler = (0, 0, 0)    # zeigt nach unten (-Z)
lo.visible_glossy = False

# Innenleben des Fachs bekommt nur das eigene Lichtband und die Umgebung, nicht die Studiolichter (sonst fällt ein
# heller Keil durch die Öffnung auf Boden und Rückwand)
innen_sam = bpy.data.collections.new('fach_innen'); sc.collection.children.link(innen_sam)
for nm in ('fa_hinten', 'fa_wand', 'fa_matte', 'fa_schacht'):
    o = bpy.data.objects[nm]; geraet_sam.objects.unlink(o); innen_sam.objects.link(o)
# Booleans anwenden, scharfe Kanten nach Winkel (sonst Schattenstreifen über der großen Front)
bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get()
for o in list(geraet_sam.objects):
    if o.type == 'MESH' and any(m.type == 'BOOLEAN' for m in o.modifiers):
        neu = bpy.data.meshes.new_from_object(o.evaluated_get(dg)); o.modifiers.clear(); o.data = neu
        neu.set_sharp_from_angle(angle=math.radians(35))

# Wand hinter dem Gerät: fängt nur den Schatten (das Bild bleibt freigestellt)
me = bpy.data.meshes.new('wand'); B = 4000
me.from_pydata([(-B, 65.5, -B), (B, 65.5, -B), (B, 65.5, B), (-B, 65.5, B)], [], [(0, 1, 2, 3)])
wand = bpy.data.objects.new('wand', me); geraet_sam.objects.link(wand); wand.parent = geraet   # in der Sammlung: bekommt das Gerätelicht und damit den Schatten
wand.is_shadow_catcher = True
wm = mat('wand', '#ffffff', 0.9); me.materials.append(wm)

# Gerät so stellen, dass der Platz des Chips im Fach im Ursprung liegt (dort ist die Drehfolge gerendert)
SITZ = Vector((0, YF + 26, FA[2] + 3 + Z.S['groesse'].x / 2 + 1.5))
geraet.rotation_euler = (0, 0, PSI)
RZ = Matrix.Rotation(PSI, 3, 'Z')
geraet.location = -(RZ @ SITZ)
bpy.context.view_layer.update()
def welt(p): return geraet.matrix_world @ Vector(p)

# ---------------------------------------------------------------- Kamera: waagrecht, Bildausschnitt über Objektivverschiebung
cam = Z.S['kamera']; cd = cam.data
cd.sensor_fit = 'VERTICAL'; cd.sensor_height = 36.0
ABST = 2300.0; HF = 650.0                         # Bildhöhe in mm auf Höhe des Geräts
cd.lens = 36.0 * ABST / HF
mitte = welt((0, YF, H / 2 - 12)) + Vector((14, 0, 0))   # etwas nach rechts, damit der Wandschatten Platz hat
cam.location = Vector((mitte.x, mitte.y - ABST, 150.0))
cam.rotation_euler = (math.radians(90), 0, 0)
cd.shift_x = (mitte.x - cam.location.x) / HF
cd.shift_y = (mitte.z - cam.location.z) / HF
cd.clip_start = 100; cd.clip_end = 10000

# ---------------------------------------------------------------- Studiolicht für das Gerät (der Chip hat seines aus szene.py)
def licht(name, ort_rel, kraft, groesse, farbe=(1, 1, 1)):
    o = Z.flaechenlicht(name, tuple(Vector(ort_rel) + mitte), tuple(mitte), kraft, groesse, farbe, sichtbar=False)
    o.light_linking.receiver_collection = geraet_sam
    return o
licht('g_haupt', (-1500, -1700, 1500), 2.6e7, 1400, (1.0, 0.98, 0.96))   # große Softbox links oben vorne
licht('g_fuell', (1700, -1500, 200), 6.0e6, 1600, (0.92, 0.95, 1.0))     # Aufheller rechts
licht('g_kante', (900, -200, 1600), 5.0e6, 500, (0.95, 0.97, 1.0))       # Kante oben rechts
sc.render.film_transparent = True
sc.cycles.film_transparent_glass = False
sc.view_settings.look = 'AgX - Base Contrast'

# ---------------------------------------------------------------- Weg des Chips: fällt aus dem Deckenschlitz, federt kurz
OBEN = Vector((0, 0, 96.0))                        # über dem Ende, im Schacht (Welt, relativ zum Ursprung)
def stand(t):
    """t 0..1: 0 bis 0.12 im Schacht, dann Fall (beschleunigt), Aufprall bei 0.55, zwei kleine Federn, Ruhe ab 0.85"""
    if t < 0.12: return OBEN.copy()
    if t < 0.55:
        s = (t - 0.12) / 0.43; return OBEN * (1 - s * s)
    s = (t - 0.55) / 0.45
    hoch = 7.0 * abs(math.sin(s * math.pi * 2.0)) * math.exp(-4.2 * s)
    return Vector((0, 0, hoch))
def chip_auf(p):
    m = ROT.to_4x4(); m.translation = p; dreh.matrix_world = m; bpy.context.view_layer.update()

def proj(p):
    from bpy_extras.object_utils import world_to_camera_view
    v = world_to_camera_view(sc, cam, p); return [round(v.x, 5), round(1 - v.y, 5)]
def rahmen_von(objs):
    from bpy_extras.object_utils import world_to_camera_view
    bpy.context.view_layer.update(); xs, ys = [], []
    for o in objs:
        mw = o.matrix_world
        for v in o.data.vertices:
            p = world_to_camera_view(sc, cam, mw @ v.co); xs.append(p.x); ys.append(1 - p.y)
    return [round(min(xs), 5), round(min(ys), 5), round(max(xs), 5), round(max(ys), 5)]

chip_auf(stand(1.0))
yv = YP - 0.01
lage = {'groesse': [BREITE, HOEHE], 'bilder': BILDER, 'chipbild': K, 'mm': [W, H],
        # Ecken der Front (x -170..170, z 0..520) in der Ebene der Frontplatte: oben links, oben rechts, unten rechts, unten links
        'front': [proj(welt((-W / 2, yv, H))), proj(welt((W / 2, yv, H))), proj(welt((W / 2, yv, 0))), proj(welt((-W / 2, yv, 0)))],
        'chip_ende': rahmen_von(chip_sam.objects)}
json.dump(lage, open(f'{aus}/lage.json', 'w'), indent=1)
print('lage', lage)

def bild(t, pfad):
    chip_auf(stand(t))
    an = glatt((t - 0.1) / 0.25)
    LED.node_tree.nodes['Emission'].inputs['Strength'].default_value = 1.0 + 9.0 * an
    led_licht.energy = 6.0e4 * an
    Z.rendern(pfad)

if NUR == 'leer':
    for o in chip_sam.objects: o.hide_render = True
    LED.node_tree.nodes["Emission"].inputs["Strength"].default_value = 10.0; led_licht.energy = 6.0e4
    Z.rendern(f'{aus}/leer.png')
elif NUR == 'vorschau':
    bild(1.0, f'{aus}/vorschau.png')
elif NUR == 'aus':
    for o in chip_sam.objects: o.hide_render = True
    LED.node_tree.nodes['Emission'].inputs['Strength'].default_value = 1.0; led_licht.energy = 0
    Z.rendern(f'{aus}/aus.png')
else:
    for i in range(BILDER): bild(i / (BILDER - 1), f'{aus}/{i:02d}.png')

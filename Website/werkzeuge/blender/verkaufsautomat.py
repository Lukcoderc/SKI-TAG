# SkiTag-Ausleihautomat (Runde 160, ersetzt die Wandstation aus Feedback 159): ein frei stehender Automat wie ein
# Snackautomat, 700 x 1700 x 640 mm. Links hinter einer Glasscheibe fünf Fächer mit Spiralen, in jeder Spirale stehen
# SkiTag-Chips hintereinander; rechts die Bediensäule mit Bildschirm, Kartenleser und Rückgabeschlitz; unten das offene
# Ausgabefach. Beim Ausleihen dreht sich eine Spirale einmal, der vorderste Chip kippt über die Kante, fällt hinter dem
# Glas nach unten und steht am Ende im Ausgabefach genau so wie Bild K der Chip-Drehfolge (assets/media/chip), damit der
# fliegende Chip auf der Seite ohne Sprung übernehmen kann.
# Bildschirm und Aufdrucke legt die Seite als HTML perspektivisch auf die Tür (lage.json: die vier Ecken der Tür im Bild).
#
# python verkaufsautomat.py -- <ordner mit szene.py> <chip.glb> <ausgabe> [breite] [proben] [bilder] [nur]
#   nur = 'vorschau' (ein Bild am Ende), 'start' (ein Bild am Anfang), 'leer' (Fach leer, Spirale voll)
#   Umgebung: AUSSCHNITT=1 rendert ab Bild 1 nur den Bereich, in dem sich etwas bewegt (Rest kommt aus Bild 0)
import sys, math, json, os
argv = sys.argv[sys.argv.index('--') + 1:]
sys.path.insert(0, argv[0])
import bpy, bmesh, szene as Z
from mathutils import Vector, Matrix, Quaternion

glb, aus = argv[1], argv[2]
BREITE = int(argv[3]) if len(argv) > 3 else 960
PROBEN = int(argv[4]) if len(argv) > 4 else 64
BILDER = int(argv[5]) if len(argv) > 5 else 24
NUR = argv[6] if len(argv) > 6 else ''
HOEHE = round(BREITE * 1.25)                     # 4 : 5
K = int(os.environ.get('CHIPBILD', '9'))
GIER = -0.72 + 0.04 * K
os.makedirs(aus, exist_ok=True)

Z.aufbauen(glb, (BREITE, HOEHE), PROBEN)
Z.ruhelage(); Z.oeffnen(0)
Z.pose(0.08, -GIER, 0.0)
sc = Z.S['sc']; dreh = Z.S['dreh']; ROT = dreh.matrix_world.to_3x3().copy()
lin = Z.lin
def glatt(t): t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)

n = ROT @ (Z.GRUND.transposed() @ Vector((0, -1, 0)))
PSI = -math.atan2(n.x, -n.y)
print('Automat gedreht um', round(math.degrees(PSI), 1), 'Grad')

# ---------------------------------------------------------------- Sammlungen und Licht des Chips
chip_sam = bpy.data.collections.new('chipteile'); sc.collection.children.link(chip_sam)
for o in bpy.data.objects['Node_72'].children_recursive:
    if o.type == 'MESH': chip_sam.objects.link(o)
geraet_sam = bpy.data.collections.new('geraet'); sc.collection.children.link(geraet_sam)
CHIPLICHT = {}
for nm in ('haupt', 'streif', 'kante', 'kante2'):
    o = bpy.data.objects[nm]; o.light_linking.receiver_collection = chip_sam; o.light_linking.blocker_collection = chip_sam
    CHIPLICHT[nm] = o.data.energy
for nm in ('softbox', 'streifen'): bpy.data.objects[nm].hide_render = True

# ---------------------------------------------------------------- Materialien
def mat(name, farbe, rau, metall=0.0, spek=0.5, coat=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; I = Z.bsdf(m).inputs
    I['Base Color'].default_value = lin(farbe); I['Roughness'].default_value = rau; I['Metallic'].default_value = metall
    I['Specular IOR Level'].default_value = spek; I['Coat Weight'].default_value = coat; I['Coat Roughness'].default_value = 0.15
    return m
def pulver(name, farbe, rau=0.5, coat=0.0):
    m = mat(name, farbe, rau, 0.0, 0.45, coat); Z.rauschen(m, 0.04, 1.6); return m
def leucht(name, farbe, kraft):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    o = nt.nodes.new('ShaderNodeOutputMaterial'); e = nt.nodes.new('ShaderNodeEmission')
    e.inputs['Color'].default_value = lin(farbe); e.inputs['Strength'].default_value = kraft
    nt.links.new(e.outputs[0], o.inputs['Surface']); return m
def glas_mat(name):
    """Scheibe: fast ganz durchsichtig, spiegelt nach Fresnel (im flachen Winkel mehr); Schatten gehen durch"""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    o = nt.nodes.new('ShaderNodeOutputMaterial'); tr = nt.nodes.new('ShaderNodeBsdfTransparent')
    gl = nt.nodes.new('ShaderNodeBsdfGlossy'); gl.inputs['Roughness'].default_value = 0.04
    fr = nt.nodes.new('ShaderNodeFresnel'); fr.inputs['IOR'].default_value = 1.6
    mu = nt.nodes.new('ShaderNodeMath'); mu.operation = 'MULTIPLY'; mu.inputs[1].default_value = 0.4
    nt.links.new(fr.outputs[0], mu.inputs[0])
    lp = nt.nodes.new('ShaderNodeLightPath'); nur = nt.nodes.new('ShaderNodeMath'); nur.operation = 'MULTIPLY'
    nt.links.new(mu.outputs[0], nur.inputs[0]); nt.links.new(lp.outputs['Is Camera Ray'], nur.inputs[1])
    mx = nt.nodes.new('ShaderNodeMixShader')
    nt.links.new(nur.outputs[0], mx.inputs['Fac']); nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(gl.outputs[0], mx.inputs[2])
    nt.links.new(mx.outputs[0], o.inputs['Surface']); return m

KORPUS = pulver('korpus', '#060f24', 0.5, 0.0)   # Navy, Pulverlack mit leichtem Klarlack
TUER = pulver('tuer', '#08132c', 0.42, 0.12)
SOCKEL = mat('sockel', '#0b0f18', 0.7)
INNEN = mat('innen', '#f7f8fa', 0.8, 0.0, 0.25)     # Rückwand und Seiten innen: hell
BLECH = mat('blech', '#c9ced6', 0.32, 1.0)          # Fachböden gebürstet
DRAHT = mat('draht', '#dfe3e8', 0.18, 1.0)          # Spiralen verchromt
LEISTE = mat('leiste', '#0d1426', 0.5)
ETIKETT = mat('etikett', '#ffffff', 0.6)
SCHRIFT = mat('schrift', '#0d1426', 0.6)
SCHEIBE = glas_mat('scheibe')
SCHIRM = mat('schirm', '#020305', 0.06, 0.0, 0.5)
LESER = mat('leser', '#1c2536', 0.3, 0.0, 0.45, 0.3)
FACH = mat('fach', '#0b1222', 0.85, 0.0, 0.1)
GUMMI = mat('gummi', '#1d2129', 1.0, 0.0, 0.0)
SCHLITZ = mat('schlitz', '#030407', 0.85)
LED = leucht('led', '#f4f7ff', 6.0)
FACHLED = leucht('fachled', '#fff1de', 1.0)

geraet = bpy.data.objects.new('geraet_wurzel', None); sc.collection.objects.link(geraet)

def teil(name, m, samm=None):
    me = bpy.data.meshes.new(name); o = bpy.data.objects.new(name, me)
    (samm or geraet_sam).objects.link(o); o.parent = geraet; me.materials.append(m); return o

def quader(name, x0, x1, y0, y1, z0, z1, m, fase=0.0, seg=3, samm=None):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x = x0 if v.co.x < 0 else x1; v.co.y = y0 if v.co.y < 0 else y1; v.co.z = z0 if v.co.z < 0 else z1
    if fase: bmesh.ops.bevel(bm, geom=bm.edges[:], offset=fase, segments=seg, affect='EDGES', profile=0.5, clamp_overlap=True)
    o = teil(name, m, samm); bm.to_mesh(o.data); bm.free()
    for p in o.data.polygons: p.use_smooth = True
    return o

def rundplatte(name, x0, x1, z0, z1, y0, y1, r, fase, m, seg=10, fseg=3, samm=None):
    """Platte mit runden Ecken in der Frontansicht (Radius r) und Fase an Vorder- und Hinterkante"""
    bm = bmesh.new(); r = min(r, (x1 - x0) / 2 - 0.01, (z1 - z0) / 2 - 0.01); pts = []
    for (cx, cz, a0) in ((x1 - r, z1 - r, 0), (x0 + r, z1 - r, 90), (x0 + r, z0 + r, 180), (x1 - r, z0 + r, 270)):
        for i in range(seg + 1):
            a = math.radians(a0 + 90 * i / seg); pts.append((cx + r * math.cos(a), cz + r * math.sin(a)))
    f = bm.faces.new([bm.verts.new((x, y0, z)) for x, z in pts])
    ex = bmesh.ops.extrude_face_region(bm, geom=[f])
    for v in ex['geom']:
        if isinstance(v, bmesh.types.BMVert): v.co.y = y1
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    if fase:
        rand = [e for e in bm.edges if abs(e.verts[0].co.y - e.verts[1].co.y) < 1e-6 and len(e.link_faces) == 2
                and any(len(fc.verts) > 4 for fc in e.link_faces)]
        bmesh.ops.bevel(bm, geom=rand, offset=fase, segments=fseg, affect='EDGES', profile=0.5, clamp_overlap=True)
    o = teil(name, m, samm); bm.to_mesh(o.data); bm.free()
    for p in o.data.polygons: p.use_smooth = True
    return o

def schneiden(ziel, schneider):
    b = ziel.modifiers.new('aus_' + schneider.name, 'BOOLEAN'); b.operation = 'DIFFERENCE'; b.object = schneider; b.solver = 'EXACT'
    schneider.hide_render = True; schneider.hide_viewport = True

# ---------------------------------------------------------------- Maße (mm): x rechts, y nach hinten, z oben; Türfront bei y = YT
W, H, D = 700.0, 1700.0, 640.0
SO = 70.0                                         # Sockelhöhe
YK = -D / 2 + 22                                  # Vorderkante Korpus (die Tür sitzt davor)
YT = YK - 24                                      # Vorderseite der Tür
# Korpus: Kasten, vorne offen
korpus = rundplatte('korpus', -W / 2, W / 2, SO, H, YK, D / 2, 16, 3.5, KORPUS, 8, 3)
schneiden(korpus, quader('hohl', -W / 2 + 16, W / 2 - 16, YK - 5, D / 2 - 16, SO + 16, H - 16, KORPUS))
quader('sockel', -W / 2 + 14, W / 2 - 14, YK + 18, D / 2 - 20, 0, SO + 2, SOCKEL, 3)
# Füße
for fx in (-W / 2 + 50, W / 2 - 50):
    for fy in (YK + 50, D / 2 - 60): quader(f'fuss_{fx}_{fy}', fx - 22, fx + 22, fy - 22, fy + 22, -1, 6, SOCKEL, 2)

# Tür: eine Platte mit Fenster (links) und Ausgabefach (unten links), rechts die Bediensäule
FEN = (-W / 2 + 32, 132.0, 560.0, H - 104)        # Fenster x0, x1, z0, z1
FA = (-W / 2 + 62, 102.0, 214.0, 384.0)           # Ausgabefach
tuer = rundplatte('tuer', -W / 2 + 2, W / 2 - 2, SO + 4, H - 2, YT, YK, 14, 3.0, TUER, 8, 3)
schneiden(tuer, rundplatte('fenster_loch', FEN[0], FEN[1], FEN[2], FEN[3], YT - 10, YK + 10, 10, 0, TUER))
schneiden(tuer, rundplatte('fach_loch', FA[0], FA[1], FA[2], FA[3], YT - 10, YK + 10, 16, 0, TUER))
# Rahmen ums Fenster (schmal, dunkel) und Scheibe
rahmen = rundplatte('rahmen', FEN[0] - 8, FEN[1] + 8, FEN[2] - 8, FEN[3] + 8, YT - 2.5, YT + 6, 16, 1.6, LEISTE, 8, 3)
schneiden(rahmen, rundplatte('rahmen_loch', FEN[0] + 4, FEN[1] - 4, FEN[2] + 4, FEN[3] - 4, YT - 10, YT + 12, 8, 0, LEISTE))
scheibe = rundplatte('scheibe', FEN[0] + 2, FEN[1] - 2, FEN[2] + 2, FEN[3] - 2, YT + 2, YT + 7, 8, 0, SCHEIBE)
scheibe.visible_shadow = False
if os.environ.get('OHNEGLAS') == '1': scheibe.hide_render = True

# Innenraum hinter dem Fenster: hell ausgekleidet, fünf Fachböden mit je fünf Spiralen
IX0, IX1 = -W / 2 + 18, 150.0
quader('rueckwand', IX0, IX1, D / 2 - 22, D / 2 - 18, SO + 18, H - 18, INNEN)
quader('innen_links', IX0, IX0 + 4, YK, D / 2 - 18, SO + 18, H - 18, INNEN)
quader('innen_rechts', IX1 - 4, IX1, YK, D / 2 - 18, SO + 18, H - 18, INNEN)
quader('innen_decke', IX0, IX1, YK, D / 2 - 18, H - 22, H - 18, INNEN)
# Schacht unter dem untersten Fach bis zum Ausgabefach (von vorne von der Tür verdeckt)
quader('schachtboden', IX0, IX1, YK, D / 2 - 18, SO + 18, SO + 22, INNEN)

FAECHER = [640.0, 830.0, 1020.0, 1210.0, 1400.0]   # Oberkante der Fachböden
SPALTEN = [-262.0, -176.0, -90.0, -4.0, 82.0]
TIEFE0, TIEFE1 = YK + 40, D / 2 - 40              # Spirale vorne / hinten
STEIG = 30.0                                       # Abstand der Windungen = Abstand der Chips
RS = 29.0                                          # Radius der Spirale
DICKE = 19.0; HOCH = 66.0
for i, zf in enumerate(FAECHER):
    quader(f'fach_{i}', IX0 + 4, IX1 - 4, YK + 24, D / 2 - 24, zf - 3, zf, BLECH, 0.8, 2)
    # Leiste mit Etiketten an der Vorderkante
    quader(f'leiste_{i}', IX0 + 4, IX1 - 4, YK + 18, YK + 26, zf - 34, zf + 2, LEISTE, 1.0, 2)
    for j, xs in enumerate(SPALTEN):
        quader(f'etikett_{i}_{j}', xs - 18, xs + 18, YK + 16.5, YK + 18.2, zf - 28, zf - 6, ETIKETT, 0.6, 2)
        cu = bpy.data.curves.new(f't_{i}_{j}', 'FONT'); cu.body = f'{"EDCBA"[i]}{j + 1}'; cu.size = 15; cu.align_x = 'CENTER'; cu.align_y = 'CENTER'
        cu.extrude = 0.2
        to = bpy.data.objects.new(f't_{i}_{j}', cu); geraet_sam.objects.link(to); to.parent = geraet; cu.materials.append(SCHRIFT)
        to.location = (xs, YK + 16.2, zf - 17); to.rotation_euler = (math.radians(90), 0, 0)

def spirale(name, xs, zf):
    """Drahtspirale entlang y, Achse auf Chipmitte"""
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 1.5; cu.bevel_resolution = 3
    sp = cu.splines.new('POLY'); schritte = int((TIEFE1 - TIEFE0) / STEIG * 24)
    sp.points.add(schritte)
    for k in range(schritte + 1):
        a = 2 * math.pi * k / 24; y = k * STEIG / 24
        sp.points[k].co = (RS * math.sin(a), y, -RS * math.cos(a), 1)
    o = bpy.data.objects.new(name, cu); geraet_sam.objects.link(o); o.parent = geraet; cu.materials.append(DRAHT)
    o.location = (xs, TIEFE0, zf + RS + 2)
    return o

# Chips in den Spiralen: Kopien der äußeren Teile mit denselben Daten (Cycles rechnet sie als Instanzen)
AUSSEN = [o for o in bpy.data.objects['Node_72'].children_recursive if o.type == 'MESH'
          and o.data.materials and o.data.materials[0].name in ('schale', 'orange', 'knopf', 'led')]
dreh.matrix_world = Matrix.Identity(4); bpy.context.view_layer.update()
REL = {o.name: o.matrix_world.copy() for o in AUSSEN}
Z.pose(0.08, -GIER, 0.0); bpy.context.view_layer.update()
G4 = Z.GRUND.to_4x4()
def chipkopie(name, ort):
    leer = bpy.data.objects.new(name, None); sc.collection.objects.link(leer); leer.parent = geraet
    leer.matrix_basis = Matrix.Translation(ort) @ G4
    for o in AUSSEN:
        k = bpy.data.objects.new(name + '_' + o.name, o.data); geraet_sam.objects.link(k)
        k.parent = leer; k.matrix_basis = REL[o.name]
    return leer

WAHL = (1, 2)                                      # Fach B (zweites von unten), Spalte 3: daraus kommt der Chip
PLATZ = 7                                          # so viele Chips stehen in jeder Spirale (von vorne)
spiralen = {}; reihen = {}
for i, zf in enumerate(FAECHER):
    for j, xs in enumerate(SPALTEN):
        spiralen[(i, j)] = spirale(f'spirale_{i}_{j}', xs, zf)
        start = 1 if (i, j) == WAHL else 0          # die gewählte Spirale: vorne steht der Chip, der gleich fällt (der echte)
        voll = PLATZ - (1 if (i * 5 + j) % 4 == 3 else 0)   # nicht alle Spiralen gleich voll
        reihen[(i, j)] = [chipkopie(f'c_{i}_{j}_{k}', Vector((xs, TIEFE0 + STEIG * (k + 0.5), zf + HOCH / 2 + 0.5)))
                          for k in range(start, voll)]

# Lichtleisten innen links und rechts hinter dem Rahmen
for nm, x in (('led_l', FEN[0] + 10), ('led_r', FEN[1] - 10)):
    quader(nm, x - 3, x + 3, YK + 2, YK + 8, FEN[2] + 20, FEN[3] - 20, LED)
for nm, x in (('ll', IX0 + 40), ('lr', IX1 - 40)):
    d = bpy.data.lights.new(nm, 'AREA'); d.shape = 'RECTANGLE'; d.size = 12; d.size_y = FEN[3] - FEN[2] - 40; d.energy = 4.0e6
    d.color = (0.97, 0.98, 1.0)
    o = bpy.data.objects.new(nm, d); sc.collection.objects.link(o); o.parent = geraet
    o.location = (x, YK + 6, (FEN[2] + FEN[3]) / 2); o.rotation_euler = (math.radians(-90), 0, 0)   # zeigt nach hinten (+y)
    o.light_linking.receiver_collection = geraet_sam
    o.visible_glossy = False

# Deckenlicht innen (weich, von oben nach unten), damit Rückwand und Fächer gleichmäßig hell sind
d = bpy.data.lights.new('decke', 'AREA'); d.shape = 'RECTANGLE'; d.size = IX1 - IX0 - 30; d.size_y = D - 120; d.energy = 6.0e6
o = bpy.data.objects.new('decke', d); sc.collection.objects.link(o); o.parent = geraet
o.location = ((IX0 + IX1) / 2, 0, H - 30); o.light_linking.receiver_collection = geraet_sam; o.visible_glossy = False

# Bediensäule rechts: Bildschirm hinter Glas, Kartenleser, Rückgabeschlitz
BS = (164.0, 324.0, 1178.0, 1438.0)
schneiden(tuer, rundplatte('bs_loch', BS[0] - 3, BS[1] + 3, BS[2] - 3, BS[3] + 3, YT - 6, YT + 4, 9, 0, TUER))
rundplatte('bs_glas', BS[0] - 2, BS[1] + 2, BS[2] - 2, BS[3] + 2, YT + 0.4, YT + 4, 8, 0.5, SCHIRM, 8, 2)
LX, LZ, LR = 244.0, 1040.0, 46.0
rundplatte('leser', LX - LR, LX + LR, LZ - LR, LZ + LR, YT - 3, YT + 1, LR, 1.4, LESER, 16, 3)
SX, SZ = 244.0, 880.0
schneiden(tuer, rundplatte('rs_loch', SX - 46, SX + 46, SZ - 5, SZ + 5, YT - 6, YK + 6, 4.9, 0, TUER))
rundplatte('rs_innen', SX - 47, SX + 47, SZ - 7, SZ + 7, YK + 4, YK + 6, 4, 0, SCHLITZ)
rundplatte('rs_kragen', SX - 58, SX + 58, SZ - 16, SZ + 16, YT - 3, YT + 1, 15, 1.2, LEISTE, 10, 3)
schneiden(bpy.data.objects['rs_kragen'], rundplatte('rs_kl', SX - 46, SX + 46, SZ - 5, SZ + 5, YT - 8, YT + 4, 4.9, 0, LEISTE))

# Ausgabefach: offen, innen dunkel, Gummimatte, verdecktes Lichtband oben
FT = 190.0
innen_sam = bpy.data.collections.new('fach_innen'); sc.collection.children.link(innen_sam)
fw = rundplatte('fa_wand', FA[0] - 5, FA[1] + 5, FA[2] - 5, FA[3] + 5, YT - 1.5, YK + FT, 20, 1.2, FACH, 10, 3, innen_sam)
schneiden(fw, rundplatte('fa_wl', FA[0] + 1, FA[1] - 1, FA[2] + 1, FA[3] - 1, YT - 8, YK + FT + 8, 15, 0, FACH))
quader('fa_hinten', FA[0] - 4, FA[1] + 4, YK + FT - 6, YK + FT - 2, FA[2] - 4, FA[3] + 4, FACH, 0, 2, innen_sam)
quader('fa_matte', FA[0] + 8, FA[1] - 8, YT + 8, YK + FT - 8, FA[2] - 1, FA[2] + 3, GUMMI, 0.8, 2, innen_sam)
quader('fa_led', FA[0] + 20, FA[1] - 20, YT + 12, YT + 15, FA[3] - 2.5, FA[3] - 0.5, FACHLED, 0, 2, innen_sam)
fl = bpy.data.lights.new('fa_licht', 'AREA'); fl.shape = 'RECTANGLE'; fl.size = FA[1] - FA[0] - 40; fl.size_y = 6; fl.energy = 0
fl.color = (1.0, 0.93, 0.85)
flo = bpy.data.objects.new('fa_licht', fl); sc.collection.objects.link(flo); flo.parent = geraet
flo.location = ((FA[0] + FA[1]) / 2, YT + 14, FA[3] - 4); flo.visible_glossy = False

bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get()
for o in list(geraet_sam.objects) + list(innen_sam.objects):
    if o.type == 'MESH' and any(m.type == 'BOOLEAN' for m in o.modifiers):
        neu = bpy.data.meshes.new_from_object(o.evaluated_get(dg)); o.modifiers.clear(); o.data = neu
        neu.set_sharp_from_angle(angle=math.radians(35))

# Boden: fängt nur den Schatten
me = bpy.data.meshes.new('boden'); B = 8000
me.from_pydata([(-B, -B, 0), (B, -B, 0), (B, B, 0), (-B, B, 0)], [], [(0, 1, 2, 3)])
boden = bpy.data.objects.new('boden', me); geraet_sam.objects.link(boden); boden.parent = geraet
boden.is_shadow_catcher = True; me.materials.append(mat('boden', '#ffffff', 0.9))

# Automat so stellen, dass der Platz des Chips im Ausgabefach im Ursprung liegt
SITZ = Vector(((FA[0] + FA[1]) / 2, YT + 70, FA[2] + 3 + Z.S['groesse'].x / 2 + 0.5))
RZ = Matrix.Rotation(PSI, 3, 'Z')
geraet.rotation_euler = (0, 0, PSI); geraet.location = -(RZ @ SITZ)
bpy.context.view_layer.update()
def welt(p): return geraet.matrix_world @ Vector(p)
M3 = geraet.matrix_world.to_3x3()

# ---------------------------------------------------------------- Kamera: waagrecht auf Augenhöhe, Ausschnitt per Verschiebung
cam = Z.S['kamera']; cd = cam.data
cd.sensor_fit = 'VERTICAL'; cd.sensor_height = 36.0
ABST = 5200.0; HF = 1880.0
cd.lens = 36.0 * ABST / HF
mitte = welt((0, YT, H / 2 - 6))
aug = welt((0, YT, 1250.0))
cam.location = Vector((mitte.x + 40, mitte.y - ABST, aug.z))
cam.rotation_euler = (math.radians(90), 0, 0)
cd.shift_x = (mitte.x - cam.location.x) / HF
cd.shift_y = (mitte.z - cam.location.z) / HF
cd.clip_start = 100; cd.clip_end = 20000

def licht(name, ort_rel, kraft, groesse, farbe=(1, 1, 1)):
    o = Z.flaechenlicht(name, tuple(Vector(ort_rel) + mitte), tuple(mitte), kraft, groesse, farbe, sichtbar=False)
    o.light_linking.receiver_collection = geraet_sam
    return o
licht('g_haupt', (-2800, -3200, 2600), 9.0e7, 2600, (1.0, 0.98, 0.96))
licht('g_fuell', (3200, -2600, 600), 2.2e7, 3000, (0.92, 0.95, 1.0))
licht('g_kante', (1600, 1200, 3000), 2.0e7, 1200, (0.95, 0.97, 1.0))
sc.render.film_transparent = True
sc.cycles.film_transparent_glass = False
sc.cycles.caustics_reflective = False; sc.cycles.caustics_refractive = False
sc.cycles.max_bounces = 6; sc.cycles.glossy_bounces = 3; sc.cycles.transmission_bounces = 4; sc.cycles.diffuse_bounces = 2
sc.view_settings.look = 'AgX - Base Contrast'

# ---------------------------------------------------------------- Ablauf: Spirale dreht einmal, der vordere Chip kippt und fällt
i0, j0 = WAHL; XS, ZF = SPALTEN[j0], FAECHER[i0]
VORN = Vector((XS, TIEFE0 + STEIG * 0.5, ZF + HOCH / 2 + 0.5))     # Platz des vordersten Chips (Automat)
KANTE_Y = YK + 26                                                 # Vorderkante des Fachbodens
LANDUNG = SITZ
Q_REGAL = (M3 @ Z.GRUND).to_quaternion()
Q_ENDE = ROT.to_quaternion()
def stand(t):
    """t 0..1: bis 0.1 Ruhe, bis 0.5 dreht die Spirale (Chips rücken eine Windung vor), bis 0.6 kippt der vordere über
    die Kante, bis 0.82 Fall, bei 0.82 Landung, zwei kleine Federn, Ruhe ab 0.95. Gibt (Ort im Automat, Drehung, Spirale 0..1)"""
    sp = glatt((t - 0.1) / 0.4)
    if t < 0.5:
        p = VORN + Vector((0, -STEIG * sp * 0.9, 0)); q = Q_REGAL; return p, q, sp
    if t < 0.6:
        s = (t - 0.5) / 0.1
        p = VORN + Vector((0, -STEIG * 0.9 - 18 * s, -10 * s * s)); q = Q_REGAL.slerp(Q_REGAL @ Quaternion((1, 0, 0), -0.4), s)
        return p, q, 1.0
    if t < 0.82:
        s = (t - 0.6) / 0.22; s2 = s * s
        a = VORN + Vector((0, -STEIG * 0.9 - 18, -10))
        p = a.lerp(LANDUNG, 0) * (1 - s2) + LANDUNG * s2
        p = Vector((a.x + (LANDUNG.x - a.x) * s, a.y + (LANDUNG.y - a.y) * s, a.z + (LANDUNG.z - a.z) * s2))
        q = (Q_REGAL @ Quaternion((1, 0, 0), -0.4)).slerp(Q_ENDE_LOKAL, glatt(s))
        return p, q, 1.0
    s = (t - 0.82) / 0.18
    hoch = 9.0 * abs(math.sin(s * math.pi * 2.0)) * math.exp(-4.6 * s)
    return LANDUNG + Vector((0, 0, hoch)), Q_ENDE_LOKAL, 1.0
Q_ENDE_LOKAL = (M3.inverted() @ ROT).to_quaternion()
Q_REGAL = Z.GRUND.to_quaternion()                    # im Automat-Raum

def setzen(t):
    p, q, sp = stand(t)
    m = geraet.matrix_world @ (Matrix.Translation(p) @ q.to_matrix().to_4x4())
    dreh.matrix_world = m
    spiralen[WAHL].rotation_euler = (0, -2 * math.pi * sp, 0)
    for k, c in enumerate(reihen[WAHL]):
        c.matrix_basis = Matrix.Translation(Vector((XS, TIEFE0 + STEIG * (k + 1.5 - sp), ZF + HOCH / 2 + 0.5))) @ G4
    # im Automat bekommt der Chip weniger von seinem Studiolicht, im Fach das volle (wie in der Drehfolge)
    f = 0.35 + 0.65 * glatt((t - 0.7) / 0.25)
    for nm, e in CHIPLICHT.items(): bpy.data.objects[nm].data.energy = e * f
    an = glatt((t - 0.55) / 0.3)
    FACHLED.node_tree.nodes['Emission'].inputs['Strength'].default_value = 1.0 + 9.0 * an
    fl.energy = 4.0e5 * an
    bpy.context.view_layer.update()

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

setzen(1.0)
xl, xr, zu, zo = -W / 2 + 2, W / 2 - 2, SO + 4, H - 2
lage = {'groesse': [BREITE, HOEHE], 'bilder': BILDER, 'chipbild': K, 'mm': [xr - xl, zo - zu], 'ursprung_mm': [xl, zo],
        'tuer': [proj(welt((xl, YT - 0.01, zo))), proj(welt((xr, YT - 0.01, zo))), proj(welt((xr, YT - 0.01, zu))), proj(welt((xl, YT - 0.01, zu)))],
        'chip_ende': rahmen_von(chip_sam.objects)}
setzen(0.0)
lage['chip_start'] = rahmen_von(chip_sam.objects)
json.dump(lage, open(f'{aus}/lage.json', 'w'), indent=1)
print('lage', lage)

def bild(t, pfad, ausschnitt=None):
    setzen(t)
    r = sc.render
    if ausschnitt:
        r.use_border = True; r.use_crop_to_border = False
        r.border_min_x, r.border_max_x = ausschnitt[0], ausschnitt[2]
        r.border_min_y, r.border_max_y = 1 - ausschnitt[3], 1 - ausschnitt[1]
    else: r.use_border = False
    Z.rendern(pfad)

if NUR == 'vorschau': bild(1.0, f'{aus}/vorschau.png')
elif NUR == 'start': bild(0.0, f'{aus}/start.png')
elif NUR == 'leer':
    setzen(1.0)
    for o in chip_sam.objects: o.hide_render = True
    Z.rendern(f'{aus}/leer.png')
elif NUR == 'mitte': bild(float(os.environ.get('T', '0.7')), f'{aus}/mitte.png')
else:
    # Bereich, in dem sich etwas bewegt: Spalte der gewählten Spirale bis hinunter ins Ausgabefach (mit Rand)
    a, e = lage['chip_start'], lage['chip_ende']
    teile_bereich = [rahmen_von([o for o in spiralen[WAHL].children] or [])] if False else []
    sp_ecken = [proj(welt((XS + dx, TIEFE0 + dy, ZF + dz))) for dx in (-60, 60) for dy in (-40, TIEFE1 - TIEFE0) for dz in (-40, 100)]
    fa_ecken = [proj(welt((x, YT, z))) for x in (FA[0] - 30, FA[1] + 30) for z in (FA[2] - 40, FA[3] + 40)]
    pts = sp_ecken + fa_ecken
    bereich = [max(0, min(p[0] for p in pts) - 0.02), max(0, min(p[1] for p in pts) - 0.02),
               min(1, max(p[0] for p in pts) + 0.02), min(1, max(p[1] for p in pts) + 0.02)]
    print('Bereich', bereich)
    nur_bereich = os.environ.get('AUSSCHNITT') == '1'
    for i in range(BILDER):
        t = i / (BILDER - 1); pfad = f'{aus}/{i:02d}.png'
        if os.path.exists(pfad) and os.environ.get('WEITER') == '1': continue
        bild(t, pfad, bereich if (nur_bereich and i > 0) else None)
    json.dump(dict(lage, bereich=bereich), open(f'{aus}/lage.json', 'w'), indent=1)

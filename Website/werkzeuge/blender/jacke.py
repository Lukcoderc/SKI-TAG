# SkiTag-Chip steckt in der Brusttasche einer Hardshell-Skijacke (verschweißter Reißverschluss) und gleitet heraus.
# Feedback 157: kein Foto, eine echte 3D-Szene.
# TUCH=tuch_fertig.npz python jacke.py -- <ordner mit szene.py> <chip.glb> <ausgabe> [groesse] [proben] [bilder] [nur]
# Ausgabe: <ausgabe>/NN.png, <ausgabe>/leer.png (Tasche ohne Chip), <ausgabe>/lage.json
import sys, math, json, os
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
sys.path.insert(0, argv[0])
import bpy, bmesh, szene as Z
import numpy as np
from mathutils import Vector

glb, aus = argv[1], argv[2]
GROESSE = int(argv[3]) if len(argv) > 3 else 600
PROBEN = int(argv[4]) if len(argv) > 4 else 48
BILDER = int(argv[5]) if len(argv) > 5 else 24
NUR = argv[6] if len(argv) > 6 else ''
BREIT = float(os.environ.get('BREIT', '1.0'))      # Bildformat Breite/Höhe
os.makedirs(aus, exist_ok=True)

Z.aufbauen(glb, (round(GROESSE * BREIT), GROESSE), PROBEN)
Z.ruhelage(); Z.oeffnen(0); Z.pose(0.08, -0.08, 0.0)
sc = Z.S['sc']; sc.render.film_transparent = False
dreh = Z.S['dreh']; GRUND_M = dreh.matrix_world.copy()

CHIP_W, CHIP_VORN, CHIP_HINTEN, CHIP_H = 23.7, -12.8, 14.0, 33.8
OFFEN = -4.0          # Linie des Reißverschlusses
YF = 4.0              # Ebene der Jackenvorderseite (ohne Chip)
ZIP_L = 95.0          # halbe Länge des Reißverschlusses (läuft aus dem Bild)
XS = ZIP_L - 2        # Schieber liegt außerhalb des Bildes
lin = Z.lin
rng = np.random.default_rng(11)

def glatt(t): t = np.clip(t, 0, 1); return t * t * (3 - 2 * t)

# ---------------------------------------------------------------- Sammlungen für Licht-Verknüpfung
chip_sam = bpy.data.collections.new('chipteile'); sc.collection.children.link(chip_sam)
for o in bpy.data.objects['Node_72'].children_recursive:
    if o.type == 'MESH': chip_sam.objects.link(o)
stoff_sam = bpy.data.collections.new('stoffteile'); sc.collection.children.link(stoff_sam)
def in_stoff(o): stoff_sam.objects.link(o) if o.name not in stoff_sam.objects else None

for n in ('haupt', 'streif', 'kante', 'kante2', 'softbox', 'streifen'):
    o = bpy.data.objects[n]; o.light_linking.receiver_collection = chip_sam; o.hide_render = False
bpy.data.objects['kante'].hide_render = True; bpy.data.objects['kante2'].hide_render = True

# ---------------------------------------------------------------- Materialien
def knoten(m): return m.node_tree.nodes, m.node_tree.links

def stoff(name, farbe):
    m = bpy.data.materials.new(name); m.use_nodes = True; N, L = knoten(m)
    b = Z.bsdf(m); I = b.inputs
    I['Specular IOR Level'].default_value = 0.32
    I['Sheen Weight'].default_value = 0.5; I['Sheen Roughness'].default_value = 0.3; I['Sheen Tint'].default_value = (0.85, 0.9, 1.0, 1)
    tc = N.new('ShaderNodeTexCoord')
    sep = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Object'], sep.inputs[0])
    def math(op, a, b_=None, wert=None):
        n = N.new('ShaderNodeMath'); n.operation = op
        for i, v in enumerate((a, b_)):
            if v is None: continue
            if isinstance(v, (int, float)): n.inputs[i].default_value = v
            else: L.new(v, n.inputs[i])
        return n.outputs[0]
    def stufe(v, a, b_):
        r = N.new('ShaderNodeMapRange'); r.interpolation_type = 'SMOOTHSTEP'
        r.inputs['From Min'].default_value = a; r.inputs['From Max'].default_value = b_; L.new(v, r.inputs['Value']); return r.outputs['Result']
    # Ripstop-Gitter (alle 4,8 mm eine feine, etwas dickere Faser) + Köperbindung als feines Rauschen
    def rip(achse):
        s = math('SINE', math('MULTIPLY', sep.outputs[achse], 2 * math_pi / 4.8))
        return stufe(s, 0.93, 0.995)
    gitter = math('MAXIMUM', rip('X'), rip('Z'))
    fein = N.new('ShaderNodeTexNoise'); fein.inputs['Scale'].default_value = 3.0; fein.inputs['Detail'].default_value = 3
    fein.inputs['Roughness'].default_value = 0.7; L.new(tc.outputs['Object'], fein.inputs['Vector'])
    grob = N.new('ShaderNodeTexNoise'); grob.inputs['Scale'].default_value = 0.05; grob.inputs['Detail'].default_value = 3
    L.new(tc.outputs['Object'], grob.inputs['Vector'])
    # verschweißtes Band rund um den Reißverschluss: etwas glatter, dunkler und eine fühlbare Kante
    dz = math('SUBTRACT', math('ABSOLUTE', math('SUBTRACT', sep.outputs['Z'], OFFEN)), 10.5)
    dx = math('SUBTRACT', math('ABSOLUTE', sep.outputs['X']), ZIP_L + 9)
    band = math('SUBTRACT', 1.0, stufe(math('MAXIMUM', dz, dx), -0.35, 0.35))
    hoehe = math('ADD', math('ADD', math('MULTIPLY', gitter, 0.12), math('MULTIPLY', fein.outputs['Fac'], 0.35)),
                 math('MULTIPLY', band, 0.0))
    bu = N.new('ShaderNodeBump'); bu.inputs['Strength'].default_value = 0.35; bu.inputs['Distance'].default_value = 0.12
    L.new(hoehe, bu.inputs['Height']); L.new(bu.outputs['Normal'], I['Normal'])
    # Farbe: leicht wolkig, das Band etwas dunkler
    c1, c2 = lin(farbe), tuple(x * 0.82 for x in lin(farbe)[:3]) + (1,)
    mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'
    L.new(math('MULTIPLY', grob.outputs['Fac'], 0.5), mx.inputs['Factor'])
    mx.inputs['A'].default_value = c1; mx.inputs['B'].default_value = c2; L.new(mx.outputs['Result'], I['Base Color'])
    rau = math('SUBTRACT', 0.74, math('MULTIPLY', band, 0.0))
    L.new(math('ADD', rau, math('MULTIPLY', fein.outputs['Fac'], 0.08)), I['Roughness'])
    return m
math_pi = math.pi

def glatt_mat(name, farbe, rau, metall=0.0, spek=0.5):
    m = bpy.data.materials.new(name); m.use_nodes = True; I = Z.bsdf(m).inputs
    I['Base Color'].default_value = lin(farbe); I['Roughness'].default_value = rau; I['Metallic'].default_value = metall
    I['Specular IOR Level'].default_value = spek
    return m

JACKE = stoff('jacke', '#22365f')
BESCH = glatt_mat('beschichtung', '#1a2846', 0.5, 0, 0.4)
SPIRALE = glatt_mat('spirale', '#0b0e15', 0.45)
FUTTER = glatt_mat('futter', '#04060a', 0.9, 0, 0.2)
METALL = glatt_mat('schieber', '#5a6070', 0.3, 1.0)
GUMMI = glatt_mat('gummi', '#0c0f15', 0.55, 0, 0.4)

# ---------------------------------------------------------------- Stoffteile
def gitter_netz(name, x0, x1, z0, z1, schritt):
    nx, nz = int(round((x1 - x0) / schritt)) + 1, int(round((z1 - z0) / schritt)) + 1
    xs, zs = np.linspace(x0, x1, nx), np.linspace(z0, z1, nz)
    P = np.array([(x, 0.0, z) for z in zs for x in xs])
    faces = [(j * nx + i, j * nx + i + 1, (j + 1) * nx + i + 1, (j + 1) * nx + i) for j in range(nz - 1) for i in range(nx - 1)]
    me = bpy.data.meshes.new(name); me.from_pydata(P.tolist(), [], faces); me.update()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o); in_stoff(o); o.data.materials.append(JACKE)
    for p in me.polygons: p.use_smooth = True
    s = o.modifiers.new('glatt', 'SUBSURF'); s.levels = 0; s.render_levels = 1
    return o, P, nx, nz

def falten(P, n, amp, skala):
    y = np.zeros(len(P))
    for _ in range(n):
        a = rng.uniform(0, math.pi); k = 2 * math.pi / rng.uniform(*skala); ph = rng.uniform(0, 6.3)
        y += amp / n * 2 * np.sin(k * (P[:, 0] * math.cos(a) + P[:, 2] * math.sin(a)) + ph)
    return y

def knicke(P, linien):
    """schmale, weiche Knitterfalten entlang schräger Linien (Punkt, Richtung, Länge, Breite, Tiefe)"""
    y = np.zeros(len(P))
    for (px, pz), w, laenge, breite, tiefe in linien:
        d = np.array([math.cos(w), math.sin(w)])
        rx, rz = P[:, 0] - px, P[:, 2] - pz
        entlang = rx * d[0] + rz * d[1]; quer = -rx * d[1] + rz * d[0]
        y += tiefe * np.exp(-(quer / breite) ** 2) * (1 - glatt(np.abs(entlang) / laenge))
    return y

TUCH = np.load(os.environ['TUCH']) if os.environ.get('TUCH') else None
if TUCH is not None:
    unten, UP, unx, unz = gitter_netz('unten', -100, 100, -100, OFFEN, 2.0)
    assert len(UP) == len(TUCH['P'])
else:
    unten, UP, unx, unz = gitter_netz('unten', -100, 100, -100, OFFEN, 1.25)
oben, OP, onx, onz = gitter_netz('oben', -100, 100, OFFEN, 106, 2.0 if TUCH is not None else 1.25)
# beide Hälften als ein Netz: außerhalb des Reißverschlusses hängen sie zusammen (keine Kante im Licht)
def kombi_bauen():
    nu = len(UP); karte = np.arange(len(OP)) + nu; eigene = []
    for i in range(onx):
        if abs(OP[i, 0]) > ZIP_L + 0.01 and len(UP) // unx == unz and unx == onx:
            karte[i] = (unz - 1) * unx + i
    neu = [k for k in range(len(OP)) if karte[k] >= nu]
    karte[neu] = nu + np.arange(len(neu))
    faces = [tuple(int(v) for v in p.vertices) for p in unten.data.polygons]
    faces += [tuple(int(karte[v]) for v in p.vertices) for p in oben.data.polygons]
    verts = np.vstack([UP, OP[neu]])
    me = bpy.data.meshes.new('stoff'); me.from_pydata(verts.tolist(), [], faces); me.update()
    o = bpy.data.objects.new('stoff', me); sc.collection.objects.link(o); in_stoff(o); me.materials.append(JACKE)
    for p in me.polygons: p.use_smooth = True
    m = o.modifiers.new('glatt', 'SUBSURF'); m.levels = 0; m.render_levels = 2
    for alt in (unten, oben): alt.hide_render = True
    return o, np.array(neu)
STOFF, NEU_O = kombi_bauen()
WELLEN = [(rng.uniform(0, math.pi), 2 * math.pi / rng.uniform(70, 170), rng.uniform(0, 6.3)) for _ in range(7)]
def falten_fest(P):
    y = np.zeros(len(P))
    for a, k, ph in WELLEN: y += 1.6 / 7 * 2 * np.sin(k * (P[:, 0] * math.cos(a) + P[:, 2] * math.sin(a)) + ph)
    return y
KNICKE = [((-75, -70), 1.0, 30, 6, 0.7), ((-70, 70), -0.5, 35, 6, 0.7)]
FALT_U = falten_fest(UP) + knicke(UP, KNICKE)
FALT_O = falten_fest(OP) + knicke(OP, KNICKE)
# Brustwölbung: zur Seite und nach oben/unten leicht nach hinten
def woelb(P): return 0.00055 * P[:, 0] ** 2 + 0.00025 * (P[:, 2] - 10) ** 2
# Kräuseln entlang der Naht des Reißverschlusses
def kraeusel(P):
    return 0.12 * np.sin(2 * math.pi * P[:, 0] / 7.5 + 0.7) * np.exp(-np.abs(P[:, 2] - OFFEN) / 4.0) * (np.abs(P[:, 0]) < ZIP_L + 6)

innen = None
def futter():
    global innen
    me = bpy.data.meshes.new('futter')
    me.from_pydata([(-ZIP_L, 17, OFFEN - 30), (ZIP_L, 17, OFFEN - 30), (ZIP_L, 17, OFFEN + 30), (-ZIP_L, 17, OFFEN + 30)], [], [(0, 1, 2, 3)])
    innen = bpy.data.objects.new('futter', me); sc.collection.objects.link(innen); in_stoff(innen); me.materials.append(FUTTER)
futter()

# ---------------------------------------------------------------- Chipweg
Z_START, Z_ENDE = OFFEN - CHIP_H + 20, OFFEN + CHIP_H + 6
def zc_bei(t): return Z_START + (Z_ENDE - Z_START) * t
def dy_bei(t):
    """der Chip kommt beim Herausziehen nach vorne, damit er vor dem oberen Stoff liegt"""
    return -12.5 * float(glatt((t - 0.15) / 0.75))

def neig_bei(t):
    """beim Herausziehen kippt der Chip mit der Oberkante zur Kamera, am Ende steht er wieder gerade"""
    return 0.2 * (1 - glatt((t - 0.35) / 0.55))
NEIG = 0.0
def chip_auf(zc, dy, sichtbar=True):
    from mathutils import Matrix
    m = Matrix.Rotation(NEIG, 4, 'X') @ GRUND_M.copy(); m.translation = Vector((0, dy, zc)); dreh.matrix_world = m
    for o in chip_sam.objects: o.hide_render = not sichtbar
    bpy.context.view_layer.update()

# ---------------------------------------------------------------- Form der beiden Stoffhälften
def formen(zc, dy, mit_chip=True):
    vorn, hinten = CHIP_VORN + dy, CHIP_HINTEN + dy
    z0, z1 = zc - CHIP_H, zc + CHIP_H
    # wie weit steckt der Chip noch in der Öffnung (0 = draußen)
    drin = float(glatt((OFFEN + 3 - z0) / 14)) if mit_chip else 0.0
    def quer(x, rand):  # 1 über der Chipbreite, weich auslaufend
        return 1 - glatt((np.abs(x) - CHIP_W) / rand)
    # unten: über dem Chip gewölbt, mit Zugfalten von den Ecken
    x, z = UP[:, 0], UP[:, 2]
    y = YF + FALT_U + woelb(UP) + kraeusel(UP)
    zz = UP[:, 2].copy()
    if mit_chip and z0 < OFFEN:
        zo = min(z1, OFFEN)
        dzr = np.maximum(np.maximum(z0 - z, z - zo), 0)
        dxr = np.maximum(np.abs(x) - CHIP_W, 0)
        d = np.hypot(dxr / 20.0, dzr / (34.0 if True else 1))   # zur Seite straff, nach unten läuft der Stoff länger aus
        stark = float(glatt((zo - z0) / 14))
        hub = (1 - glatt(d)) * stark
        hub = hub * hub * (3 - 2 * hub)
        y = y * (1 - hub) + (vorn - 1.3 + 0.3 * FALT_U) * hub
        # Zugfalten: von den unteren Ecken des Chips schräg nach außen unten
        zug = [((s * (CHIP_W - 2), z0 + 4), -math.pi / 2 + s * 0.55, 30, 3.2, 1.6 * stark) for s in (-1, 1)]
        zug += [((s * (CHIP_W - 6), z0 + 2), -math.pi / 2 + s * 0.18, 22, 2.6, 0.9 * stark) for s in (-1, 1)]
        y += knicke(UP, zug) * (z < z0 + 6)
    # die untere Lippe hängt neben dem Chip etwas durch (Öffnung klafft), danach bleibt ein schmaler Spalt
    sack = (2.6 * drin + 0.9 * (1 - drin)) * quer(x, 24 if drin > 0.5 else 30)
    zz -= sack * np.exp(-(OFFEN - z) / 7.0)
    co = UP.copy(); co[:, 1] = y; co[:, 2] = zz
    if TUCH is not None:
        sim = TUCH[SIM_KEY].copy()
        geschoben = glatt((YF - 0.5 - sim[:, 1]) / 4.0)
        # Knitter der Simulation auf der gespannten Fläche glätten (Laplace auf dem Gitter, Rand bleibt)
        g = sim[:, 1].reshape(unz, unx).copy(); gw = geschoben.reshape(unz, unx)
        for _ in range(int(os.environ.get('GLAETTEN', '10'))):
            m = g.copy(); m[1:-1, 1:-1] = (g[:-2, 1:-1] + g[2:, 1:-1] + g[1:-1, :-2] + g[1:-1, 2:]) / 4
            g = np.minimum(g * (1 - gw) + m * gw, sim[:, 1].reshape(unz, unx)); g[-1, :] = sim[:, 1].reshape(unz, unx)[-1, :]   # nur nach vorne, nie in den Chip
        sim[:, 1] = g.ravel()          # wo der Chip den Stoff nach vorne drückt, keine Grundfalten
        sim[:, 1] += (FALT_U + woelb(UP) + kraeusel(UP)) * (1 - geschoben) + 0.25 * FALT_U * geschoben
        co = sim
    CO_U = co
    rand_u = (co[(unz - 1) * unx:, 0], co[(unz - 1) * unx:, 1], co[(unz - 1) * unx:, 2])
    # oben: die Lippe wird vom Chip nach hinten gedrückt, solange er in der Öffnung steckt
    x, z = OP[:, 0], OP[:, 2]
    y = YF + FALT_O + woelb(OP) + kraeusel(OP)
    zz = OP[:, 2].copy()
    if mit_chip:
        tief = np.maximum(0.0, hinten + 1.0 - YF - (z - zc) * math.tan(NEIG))
        if tief.max() > 0 and z1 > OFFEN and z0 < OFFEN + 40:
            zu = max(z0, OFFEN)
            dzr = np.maximum(np.maximum(zu - z, z - z1), 0)
            d = np.hypot(np.maximum(np.abs(x) - CHIP_W + 2, 0), dzr)
            y += tief * (1 - glatt(d / 12.0))
    zz += (0.6 * drin + 0.3 * (1 - drin)) * quer(x, 24) * np.exp(-(z - OFFEN) / 7.0)
    co = OP.copy(); co[:, 1] = y; co[:, 2] = zz
    STOFF.data.vertices.foreach_set('co', np.vstack([CO_U, co[NEU_O]]).ravel()); STOFF.data.update()
    rand_o = (co[:onx, 0], co[:onx, 1], co[:onx, 2])
    return rand_u, rand_o

# ---------------------------------------------------------------- Reißverschluss
PROFIL = [(-4.6, 0.3), (-4.1, -0.18), (-3.3, -0.3), (-1.8, -0.34), (-0.9, -0.32), (-0.4, -0.24), (-0.1, -0.06),
          (0.0, 0.2), (-0.1, 0.6), (-0.4, 1.0), (-1.6, 1.2)]

def objekt(name, me, mat):
    o = bpy.data.objects.get(name)
    if o: old = o.data; o.data = me; bpy.data.meshes.remove(old)
    else: o = bpy.data.objects.new(name, me); sc.collection.objects.link(o); in_stoff(o)
    if not o.data.materials: o.data.materials.append(mat)
    for p in o.data.polygons: p.use_smooth = True
    return o

def band(name, rand, richtung):
    """beschichtetes Band entlang der Kante; richtung -1: Band liegt unter der Kante (untere Hälfte), +1 darüber"""
    rx, ry, rz = rand
    xs = np.arange(-ZIP_L, ZIP_L + 0.01, 0.7)
    ys, zs = np.interp(xs, rx, ry), np.interp(xs, rx, rz)
    # an den Enden laufen die Bänder rund zusammen
    ende = glatt((ZIP_L - np.abs(xs)) / 3.0)
    verts, faces = [], []; n = len(PROFIL)
    for i, (x, y, z) in enumerate(zip(xs, ys, zs)):
        for dz, dyp in PROFIL:
            verts.append((x, y + dyp * (0.3 + 0.7 * ende[i]), z - richtung * dz))
        if i:
            a, b = (i - 1) * n, i * n
            for k in range(n - 1):
                f = (a + k, b + k, b + k + 1, a + k + 1)
                faces.append(f if richtung < 0 else f[::-1])
    me = bpy.data.meshes.new(name); me.from_pydata(verts, [], faces); me.update()
    return objekt(name, me, BESCH)

def spirale(name, rand, richtung, x_bis):
    """Kunststoffspirale hinter der beschichteten Kante, nur sichtbar, wo der Reißverschluss klafft"""
    rx, ry, rz = rand
    bm = bmesh.new()
    for x in np.arange(-ZIP_L + 2, x_bis, 1.25):
        y, z = np.interp(x, rx, ry), np.interp(x, rx, rz)
        r = bmesh.ops.create_uvsphere(bm, u_segments=8, v_segments=6, radius=1.0)
        for v in r['verts']:
            v.co.x = x + v.co.x * 0.5; v.co.y = y + 2.0 + v.co.y * 0.9; v.co.z = z - richtung * 0.2 + v.co.z * 1.1
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    return objekt(name, me, SPIRALE)

def schieber(rand_u, rand_o):
    """Schieber und Zieher aus Gummi, rechts neben dem Chip"""
    yb = float(np.interp(XS, rand_u[0], rand_u[1])); zb = float(np.interp(XS, rand_u[0], rand_u[2]))
    if 'schieber' in bpy.data.objects: return
    bm = bmesh.new()
    r = bmesh.ops.create_cube(bm, size=1.0)
    for v in r['verts']:
        breit = 1.0 if v.co.x > 0 else 0.82      # zur offenen Seite hin schmaler
        v.co.x *= 8.0; v.co.y = v.co.y * 3.0; v.co.z *= 7.0 * breit
    bmesh.ops.bevel(bm, geom=bm.edges[:] + bm.verts[:], offset=1.2, segments=4, affect='EDGES')
    me = bpy.data.meshes.new('schieber'); bm.to_mesh(me); bm.free()
    o = objekt('schieber', me, METALL); o.location = (XS, yb - 1.9, zb)
    # Bügel
    # Zieher: flache Gummilasche, hängt nach unten und liegt schräg auf dem Stoff
    bm = bmesh.new(); r = bmesh.ops.create_cube(bm, size=1.0)
    for v in r['verts']:
        v.co.x *= 6.0 if v.co.z > 0 else 7.5; v.co.y *= 1.6; v.co.z *= 20.0
    bmesh.ops.bevel(bm, geom=bm.edges[:] + bm.verts[:], offset=1.0, segments=4, affect='EDGES')
    me = bpy.data.meshes.new('zieher'); bm.to_mesh(me); bm.free()
    zi = objekt('zieher', me, GUMMI)
    zi.location = (XS + 1.5, yb - 2.6, zb - 13.5); zi.rotation_euler = (0.05, 0, 0.1)
    # eingeprägte Rille im Zieher
    bm = bmesh.new(); r = bmesh.ops.create_cube(bm, size=1.0)
    for v in r['verts']: v.co.x *= 1.8; v.co.y *= 0.5; v.co.z *= 10.0
    bmesh.ops.bevel(bm, geom=bm.edges[:] + bm.verts[:], offset=0.25, segments=2, affect='EDGES')
    me = bpy.data.meshes.new('rille'); bm.to_mesh(me); bm.free()
    ri = objekt('rille', me, FUTTER); ri.parent = zi; ri.location = (0, -0.7, -3.0)

def reissverschluss(rand_u, rand_o):
    band('band_u', rand_u, -1); band('band_o', rand_o, +1)
    spirale('spir_u', rand_u, -1, XS); spirale('spir_o', rand_o, +1, XS)

# ---------------------------------------------------------------- Kamera und Licht
cam = Z.S["kamera"]; cam.data.lens = 125
ZIEL = Vector((0, 0, 14.0)); ABST = 470
cam.location = ZIEL + Vector((0, -ABST, 12)); cam.rotation_euler = (ZIEL - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam.data.dof.use_dof = True; cam.data.dof.focus_distance = ABST - 12; cam.data.dof.aperture_fstop = 9

key = Z.flaechenlicht('stoff_key', (-380, -150, 320), (0, 0, -10), 4.5e6, 90, (1.0, 0.97, 0.92))
fill = Z.flaechenlicht('stoff_fill', (330, -420, 40), (0, 0, 0), 1.2e5, 320, (0.85, 0.9, 1.0))
rim = Z.flaechenlicht('stoff_rim', (0, -60, 420), (0, 0, 0), 1.2e5, 200, (0.9, 0.94, 1.0))
for l in (key, fill, rim): l.light_linking.receiver_collection = stoff_sam
# der Chip bekommt ein schwaches Licht von links oben dazu, damit er zum Stoff passt
ck = Z.flaechenlicht('chip_key', (-380, -150, 320), (0, 0, 0), 3e5, 70, (1.0, 0.97, 0.92))
ck.light_linking.receiver_collection = chip_sam

def projektion(zc, dy):
    mo, ob = Z.projizieren((0, CHIP_VORN + dy, zc)), Z.projizieren((0, CHIP_VORN + dy, zc + CHIP_H))
    un = Z.projizieren((0, CHIP_VORN + dy, zc - CHIP_H))
    return {'mitte': [round(mo[0], 5), round(mo[1], 5)], 'oben': round(ob[1], 5), 'unten': round(un[1], 5)}

lage = {'groesse': [round(GROESSE * BREIT), GROESSE], 'bilder': BILDER,
        'start': projektion(Z_START, dy_bei(0)), 'ende': projektion(Z_ENDE, dy_bei(1))}
def chip_rahmen():
    from bpy_extras.object_utils import world_to_camera_view
    bpy.context.view_layer.update(); xs, ys = [], []
    for o in chip_sam.objects:
        mw = o.matrix_world
        for v in list(o.data.vertices)[::3]:
            p = world_to_camera_view(sc, cam, mw @ v.co); xs.append(p.x); ys.append(1 - p.y)
    return [round(min(xs), 5), round(min(ys), 5), round(max(xs), 5), round(max(ys), 5)]
chip_auf(Z_ENDE, dy_bei(1)); lage['ende_rahmen'] = chip_rahmen()
chip_auf(Z_START, dy_bei(0)); lage['start_rahmen'] = chip_rahmen()
json.dump(lage, open(f'{aus}/lage.json', 'w'))

SIM_KEY = None
def bild(t, pfad):
    global SIM_KEY, NEIG; SIM_KEY = f'{t:g}'; NEIG = neig_bei(t)
    zc, dy = zc_bei(t), dy_bei(t); chip_auf(zc, dy)
    ru, ro = formen(zc, dy); reissverschluss(ru, ro)
    Z.rendern(pfad)

def leer(pfad):
    global SIM_KEY, NEIG; SIM_KEY = 'leer'; NEIG = 0.0
    chip_auf(Z_ENDE, dy_bei(1), False); ru, ro = formen(Z_ENDE, dy_bei(1), False); reissverschluss(ru, ro); Z.rendern(pfad)

if NUR == 'leer': leer(f'{aus}/leer.png')
elif NUR:
    for t in NUR.split(','): bild(float(t), f'{aus}/t{t}.png')
else:
    nr = [int(v) for v in os.environ['NR'].split(',')] if os.environ.get('NR') else range(BILDER)
    for i in nr: bild(i / (BILDER - 1), f'{aus}/{i:02d}.png')
    if not os.environ.get('NR'): leer(f'{aus}/leer.png')
print('fertig', lage)

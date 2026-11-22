# Explosionsansicht, nur das Öffnen (Feedback 131, gestaffelt und schärfer seit Feedback 132): 48 Bilder von zu (e = 0) bis ganz offen (e = 1), die Ansicht dreht dabei
# ein kleines Stück weiter; mit Ansatzpunkten der Namen. Abgespielt wird nach der Zeit (innen-film.js), nicht am Scrollen.
import sys, json, math, time; sys.path.insert(0, sys.argv[-3])
import bpy, szene as Z
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
glb, aus = sys.argv[-2], sys.argv[-1]
import os
W, H, N = 1800, 1350, int(os.environ.get('BILDER', 48))   # seit 2026-11-22: 96 Bilder (BILDER=96), gegen das Ruckeln
Z.aufbauen(glb, (W, H), int(os.environ.get('PROBEN', 24)))
# GERAET=OPTIX oder CUDA rechnet auf der Grafikkarte (sonst CPU)
if os.environ.get('GERAET'):
    pr = bpy.context.preferences.addons['cycles'].preferences; pr.compute_device_type = os.environ['GERAET']; pr.get_devices()
    for d in pr.devices: d.use = d.type == os.environ['GERAET']
    bpy.context.scene.cycles.device = 'GPU'
Z.ruhelage(); Z.oeffnen(0)
# von oben spiegelt die Front sonst die helle Decke und wirkt weiß: Umgebung leiser, Spiegelkarten (für die Ansicht von vorn) aus
for n in ('softbox', 'streifen'): bpy.data.objects[n].hide_render = True
bpy.data.objects['kante'].visible_glossy = False
_nt = bpy.context.scene.world.node_tree; _bg = _nt.nodes['Background']; _l = _bg.inputs['Strength'].links[0]
_m = _nt.nodes.new('ShaderNodeMath'); _m.operation = 'MULTIPLY'; _m.inputs[1].default_value = 0.4
_nt.links.new(_l.from_socket, _m.inputs[0]); _nt.links.new(_m.outputs[0], _bg.inputs['Strength'])
E = Z.S['ebenen']; sc = Z.S['sc']; ko = Z.S['kamera']
klemme = lambda x: max(0.0, min(1.0, x)); weich = lambda x: x * x * (3 - 2 * x)
# Umrisse der benannten Teile im geschlossenen Zustand (Weltmaß, Chip flach, Dicke = Z)
ANSATZ = [('kappe', 'rund'), ('ledstab', 'fest'), ('rand', 'eckig'), ('platine', 'eckig'), ('akku', 'eckig'), ('qi', 'rund')]
umrisse = []
for name, form in ANSATZ:
    a, b = Z.welt_bbox(E[name]); cx, cy = (a.x + b.x) / 2, (a.y + b.y) / 2
    if form == 'fest': umrisse.append([Vector((cx, cy, b.z))]); continue
    zz = b.z if name == 'kappe' else (a.z + b.z) / 2; rx, ry = (b.x - a.x) / 2, (b.y - a.y) / 2; l = []
    for k in range(32):
        w = k / 32 * 2 * math.pi; c, s = math.cos(w), math.sin(w)
        f = min(rx, ry) * 0.97 if form == 'rund' else 1 / max(abs(c) / (rx - 1.2), abs(s) / (ry - 1.2))
        l.append(Vector((cx + c * f, cy + s * f, zz)))
    umrisse.append(l)
chip = [o for o in bpy.data.objects['Node_72'].children_recursive if o.type == 'MESH']
pts = [o.matrix_world @ Vector(v) for o in chip for v in o.bound_box]
zoben = max(p.z for p in pts); zunten = min(p.z for p in pts); DIAG = math.hypot(66, 46)
cam = ko.data; cam.lens = 70; cam.sensor_fit = 'VERTICAL'; cam.sensor_height = 24
daten = {'bilder': [], 'n': N}
def proj(v): p = world_to_camera_view(sc, ko, v); return [round(p.x, 5), round(1 - p.y, 5)]
for i in range(N):
    e = i / (N - 1); p = e
    Z.oeffnen(e)
    az = -0.62 + e * 0.25; el = 0.52 + (0.44 - 0.52) * e
    vs = [Z.weg(k, e) for k in E]
    unten = zunten + min(vs); oben = zoben + max(vs) + 4 * e
    mitte = Vector((0, 0, (oben + unten) / 2))
    richt = Vector((math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el)))
    # Abstand: Höhe des Stapels mit Rand, Breite der Diagonale; der Stapel rückt mit dem Öffnen nach links
    t = math.tan(math.atan(12 / 70)); hoch = (oben - unten) * math.cos(el) + 54 * math.sin(el)
    schub = 0.13 * weich(e)
    d = max(hoch / 2 * 1.16 / t, (DIAG / 2) / (t * (W / H) * 2 * (0.5 - schub) * 0.74))
    ko.location = mitte + richt * d
    ko.rotation_euler = (-richt).to_track_quat('-Z', 'Y').to_euler()
    cam.shift_x = schub * 1.0
    bpy.context.view_layer.update()
    b = {'p': round(p, 4), 'e': round(e, 4), 'orte': []}
    for (name, form), l in zip(ANSATZ, umrisse):
        v = Z.weg(name, e)
        kand = [proj(q + Vector((0, 0, v))) for q in l]
        b['orte'].append(max(kand, key=lambda q: q[0]))
    mp = proj(mitte); rechts = (ko.matrix_world.to_3x3() @ Vector((1, 0, 0))).normalized()
    b['mitte'] = mp; b['spalte'] = proj(mitte + rechts * DIAG / 2)[0]
    b['oben'] = proj(Vector((0, 0, zoben + Z.weg('kappe', e))))[1]
    b['unten'] = proj(Vector((0, 0, zunten + 1.3 + Z.weg('qi', e))))[1]
    # nur den Bereich um den Chip rechnen (das Bild bleibt W x H, außen durchsichtig); wandeln.py schneidet später zu
    ecken = [proj(o.matrix_world @ Vector(c)) for o in chip if not o.hide_render for c in o.bound_box]
    x0 = min(q[0] for q in ecken) - 0.03; x1 = max(q[0] for q in ecken) + 0.03; y0 = min(q[1] for q in ecken) - 0.03; y1 = max(q[1] for q in ecken) + 0.03
    r = sc.render; r.use_border = True; r.use_crop_to_border = False
    r.border_min_x, r.border_max_x = max(0, x0), min(1, x1); r.border_min_y, r.border_max_y = max(0, 1 - y1), min(1, 1 - y0)
    daten['bilder'].append(b)
    json.dump(daten, open(f'{aus}/punkte.json', 'w'))
    import os
    if os.path.exists(f'{aus}/{i:02d}.png') or (os.environ.get('NUR') and str(i) not in os.environ['NUR'].split(',')): continue   # schon fertig (nach einem Abbruch weitermachen)
    tt = time.time(); Z.rendern(f'{aus}/{i:02d}.png'); print('Bild', i, round(time.time() - tt), flush=True)

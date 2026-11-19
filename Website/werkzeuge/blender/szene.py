# SkiTag-Chip als Produktfoto in Blender/Cycles. Wird von den Render-Skripten importiert.
import bpy, math, mathutils, json
from mathutils import Vector, Matrix, Euler, Quaternion

GLB = None
S = {}

def lin(h):
    h = h.lstrip('#'); c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c) + (1.0,)

def bsdf(mat):
    return next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')

def rauschen(mat, staerke=0.15, skala=900):
    """feine Körnung wie gestrahlter Kunststoff: Rauschen in die Normale"""
    nt = mat.node_tree; b = bsdf(mat)
    tc = nt.nodes.new('ShaderNodeTexCoord'); no = nt.nodes.new('ShaderNodeTexNoise'); bu = nt.nodes.new('ShaderNodeBump')
    no.inputs['Scale'].default_value = skala; no.inputs['Detail'].default_value = 4
    bu.inputs['Strength'].default_value = staerke; bu.inputs['Distance'].default_value = 0.02
    nt.links.new(tc.outputs['Object'], no.inputs['Vector']); nt.links.new(no.outputs['Fac'], bu.inputs['Height'])
    nt.links.new(bu.outputs['Normal'], b.inputs['Normal'])

def materialien():
    for m in bpy.data.materials:
        if not m.use_nodes: continue
        b = bsdf(m); n = m.name; I = b.inputs
        I['Emission Strength'].default_value = 0.0
        if n == 'schale':
            I['Base Color'].default_value = lin('#121418'); I['Roughness'].default_value = 0.38
            I['Coat Weight'].default_value = 0.7; I['Coat Roughness'].default_value = 0.1
            rauschen(m, 0.12)
        elif n == 'orange':
            I['Base Color'].default_value = lin('#ff4a0a'); I['Roughness'].default_value = 0.48
            I['Subsurface Weight'].default_value = 0.08; I['Subsurface Radius'].default_value = (1.0, 0.35, 0.15); I['Subsurface Scale'].default_value = 0.6
            I['Sheen Weight'].default_value = 0.25; I['Sheen Tint'].default_value = lin('#ffc9a8')
            I['Coat Weight'].default_value = 0.1; I['Coat Roughness'].default_value = 0.35
            rauschen(m, 0.08)
        elif n == 'knopf':
            I['Base Color'].default_value = lin('#17191d'); I['Roughness'].default_value = 0.55
            I['Coat Weight'].default_value = 0.35; I['Coat Roughness'].default_value = 0.22
            rauschen(m, 0.06, 1400)
        elif n == 'led':
            I['Base Color'].default_value = lin('#d9ffe0'); I['Roughness'].default_value = 0.08
            I['Transmission Weight'].default_value = 0.6
            I['Emission Color'].default_value = lin('#3dff76'); I['Emission Strength'].default_value = 1.5
        elif n in ('metall', 'silber', 'blech', 'gold', 'kupfer'):
            I['Metallic'].default_value = 1.0
            I['Roughness'].default_value = {'metall': 0.28, 'silber': 0.2, 'blech': 0.32, 'gold': 0.25, 'kupfer': 0.3}[n]
        elif n == 'platine':
            I['Roughness'].default_value = 0.35; I['Coat Weight'].default_value = 0.5; I['Coat Roughness'].default_value = 0.2
        elif n.startswith('Material_'):
            I['Metallic'].default_value = 0.85; I['Roughness'].default_value = 0.32
        elif n == 'akku':
            I['Metallic'].default_value = 0.4; I['Roughness'].default_value = 0.3
        elif n == 'keramik':
            I['Roughness'].default_value = 0.6
        elif n == 'ferrit':
            I['Roughness'].default_value = 0.75

def flaechenlicht(name, ort, ziel, kraft, groesse, farbe=(1, 1, 1), sichtbar=True):
    d = bpy.data.lights.new(name, 'AREA'); d.energy = kraft; d.size = groesse; d.color = farbe; d.shape = 'RECTANGLE'; d.size_y = groesse * 0.6
    o = bpy.data.objects.new(name, d); bpy.context.scene.collection.objects.link(o)
    o.location = ort; o.rotation_euler = (Vector(ziel) - Vector(ort)).to_track_quat('-Z', 'Y').to_euler()
    o.visible_glossy = sichtbar
    return o

def spiegelkarte(name, ort, b, h, kraft):
    """helle Fläche mit weichem Verlauf, die nur in Spiegelungen zu sehen ist (kein Licht auf matte Flächen)"""
    me = bpy.data.meshes.new(name); me.from_pydata([(-b/2, -h/2, 0), (b/2, -h/2, 0), (b/2, h/2, 0), (-b/2, h/2, 0)], [], [(0, 1, 2, 3)])
    me.uv_layers.new()
    o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o)
    o.location = ort; o.rotation_euler = (Vector((0, 0, 0)) - Vector(ort)).to_track_quat('Z', 'Y').to_euler()
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial'); em = nt.nodes.new('ShaderNodeEmission'); em.inputs['Strength'].default_value = kraft
    tc = nt.nodes.new('ShaderNodeTexCoord'); gr = nt.nodes.new('ShaderNodeTexGradient'); gr.gradient_type = 'QUADRATIC_SPHERE'
    mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Location'].default_value = (-0.5, -0.5, 0)
    nt.links.new(tc.outputs['UV'], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], gr.inputs['Vector'])
    ra = nt.nodes.new('ShaderNodeMath'); ra.operation = 'POWER'; ra.inputs[1].default_value = 1.6
    nt.links.new(gr.outputs['Fac'], ra.inputs[0]); nt.links.new(ra.outputs[0], em.inputs['Strength'])
    mu = nt.nodes.new('ShaderNodeMath'); mu.operation = 'MULTIPLY'; mu.inputs[1].default_value = kraft
    nt.links.new(ra.outputs[0], mu.inputs[0]); nt.links.new(mu.outputs[0], em.inputs['Strength'])
    nt.links.new(em.outputs[0], out.inputs['Surface'])
    o.data.materials.append(m)
    o.visible_diffuse = False; o.visible_camera = False; o.visible_shadow = False; o.visible_transmission = False
    return o

def studio(sc):
    """Umgebung wie ein Fotostudio: oben eine helle Decke mit weichem Verlauf, links vorne eine große Softbox,
    rechts ein schmaler Streifen, unten dunkel. Sie spiegelt sich in allen Flächen, egal wie der Chip liegt."""
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; nt = w.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputWorld'); bg = nt.nodes.new('ShaderNodeBackground')
    tc = nt.nodes.new('ShaderNodeTexCoord')
    def fleck(richtung, schaerfe, kraft):
        d = nt.nodes.new('ShaderNodeVectorMath'); d.operation = 'DOT_PRODUCT'
        d.inputs[1].default_value = Vector(richtung).normalized()
        nt.links.new(tc.outputs['Generated'], d.inputs[0])
        k = nt.nodes.new('ShaderNodeMath'); k.operation = 'MAXIMUM'; k.inputs[1].default_value = 0
        nt.links.new(d.outputs['Value'], k.inputs[0])
        p = nt.nodes.new('ShaderNodeMath'); p.operation = 'POWER'; p.inputs[1].default_value = schaerfe
        nt.links.new(k.outputs[0], p.inputs[0])
        m = nt.nodes.new('ShaderNodeMath'); m.operation = 'MULTIPLY'; m.inputs[1].default_value = kraft
        nt.links.new(p.outputs[0], m.inputs[0]); return m.outputs[0]
    teile = [fleck((0, -0.2, 1), 2, 1.3),          # Decke
             fleck((-0.9, -0.45, 0.05), 5, 2.2),   # große Softbox links vorne (spiegelt sich in der gedrehten Vorderseite)
             fleck((-0.6, -0.8, 0.6), 14, 3.0),    # Spitzlicht oben links
             fleck((1, -0.3, 0.1), 50, 6.0),       # schmaler Streifen rechts
             fleck((0.3, 1, 0.4), 10, 2.0),        # Kante hinten
             fleck((0, -1, -0.35), 3, 0.25)]       # heller Boden vorne
    summe = teile[0]
    for t in teile[1:]:
        a = nt.nodes.new('ShaderNodeMath'); a.operation = 'ADD'; nt.links.new(summe, a.inputs[0]); nt.links.new(t, a.inputs[1]); summe = a.outputs[0]
    g = nt.nodes.new('ShaderNodeMath'); g.operation = 'ADD'; g.inputs[1].default_value = 0.03; nt.links.new(summe, g.inputs[0])
    nt.links.new(g.outputs[0], bg.inputs['Strength']); bg.inputs['Color'].default_value = (0.95, 0.97, 1.0, 1)
    nt.links.new(bg.outputs[0], out.inputs['Surface'])

def aufbauen(glb, aufloesung=(1200, 1200), proben=128):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    bpy.ops.import_scene.gltf(filepath=glb)
    materialien()
    # weiche Kanten: Normalen glätten, wo die Datei Facetten hat
    for o in bpy.data.objects:
        if o.type == 'MESH':
            o.data.shade_smooth() if hasattr(o.data, 'shade_smooth') else None
    ebenen = {o.name[6:]: o for o in bpy.data.objects if o.name.startswith('ebene_')}
    wurzel = bpy.data.objects['Node_72']
    # Mitte des geschlossenen Chips
    bpy.context.view_layer.update()
    pts = [o.matrix_world @ Vector(c) for o in bpy.data.objects if o.type == 'MESH' for c in o.bound_box]
    mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    mitte = (mn + mx) / 2
    dreh = bpy.data.objects.new('dreh', None); sc.collection.objects.link(dreh)
    dreh.location = (0, 0, 0)
    wurzel.parent = dreh; wurzel.location = wurzel.location - mitte
    basis = {k: o.matrix_world.copy() for k, o in ebenen.items()}
    S.update(sc=sc, ebenen=ebenen, dreh=dreh, mitte=mitte, groesse=mx - mn)

    # Licht: großes Softbox oben links vorne, kaltes Kantenlicht hinten rechts, Aufheller unten
    # Studio: große Softbox oben links, Streifenlicht rechts, Kante hinten, eine helle Fläche über der Kamera, die
    # sich als weicher Verlauf in der lackierten Vorderseite spiegelt
    flaechenlicht('haupt', (-170, -170, 190), (0, 0, 0), 1.2e6, 170)
    flaechenlicht('streif', (230, -90, 40), (0, 0, 0), 6e5, 40, (1.0, 0.97, 0.93))
    flaechenlicht('kante', (120, 220, 140), (0, 0, 0), 2.0e6, 80, (0.8, 0.88, 1.0))
    flaechenlicht('kante2', (-200, 160, -60), (0, 0, 0), 9e5, 70, (0.85, 0.9, 1.0))
    studio(sc)
    spiegelkarte('softbox', (-165, -165, 20), 230, 280, 9)
    spiegelkarte('streifen', (200, -120, 30), 40, 260, 12)

    cam = bpy.data.cameras.new('k'); cam.lens = 105; cam.clip_start = 5; cam.clip_end = 5000
    ko = bpy.data.objects.new('kamera', cam); sc.collection.objects.link(ko); sc.camera = ko
    S['kamera'] = ko

    sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = proben
    sc.cycles.use_adaptive_sampling = True; sc.cycles.adaptive_threshold = 0.03
    sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
    sc.cycles.max_bounces = 8; sc.cycles.transmission_bounces = 6
    sc.render.film_transparent = True
    sc.render.resolution_x, sc.render.resolution_y = aufloesung; sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
    sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Punchy'
    sc.render.threads_mode = 'AUTO'
    S['basis'] = basis
    return S

# Grundlage: Chip hochkant, Vorderseite zur Kamera (-Y), lange Seite nach oben (wie chip-3d.js)
GRUND = Matrix(((0, -1, 0), (0, 0, -1), (1, 0, 0)))
P = Matrix(((1, 0, 0), (0, 0, -1), (0, 1, 0)))   # three (x rechts, y oben, z zur Kamera) -> Blender

def pose(x, y, z, flach=False):
    """Drehung wie E(x, y, z) in chip-3d.js (Euler YXZ im Bildraum)"""
    q = Euler((x, y, z), 'YXZ').to_matrix()
    r = P @ q @ P.transposed()
    g = Matrix.Identity(3) if flach else GRUND
    S['dreh'].matrix_world = (r @ g).to_4x4()

def ruhelage():
    """Grundwerte für das Öffnen: Richtung der Dicke im Raum der Eltern jeder Schicht (bei ungedrehtem Chip)"""
    S['dreh'].matrix_world = Matrix.Identity(4); bpy.context.view_layer.update()
    S['ruhe'] = {}
    for k, o in S['ebenen'].items():
        d = o.parent.matrix_world.inverted().to_3x3() @ Vector((0, 0, 1))
        S['ruhe'][k] = (o.location.copy(), d)

def oeffnen(e):
    """Explosion: jede Schicht wandert um versatz * e mm entlang der Dicke; innen liegende Teile erst ab e > 0,012"""
    for k, o in S['ebenen'].items():
        ort, d = S['ruhe'][k]
        o.location = ort + d * (o.get('versatz', 0) * e)
        weg = bool(o.get('innen', 0)) and e <= 0.012
        for c in o.children_recursive: c.hide_render = weg
    bpy.context.view_layer.update()

def welt_bbox(o):
    pts = [c.matrix_world @ Vector(v) for c in o.children_recursive if c.type == 'MESH' for v in c.bound_box]
    return (Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts))),
            Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts))))

def kamera(abstand=420, hoehe=0.0, ziel=(0, 0, 0), versatz=(0, 0)):
    ko = S['kamera']
    ko.location = Vector(ziel) + Vector((versatz[0], -abstand, hoehe))
    ko.rotation_euler = (Vector(ziel) - ko.location).to_track_quat('-Z', 'Y').to_euler()

def projizieren(welt):
    from bpy_extras.object_utils import world_to_camera_view
    sc = S['sc']; bpy.context.view_layer.update()
    p = world_to_camera_view(sc, S['kamera'], Vector(welt))
    return (p.x, 1 - p.y)

def rendern(pfad):
    S['sc'].render.filepath = pfad
    bpy.ops.render.render(write_still=True)

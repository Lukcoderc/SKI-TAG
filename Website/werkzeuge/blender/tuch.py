# Stoffsimulation für die untere Taschenhälfte: der Chip drückt den Stoff von hinten nach vorne.
# Rechnet in Metern (Blender-Tuch ist auf Meter abgestimmt), gibt Millimeter zurück.
# python tuch.py -- <aus.npz> <t1,t2,...>   (t wie in jacke2.py)
import sys, math
argv = sys.argv[sys.argv.index('--') + 1:]
import bpy, bmesh
import numpy as np

aus = argv[0]; TS = [float(t) for t in argv[1].split(',')]
LEER = 'leer' in argv[2:] if len(argv) > 2 else False
CHIP_W, CHIP_VORN, CHIP_HINTEN, CHIP_H = 23.7, -12.8, 14.0, 33.8
OFFEN, YF, ZIP_L = -4.0, 4.0, 95.0
SCHRITT = 2.0
Z_START, Z_ENDE = OFFEN - CHIP_H + 20, OFFEN + CHIP_H + 6
def glatt(t): t = min(max(t, 0), 1); return t * t * (3 - 2 * t)
def zc_bei(t): return Z_START + (Z_ENDE - Z_START) * t
def dy_bei(t): return -12.5 * glatt((t - 0.15) / 0.75)
def neig_bei(t): return 0.2 * (1 - glatt((t - 0.35) / 0.55))
M = 0.001

def szene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene; sc.frame_start = 1; sc.frame_end = 60; sc.render.fps = 24
    xs = np.arange(-100, 100.01, SCHRITT); zs = np.arange(-100, OFFEN + 0.01, SCHRITT)
    nx, nz = len(xs), len(zs)
    P = np.array([(x, YF, z) for z in zs for x in xs])
    faces = [(j * nx + i, j * nx + i + 1, (j + 1) * nx + i + 1, (j + 1) * nx + i) for j in range(nz - 1) for i in range(nx - 1)]
    me = bpy.data.meshes.new('tuch'); me.from_pydata((P * M).tolist(), [], faces); me.update()
    o = bpy.data.objects.new('tuch', me); sc.collection.objects.link(o)
    g = o.vertex_groups.new(name='pin')
    fest = [k for k, (x, y, z) in enumerate(P) if z < -96 or abs(x) > 96 or (z > OFFEN - 0.5 and abs(x) > ZIP_L)]
    g.add(fest, 1.0, 'REPLACE')
    rand = [k for k, (x, y, z) in enumerate(P) if z > OFFEN - 0.5 and abs(x) <= ZIP_L]
    g.add(rand, 1.0, 'REPLACE')
    cl = o.modifiers.new('tuch', 'CLOTH'); s = cl.settings
    s.quality = 12; s.mass = 0.12; s.air_damping = 2.0
    s.tension_stiffness = 40; s.compression_stiffness = 40; s.shear_stiffness = 20; s.bending_stiffness = float(__import__('os').environ.get('BIEG', '0.6'))
    s.tension_damping = 8; s.compression_damping = 8; s.bending_damping = 0.4
    s.vertex_group_mass = 'pin'; s.pin_stiffness = 1.0
    s.effector_weights.gravity = 0.3
    c = cl.collision_settings; c.distance_min = 0.6 * M; c.use_self_collision = False; c.collision_quality = 4
    cl.point_cache.frame_start = 1; cl.point_cache.frame_end = 60
    # Körper dahinter
    bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=0.12)
    me2 = bpy.data.meshes.new('koerper'); bm.to_mesh(me2); bm.free()
    k = bpy.data.objects.new('koerper', me2); sc.collection.objects.link(k)
    k.rotation_euler = (math.pi / 2, 0, 0); k.location = (0, (YF + 1.5) * M, -0.05)
    k.modifiers.new('k', 'COLLISION'); k.collision.thickness_outer = 0.5 * M
    # Chip als abgerundeter Block
    bm = bmesh.new(); r = bmesh.ops.create_cube(bm, size=1.0)
    for v in r['verts']:
        v.co.x *= 2 * CHIP_W * M; v.co.y *= 22.0 * M; v.co.z *= 2 * (CHIP_H - 1.5) * M
    bmesh.ops.bevel(bm, geom=bm.edges[:] + bm.verts[:], offset=7 * M, segments=5, affect='EDGES')
    me3 = bpy.data.meshes.new('chip'); bm.to_mesh(me3); bm.free()
    ch = bpy.data.objects.new('chip', me3); sc.collection.objects.link(ch)
    ch.modifiers.new('k', 'COLLISION'); ch.collision.thickness_outer = 0.8 * M; ch.collision.cloth_friction = float(__import__('os').environ.get('REIB', '1'))
    return sc, o, ch, P, nx, nz

ergebnis = {}
for t in TS:
    sc, o, ch, P, nx, nz = szene()
    zc, dy = zc_bei(t), dy_bei(t)
    ym = 1.0 + dy          # Mitte des Gehäuses (Vorderseite etwa -10 mm, die Bounding-Box reicht weiter)
    GRUNDNEIG = 0.07       # der Chip steht in der Pose leicht nach vorne gekippt
    hinten = 26.0   # Start: ganz hinter dem Stoff
    # Kante (Reißverschluss) wird per Formschlüssel auf die Chipvorderseite geführt; der Rest fällt frei
    z0 = zc - CHIP_H
    drin = 0.0 if LEER else glatt((OFFEN + 3 - z0) / 14)
    vorn = -10.0 + dy - 1.2 - (OFFEN - zc) * math.tan(neig_bei(t) + GRUNDNEIG)
    o.shape_key_add(name='flach'); sk = o.shape_key_add(name='rand')
    for k, (x, y, z) in enumerate(P):
        if z > OFFEN - 0.5 and abs(x) <= ZIP_L:
            w = math.exp(-(max(abs(x) - (CHIP_W - 8), 0) / 17.0) ** 2)
            ende = glatt((ZIP_L - abs(x)) / 6)
            yy = YF + (vorn - 0.08 * x - YF) * w * drin
            zz = OFFEN - (1.2 * drin + 0.4 * (1 - drin)) * (1 - glatt((abs(x) - CHIP_W) / 26)) * ende
            sk.data[k].co = (x * M, yy * M, zz * M)
    sk.value = 0; sk.keyframe_insert('value', frame=1); sk.value = 1; sk.keyframe_insert('value', frame=22)
    if LEER: ch.location = (0, 0.5, 0)
    else:
        ch.rotation_euler = (neig_bei(t) + GRUNDNEIG, 0, -0.08)   # rechte Seite steht in der Pose etwas weiter vorne
        ch.location = (0, (ym + hinten) * M, zc * M); ch.keyframe_insert('location', frame=1)
        ch.location = (0, ym * M, zc * M); ch.keyframe_insert('location', frame=22)
        for f in ch.animation_data.action.fcurves if hasattr(ch.animation_data.action, 'fcurves') else []:
            for kp in f.keyframe_points: kp.interpolation = 'SINE'
    for f in range(1, 61): sc.frame_set(f)
    dg = bpy.context.evaluated_depsgraph_get(); ev = o.evaluated_get(dg)
    co = np.array([v.co[:] for v in ev.data.vertices]) / M
    ergebnis['leer' if LEER else f'{t:g}'] = co
    print('tuch', t, 'vorderster Punkt', round(co[:, 1].min(), 2), 'z-Bereich am Rand', round(co[-nx:, 2].min(), 2))
np.savez(aus, nx=nx, nz=nz, P=P, **ergebnis)

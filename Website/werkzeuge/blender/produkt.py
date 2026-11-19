# Liegendes Produktbild mit weichem Schatten auf unsichtbarem Boden (für „Das sind wir“)
import sys, math; sys.path.insert(0, sys.argv[-3])
import bpy, szene as Z
from mathutils import Vector
glb, aus = sys.argv[-2], sys.argv[-1]
Z.aufbauen(glb, (1200, 1000), 28)
Z.ruhelage(); Z.oeffnen(0)
for n in ('softbox', 'streifen'): bpy.data.objects[n].hide_render = True
bpy.data.objects['kante'].visible_glossy = False
chip = [o for o in bpy.data.objects['Node_72'].children_recursive if o.type == 'MESH']
zunten = min((o.matrix_world @ Vector(v)).z for o in chip for v in o.bound_box)
Z.S['dreh'].rotation_euler = (0, 0, math.radians(-28))
bpy.ops.mesh.primitive_plane_add(size=2000, location=(0, 0, zunten - 0.05))
boden = bpy.context.active_object; boden.is_shadow_catcher = True
ko = Z.S['kamera']; ko.data.lens = 85; el = math.radians(38); az = math.radians(-18); d = 215
ko.location = Vector((math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el))) * d
ko.rotation_euler = (-ko.location).to_track_quat('-Z', 'Y').to_euler()
Z.rendern(aus)

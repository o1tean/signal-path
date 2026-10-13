import bpy, mathutils, math
S="/private/tmp/claude-501/-Users-o1tean-Documents-work-signal-path/f79163cf-5a2b-4b3f-8e9f-5f39119a11ad/scratchpad"
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.wm.stl_import(filepath=S+"/models/flipper-zero-body-3d.stl")
obj = bpy.context.selected_objects[0]; bpy.context.view_layer.objects.active = obj
me = obj.data
import bmesh
bm = bmesh.new(); bm.from_mesh(me)
for co, no in [((-29.25,0,0),(1,0,0)), ((-5.75,0,0),(1,0,0)), ((0,0.15,0),(0,1,0)), ((0,38.85,0),(0,1,0))]:
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:]+bm.edges[:]+bm.faces[:], plane_co=co, plane_no=no, clear_inner=False, clear_outer=False)
bm.to_mesh(me); bm.free(); me.update()
# planar decimate: merge coplanar triangles, keeps silhouette
def mat(name, rgb, rough=0.6, metal=0.0):
    m = bpy.data.materials.new(name); m.use_nodes=True
    b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value=(*rgb,1); b.inputs["Roughness"].default_value=rough; b.inputs["Metallic"].default_value=metal; m.diffuse_color=(*rgb,1)
    return m
mats = [mat("body",(0.92,0.92,0.90),0.55), mat("accent",(1.0,0.35,0.05),0.5), mat("glass",(0.08,0.06,0.04),0.25), mat("dark",(0.12,0.12,0.13),0.7)]
for m in mats: me.materials.append(m)
DPAD=(-17.8,51.3); BACK=(-10.6,65.7)
for p in me.polygons:
    c = p.center; n = p.normal
    x,y,z = c.x,c.y,c.z
    idx = 0
    d = math.hypot(x-DPAD[0], y-DPAD[1]); b = math.hypot(x-BACK[0], y-BACK[1])
    if z > 1.0 and (d < 10.5 or b < 3.4): idx = 1            # d-pad ring + back button
    if -29.25 < x < -5.75 and 0.15 < y < 38.85 and z > 0.9 and n.z > 0.3: idx = 2   # screen window recess
    if z < -1.0 and n.z < -0.5: idx = 3                        # back shell darker? keep body colour; only mark
    p.material_index = idx if idx != 3 else 0
mod = obj.modifiers.new("dec", 'DECIMATE'); mod.decimate_type='DISSOLVE'; mod.angle_limit=math.radians(2.5); mod.delimit={'MATERIAL'}
bpy.ops.object.modifier_apply(modifier="dec")
print("TRIS after planar", len(me.polygons))
bpy.ops.object.shade_smooth_by_angle(angle=math.radians(35))
bpy.ops.export_scene.gltf(filepath=S+"/flipper-zero.glb", export_format='GLB', export_apply=True, export_yup=True, export_texcoords=False, export_normals=True, export_materials='EXPORT', export_animations=False, export_skins=False, export_morph=False, export_lights=False, export_cameras=False, use_selection=False)
# colour preview render
sc=bpy.context.scene; sc.render.engine='BLENDER_WORKBENCH'; sc.display.shading.light='STUDIO'; sc.display.shading.color_type='MATERIAL'
sc.render.resolution_x=900; sc.render.resolution_y=600
cam=bpy.data.objects.new("Cam", bpy.data.cameras.new("Cam")); sc.collection.objects.link(cam); sc.camera=cam; cam.data.type='ORTHO'; cam.data.ortho_scale=130
center=mathutils.Vector((-13.5,26,-10)); cam.location=center+mathutils.Vector((0,0,200)); cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler()
sc.render.filepath=S+"/render_mat.png"; bpy.ops.render.render(write_still=True)
print("DONE")

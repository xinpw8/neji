"""
Blender script to render all .blend files with top-down orthographic camera.
Run with: blender --background --python render_models.py

This script is designed to run from WSL with paths converted to Windows format.
"""

import bpy
import os
import math

# Configuration - Using Windows UNC paths for WSL with backslashes
WSL_DISTRO = "Ubuntu-22.04"
BLEND_DIR_WSL = "/home/daa/neji/evo_assets/evo_models/Blender"
OUTPUT_DIR_WSL = "/home/daa/neji/evo_assets/reference_renders"

# Convert to Windows UNC paths with proper backslashes
BLEND_DIR = "\\\\wsl.localhost\\" + WSL_DISTRO + BLEND_DIR_WSL.replace("/", "\\")
OUTPUT_DIR = "\\\\wsl.localhost\\" + WSL_DISTRO + OUTPUT_DIR_WSL.replace("/", "\\")

RENDER_SIZE = 512  # 512x512 pixels

def convert_materials_to_principled():
    """Convert old materials to use Principled BSDF with vertex colors if available."""
    for mat in bpy.data.materials:
        if mat.use_nodes:
            # Check if there's already a proper setup
            has_principled = False
            for node in mat.node_tree.nodes:
                if node.type == 'BSDF_PRINCIPLED':
                    has_principled = True
                    break
            if has_principled:
                continue

        # Enable nodes if not already
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links

        # Clear existing nodes
        nodes.clear()

        # Create Principled BSDF
        principled = nodes.new('ShaderNodeBsdfPrincipled')
        principled.location = (0, 0)

        # Set a default color based on material name or diffuse color
        if hasattr(mat, 'diffuse_color'):
            principled.inputs['Base Color'].default_value = mat.diffuse_color

        # Create output node
        output = nodes.new('ShaderNodeOutputMaterial')
        output.location = (300, 0)

        # Link them
        links.new(principled.outputs['BSDF'], output.inputs['Surface'])

def setup_vertex_color_materials():
    """Set up materials to use vertex colors if available."""
    for obj in bpy.data.objects:
        if obj.type != 'MESH':
            continue

        mesh = obj.data

        # Check if mesh has vertex colors
        if not mesh.color_attributes:
            continue

        color_attr = mesh.color_attributes[0]

        # Process each material slot
        for slot in obj.material_slots:
            mat = slot.material
            if mat is None:
                # Create a new material
                mat = bpy.data.materials.new(name=f"{obj.name}_Material")
                slot.material = mat

            mat.use_nodes = True
            nodes = mat.node_tree.nodes
            links = mat.node_tree.links

            # Find or create Principled BSDF
            principled = None
            output = None
            for node in nodes:
                if node.type == 'BSDF_PRINCIPLED':
                    principled = node
                elif node.type == 'OUTPUT_MATERIAL':
                    output = node

            if principled is None:
                nodes.clear()
                principled = nodes.new('ShaderNodeBsdfPrincipled')
                principled.location = (0, 0)

            if output is None:
                output = nodes.new('ShaderNodeOutputMaterial')
                output.location = (300, 0)
                links.new(principled.outputs['BSDF'], output.inputs['Surface'])

            # Add vertex color node
            vc_node = nodes.new('ShaderNodeVertexColor')
            vc_node.layer_name = color_attr.name
            vc_node.location = (-300, 0)

            # Connect vertex color to base color
            links.new(vc_node.outputs['Color'], principled.inputs['Base Color'])

def setup_scene():
    """Set up the scene with proper lighting and render settings."""
    scene = bpy.context.scene

    # Use EEVEE for faster rendering
    scene.render.engine = 'BLENDER_EEVEE_NEXT'

    # Render settings
    scene.render.resolution_x = RENDER_SIZE
    scene.render.resolution_y = RENDER_SIZE
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True  # Transparent background
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'

def list_blend_files():
    """Get list of .blend files in the directory."""
    blend_files = []
    # List files in the blend directory
    for f in os.listdir(BLEND_DIR):
        if f.endswith('.blend'):
            blend_files.append(f)
    return sorted(blend_files)

def render_blend_file(blend_filename):
    """Open a blend file and render it."""
    blend_path = BLEND_DIR + "\\" + blend_filename
    output_name = os.path.splitext(blend_filename)[0] + ".png"
    output_path = OUTPUT_DIR + "\\" + output_name

    print(f"\n{'='*60}")
    print(f"Processing: {blend_filename}")
    print(f"Input: {blend_path}")
    print(f"Output: {output_path}")
    print(f"{'='*60}")

    try:
        # Open the blend file
        bpy.ops.wm.open_mainfile(filepath=blend_path)

        # Setup render settings
        setup_scene()

        # Try to set up vertex color materials
        setup_vertex_color_materials()

        # Find all mesh objects
        mesh_objects = [obj for obj in bpy.data.objects if obj.type == 'MESH']

        if not mesh_objects:
            print(f"WARNING: No mesh objects found in {blend_filename}")
            return False

        print(f"Found {len(mesh_objects)} mesh objects")

        # Print material info
        for obj in mesh_objects:
            if obj.data.color_attributes:
                print(f"  {obj.name}: has vertex colors ({obj.data.color_attributes[0].name})")

        # Calculate bounds using world matrix
        min_x = min_y = min_z = float('inf')
        max_x = max_y = max_z = float('-inf')

        from mathutils import Vector

        for obj in mesh_objects:
            if obj.type == 'MESH':
                for corner in obj.bound_box:
                    world_corner = obj.matrix_world @ Vector(corner)
                    min_x = min(min_x, world_corner.x)
                    min_y = min(min_y, world_corner.y)
                    min_z = min(min_z, world_corner.z)
                    max_x = max(max_x, world_corner.x)
                    max_y = max(max_y, world_corner.y)
                    max_z = max(max_z, world_corner.z)

        if min_x == float('inf'):
            print(f"WARNING: Could not calculate bounds for {blend_filename}")
            return False

        center_x = (min_x + max_x) / 2
        center_y = (min_y + max_y) / 2
        center_z = (min_z + max_z) / 2
        size_x = max_x - min_x
        size_y = max_y - min_y
        size_z = max_z - min_z

        print(f"Model bounds: size=({size_x:.2f}, {size_y:.2f}, {size_z:.2f}), center=({center_x:.2f}, {center_y:.2f}, {center_z:.2f})")

        # Calculate camera settings - add padding
        max_dim = max(size_x, size_y) * 1.3

        # Delete existing cameras and lights (to have a clean setup)
        for obj in bpy.data.objects:
            if obj.type in ['CAMERA', 'LIGHT']:
                bpy.data.objects.remove(obj, do_unlink=True)

        # Create camera
        cam_data = bpy.data.cameras.new('RenderCamera')
        cam_data.type = 'ORTHO'
        cam_data.ortho_scale = max_dim

        cam_obj = bpy.data.objects.new('RenderCamera', cam_data)
        bpy.context.scene.collection.objects.link(cam_obj)

        # Position camera above looking down (top-down view)
        cam_obj.location = (center_x, center_y, max_z + 10)
        cam_obj.rotation_euler = (0, 0, 0)  # Looking straight down -Z

        bpy.context.scene.camera = cam_obj

        # Create main sun light
        light_data = bpy.data.lights.new('SunLight', 'SUN')
        light_data.energy = 3.0
        light_obj = bpy.data.objects.new('SunLight', light_data)
        bpy.context.scene.collection.objects.link(light_obj)
        light_obj.location = (center_x + 5, center_y - 5, max_z + 20)
        light_obj.rotation_euler = (math.radians(45), math.radians(15), math.radians(45))

        # Add fill light from opposite side
        fill_light_data = bpy.data.lights.new('FillLight', 'SUN')
        fill_light_data.energy = 1.5
        fill_light_obj = bpy.data.objects.new('FillLight', fill_light_data)
        bpy.context.scene.collection.objects.link(fill_light_obj)
        fill_light_obj.location = (center_x - 5, center_y + 5, max_z + 15)
        fill_light_obj.rotation_euler = (math.radians(45), math.radians(-15), math.radians(-45))

        # Set output path and render
        bpy.context.scene.render.filepath = output_path
        bpy.ops.render.render(write_still=True)

        print(f"SUCCESS: Rendered to {output_path}")
        return True

    except Exception as e:
        print(f"ERROR rendering {blend_filename}: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main function to process all blend files."""
    print(f"\nBlend directory: {BLEND_DIR}")
    print(f"Output directory: {OUTPUT_DIR}")

    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Get list of blend files
    blend_files = list_blend_files()

    print(f"\nFound {len(blend_files)} .blend files to process")

    results = {'success': [], 'failed': []}

    for blend_filename in blend_files:
        if render_blend_file(blend_filename):
            results['success'].append(blend_filename)
        else:
            results['failed'].append(blend_filename)

    # Print summary
    print(f"\n{'='*60}")
    print("RENDERING COMPLETE")
    print(f"{'='*60}")
    print(f"Successful: {len(results['success'])}")
    print(f"Failed: {len(results['failed'])}")

    if results['success']:
        print(f"\nSuccessful renders:")
        for f in results['success']:
            print(f"  - {f}")

    if results['failed']:
        print(f"\nFailed files:")
        for f in results['failed']:
            print(f"  - {f}")

if __name__ == "__main__":
    main()

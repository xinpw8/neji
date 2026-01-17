"""
Blender Python Script: Batch Convert .blend files to .glb (binary glTF)
Run this script with: blender --background --python convert_blend_to_glb.py

This script:
1. Opens each .blend file in the source directory
2. Exports all visible meshes to GLB format
3. Saves to the output directory with matching filename
"""

import bpy
import os
import sys

# Paths - using WSL network paths accessible from Windows Blender
# Source: Blender models directory
SOURCE_DIR = r"\\wsl.localhost\Ubuntu-22.04\home\daa\neji\evo_assets\evo_models\Blender"
# Output: Models directory for game
OUTPUT_DIR = r"\\wsl.localhost\Ubuntu-22.04\home\daa\neji\evo_assets\models"

def clear_scene():
    """Remove all objects from the scene"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

def export_to_glb(blend_file, output_path):
    """Export the current scene to GLB format"""
    try:
        # Clear existing scene
        clear_scene()

        # Append all objects from the blend file
        with bpy.data.libraries.load(blend_file, link=False) as (data_from, data_to):
            data_to.objects = data_from.objects

        # Link objects to the current scene
        for obj in data_to.objects:
            if obj is not None:
                bpy.context.collection.objects.link(obj)

        # Select all mesh objects
        bpy.ops.object.select_all(action='DESELECT')
        for obj in bpy.context.scene.objects:
            if obj.type == 'MESH':
                obj.select_set(True)

        # Set active object if we have any selected
        selected = [obj for obj in bpy.context.scene.objects if obj.select_get()]
        if selected:
            bpy.context.view_layer.objects.active = selected[0]

        # Export to GLB - Blender 4.x compatible settings
        bpy.ops.export_scene.gltf(
            filepath=output_path,
            export_format='GLB',
            use_selection=False,  # Export entire scene
            export_apply=True,    # Apply modifiers
            export_materials='EXPORT',
            export_texcoords=True,
            export_normals=True,
        )

        return True
    except Exception as e:
        print(f"Error exporting {blend_file}: {e}")
        return False

def main():
    """Main conversion function"""
    print("=" * 60)
    print("Blender to GLB Batch Converter")
    print("=" * 60)
    print(f"Source: {SOURCE_DIR}")
    print(f"Output: {OUTPUT_DIR}")
    print("=" * 60)

    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Get list of .blend files
    blend_files = []
    for f in os.listdir(SOURCE_DIR):
        if f.endswith('.blend'):
            blend_files.append(f)

    print(f"Found {len(blend_files)} .blend files to convert")
    print()

    success_count = 0
    fail_count = 0

    for i, blend_file in enumerate(sorted(blend_files), 1):
        # Create paths
        input_path = os.path.join(SOURCE_DIR, blend_file)
        output_name = os.path.splitext(blend_file)[0] + '.glb'
        output_path = os.path.join(OUTPUT_DIR, output_name)

        print(f"[{i}/{len(blend_files)}] Converting: {blend_file}")

        if export_to_glb(input_path, output_path):
            print(f"    SUCCESS: {output_name}")
            success_count += 1
        else:
            print(f"    FAILED: {blend_file}")
            fail_count += 1

    print()
    print("=" * 60)
    print(f"Conversion Complete!")
    print(f"  Success: {success_count}")
    print(f"  Failed:  {fail_count}")
    print("=" * 60)

if __name__ == "__main__":
    main()

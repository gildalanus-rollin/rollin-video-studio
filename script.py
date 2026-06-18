with open('app/api/projects/[id]/visual-sequence/init/route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''      scene_type: "image",
      role: asset.is_primary ? "cover" : "support",
      motion_preset: "static",
      duration_ratio: 1.0,
      overlay_title: startOrder + index === 0,
      overlay_subtitles: true,
      overlay_avatar: false,'''

new = '''      scene_type: "image",
      motion_preset: "zoom-in",
      duration_ratio: 1.0,'''

print("Found:", old in content)
content = content.replace(old, new)

with open('app/api/projects/[id]/visual-sequence/init/route.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
with open('components/VisualSequenceEditor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''  const removeScene = async (id: string) => {
    try {
      await fetch(`/api/projects/${projectId}/visual-sequence/${id}`, { method: "DELETE" });
      setScenes(scenes.filter((s) => s.id !== id));
      if (selected === id) setSelected(null);
    } catch {}
  };'''

new = '''  const removeScene = async (id: string) => {
    try {
      const scene = scenes.find((s) => s.id === id);
      await fetch(`/api/projects/${projectId}/visual-sequence/${id}`, { method: "DELETE" });
      // Tambien borrar el asset de project_assets
      if (scene?.asset?.id) {
        await fetch(`/api/projects/${projectId}/assets/${scene.asset.id}`, { method: "DELETE" });
      }
      setScenes(scenes.filter((s) => s.id !== id));
      if (selected === id) setSelected(null);
    } catch {}
  };'''

print("Found:", old in content)
content = content.replace(old, new)

with open('components/VisualSequenceEditor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
with open('components/VisualSequenceEditor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
        secuencia visual {saving && <span className="text-slate-300 ml-1">guardando...</span>}
      </p>'''

new = '''      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          secuencia visual {saving && <span className="text-slate-300 ml-1">guardando...</span>}
        </p>
        <div className="flex gap-2">
          <label className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
            + fotos
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          </label>
          <label className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
            + video
            <input type="file" accept="video/mp4" className="hidden" onChange={handleVideoUpload} />
          </label>
        </div>
      </div>'''

print("Found:", old in content)
content = content.replace(old, new)

# Add upload handlers before return statement
old2 = '  if (loading) return'
new2 = '''  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      await fetch(`/api/projects/${projectId}/assets/upload-image`, { method: "POST", body: formData });
    }
    await fetch(`/api/projects/${projectId}/visual-sequence/init`, { method: "POST" });
    await load();
    e.target.value = "";
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    await fetch(`/api/projects/${projectId}/assets/upload-video`, { method: "POST", body: formData });
    await fetch(`/api/projects/${projectId}/visual-sequence/init`, { method: "POST" });
    await load();
    e.target.value = "";
  };

  if (loading) return'''

content = content.replace(old2, new2)

with open('components/VisualSequenceEditor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
with open('lib/renderVideo.ts', 'r', encoding='utf-8') as f:
    content = f.read()

old = '  await renderMedia({'

new = '''  // Pre-descargar videos para que Remotion pueda renderizarlos
  if (Array.isArray(inputProps.visualSequence)) {
    for (const scene of inputProps.visualSequence as any[]) {
      if (
        scene.asset?.url &&
        (scene.asset.url.includes("/videos/") ||
          /\\.(mp4|mov|webm)$/i.test(scene.asset.url))
      ) {
        try {
          console.log("[render] Descargando video:", scene.asset.url);
          const localPath = await downloadToTemp(scene.asset.url);
          scene.asset.url = "file://" + localPath;
          console.log("[render] Video descargado a:", localPath);
        } catch (e) {
          console.warn("[render] No se pudo descargar video:", e);
        }
      }
    }
  }

  await renderMedia({'''

content = content.replace(old, new, 1)

with open('lib/renderVideo.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done:", new[:50] in content)
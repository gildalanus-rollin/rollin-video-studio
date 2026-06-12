with open('components/VisualSequenceEditor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'scene.assetType === "video" || scene.asset.originalFilename?.match(/\\.(mp4|mov|webm)$/i)',
    'scene.asset.originalFilename?.match(/\\.(mp4|mov|webm)$/i)'
)

with open('components/VisualSequenceEditor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
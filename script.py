with open('lib/renderVideo.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'scene.asset.url = "file://" + localPath;',
    'scene.asset.url = localPath;'
)

with open('lib/renderVideo.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done:", 'scene.asset.url = localPath;' in content)
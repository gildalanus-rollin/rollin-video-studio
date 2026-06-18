with open('lib/renderVideo.ts', 'r', encoding='utf-8') as f:
    content = f.read()

old = '  await renderMedia({\n    composition,\n    serveUrl: bundleLocation,\n    codec: "h264",'
new = '  await renderMedia({\n    composition,\n    serveUrl: bundleLocation,\n    codec: "h264",\n    logLevel: "verbose",'

print("Found:", old in content)
content = content.replace(old, new)

with open('lib/renderVideo.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
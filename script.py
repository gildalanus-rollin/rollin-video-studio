with open('lib/renderVideo.ts', 'r', encoding='utf-8') as f:
    content = f.read()

old = '  await renderMedia({\n    composition,\n    serveUrl: bundleLocation,\n    codec: "h264",\n    outputLoca'

new = '''  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    onBrowserLog: (log) => {
      console.log(`[browser] ${log.type}: ${log.text}`);
    },
    outputLoca'''

print("Found:", old in content)
content = content.replace(old, new)

with open('lib/renderVideo.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
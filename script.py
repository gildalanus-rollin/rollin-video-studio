with open('lib/renderVideo.ts', 'r', encoding='utf-8') as f:
    content = f.read()

old = '  await renderMedia({\n    composition,\n    serveUrl: bundleLocation,\n    codec: "h264",'
new = '''  const chromiumPath = process.env.PUPPETEER_EXECUTABLE_PATH || null;

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    ...(chromiumPath ? { chromiumExecutable: chromiumPath } : {}),'''

print("Found:", old in content)
content = content.replace(old, new)

with open('lib/renderVideo.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
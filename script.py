with open('lib/renderVideo.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove chromiumPath variable and its usage
content = content.replace(
    '  const chromiumPath = process.env.PUPPETEER_EXECUTABLE_PATH || null;\n\n  await renderMedia({',
    '  await renderMedia({'
)
content = content.replace(
    '    ...(chromiumPath ? { chromiumExecutable: chromiumPath } : {}),\n    ',
    '    '
)

with open('lib/renderVideo.ts', 'w', encoding='utf-8') as f:
    f.write(content)

# Verify
content2 = open('lib/renderVideo.ts', encoding='utf-8').read()
print("chromiumPath removed:", 'chromiumPath' not in content2)
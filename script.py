with open('remotion/VideoComposition.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'const titlePos = getTitlePositionStyle({ position: isTop ? "top-left" : "bottom-left" });',
    'const titlePos = getTitlePositionStyle({ position: isTop ? "top-left" : "bottom-left", outputFormat });'
)

with open('remotion/VideoComposition.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
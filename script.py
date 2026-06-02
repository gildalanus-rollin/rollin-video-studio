with open('remotion/VideoComposition.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = '        const isTop = placa.posicion === "top";\n        const titlePos = getTitlePositionStyle({ position: isTop ? "top-left" : "bottom-left", outputFormat });'

new = '        const isTop = placa.posicion === "top";\n        const placaStyle = isTop\n          ? { position: "absolute" as const, top: 0, left: 0, zIndex: 50, padding: 40, display: "flex", alignItems: "flex-start" as const }\n          : { position: "absolute" as const, top: 0, bottom: 0, left: 0, right: 0, zIndex: 50, padding: 40, display: "flex", alignItems: "center" as const, justifyContent: "flex-start" as const };'

content = content.replace(old, new)
content = content.replace('              ...titlePos,', '              ...placaStyle,')

with open('remotion/VideoComposition.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done:", old not in content)
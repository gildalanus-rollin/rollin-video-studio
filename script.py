with open('remotion/VideoComposition.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remove line 460 (index 459) which is the duplicate muted
lines.pop(459)

with open('remotion/VideoComposition.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("Done")
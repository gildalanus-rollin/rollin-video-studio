with open('remotion/VideoComposition.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove duplicate muted
old = '''              startFrom={0}
              muted
              muted'''
new = '              startFrom={0}\n              muted'

print("Found duplicate:", old in content)
content = content.replace(old, new)

with open('remotion/VideoComposition.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
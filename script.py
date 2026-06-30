with open('components/VisualSequenceEditor.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '/api/projects/${projectId}/assets/upload-image',
    '/api/projects/${projectId}/assets/upload'
)

with open('components/VisualSequenceEditor.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
with open('Dockerfile', 'r', encoding='utf-8') as f:
    content = f.read()

old = '  ffmpeg \\\n  chromium \\'
new = '  ffmpeg \\\n  chromium \\\n  chromium-codecs-ffmpeg-extra \\'

print("Found:", old in content)
content = content.replace(old, new)

with open('Dockerfile', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
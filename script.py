with open('Dockerfile', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('  chromium \\\n  chromium-codecs-ffmpeg-extra \\\n', '  chromium \\\n')

with open('Dockerfile', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
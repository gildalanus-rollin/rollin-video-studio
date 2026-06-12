with open('lib/renderVideo.ts', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''type RenderScene = {
  id: string;
  sequenceOrder: number;
  sceneType: string;
  role: string;
  motionPreset: string;
  durationRatio: number;
  overlayTitle: boolean;
  overlaySubtitles: boolean;
  overlayAvatar: boolean;
  asset: {
    id: string;
    label: string;
    originalFilename: string;
    isPrimary: boolean;
    url: string;
  } | null;
};'''

new = '''type RenderScene = {
  id: string;
  sequenceOrder: number;
  sceneType: string;
  motionPreset: string;
  durationRatio: number;
  asset: {
    id: string;
    label: string;
    originalFilename: string;
    isPrimary: boolean;
    url: string;
  } | null;
};'''

print("Found:", old in content)
content = content.replace(old, new)

with open('lib/renderVideo.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
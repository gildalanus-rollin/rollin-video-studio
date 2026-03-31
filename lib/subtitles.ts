export function splitLongBlock(block: string, maxChars = 42) {
  const words = block.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) chunks.push(current);
      current = word;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

export function buildSubtitleBlocks(text?: string | null) {
  const clean = (text || "").trim();
  if (!clean) return [];

  const byLines = clean
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (byLines.length > 1) {
    return byLines.flatMap((line) => splitLongBlock(line)).slice(0, 8);
  }

  const sentences =
    clean
      .match(/[^.!?\n]+[.!?]?/g)
      ?.map((item) => item.trim())
      .filter(Boolean) || [];

  if (sentences.length > 0) {
    const blocks: string[] = [];
    let current = "";

    for (const sentence of sentences) {
      const candidate = current ? `${current} ${sentence}` : sentence;

      if (candidate.length <= 64) {
        current = candidate;
      } else {
        if (current) blocks.push(current);
        current = sentence;
      }
    }

    if (current) blocks.push(current);

    return blocks.flatMap((block) => splitLongBlock(block)).slice(0, 8);
  }

  return splitLongBlock(clean).slice(0, 8);
}

export function getSubtitleBlockForFrame(params: {
  text?: string | null;
  frame: number;
  durationInFrames: number;
}) {
  const { text, frame, durationInFrames } = params;
  const blocks = buildSubtitleBlocks(text);

  if (blocks.length === 0) return "";
  if (blocks.length === 1) return blocks[0];

  const framesPerBlock = Math.max(Math.floor(durationInFrames / blocks.length), 1);
  const index = Math.min(Math.floor(frame / framesPerBlock), blocks.length - 1);

  return blocks[index];
}

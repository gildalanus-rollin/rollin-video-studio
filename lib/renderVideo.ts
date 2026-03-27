import path from "path";
import fs from "fs/promises";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";

type RenderVideoInput = {
  title?: string;
  script?: string;
  image?: string | null;
  music?: string | null;
  outputFileName?: string;
};

export async function renderVideo(input: RenderVideoInput) {
  const entryPoint = path.join(process.cwd(), "remotion/index.ts");
  const outDir = path.join(process.cwd(), "out");

  await fs.mkdir(outDir, { recursive: true });

  const bundleLocation = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  });

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "RollinExport",
    inputProps: {
      title: input.title ?? "Rollin Video Studio",
      script: input.script ?? "Primer export",
      image: input.image ?? null,
      music: input.music ?? null,
    },
  });

  const outputLocation = path.join(
    outDir,
    input.outputFileName ?? `render-${Date.now()}.mp4`
  );

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation,
    inputProps: {
      title: input.title ?? "Rollin Video Studio",
      script: input.script ?? "Primer export",
      image: input.image ?? null,
      music: input.music ?? null,
    },
  });

  return {
    outputLocation,
  };
}

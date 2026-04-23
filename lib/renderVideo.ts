import path from "path";
import fs from "fs/promises";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";

type RenderScene = {
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
};

type RenderVideoInput = {
  title?: string;
  script?: string;
  image?: string | null;
  music?: string | null;
  voiceover?: string | null;
  outputFormat?: string;
  durationInSeconds?: number;
  narrativePreset?: string;
  avatarEnabled?: boolean;
  graphicTitleSize?: string;
  graphicTitlePosition?: string;
  subtitleEnabled?: boolean;
  subtitlePosition?: string;
  subtitleSize?: string;
  outputFileName?: string;
  visualSequence?: RenderScene[];
};

export async function renderVideo(input: RenderVideoInput) {
  const entryPoint = path.join(process.cwd(), "remotion/index.ts");
  const outDir = path.join(process.cwd(), "out");

  await fs.mkdir(outDir, { recursive: true });

  const bundleLocation = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  });

  const inputProps = {
    title: input.title ?? "Rollin Video Studio",
    script: input.script ?? "",
    image: input.image ?? null,
    music: input.music ?? null,
    voiceover: input.voiceover ?? null,
    outputFormat: input.outputFormat ?? "16:9",
    durationInSeconds: input.durationInSeconds ?? 15,
    narrativePreset: input.narrativePreset ?? "titulo-resumen-foto",
    avatarEnabled: input.avatarEnabled ?? true,
    graphicTitleSize: input.graphicTitleSize ?? "md",
    graphicTitlePosition: input.graphicTitlePosition ?? "bottom-left",
    subtitleEnabled: input.subtitleEnabled ?? true,
    subtitlePosition: input.subtitlePosition ?? "bottom-center",
    subtitleSize: input.subtitleSize ?? "md",
    visualSequence: input.visualSequence ?? [],
  };

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "RollinExport",
    inputProps,
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
    inputProps,
  });

  return {
    outputLocation,
  };
}

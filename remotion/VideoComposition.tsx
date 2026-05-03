import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getSubtitleBlockForFrame } from "../lib/subtitles";

type VisualSequenceScene = {
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

type Props = {
  title?: string;
  script?: string;
  image?: string | null;
  music?: string | null;
  narrativePreset?: string;
  avatarEnabled?: boolean;
  graphicTitleSize?: string;
  graphicTitlePosition?: string;
  subtitleEnabled?: boolean;
  subtitlePosition?: string;
  subtitleSize?: string;
  voiceover?: string | null;
  visualSequence?: VisualSequenceScene[];
};

function getOutputFormat(width: number, height: number) {
  if (width === 1080 && height === 1920) return "9:16";
  if (width === 1080 && height === 1080) return "1:1";
  return "16:9";
}

function getTitleFontSize(format: string, size?: string) {
  if (format === "9:16") {
    if (size === "sm") return 84;
    if (size === "lg") return 120;
    return 100;
  }
  if (format === "1:1") {
    if (size === "sm") return 50;
    if (size === "lg") return 76;
    return 62;
  }
  if (size === "sm") return 46;
  if (size === "lg") return 82;
  return 64;
}

function getSubtitleFontSize(format: string, size?: string) {
  if (format === "9:16") {
    if (size === "sm") return 24;
    if (size === "lg") return 34;
    return 28;
  }
  if (size === "sm") return 22;
  if (size === "lg") return 36;
  return 28;
}

function getTitleBoxWidth(format: string) {
  if (format === "9:16") return "78%";
  if (format === "1:1") return "82%";
  return "72%";
}

function getSubtitleBoxWidth(format: string) {
  if (format === "9:16") return "78%";
  if (format === "1:1") return "82%";
  return "62%";
}

function getTitlePositionStyle(params: {
  position?: string | null;
  subtitleEnabled?: boolean;
  subtitlePosition?: string | null;
  outputFormat: string;
}) {
  const { position, subtitleEnabled, subtitlePosition, outputFormat } = params;

  const subtitleAtBottom =
    subtitleEnabled &&
    (subtitlePosition === "bottom-left" ||
      subtitlePosition === "bottom-center" ||
      subtitlePosition === "bottom-right" ||
      !subtitlePosition);

  const bottomOffset =
    outputFormat === "9:16" ? 210 : outputFormat === "1:1" ? 185 : 130;

  const base = {
    position: "absolute" as const,
    zIndex: 10,
    display: "flex",
    padding: 40,
  };

  switch (position) {
    case "top-left":
      return { ...base, top: 0, left: 0, alignItems: "flex-start" as const };
    case "top-center":
      return {
        ...base,
        top: 0,
        left: 0,
        right: 0,
        justifyContent: "center" as const,
        alignItems: "center" as const,
      };
    case "top-right":
      return { ...base, top: 0, right: 0, alignItems: "flex-end" as const };
    case "bottom-center":
      return {
        ...base,
        left: 0,
        right: 0,
        bottom: subtitleAtBottom ? bottomOffset : 0,
        justifyContent: "center" as const,
        alignItems: "center" as const,
      };
    case "bottom-right":
      return {
        ...base,
        right: 0,
        bottom: subtitleAtBottom ? bottomOffset : 0,
        alignItems: "flex-end" as const,
      };
    case "bottom-left":
    default:
      return {
        ...base,
        left: 0,
        bottom: subtitleAtBottom ? bottomOffset : 0,
        alignItems: "flex-start" as const,
      };
  }
}

function getSubtitlePositionStyle(position?: string | null) {
  const base = {
    position: "absolute" as const,
    zIndex: 30,
    display: "flex",
    left: 0,
    right: 0,
    paddingLeft: 32,
    paddingRight: 32,
  };

  switch (position) {
    case "top-left":
      return {
        ...base,
        top: 28,
        justifyContent: "flex-start" as const,
      };
    case "top-center":
      return {
        ...base,
        top: 28,
        justifyContent: "center" as const,
      };
    case "top-right":
      return {
        ...base,
        top: 28,
        justifyContent: "flex-end" as const,
      };
    case "bottom-left":
      return {
        ...base,
        bottom: 28,
        justifyContent: "flex-start" as const,
      };
    case "bottom-right":
      return {
        ...base,
        bottom: 28,
        justifyContent: "flex-end" as const,
      };
    case "bottom-center":
    default:
      return {
        ...base,
        bottom: 28,
        justifyContent: "center" as const,
      };
  }
}

const AvatarWindow = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: 28,
        right: 28,
        width: 170,
        height: 220,
        borderRadius: 24,
        overflow: "hidden",
        border: "2px solid rgba(255,255,255,0.18)",
        boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
        background: "rgba(15,23,42,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 20,
      }}
    >
      <div
        style={{
          padding: 24,
          textAlign: "center",
          color: "white",
          fontSize: 18,
          lineHeight: 1.35,
        }}
      >
        <div
          style={{
            fontSize: 13,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            opacity: 0.7,
            marginBottom: 12,
          }}
        >
          avatar
        </div>
        Ventana lista para HeyGen
      </div>
    </div>
  );
};

function getSceneForFrame(
  visualSequence: VisualSequenceScene[],
  frame: number,
  durationInFrames: number
) {
  if (!visualSequence.length) return null;

  const totalRatio = visualSequence.reduce(
    (sum, scene) => sum + Math.max(scene.durationRatio || 1, 0.0001),
    0
  );

  let accumulated = 0;

  for (let index = 0; index < visualSequence.length; index++) {
    const scene = visualSequence[index];
    const ratio = Math.max(scene.durationRatio || 1, 0.0001);
    const sceneFrames =
      index === visualSequence.length - 1
        ? durationInFrames - accumulated
        : Math.max(1, Math.round((ratio / totalRatio) * durationInFrames));

    const startFrame = accumulated;
    const endFrame = accumulated + sceneFrames;

    if (frame >= startFrame && frame < endFrame) {
      return {
        scene,
        sceneFrame: frame - startFrame,
        sceneDurationInFrames: sceneFrames,
      };
    }

    accumulated = endFrame;
  }

  const lastScene = visualSequence[visualSequence.length - 1];
  return {
    scene: lastScene,
    sceneFrame: 0,
    sceneDurationInFrames: durationInFrames,
  };
}

function getSceneImageStyle(
  motionPreset: string | undefined,
  sceneFrame: number,
  sceneDurationInFrames: number
) {
  const progress =
    sceneDurationInFrames > 1
      ? sceneFrame / Math.max(sceneDurationInFrames - 1, 1)
      : 0;

  const zoomIn = interpolate(progress, [0, 1], [1, 1.08]);
  const zoomOut = interpolate(progress, [0, 1], [1.08, 1]);
  const panX = interpolate(progress, [0, 1], [0, -40]);

  switch (motionPreset) {
    case "zoom-in":
      return {
        transform: `scale(${zoomIn})`,
      };
    case "zoom-out":
      return {
        transform: `scale(${zoomOut})`,
      };
    case "pan":
      return {
        transform: `scale(1.05) translateX(${panX}px)`,
      };
    case "static":
    default:
      return {
        transform: "scale(1)",
      };
  }
}

export const VideoComposition = ({
  title = "Rollin Video Studio",
  script = "",
  image,
  music,
  voiceover,
  narrativePreset = "titulo-resumen-foto",
  avatarEnabled = true,
  graphicTitleSize = "md",
  graphicTitlePosition = "bottom-left",
  subtitleEnabled = true,
  subtitlePosition = "bottom-center",
  subtitleSize = "md",
  visualSequence = [],
}: Props) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const outputFormat = getOutputFormat(width, height);

  const fallbackImageSrc =
    image && (image.startsWith("http://") || image.startsWith("https://"))
      ? image
      : null;

  const musicSrc =
    music && (music.startsWith("http://") || music.startsWith("https://"))
      ? music
      : null;

  const titleEntrance = spring({
    frame,
    fps,
    config: {
      damping: 200,
      stiffness: 120,
      mass: 0.9,
    },
  });

  const musicVolume =
    frame < fps
      ? interpolate(frame, [0, fps], [0, 0.18], { extrapolateRight: "clamp" })
      : frame > durationInFrames - fps
        ? interpolate(
            frame,
            [durationInFrames - fps, durationInFrames],
            [0.18, 0],
            { extrapolateLeft: "clamp" }
          )
        : 0.18;

  const showAvatarGlobal =
    narrativePreset === "titulo-resumen-foto-avatar" && avatarEnabled;

  const currentSubtitle = subtitleEnabled
    ? getSubtitleBlockForFrame({
        text: script,
        frame,
        durationInFrames,
      })
    : "";

  const currentSceneData = getSceneForFrame(visualSequence, frame, durationInFrames);
  const currentScene = currentSceneData?.scene ?? null;
  const currentSceneImageSrc =
    currentScene?.asset?.url &&
    (currentScene.asset.url.startsWith("http://") ||
      currentScene.asset.url.startsWith("https://"))
      ? currentScene.asset.url
      : null;

  const effectiveImageSrc = currentSceneImageSrc || fallbackImageSrc;
  const effectiveOverlayTitle = currentScene ? currentScene.overlayTitle : true;
  const effectiveOverlaySubtitles = currentScene
    ? currentScene.overlaySubtitles
    : subtitleEnabled;
  const effectiveOverlayAvatar = currentScene
    ? currentScene.overlayAvatar
    : showAvatarGlobal;

  const sceneImageStyle = currentSceneData
    ? getSceneImageStyle(
        currentScene?.motionPreset,
        currentSceneData.sceneFrame,
        currentSceneData.sceneDurationInFrames
      )
    : { transform: "scale(1)" };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#020617",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {effectiveImageSrc ? (
        (() => {
          const isVideo = currentScene?.asset?.originalFilename
            ? /\.(mp4|mov|webm|avi|mkv)$/i.test(currentScene.asset.originalFilename)
            : effectiveImageSrc.includes("/videos/");
          return isVideo ? (
            <OffthreadVideo
              src={effectiveImageSrc}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              startFrom={0}
              endAt={currentSceneData ? currentSceneData.sceneDurationInFrames : durationInFrames}
              muted
            />
          ) : (
            <Img
              src={effectiveImageSrc}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                ...sceneImageStyle,
              }}
            />
          );
        })()
      ) : (
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(180deg, rgba(15,23,42,1) 0%, rgba(30,41,59,1) 100%)",
          }}
        />
      )}

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(2,6,23,0.25) 0%, rgba(2,6,23,0.58) 65%, rgba(2,6,23,0.82) 100%)",
        }}
      />

      {musicSrc ? <Audio src={musicSrc} volume={voiceover ? 0.08 : musicVolume} /> : null}
      {voiceover ? <Audio src={voiceover} volume={1} /> : null}
      {effectiveOverlayAvatar ? <AvatarWindow /> : null}

      {effectiveOverlayTitle ? (
        <div
          style={{
            ...getTitlePositionStyle({
              position: graphicTitlePosition,
              subtitleEnabled: effectiveOverlaySubtitles,
              subtitlePosition,
              outputFormat,
            }),
            transform: `translateY(${(1 - titleEntrance) * 24}px)`,
            opacity: titleEntrance,
          }}
        >
          <div style={{ maxWidth: getTitleBoxWidth(outputFormat) }}>
            <div
              style={{
                display: "inline-flex",
                borderRadius: 999,
                background: "rgba(255,255,255,0.15)",
                padding: "8px 12px",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1,
                textTransform: "uppercase",
                backdropFilter: "blur(8px)",
              }}
            >
              título
            </div>

            <div
              style={{
                marginTop: 14,
                fontWeight: 700,
                fontSize: getTitleFontSize(outputFormat, graphicTitleSize),
                lineHeight:
                  outputFormat === "9:16" ? 1.08 : outputFormat === "1:1" ? 1.06 : 1.05,
                textShadow: "0 3px 18px rgba(0,0,0,0.35)",
              }}
            >
              {title}
            </div>
          </div>
        </div>
      ) : null}

      {effectiveOverlaySubtitles && currentSubtitle ? (
        <div style={getSubtitlePositionStyle(subtitlePosition)}>
          <div
            style={{
              maxWidth: getSubtitleBoxWidth(outputFormat),
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(0,0,0,0.78)",
              padding: "12px 16px",
              fontWeight: 600,
              fontSize: getSubtitleFontSize(outputFormat, subtitleSize),
              lineHeight: 1.25,
              textAlign: "center",
              boxShadow: "0 12px 28px rgba(0,0,0,0.25)",
            }}
          >
            {currentSubtitle}
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

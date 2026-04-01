import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getSubtitleBlockForFrame } from "@/lib/subtitles";

type Props = {
  title?: string;
  script?: string;
  image?: string | null;
  music?: string | null;
  avatarVideo?: string | null;
  narrativePreset?: string;
  avatarEnabled?: boolean;
  graphicTitleSize?: string;
  graphicTitlePosition?: string;
  subtitleEnabled?: boolean;
  subtitlePosition?: string;
  subtitleSize?: string;
};

function getEffectiveTitleSize(
  outputFormat: string,
  requestedSize?: string | null
) {
  if (outputFormat === "1:1" && requestedSize === "lg") return "md";
  if (outputFormat === "9:16" && requestedSize === "lg") return "md";
  return requestedSize || "md";
}

function getTitleFontSize(outputFormat: string, requestedSize?: string | null) {
  const size = getEffectiveTitleSize(outputFormat, requestedSize);

  if (outputFormat === "9:16") {
    switch (size) {
      case "sm":
        return 42;
      case "lg":
        return 72;
      case "md":
      default:
        return 58;
    }
  }

  if (outputFormat === "1:1") {
    switch (size) {
      case "sm":
        return 50;
      case "lg":
        return 88;
      case "md":
      default:
        return 68;
    }
  }

  switch (size) {
    case "sm":
      return 48;
    case "lg":
      return 88;
    case "md":
    default:
      return 68;
  }
}

function getSubtitleFontSize(outputFormat: string, size?: string | null) {
  if (outputFormat === "9:16") {
    switch (size) {
      case "sm":
        return 24;
      case "lg":
        return 34;
      case "md":
      default:
        return 28;
    }
  }

  switch (size) {
    case "sm":
      return 22;
    case "lg":
      return 34;
    case "md":
    default:
      return 28;
  }
}

function getTitleLineHeight(outputFormat: string) {
  if (outputFormat === "9:16") return 1.08;
  if (outputFormat === "1:1") return 1.06;
  return 1.05;
}

function getTitleBoxWidth(outputFormat: string) {
  if (outputFormat === "9:16") return "78%";
  if (outputFormat === "1:1") return "82%";
  return "72%";
}

function getSubtitleBoxWidth(outputFormat: string) {
  if (outputFormat === "9:16") return "78%";
  if (outputFormat === "1:1") return "82%";
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
    outputFormat === "9:16" ? 180 : outputFormat === "1:1" ? 170 : 120;

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
  };

  switch (position) {
    case "top-left":
      return {
        ...base,
        top: 28,
        left: 28,
        justifyContent: "flex-start" as const,
      };
    case "top-center":
      return {
        ...base,
        top: 28,
        left: 0,
        right: 0,
        justifyContent: "center" as const,
      };
    case "top-right":
      return {
        ...base,
        top: 28,
        right: 28,
        justifyContent: "flex-end" as const,
      };
    case "bottom-left":
      return {
        ...base,
        bottom: 24,
        left: 28,
        justifyContent: "flex-start" as const,
      };
    case "bottom-right":
      return {
        ...base,
        bottom: 24,
        right: 28,
        justifyContent: "flex-end" as const,
      };
    case "bottom-center":
    default:
      return {
        ...base,
        bottom: 24,
        left: 0,
        right: 0,
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

export const VideoComposition = ({
  title = "Rollin Video Studio",
  script = "",
  image,
  music,
  narrativePreset = "titulo-resumen-foto",
  avatarEnabled = true,
  graphicTitleSize = "md",
  graphicTitlePosition = "bottom-left",
  subtitleEnabled = true,
  subtitlePosition = "bottom-center",
  subtitleSize = "md",
}: Props) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const outputFormat =
    width === 1080 && height === 1920
      ? "9:16"
      : width === 1080 && height === 1080
        ? "1:1"
        : "16:9";

  const imageSrc =
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

  const showAvatar =
    narrativePreset === "titulo-resumen-foto-avatar" && avatarEnabled;

  const currentSubtitle = subtitleEnabled
    ? getSubtitleBlockForFrame({
        text: script,
        frame,
        durationInFrames,
      })
    : "";

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#020617",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {imageSrc ? (
        <Img
          src={imageSrc}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
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

      {musicSrc ? <Audio src={musicSrc} volume={musicVolume} /> : null}

      {showAvatar ? <AvatarWindow /> : null}

      <div
        style={{
          ...getTitlePositionStyle({
            position: graphicTitlePosition,
            subtitleEnabled,
            subtitlePosition,
            outputFormat,
          }),
          transform: `translateY(${(1 - titleEntrance) * 24}px)`,
          opacity: titleEntrance,
        }}
      >
        <div
          style={{
            maxWidth: getTitleBoxWidth(outputFormat),
          }}
        >
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
              lineHeight: getTitleLineHeight(outputFormat),
              textShadow: "0 3px 18px rgba(0,0,0,0.35)",
            }}
          >
            {title}
          </div>
        </div>
      </div>

      {subtitleEnabled && currentSubtitle ? (
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

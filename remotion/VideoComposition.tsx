import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as loadBarlowCondensed } from "@remotion/google-fonts/BarlowCondensed";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";
import { getSubtitleBlockForFrame } from "../lib/subtitles";
import { LAYOUT, SUBTITLE_COLORS, tituloFontSizeFrac } from "../lib/graphicLayout";
import type { Momento } from "../lib/graphicLayout";

const { fontFamily: oswaldFontFamily } = loadOswald("normal", {
  weights: ["500", "600", "700"],
});
const { fontFamily: barlowCondensedFontFamily } = loadBarlowCondensed("normal", {
  weights: ["500", "600"],
});
const { fontFamily: manropeFontFamily } = loadManrope("normal", {
  weights: ["500", "800"],
});

type VisualSequenceScene = {
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
};

type Placa = {
  titulo: string;
  antetitulo?: string | null;
  momento: Momento;
};

type Props = {
  title?: string;
  script?: string;
  image?: string | null;
  music?: string | null;
  narrativePreset?: string;
  avatarEnabled?: boolean;
  subtitleEnabled?: boolean;
  subtitleColor?: string;
  voiceover?: string | null;
  category?: string;
  date?: string;
  placas?: Placa[];
  visualSequence?: VisualSequenceScene[];
};

function getOutputFormat(width: number, height: number) {
  if (width === 1080 && height === 1920) return "9:16";
  if (width === 1080 && height === 1080) return "1:1";
  return "16:9";
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
  durationInFrames: number,
  fps: number,
  activeMomentos: Set<Momento>
) {
  const n = visualSequence.length;
  if (n === 0) return null;

  const middleIndex = Math.floor((n - 1) / 2);

  const targetIndices = new Set<number>();
  if (activeMomentos.has("inicio")) targetIndices.add(0);
  if (activeMomentos.has("final")) targetIndices.add(n - 1);
  if (activeMomentos.has("mitad")) targetIndices.add(middleIndex);

  const minFrames = Math.round(5 * fps);

  const totalRatio = visualSequence.reduce(
    (sum, scene) => sum + Math.max(scene.durationRatio || 1, 0.0001),
    0
  );

  const naturalFrames = visualSequence.map((scene) => {
    const ratio = Math.max(scene.durationRatio || 1, 0.0001);
    return (ratio / totalRatio) * durationInFrames;
  });

  const flooredFrames = naturalFrames.map((natural, i) =>
    targetIndices.has(i) ? Math.max(natural, minFrames) : natural
  );

  let extra = 0;
  for (let i = 0; i < n; i++) {
    if (targetIndices.has(i)) {
      extra += Math.max(0, flooredFrames[i] - naturalFrames[i]);
    }
  }

  const nonTargetNaturalTotal = naturalFrames.reduce(
    (sum, val, i) => (targetIndices.has(i) ? sum : sum + val),
    0
  );

  const finalFramesFloat = flooredFrames.map((val, i) => {
    if (targetIndices.has(i)) return val;
    if (nonTargetNaturalTotal <= 0) return val;
    const share = naturalFrames[i] / nonTargetNaturalTotal;
    return Math.max(1, val - extra * share);
  });

  let accumulated = 0;
  const scenesWithFrames: {
    scene: VisualSequenceScene;
    startFrame: number;
    sceneFrames: number;
  }[] = [];

  for (let i = 0; i < n; i++) {
    const sceneFrames =
      i === n - 1
        ? Math.max(1, durationInFrames - accumulated)
        : Math.max(1, Math.round(finalFramesFloat[i]));
    scenesWithFrames.push({
      scene: visualSequence[i],
      startFrame: accumulated,
      sceneFrames,
    });
    accumulated += sceneFrames;
  }

  for (const entry of scenesWithFrames) {
    if (frame >= entry.startFrame && frame < entry.startFrame + entry.sceneFrames) {
      return {
        scene: entry.scene,
        sceneFrame: frame - entry.startFrame,
        sceneDurationInFrames: entry.sceneFrames,
      };
    }
  }

  const last = scenesWithFrames[scenesWithFrames.length - 1];
  return {
    scene: last.scene,
    sceneFrame: 0,
    sceneDurationInFrames: last.sceneFrames,
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
      return { transform: `scale(${zoomIn})` };
    case "zoom-out":
      return { transform: `scale(${zoomOut})` };
    case "pan":
      return { transform: `scale(1.05) translateX(${panX}px)` };
    case "static":
    default:
      return { transform: "scale(1)" };
  }
}

export const VideoComposition = ({
  title = "Rollin Video Studio",
  script = "",
  image,
  music,
  voiceover,
  placas = [],
  narrativePreset = "titulo-resumen-foto",
  avatarEnabled = true,
  subtitleEnabled = true,
  subtitleColor = "blanco",
  category = "General",
  date = "",
  visualSequence = [],
}: Props) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  getOutputFormat(width, height);

  const fallbackImageSrc =
    image && (image.startsWith("http://") || image.startsWith("https://"))
      ? image
      : null;

  const musicSrc =
    music && (music.startsWith("http://") || music.startsWith("https://"))
      ? music
      : null;

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

  const activeMomentos = new Set<Momento>(placas.map((p) => p.momento));

  const currentSceneData = getSceneForFrame(
    visualSequence,
    frame,
    durationInFrames,
    fps,
    activeMomentos
  );
  const currentScene = currentSceneData?.scene ?? null;
  const currentSceneImageSrc =
    currentScene?.asset?.url &&
    (currentScene.asset.url.startsWith("http://") ||
      currentScene.asset.url.startsWith("https://"))
      ? currentScene.asset.url
      : null;

  const effectiveImageSrc = currentSceneImageSrc || fallbackImageSrc;
  const sceneIndex = currentSceneData
    ? visualSequence.indexOf(currentSceneData.scene)
    : -1;
  const n = visualSequence.length;
  const middleIndex = Math.floor((n - 1) / 2);

  let activePlacaMomento: Momento | null = null;
  if (sceneIndex >= 0) {
    const candidates: Momento[] = [];
    if (sceneIndex === 0) candidates.push("inicio");
    if (n > 0 && sceneIndex === middleIndex) candidates.push("mitad");
    if (sceneIndex === n - 1) candidates.push("final");
    for (const c of candidates) {
      if (activeMomentos.has(c)) {
        activePlacaMomento = c;
        break;
      }
    }
  }
  const currentPlaca = activePlacaMomento
    ? placas.find((p) => p.momento === activePlacaMomento) ?? null
    : null;

  const showSinGrafica = subtitleEnabled && !currentPlaca;
  const effectiveOverlayAvatar = showAvatarGlobal;

  const currentSubtitle = showSinGrafica
    ? getSubtitleBlockForFrame({ text: script, frame, durationInFrames })
    : "";

  const sceneImageStyle = currentSceneData
    ? getSceneImageStyle(
        currentScene?.motionPreset,
        currentSceneData.sceneFrame,
        currentSceneData.sceneDurationInFrames
      )
    : { transform: "scale(1)" };

  const tituloText = currentPlaca?.titulo ?? title;
  const tituloFontSize = height * tituloFontSizeFrac(tituloText.length);
  const subtitleHexColor = SUBTITLE_COLORS[subtitleColor] ?? SUBTITLE_COLORS.blanco;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#020617",
        color: "white",
        fontFamily: barlowCondensedFontFamily,
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
              muted
              endAt={
                currentSceneData ? currentSceneData.sceneDurationInFrames : durationInFrames
              }
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

      {currentPlaca ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            top: height * LAYOUT.glowTopFrac,
            background:
              "radial-gradient(130% 85% at 50% 135%, #F114CD 0%, #870AAD 38%, rgba(63,12,52,.55) 58%, rgba(0,0,0,0) 78%)",
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "38%",
            background:
              "linear-gradient(to top, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 100%)",
          }}
        />
      )}

      {musicSrc ? <Audio src={musicSrc} volume={voiceover ? 0.08 : musicVolume} /> : null}
      {voiceover ? <Audio src={voiceover} volume={1} /> : null}
      {effectiveOverlayAvatar ? <AvatarWindow /> : null}

      {currentPlaca ? (
        <div
          style={{
            position: "absolute",
            top: height * LAYOUT.blockTopFrac,
            left: width * LAYOUT.blockLeftFrac,
            right: width * LAYOUT.blockRightFrac,
            display: "flex",
            flexDirection: "column",
          }}
        >
                    {currentPlaca.momento === "inicio" ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: width * LAYOUT.badgeGapFrac,
                marginBottom: height * LAYOUT.badgeToTituloGapFrac,
              }}
            >
              <span
                style={{
                  width: height * LAYOUT.badgeDotFrac,
                  height: height * LAYOUT.badgeDotFrac,
                  borderRadius: "50%",
                  background: "#FF221B",
                  flexShrink: 0,
                  position: "relative",
                  top: -(height * LAYOUT.badgeDotOffsetFrac),
                }}
              />
              <span
                style={{
                  color: "#fff",
                  fontFamily: barlowCondensedFontFamily,
                  fontWeight: 600,
                  fontSize: height * LAYOUT.categoriaFontFrac,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                }}
              >
                {category}
              </span>
              <span style={{ flex: 1 }} />
              <span
                style={{
                  color: "rgba(255,255,255,0.65)",
                  fontFamily: barlowCondensedFontFamily,
                  fontWeight: 500,
                  fontSize: height * LAYOUT.fechaFontFrac,
                  letterSpacing: 0.5,
                }}
              >
                {date}
              </span>
            </div>
          ) : null}

          <h1
            style={{
              margin: 0,
              color: "#fff",
              fontFamily: oswaldFontFamily,
              fontWeight: 700,
              fontSize: tituloFontSize,
              lineHeight: 1.08,
              textTransform: "uppercase",
              textAlign: "left",
              whiteSpace: "pre-line",
            }}
          >
            {tituloText}
          </h1>
        </div>
      ) : null}

      {showSinGrafica ? (
        <div
          style={{
            position: "absolute",
            left: width * LAYOUT.moscaLeftFrac,
            top: height * LAYOUT.moscaTopFrac,
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            color: "#fff",
            fontFamily: manropeFontFamily,
            fontWeight: 800,
            fontSize: height * LAYOUT.moscaFontFrac,
            letterSpacing: 1,
          }}
        >
          Rollin News
        </div>
      ) : null}

      {showSinGrafica && currentSubtitle ? (
        <div
          style={{
            position: "absolute",
            left: width * LAYOUT.subtituloLeftFrac,
            right: width * LAYOUT.subtituloRightFrac,
            bottom: height * LAYOUT.subtituloBottomFrac,
            textAlign: "center",
          }}
        >
          <span
            style={{
              color: subtitleHexColor,
              fontFamily: manropeFontFamily,
              fontWeight: 800,
              fontSize: height * LAYOUT.subtituloFontFrac,
              lineHeight: 1.3,
              textTransform: "uppercase",
              textShadow: "0 2px 10px rgba(0,0,0,0.65)",
            }}
          >
            {currentSubtitle}
          </span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

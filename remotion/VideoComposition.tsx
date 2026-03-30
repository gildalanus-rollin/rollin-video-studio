import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type Props = {
  title?: string;
  script?: string;
  image?: string | null;
  music?: string | null;
  avatarVideo?: string | null;
  narrativePreset?: string;
};

const splitSummary = (text: string) => {
  const clean = (text || "").trim();
  if (!clean) return ["Sin resumen cargado."];
  const lines = clean
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length > 0) return lines.slice(0, 4);

  const chunks = clean.match(/[^.!?\n]+[.!?]?/g) || [clean];
  return chunks.map((c) => c.trim()).filter(Boolean).slice(0, 4);
};

const BackgroundImage = ({ src }: { src: string | null }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.08], {
    extrapolateRight: "clamp",
  });

  if (!src) {
    return (
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(15,23,42,1) 0%, rgba(30,41,59,1) 100%)",
        }}
      />
    );
  }

  return (
    <AbsoluteFill>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(2,6,23,0.35) 0%, rgba(2,6,23,0.72) 65%, rgba(2,6,23,0.88) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

const AvatarWindow = ({ avatarVideo }: { avatarVideo?: string | null }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 48,
        right: 48,
        width: 300,
        height: 420,
        borderRadius: 24,
        overflow: "hidden",
        border: "2px solid rgba(255,255,255,0.18)",
        boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
        background: "rgba(15,23,42,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 5,
      }}
    >
      {avatarVideo ? (
        <video
          src={avatarVideo}
          autoPlay
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <div
          style={{
            padding: 24,
            textAlign: "center",
            color: "white",
            fontSize: 24,
            lineHeight: 1.35,
          }}
        >
          <div
            style={{
              fontSize: 18,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              opacity: 0.7,
              marginBottom: 12,
            }}
          >
            avatar
          </div>
          Ventana preparada para integrar HeyGen
        </div>
      )}
    </div>
  );
};

export const VideoComposition = ({
  title = "Rollin Video Studio",
  script = "Primer export de prueba",
  image,
  music,
  avatarVideo,
  narrativePreset = "titulo-resumen-foto",
}: Props) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const imageSrc =
    image && (image.startsWith("http://") || image.startsWith("https://"))
      ? image
      : null;

  const musicSrc =
    music && (music.startsWith("http://") || music.startsWith("https://"))
      ? music
      : null;

  const summaryLines = splitSummary(script);

  const introFrames = Math.floor(fps * 3);
  const outroFrames = Math.floor(fps * 2);
  const bodyFrames = Math.max(
    durationInFrames - introFrames - outroFrames,
    Math.floor(fps * 6)
  );

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
        ? interpolate(frame, [durationInFrames - fps, durationInFrames], [0.18, 0], {
            extrapolateLeft: "clamp",
          })
        : 0.18;

  const showAvatar = narrativePreset === "titulo-resumen-foto-avatar";

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#020617",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <BackgroundImage src={imageSrc} />

      {musicSrc ? <Audio src={musicSrc} volume={musicVolume} /> : null}

      <Sequence from={0} durationInFrames={introFrames}>
        <AbsoluteFill
          style={{
            padding: 72,
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              maxWidth: 1240,
              background: "rgba(2,6,23,0.42)",
              borderRadius: 28,
              padding: "42px 46px",
              transform: `translateY(${(1 - titleEntrance) * 40}px)`,
              opacity: titleEntrance,
              boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                opacity: 0.72,
                marginBottom: 18,
              }}
            >
              resumen informativo
            </div>

            <div
              style={{
                fontSize: 72,
                fontWeight: 700,
                lineHeight: 1.06,
                textWrap: "balance",
              }}
            >
              {title}
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={introFrames} durationInFrames={bodyFrames}>
        <AbsoluteFill
          style={{
            padding: 72,
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              maxWidth: showAvatar ? 1120 : 1240,
              background: "rgba(2,6,23,0.42)",
              borderRadius: 24,
              padding: "28px 32px",
            }}
          >
            <div
              style={{
                fontSize: 22,
                lineHeight: 1.35,
                opacity: 0.92,
              }}
            >
              {title}
            </div>
          </div>

          <div
            style={{
              maxWidth: showAvatar ? 980 : 1240,
              background: "rgba(2,6,23,0.58)",
              borderRadius: 28,
              padding: "36px 40px",
              boxShadow: "0 18px 50px rgba(0,0,0,0.3)",
            }}
          >
            {summaryLines.map((line, index) => (
              <div
                key={`${line}-${index}`}
                style={{
                  fontSize: showAvatar ? 32 : 36,
                  lineHeight: 1.32,
                  marginBottom: index === summaryLines.length - 1 ? 0 : 18,
                  opacity: 0.98,
                }}
              >
                {line}
              </div>
            ))}
          </div>

          {showAvatar ? <AvatarWindow avatarVideo={avatarVideo} /> : null}
        </AbsoluteFill>
      </Sequence>

      <Sequence from={introFrames + bodyFrames} durationInFrames={outroFrames}>
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            padding: 72,
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              textAlign: "center",
              background: "rgba(2,6,23,0.5)",
              borderRadius: 28,
              padding: "36px 42px",
              boxShadow: "0 18px 50px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                fontSize: 54,
                fontWeight: 700,
                lineHeight: 1.1,
                textWrap: "balance",
              }}
            >
              {title}
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

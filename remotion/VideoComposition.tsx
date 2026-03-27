import { AbsoluteFill, staticFile, Audio, Img } from "remotion";

type Props = {
  title?: string;
  script?: string;
  image?: string | null;
  music?: string | null;
};

export const VideoComposition = ({
  title = "Rollin Video Studio",
  script = "Primer export de prueba",
  image,
  music,
}: Props) => {
  const imageSrc =
    image && (image.startsWith("http://") || image.startsWith("https://"))
      ? image
      : null;

  const musicSrc =
    music && (music.startsWith("http://") || music.startsWith("https://"))
      ? music
      : null;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f172a",
        color: "white",
        fontFamily: "Arial, sans-serif",
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
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
            opacity: 0.35,
          }}
        />
      ) : null}

      {musicSrc ? <Audio src={musicSrc} /> : null}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1200,
          textAlign: "center",
          background: "rgba(15, 23, 42, 0.55)",
          padding: 40,
          borderRadius: 24,
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: 24,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 32,
            lineHeight: 1.4,
            whiteSpace: "pre-wrap",
          }}
        >
          {script}
        </div>
      </div>
    </AbsoluteFill>
  );
};

import { Composition } from "remotion";
import { VideoComposition } from "./VideoComposition";

const getDimensions = (format?: string) => {
  switch ((format || "").trim()) {
    case "9:16":
      return { width: 1080, height: 1920 };
    case "1:1":
      return { width: 1080, height: 1080 };
    case "16:9":
    default:
      return { width: 1920, height: 1080 };
  }
};

export const RemotionRoot = () => {
  return (
    <Composition
      id="RollinExport"
      component={VideoComposition}
      durationInFrames={450}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        title: "Rollin Video Studio",
        script: "",
        image: null,
        music: null,
        narrativePreset: "titulo-resumen-foto",
        avatarEnabled: true,
        graphicTitleSize: "md",
        graphicTitlePosition: "bottom-left",
        subtitleEnabled: true,
        subtitlePosition: "bottom-center",
        subtitleSize: "md",
      }}
      calculateMetadata={({ props }: { props: any }) => {
        const fps = 30;
        const { width, height } = getDimensions(props?.outputFormat);
        const durationInSeconds = Math.max(
          10,
          Number(props?.durationInSeconds) || 15
        );

        return {
          fps,
          width,
          height,
          durationInFrames: Math.round(durationInSeconds * fps),
        };
      }}
    />
  );
};

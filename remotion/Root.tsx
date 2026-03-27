import { Composition } from "remotion";
import { VideoComposition } from "./VideoComposition";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="RollinExport"
        component={VideoComposition}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: "Rollin Video Studio",
          script: "Primer export de prueba",
          image: null,
          music: null,
        }}
      />
    </>
  );
};

import ProjectSettingsEditor from "@/components/ProjectSettingsEditor";
import NarrationModeEditor from "@/components/NarrationModeEditor";
import ProjectSummaryEditor from "@/components/ProjectSummaryEditor";
import RenderScriptEditor from "@/components/RenderScriptEditor";

type Props = {
  projectId: string;
  mainSourceUrl: string;
  effectiveEditorialProfile: string;
  durationLimitSeconds: number;
  outputFormat: string;
  secondarySources: string[];
  summary: string;
  selectedImage: string;
  selectedVideo: string;
  selectedMusic: string;
  externalImageUrl: string;
  externalVideoUrl: string;
  narrationMode: string;
  renderScript: string;
};

export default function ProjectEditorialPanel({
  projectId,
  mainSourceUrl,
  effectiveEditorialProfile,
  durationLimitSeconds,
  outputFormat,
  secondarySources,
  summary,
  selectedImage,
  selectedVideo,
  selectedMusic,
  externalImageUrl,
  externalVideoUrl,
  narrationMode,
  renderScript,
}: Props) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        2. enfoque editorial
      </p>
      <h2 className="mt-2 text-xl font-semibold text-slate-900">
        criterio, narración, resumen y guion
      </h2>

      <div className="mt-5 space-y-4">
        <ProjectSettingsEditor
          projectId={projectId}
          initialCategory={effectiveEditorialProfile}
          initialDurationLimitSeconds={durationLimitSeconds}
          initialOutputFormat={outputFormat}
        />

        <NarrationModeEditor
          projectId={projectId}
          initialSecondarySources={secondarySources}
          initialSummary={summary}
          initialSelectedImage={selectedImage}
          initialSelectedVideo={selectedVideo}
          initialSelectedMusic={selectedMusic}
          initialExternalImageUrl={externalImageUrl}
          initialExternalVideoUrl={externalVideoUrl}
          initialNarrationMode={narrationMode}
        />

        <ProjectSummaryEditor
          projectId={projectId}
          mainSourceUrl={mainSourceUrl}
          initialSecondarySources={secondarySources}
          initialSummary={summary}
          initialSelectedImage={selectedImage}
          initialSelectedVideo={selectedVideo}
          initialSelectedMusic={selectedMusic}
          initialExternalImageUrl={externalImageUrl}
          initialExternalVideoUrl={externalVideoUrl}
        />

        <RenderScriptEditor
          projectId={projectId}
          initialRenderScript={renderScript}
        />
      </div>
    </section>
  );
}

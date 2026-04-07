import ExternalMediaLinksEditor from "@/components/ExternalMediaLinksEditor";

type Props = {
  projectId: string;
  secondarySources: string[];
  summary: string;
  selectedImage: string;
  selectedVideo: string;
  selectedMusic: string;
  externalImageUrl: string;
  externalVideoUrl: string;
  narrationMode: string;
};

export default function ProjectLegacyMediaPanel({
  projectId,
  secondarySources,
  summary,
  selectedImage,
  selectedVideo,
  selectedMusic,
  externalImageUrl,
  externalVideoUrl,
  narrationMode,
}: Props) {
  return (
    <details className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
      <summary className="cursor-pointer text-sm font-medium text-slate-700">
        herramientas legacy y enlaces externos
      </summary>

      <div className="mt-4 space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            imagen externa por link
          </p>
          <p className="mt-2 break-all text-sm text-slate-600">
            {externalImageUrl || "sin link externo"}
          </p>
        </div>

        <ExternalMediaLinksEditor
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
      </div>
    </details>
  );
}

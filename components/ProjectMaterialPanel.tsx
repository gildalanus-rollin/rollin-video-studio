import Link from "next/link";
import SourcesEditor from "@/components/SourcesEditor";
import ClearMainSourceButton from "@/components/ClearMainSourceButton";
import RemoveSecondarySourceButton from "@/components/RemoveSecondarySourceButton";
import ProjectAssetsPanel from "@/components/ProjectAssetsPanel";
import ProjectVisualSequencePanel from "@/components/ProjectVisualSequencePanel";
import ProjectLegacyMediaPanel from "@/components/ProjectLegacyMediaPanel";

type Props = {
  projectId: string;
  mainSourceUrl: string;
  secondarySources: string[];
  selectedImage: string;
  selectedVideo: string;
  selectedMusic: string;
  summary: string;
  externalImageUrl: string;
  externalVideoUrl: string;
  narrationMode: string;
};

export default function ProjectMaterialPanel({
  projectId,
  mainSourceUrl,
  secondarySources,
  selectedImage,
  selectedVideo,
  selectedMusic,
  summary,
  externalImageUrl,
  externalVideoUrl,
  narrationMode,
}: Props) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        1. material
      </p>
      <h2 className="mt-2 text-xl font-semibold text-slate-900">
        fuentes, assets y secuencia base
      </h2>

      <div className="mt-5 space-y-4">
        <SourcesEditor
          projectId={projectId}
          currentMain={mainSourceUrl || ""}
        />

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                fuente principal
              </p>

              {mainSourceUrl ? (
                <a
                  href={mainSourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block break-all text-sm font-medium text-slate-900 underline underline-offset-4"
                >
                  {mainSourceUrl}
                </a>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  No hay fuente principal cargada.
                </p>
              )}
            </div>

            {mainSourceUrl ? (
              <ClearMainSourceButton projectId={projectId} />
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            fuentes secundarias
          </p>

          {secondarySources.length > 0 ? (
            <div className="mt-3 space-y-2">
              {secondarySources.map((source, index) => (
                <div
                  key={`${source}-${index}`}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3"
                >
                  <a
                    href={source}
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-0 flex-1 break-all text-sm font-medium text-slate-900 underline underline-offset-4"
                  >
                    {source}
                  </a>

                  <RemoveSecondarySourceButton
                    projectId={projectId}
                    sourceToRemove={source}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              No hay fuentes secundarias cargadas todavía.
            </p>
          )}
        </div>

        <ProjectAssetsPanel projectId={projectId} />

        <ProjectVisualSequencePanel projectId={projectId} />

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            música del proyecto
          </p>
          <p className="mt-2 break-all text-sm text-slate-600">
            {selectedMusic || "Todavía no hay música seleccionada."}
          </p>

          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              href={`/modules/assets/music?projectId=${projectId}`}
              className="inline-flex rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              {selectedMusic ? "reemplazar música" : "seleccionar música"}
            </Link>
          </div>
        </div>

        <ProjectLegacyMediaPanel
          projectId={projectId}
          secondarySources={secondarySources}
          summary={summary}
          selectedImage={selectedImage}
          selectedVideo={selectedVideo}
          selectedMusic={selectedMusic}
          externalImageUrl={externalImageUrl}
          externalVideoUrl={externalVideoUrl}
          narrationMode={narrationMode}
        />
      </div>
    </section>
  );
}

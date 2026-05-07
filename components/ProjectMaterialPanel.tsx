import Link from "next/link";
import SourcesEditor from "@/components/SourcesEditor";
import RemoveSecondarySourceButton from "@/components/RemoveSecondarySourceButton";
import VisualSequenceEditor from "@/components/VisualSequenceEditor";
import ClearMusicButton from "@/components/ClearMusicButton";

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
  selectedMusic,
  summary,
  externalImageUrl,
  externalVideoUrl,
  narrationMode,
  selectedImage,
  selectedVideo,
}: Props) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        01 — material
      </p>

      <div className="mt-5 space-y-4">

        {/* Fuentes */}
        <SourcesEditor projectId={projectId} currentMain={mainSourceUrl} />


        {/* Fuentes secundarias */}
        {secondarySources.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">fuentes secundarias</p>
            <div className="mt-2 space-y-2">
              {secondarySources.map((source, index) => (
                <div
                  key={source + index}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3"
                >
                  <a
                    href={source}
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-0 flex-1 truncate text-sm text-slate-700 underline underline-offset-4"
                  >
                    {source}
                  </a>
                  <RemoveSecondarySourceButton projectId={projectId} sourceToRemove={source} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Secuencia de fotos — drag & drop */}
        <VisualSequenceEditor projectId={projectId} />

        {/* Música */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">música</p>
          <p className="mt-1 truncate text-sm text-slate-600">
            {selectedMusic || "Sin música seleccionada"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={"/modules/assets/music?projectId=" + projectId}
              className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800"
            >
              {selectedMusic ? "reemplazar" : "seleccionar música"}
            </Link>
            {selectedMusic && <ClearMusicButton projectId={projectId} />}
          </div>
        </div>

      </div>
    </section>
  );
}

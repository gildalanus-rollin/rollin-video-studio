export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ProjectTitleEditor from "@/components/ProjectTitleEditor";
import ProjectSummaryEditor from "@/components/ProjectSummaryEditor";
import ExternalMediaLinksEditor from "@/components/ExternalMediaLinksEditor";
import ClearSelectedAssetButton from "@/components/ClearSelectedAssetButton";
import ClearMainSourceButton from "@/components/ClearMainSourceButton";
import RemoveSecondarySourceButton from "@/components/RemoveSecondarySourceButton";
import ClearExternalLinkButton from "@/components/ClearExternalLinkButton";
import GenerateExportButton from "@/components/GenerateExportButton";
import NarrationModeEditor from "@/components/NarrationModeEditor";
import SourcesEditor from "@/components/SourcesEditor";
import ProjectSettingsEditor from "@/components/ProjectSettingsEditor";
import { parseProjectNotes } from "@/lib/projectNotes";

type Project = {
  id: string;
  title: string;
  category: string | null;
  editorial_profile: string | null;
  status: string;
  duration_limit_seconds: number;
  output_format: string;
  created_at: string;
  main_source_url: string | null;
  notes: string | null;
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, title, category, editorial_profile, status, duration_limit_seconds, output_format, created_at, main_source_url, notes"
    )
    .eq("id", id)
    .single();

  const project = data as Project | null;

  if (error) {
    return (
      <div className="space-y-6">
        <section className="rounded-[28px] border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm font-medium text-red-700">
            Error al leer el proyecto: {error.message}
          </p>
        </section>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          No se encontró el proyecto.
        </section>
      </div>
    );
  }

  const parsedNotes = parseProjectNotes(project.notes);
  const secondarySources = parsedNotes.secondarySources;
  const summary = parsedNotes.summary;
  const selectedImage = parsedNotes.selectedImage;
  const selectedVideo = parsedNotes.selectedVideo;
  const selectedMusic = parsedNotes.selectedMusic;
  const externalImageUrl = parsedNotes.externalImageUrl;
  const externalVideoUrl = parsedNotes.externalVideoUrl;
  const narrationMode = parsedNotes.narrationMode;

  const effectiveEditorialProfile =
    project.editorial_profile ?? project.category ?? "explicativo";

  let selectedImagePreviewUrl = "";

  if (selectedImage.startsWith("images/")) {
    const imagePath = selectedImage.replace(/^images\//, "");
    const { data: signedImage } = await supabase.storage
      .from("images")
      .createSignedUrl(imagePath, 3600);

    selectedImagePreviewUrl = signedImage?.signedUrl ?? "";
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <Link
          href="/projects"
          className="inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          ← volver a proyectos
        </Link>

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              mesa de producción
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {project.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              El flujo del proyecto sigue este orden: material, enfoque y export,
              IA, gráfica y render final.
            </p>

            <div className="mt-4 max-w-3xl">
              <ProjectTitleEditor
                projectId={project.id}
                initialTitle={project.title}
              />
            </div>
          </div>

          <div className="flex flex-col items-start gap-3">
            <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              {project.status}
            </span>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                creado
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {new Date(project.created_at).toLocaleString("es-AR")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              1. material
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              fuentes y recursos base
            </h2>

            <div className="mt-5 space-y-4">
              <SourcesEditor
                projectId={project.id}
                currentMain={project.main_source_url || ""}
              />

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      fuente principal
                    </p>

                    {project.main_source_url ? (
                      <a
                        href={project.main_source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 block break-all text-sm font-medium text-slate-900 underline underline-offset-4"
                      >
                        {project.main_source_url}
                      </a>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">
                        No hay fuente principal cargada.
                      </p>
                    )}
                  </div>

                  {project.main_source_url ? (
                    <ClearMainSourceButton projectId={project.id} />
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
                          projectId={project.id}
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

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  imagen elegida
                </p>

                {selectedImagePreviewUrl ? (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <img
                      src={selectedImagePreviewUrl}
                      alt="Imagen elegida"
                      className="h-44 w-full object-cover"
                    />
                  </div>
                ) : null}

                <p className="mt-3 break-all text-sm text-slate-600">
                  {selectedImage || "Todavía no hay imagen elegida."}
                </p>

                <div className="mt-3 flex flex-wrap gap-3">
                  <Link
                    href={`/modules/assets/images?projectId=${project.id}`}
                    className="inline-flex rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    {selectedImage ? "reemplazar imagen" : "seleccionar imagen"}
                  </Link>

                  {selectedImage ? (
                    <ClearSelectedAssetButton
                      projectId={project.id}
                      assetType="image"
                    />
                  ) : null}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  música elegida
                </p>
                <p className="mt-1 break-all text-sm text-slate-600">
                  {selectedMusic || "Todavía no hay música elegida."}
                </p>

                <div className="mt-3 flex flex-wrap gap-3">
                  <Link
                    href={`/modules/assets/music?projectId=${project.id}`}
                    className="inline-flex rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    {selectedMusic ? "reemplazar música" : "seleccionar música"}
                  </Link>

                  {selectedMusic ? (
                    <ClearSelectedAssetButton
                      projectId={project.id}
                      assetType="music"
                    />
                  ) : null}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  imagen externa por link
                </p>

                {externalImageUrl ? (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <img
                      src={externalImageUrl}
                      alt="Imagen externa"
                      className="h-44 w-full object-cover"
                    />
                  </div>
                ) : null}

                <div className="mt-3 space-y-3 text-sm text-slate-600">
                  <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
                    <p className="min-w-0 flex-1 break-all">
                      imagen externa: {externalImageUrl || "sin link todavía"}
                    </p>

                    {externalImageUrl ? (
                      <ClearExternalLinkButton
                        projectId={project.id}
                        linkType="image"
                      />
                    ) : null}
                  </div>
                </div>

                <div className="mt-4">
                  <ExternalMediaLinksEditor
                    projectId={project.id}
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
              </div>

              <NarrationModeEditor
                projectId={project.id}
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
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              2. enfoque y export
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              criterio editorial y salida
            </h2>

            <div className="mt-5">
              <ProjectSettingsEditor
                projectId={project.id}
                initialCategory={effectiveEditorialProfile}
                initialDurationLimitSeconds={project.duration_limit_seconds}
                initialOutputFormat={project.output_format}
              />
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              3. IA
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              resumen dentro del marco elegido
            </h2>

            <div className="mt-5">
              <ProjectSummaryEditor
                projectId={project.id}
                mainSourceUrl={project.main_source_url ?? ""}
                initialSecondarySources={secondarySources}
                initialSummary={summary}
                initialSelectedImage={selectedImage}
                initialSelectedVideo={selectedVideo}
                initialSelectedMusic={selectedMusic}
                initialExternalImageUrl={externalImageUrl}
                initialExternalVideoUrl={externalVideoUrl}
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              4. gráfica
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              preview editorial
            </h2>

            <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              Este bloque queda reservado para el preview de título + foto + avatar
              y herramientas simples de ajuste visual antes del render.
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              5. render
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              salida final y link público
            </h2>

            <div className="mt-5 space-y-3">
              <GenerateExportButton projectId={project.id} />

              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
                El render usa título, resumen, foto, música, perfil editorial, formato y duración del proyecto.
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ProjectTitleEditor from "@/components/ProjectTitleEditor";
import ProjectSummaryEditor from "@/components/ProjectSummaryEditor";
import ProjectMaterialPanel from "@/components/ProjectMaterialPanel";
import GenerateExportButton from "@/components/GenerateExportButton";
import NarrationModeEditor from "@/components/NarrationModeEditor";
import ProjectSettingsEditor from "@/components/ProjectSettingsEditor";
import RenderScriptEditor from "@/components/RenderScriptEditor";
import GraphicPreview from "@/components/GraphicPreview";
import GraphicSettingsEditor from "@/components/GraphicSettingsEditor";
import { parseProjectNotes } from "@/lib/projectNotes";

type Project = {
  id: string;
  title: string;
  category: string | null;
  editorial_profile: string | null;
  narrative_preset?: string | null;
  graphic_title_size?: string | null;
  graphic_title_position?: string | null;
  avatar_enabled?: boolean | null;
  subtitle_enabled?: boolean | null;
  subtitle_position?: string | null;
  subtitle_size?: string | null;
  status: string;
  duration_limit_seconds: number;
  output_format: string;
  created_at: string;
  main_source_url: string | null;
  notes: string | null;
  render_script?: string | null;
};

type AssetPreviewRow = {
  storage_bucket: string | null;
  storage_path: string | null;
  source_type: string;
  value: string;
  is_primary: boolean;
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
      "id, title, category, editorial_profile, narrative_preset, graphic_title_size, graphic_title_position, avatar_enabled, subtitle_enabled, subtitle_position, subtitle_size, status, duration_limit_seconds, output_format, created_at, main_source_url, notes, render_script"
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

  const effectiveNarrativePreset =
    project.narrative_preset ?? "titulo-resumen-foto";

  const effectiveGraphicTitleSize =
    project.graphic_title_size ?? "md";

  const effectiveGraphicTitlePosition =
    project.graphic_title_position ?? "bottom-left";

  const effectiveAvatarEnabled =
    project.avatar_enabled ?? true;

  const effectiveSubtitleEnabled =
    project.subtitle_enabled ?? true;

  const effectiveSubtitlePosition =
    project.subtitle_position ?? "bottom-center";

  const effectiveSubtitleSize =
    project.subtitle_size ?? "md";

  const { data: assetRows } = await supabase
    .from("project_assets")
    .select("storage_bucket, storage_path, source_type, value, is_primary")
    .eq("project_id", id)
    .eq("asset_type", "image")
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const projectAssets = (assetRows ?? []) as AssetPreviewRow[];
  const primaryAsset = projectAssets.find((asset) => asset.is_primary) ?? projectAssets[0] ?? null;

  let previewImageUrl = externalImageUrl || "";

  if (primaryAsset?.storage_bucket && primaryAsset?.storage_path) {
    const { data: publicUrlData } = supabase.storage
      .from(primaryAsset.storage_bucket)
      .getPublicUrl(primaryAsset.storage_path);

    previewImageUrl = publicUrlData.publicUrl;
  } else if (primaryAsset?.source_type === "url" && primaryAsset.value) {
    previewImageUrl = primaryAsset.value;
  } else if (primaryAsset?.value) {
    previewImageUrl = primaryAsset.value;
  }

  const previewSubtitleText =
    (project.render_script && String(project.render_script).trim()) || summary || "";

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
              mesa de edición
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {project.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              El proyecto se organiza en cuatro capas: material, enfoque editorial,
              gráfica y export/render.
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

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                {project.output_format}
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                {project.duration_limit_seconds}s
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                {effectiveEditorialProfile}
              </span>
            </div>

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
          <ProjectMaterialPanel
            projectId={project.id}
            mainSourceUrl={project.main_source_url || ""}
            secondarySources={secondarySources}
            selectedImage={selectedImage}
            selectedVideo={selectedVideo}
            selectedMusic={selectedMusic}
            summary={summary}
            externalImageUrl={externalImageUrl}
            externalVideoUrl={externalVideoUrl}
            narrationMode={narrationMode}
          />

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              2. enfoque editorial
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              criterio, narración, resumen y guion
            </h2>

            <div className="mt-5 space-y-4">
              <ProjectSettingsEditor
                projectId={project.id}
                initialCategory={effectiveEditorialProfile}
                initialDurationLimitSeconds={project.duration_limit_seconds}
                initialOutputFormat={project.output_format}
              />

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

              <RenderScriptEditor
                projectId={project.id}
                initialRenderScript={project.render_script ?? summary}
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              3. gráfica
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              vista editorial y ajustes visuales
            </h2>

            <div className="mt-5 space-y-4">
              <GraphicPreview
                title={project.title}
                imageUrl={previewImageUrl}
                outputFormat={project.output_format}
                narrativePreset={effectiveNarrativePreset}
                graphicTitleSize={effectiveGraphicTitleSize}
                graphicTitlePosition={effectiveGraphicTitlePosition}
                avatarEnabled={effectiveAvatarEnabled}
                subtitleEnabled={effectiveSubtitleEnabled}
                subtitlePosition={effectiveSubtitlePosition}
                subtitleSize={effectiveSubtitleSize}
                subtitleText={previewSubtitleText}
              />

              <GraphicSettingsEditor
                projectId={project.id}
                initialGraphicTitleSize={effectiveGraphicTitleSize}
                initialGraphicTitlePosition={effectiveGraphicTitlePosition}
                initialAvatarEnabled={effectiveAvatarEnabled}
                initialSubtitlePosition={effectiveSubtitlePosition}
                initialSubtitleSize={effectiveSubtitleSize}
              />

              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Este bloque usa como base la imagen principal del proyecto y el
                guion de render para que la lectura editorial sea más consistente.
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              4. export y render
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              salida del proyecto
            </h2>

            <div className="mt-5 space-y-3">
              <GenerateExportButton projectId={project.id} />

              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
                El export toma el título, el resumen editorial, el render_script,
                la imagen principal y la secuencia visual del proyecto.
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import ProjectTitleEditor from "@/components/ProjectTitleEditor";
import ProjectTabs from "@/components/ProjectTabs";
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
  voiceover_url?: string | null;
};

type AssetPreviewRow = {
  storage_bucket: string | null;
  storage_path: string | null;
  source_type: string;
  value: string;
  is_primary: boolean;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, title, category, editorial_profile, narrative_preset, graphic_title_size, graphic_title_position, avatar_enabled, subtitle_enabled, subtitle_position, subtitle_size, status, duration_limit_seconds, output_format, created_at, main_source_url, notes, render_script, voiceover_url"
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

  const supabaseAdmin = getSupabaseAdmin();
  const parsedNotes = parseProjectNotes(project.notes);

  const effectiveEditorialProfile =
    project.editorial_profile ?? project.category ?? "explicativo";
  const effectiveNarrativePreset =
    project.narrative_preset ?? "titulo-resumen-foto";
  const effectiveGraphicTitleSize = project.graphic_title_size ?? "md";
  const effectiveGraphicTitlePosition =
    project.graphic_title_position ?? "bottom-left";
  const effectiveAvatarEnabled = project.avatar_enabled ?? true;
  const effectiveSubtitleEnabled = project.subtitle_enabled ?? true;
  const effectiveSubtitlePosition = project.subtitle_position ?? "bottom-center";
  const effectiveSubtitleSize = project.subtitle_size ?? "md";

  const { data: assetRows } = await supabaseAdmin
    .from("project_assets")
    .select("storage_bucket, storage_path, source_type, value, is_primary")
    .eq("project_id", id)
    .eq("asset_type", "image")
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const projectAssets = (assetRows ?? []) as AssetPreviewRow[];
  const primaryAsset =
    projectAssets.find((a) => a.is_primary) ?? projectAssets[0] ?? null;

  let previewImageUrl = parsedNotes.externalImageUrl || "";

  if (primaryAsset?.storage_bucket && primaryAsset?.storage_path) {
    const { data: pub } = supabase.storage
      .from(primaryAsset.storage_bucket)
      .getPublicUrl(primaryAsset.storage_path);
    previewImageUrl = pub.publicUrl;
  } else if (primaryAsset?.source_type === "url" && primaryAsset.value) {
    previewImageUrl = primaryAsset.value;
  } else if (primaryAsset?.value) {
    previewImageUrl = primaryAsset.value;
  }

  const previewSubtitleText =
    (project.render_script && String(project.render_script).trim()) ||
    parsedNotes.summary ||
    "";

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

      <ProjectTabs
        projectId={project.id}
        title={project.title}
        mainSourceUrl={project.main_source_url || ""}
        secondarySources={parsedNotes.secondarySources}
        selectedImage={parsedNotes.selectedImage}
        selectedVideo={parsedNotes.selectedVideo}
        selectedMusic={parsedNotes.selectedMusic}
        summary={parsedNotes.summary}
        externalImageUrl={parsedNotes.externalImageUrl}
        externalVideoUrl={parsedNotes.externalVideoUrl}
        narrationMode={parsedNotes.narrationMode}
        effectiveEditorialProfile={effectiveEditorialProfile}
        durationLimitSeconds={project.duration_limit_seconds}
        outputFormat={project.output_format}
        voiceOption={parsedNotes.voiceOption}
        avatarOption={parsedNotes.avatarOption}
        renderScript={project.render_script ?? parsedNotes.summary}
        currentVoiceoverUrl={project.voiceover_url ?? undefined}
        initialStatus={project.status}
        imageUrl={previewImageUrl}
        narrativePreset={effectiveNarrativePreset}
        graphicTitleSize={effectiveGraphicTitleSize}
        graphicTitlePosition={effectiveGraphicTitlePosition}
        avatarEnabled={effectiveAvatarEnabled}
        subtitleEnabled={effectiveSubtitleEnabled}
        subtitlePosition={effectiveSubtitlePosition}
        subtitleSize={effectiveSubtitleSize}
        subtitleText={previewSubtitleText}
      />
    </div>
  );
}

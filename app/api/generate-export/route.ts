import { NextResponse } from "next/server";
import { parseProjectNotes } from "@/lib/projectNotes";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type ProjectAsset = {
  id: string;
  project_id: string;
  asset_type: string;
  source_type: string;
  value: string;
  label: string;
  sort_order: number;
  is_selected: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
  storage_bucket: string | null;
  storage_path: string | null;
  original_filename: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  is_primary: boolean;
  status: string;
  updated_at: string;
};

type VisualSequenceRow = {
  id: string;
  project_id: string;
  asset_id: string | null;
  sequence_order: number;
  scene_type: string;
  role: string;
  motion_preset: string;
  duration_ratio: number;
  overlay_title: boolean;
  overlay_subtitles: boolean;
  overlay_avatar: boolean;
  created_at: string;
  updated_at?: string;
  asset?: ProjectAsset | null;
};

function resolveAssetUrl(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  asset: Pick<ProjectAsset, "storage_bucket" | "storage_path" | "source_type" | "value"> | null
) {
  if (!asset) return "";

  if (asset.storage_bucket && asset.storage_path) {
    const { data } = supabase.storage
      .from(asset.storage_bucket)
      .getPublicUrl(asset.storage_path);

    return data.publicUrl;
  }

  if (asset.source_type === "url" && asset.value) {
    return asset.value;
  }

  return asset.value || "";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const warnings: string[] = [];

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const parsed = parseProjectNotes(data.notes);

    let resolvedImage = parsed.selectedImage || "";

    try {
      const { data: assetRows, error: assetsError } = await supabase
        .from("project_assets")
        .select("*")
        .eq("project_id", projectId)
        .eq("asset_type", "image")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (assetsError) {
        warnings.push(`No se pudo leer project_assets: ${assetsError.message}`);
      } else {
        const assets = (assetRows ?? []) as ProjectAsset[];

        const selectedAsset =
          assets.find((asset) => asset.is_primary) ??
          assets[0] ??
          null;

        if (selectedAsset) {
          resolvedImage = resolveAssetUrl(supabase, selectedAsset);
        }
      }
    } catch (error) {
      warnings.push(
        error instanceof Error
          ? `Fallo al resolver image principal: ${error.message}`
          : "Fallo al resolver image principal"
      );
    }

    let visualSequence: Array<{
      id: string;
      sequenceOrder: number;
      sceneType: string;
      role: string;
      motionPreset: string;
      durationRatio: number;
      overlayTitle: boolean;
      overlaySubtitles: boolean;
      overlayAvatar: boolean;
      asset: {
        id: string;
        label: string;
        originalFilename: string;
        isPrimary: boolean;
        url: string;
      } | null;
    }> = [];

    try {
      const { data: visualSequenceRows, error: sequenceError } = await supabase
        .from("project_visual_sequence")
        .select(`
          *,
          asset:project_assets (*)
        `)
        .eq("project_id", projectId)
        .order("sequence_order", { ascending: true });

      if (sequenceError) {
        warnings.push(
          `No se pudo leer project_visual_sequence: ${sequenceError.message}`
        );
      } else {
        visualSequence = ((visualSequenceRows ?? []) as VisualSequenceRow[]).map((row) => ({
          id: row.id,
          sequenceOrder: row.sequence_order,
          sceneType: row.scene_type,
          role: row.role,
          motionPreset: row.motion_preset,
          durationRatio: row.duration_ratio,
          overlayTitle: row.overlay_title,
          overlaySubtitles: row.overlay_subtitles,
          overlayAvatar: row.overlay_avatar,
          asset: row.asset
            ? {
                id: row.asset.id,
                label: row.asset.label || "",
                originalFilename: row.asset.original_filename || "",
                isPrimary: row.asset.is_primary,
                url: resolveAssetUrl(supabase, row.asset),
              }
            : null,
        }));
      }
    } catch (error) {
      warnings.push(
        error instanceof Error
          ? `Fallo al resolver visualSequence: ${error.message}`
          : "Fallo al resolver visualSequence"
      );
    }

    const exportData = {
      title: data.title,
      summary: parsed.summary,
      script:
        (typeof data.render_script === "string" && data.render_script.trim()) ||
        parsed.summary,
      mainSource: data.main_source_url,
      secondarySources: parsed.secondarySources,
      image: resolvedImage,
      video: parsed.selectedVideo,
      music: parsed.selectedMusic,
      visualSequence,
      warnings,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      export: exportData,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

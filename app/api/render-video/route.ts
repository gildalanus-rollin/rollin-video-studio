import { NextResponse } from "next/server";
import { parseProjectNotes } from "@/lib/projectNotes";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import fs from "fs/promises";

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

function safeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

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

async function resolveStorageUrl(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  rawValue: string | null | undefined,
  bucketName: string
) {
  if (!rawValue) return null;

  if (rawValue.startsWith("http://") || rawValue.startsWith("https://")) {
    return rawValue;
  }

  const prefix = `${bucketName}/`;

  if (!rawValue.startsWith(prefix)) {
    return null;
  }

  const filePath = rawValue.replace(new RegExp(`^${bucketName}/`), "");

  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(filePath, 60 * 60);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, disableMusic } = body;

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const parsed = parseProjectNotes(data.notes);
    const baseName = safeFileName(data.title || "video-export");

    const stamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .replace("T", "_")
      .replace("Z", "");

    const fileName = `${baseName}-${stamp}.mp4`;

    let fallbackImageUrl = parsed.externalImageUrl || null;

    const { data: assetRows, error: assetsError } = await supabase
      .from("project_assets")
      .select("*")
      .eq("project_id", projectId)
      .eq("asset_type", "image")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (!assetsError) {
      const assets = (assetRows ?? []) as ProjectAsset[];
      const selectedAsset =
        assets.find((asset) => asset.is_primary) ??
        assets[0] ??
        null;

      if (selectedAsset) {
        fallbackImageUrl = resolveAssetUrl(supabase, selectedAsset);
      }
    } else {
      const internalImageUrl = await resolveStorageUrl(
        supabase,
        parsed.selectedImage,
        "images"
      );
      fallbackImageUrl = internalImageUrl || parsed.externalImageUrl || null;
    }

    const { data: visualSequenceRows, error: sequenceError } = await supabase
      .from("project_visual_sequence")
      .select(`
        *,
        asset:project_assets (*)
      `)
      .eq("project_id", projectId)
      .order("sequence_order", { ascending: true });

    const visualSequence = !sequenceError
      ? ((visualSequenceRows ?? []) as VisualSequenceRow[]).map((row) => ({
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
        }))
      : [];

    const musicUrl = disableMusic
      ? null
      : await resolveStorageUrl(
          supabase,
          parsed.selectedMusic,
          "music"
        );

    const outputFormat = data.output_format || "16:9";
    const durationInSeconds = Number(data.duration_limit_seconds) || 15;

    const finalScript =
      (data.render_script && String(data.render_script).trim()) ||
      parsed.summary ||
      data.summary ||
      data.title ||
      "";

    const voiceoverUrl = data.voiceover_url || null;

    const { renderVideo } = await import("@/lib/renderVideo");

    const result = await renderVideo({
      title: data.title,
      script: finalScript,
      image: fallbackImageUrl,
      music: musicUrl,
      voiceover: voiceoverUrl,
      outputFormat,
      durationInSeconds,
      narrativePreset: data.narrative_preset || "titulo-resumen-foto",
      avatarEnabled: data.avatar_enabled ?? true,
      graphicTitleSize: data.graphic_title_size ?? "md",
      graphicTitlePosition: data.graphic_title_position ?? "bottom-left",
      subtitleEnabled: data.subtitle_enabled ?? true,
      subtitlePosition: data.subtitle_position ?? "bottom-center",
      subtitleSize: data.subtitle_size ?? "md",
      outputFileName: fileName,
      visualSequence,
    });

    const fileBuffer = await fs.readFile(result.outputLocation);

    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(fileName, fileBuffer, {
        contentType: "video/mp4",
        upsert: false,
        cacheControl: "0",
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("videos")
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      fileName,
      outputLocation: result.outputLocation,
      url: publicUrlData.publicUrl,
      debug: {
        imageUsed: fallbackImageUrl,
        musicUsed: musicUrl,
        outputFormatUsed: outputFormat,
        durationUsed: durationInSeconds,
        narrativePresetUsed: data.narrative_preset || "titulo-resumen-foto",
        avatarEnabledUsed: data.avatar_enabled ?? true,
        graphicTitleSizeUsed: data.graphic_title_size ?? "md",
        graphicTitlePositionUsed: data.graphic_title_position ?? "bottom-left",
        subtitleEnabledUsed: data.subtitle_enabled ?? true,
        subtitlePositionUsed: data.subtitle_position ?? "bottom-center",
        subtitleSizeUsed: data.subtitle_size ?? "md",
        renderScriptUsed: finalScript,
        visualSequenceCount: visualSequence.length,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "No se pudo renderizar el video." },
      { status: 500 }
    );
  }
}

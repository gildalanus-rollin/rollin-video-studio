import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

function sanitizeFilename(filename: string) {
  return filename
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await context.params;
    const supabase = getSupabaseAdmin();

    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((item) => item instanceof File) as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No se enviaron archivos" }, { status: 400 });
    }

    const invalidFile = files.find(
      (file) => !file.type || (!file.type.includes("mp4") && !file.type.includes("x-mp4"))
    );

    if (invalidFile) {
      return NextResponse.json({ error: "Solo se permiten videos" }, { status: 400 });
    }

    const { data: existingAssets } = await supabase
      .from("project_assets")
      .select("id, sort_order, is_primary")
      .eq("project_id", projectId)
      .eq("asset_type", "video")
      .order("sort_order", { ascending: true });

    let nextSortOrder = existingAssets?.length ?? 0;
    const insertedAssets = [];

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const fileId = randomUUID();
      const safeName = sanitizeFilename(file.name || `video-${index + 1}.mp4`);
      const storagePath = `projects/${projectId}/videos/${fileId}-${safeName}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      const { data: insertedAsset, error: insertError } = await supabase
        .from("project_assets")
        .insert({
          project_id: projectId,
          asset_type: "video",
          source_type: "storage",
          value: storagePath,
          label: file.name || safeName,
          sort_order: nextSortOrder,
          is_selected: false,
          metadata: { uploaded_from: "project_assets_upload_video_api" },
          storage_bucket: "videos",
          storage_path: storagePath,
          original_filename: file.name || safeName,
          mime_type: file.type || null,
          file_size_bytes: typeof file.size === "number" ? file.size : null,
          is_primary: false,
          status: "ready",
        })
        .select("*")
        .single();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      const { data: publicUrlData } = supabase.storage
        .from("videos")
        .getPublicUrl(storagePath);

      insertedAssets.push({
        ...insertedAsset,
        resolved_url: publicUrlData.publicUrl,
      });

      nextSortOrder += 1;
    }

    return NextResponse.json({ ok: true, assets: insertedAssets });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error inesperado" },
      { status: 500 }
    );
  }
}

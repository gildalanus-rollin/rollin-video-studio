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
      return NextResponse.json(
        { error: "No se enviaron archivos" },
        { status: 400 }
      );
    }

    const invalidFile = files.find(
      (file) => !file.type || !file.type.startsWith("image/")
    );

    if (invalidFile) {
      return NextResponse.json(
        { error: "Solo se permiten imágenes" },
        { status: 400 }
      );
    }

    const { data: existingAssets, error: existingError } = await supabase
      .from("project_assets")
      .select("id, sort_order, is_primary")
      .eq("project_id", projectId)
      .eq("asset_type", "image")
      .order("sort_order", { ascending: true });

    if (existingError) {
      return NextResponse.json(
        { error: existingError.message },
        { status: 500 }
      );
    }

    const hasPrimary = (existingAssets ?? []).some((asset) => asset.is_primary);
    let nextSortOrder = existingAssets?.length ?? 0;

    const insertedAssets = [];

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const fileId = randomUUID();
      const safeName = sanitizeFilename(file.name || `image-${index + 1}.jpg`);
      const storagePath = `projects/${projectId}/images/${fileId}-${safeName}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json(
          { error: uploadError.message },
          { status: 500 }
        );
      }

      const shouldBePrimary = !hasPrimary && index === 0;

      const { data: insertedAsset, error: insertError } = await supabase
        .from("project_assets")
        .insert({
          project_id: projectId,
          asset_type: "image",
          source_type: "storage",
          value: storagePath,
          label: file.name || safeName,
          sort_order: nextSortOrder,
          is_selected: shouldBePrimary,
          metadata: {
            uploaded_from: "project_assets_upload_api",
          },
          storage_bucket: "images",
          storage_path: storagePath,
          original_filename: file.name || safeName,
          mime_type: file.type || null,
          file_size_bytes: typeof file.size === "number" ? file.size : null,
          is_primary: shouldBePrimary,
          status: "ready",
        })
        .select("*")
        .single();

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from("images")
        .getPublicUrl(storagePath);

      insertedAssets.push({
        ...insertedAsset,
        resolved_url: publicUrlData.publicUrl,
      });

      nextSortOrder += 1;
    }

    return NextResponse.json({
      ok: true,
      assets: insertedAssets,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Error inesperado",
      },
      { status: 500 }
    );
  }
}

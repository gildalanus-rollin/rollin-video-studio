import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; assetId: string }> }
) {
  try {
    const { id: projectId, assetId } = await context.params;
    const supabase = getSupabaseAdmin();

    const { data: asset, error: assetError } = await supabase
      .from("project_assets")
      .select("id, project_id, asset_type, storage_bucket, storage_path, is_primary")
      .eq("id", assetId)
      .eq("project_id", projectId)

      .single();

    if (assetError || !asset) {
      return NextResponse.json(
        { error: "No se encontró la imagen del proyecto" },
        { status: 404 }
      );
    }

    if (asset.storage_bucket && asset.storage_path) {
      const { error: storageError } = await supabase.storage
        .from(asset.storage_bucket)
        .remove([asset.storage_path]);

      if (storageError) {
        return NextResponse.json(
          { error: storageError.message },
          { status: 500 }
        );
      }
    }

    const { error: deleteError } = await supabase
      .from("project_assets")
      .delete()
      .eq("id", assetId)
      .eq("project_id", projectId)


    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    const { data: remainingAssets, error: remainingError } = await supabase
      .from("project_assets")
      .select("id, sort_order, is_primary")
      .eq("project_id", projectId)

      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (remainingError) {
      return NextResponse.json(
        { error: remainingError.message },
        { status: 500 }
      );
    }

    const remaining = remainingAssets ?? [];

    for (let index = 0; index < remaining.length; index++) {
      const row = remaining[index];
      const shouldBePrimary = remaining.length > 0 && index === 0;

      const { error: reorderError } = await supabase
        .from("project_assets")
        .update({
          sort_order: index,
          is_primary: row.is_primary || shouldBePrimary,
          is_selected: row.is_primary || shouldBePrimary,
        })
        .eq("id", row.id);

      if (reorderError) {
        return NextResponse.json(
          { error: reorderError.message },
          { status: 500 }
        );
      }
    }

    const noPrimaryLeft = remaining.length > 0 && !remaining.some((row) => row.is_primary);

    if (noPrimaryLeft) {
      const firstAsset = remaining[0];

      const { error: primaryError } = await supabase
        .from("project_assets")
        .update({
          is_primary: true,
          is_selected: true,
        })
        .eq("id", firstAsset.id);

      if (primaryError) {
        return NextResponse.json(
          { error: primaryError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ ok: true });
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

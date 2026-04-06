import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string; assetId: string }> }
) {
  try {
    const { id: projectId, assetId } = await context.params;
    const supabase = getSupabaseAdmin();

    const { data: targetAsset, error: targetError } = await supabase
      .from("project_assets")
      .select("id, project_id, asset_type")
      .eq("id", assetId)
      .eq("project_id", projectId)
      .eq("asset_type", "image")
      .single();

    if (targetError || !targetAsset) {
      return NextResponse.json(
        { error: "No se encontró la imagen del proyecto" },
        { status: 404 }
      );
    }

    const { error: resetError } = await supabase
      .from("project_assets")
      .update({
        is_primary: false,
        is_selected: false,
      })
      .eq("project_id", projectId)
      .eq("asset_type", "image");

    if (resetError) {
      return NextResponse.json(
        { error: resetError.message },
        { status: 500 }
      );
    }

    const { data: updatedAsset, error: updateError } = await supabase
      .from("project_assets")
      .update({
        is_primary: true,
        is_selected: true,
      })
      .eq("id", assetId)
      .eq("project_id", projectId)
      .eq("asset_type", "image")
      .select("*")
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      asset: updatedAsset,
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

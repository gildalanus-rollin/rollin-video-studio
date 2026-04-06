import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await context.params;
    const supabase = getSupabaseAdmin();

    const { data: existingSequence, error: existingSequenceError } = await supabase
      .from("project_visual_sequence")
      .select("id")
      .eq("project_id", projectId)
      .order("sequence_order", { ascending: true });

    if (existingSequenceError) {
      return NextResponse.json(
        { error: existingSequenceError.message },
        { status: 500 }
      );
    }

    if ((existingSequence ?? []).length > 0) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        message: "La secuencia ya existe para este proyecto",
      });
    }

    const { data: assets, error: assetsError } = await supabase
      .from("project_assets")
      .select("id, project_id, sort_order, is_primary")
      .eq("project_id", projectId)
      .eq("asset_type", "image")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (assetsError) {
      return NextResponse.json(
        { error: assetsError.message },
        { status: 500 }
      );
    }

    if (!assets || assets.length === 0) {
      return NextResponse.json(
        { error: "El proyecto no tiene imágenes para inicializar la secuencia" },
        { status: 400 }
      );
    }

    const rows = assets.map((asset, index) => ({
      project_id: projectId,
      asset_id: asset.id,
      sequence_order: index,
      scene_type: "image",
      role: asset.is_primary ? "cover" : "support",
      motion_preset: "static",
      duration_ratio: 1.0,
      overlay_title: index === 0,
      overlay_subtitles: true,
      overlay_avatar: false,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("project_visual_sequence")
      .insert(rows)
      .select("*");

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      sequence: inserted ?? [],
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

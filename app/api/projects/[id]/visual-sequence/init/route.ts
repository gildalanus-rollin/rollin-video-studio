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

    const { data: assets, error: assetsError } = await supabase
      .from("project_assets")
      .select("id, sort_order, is_primary, asset_type")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (assetsError) {
      return NextResponse.json({ error: assetsError.message }, { status: 500 });
    }

    if (!assets || assets.length === 0) {
      return NextResponse.json(
        { error: "El proyecto no tiene assets para inicializar la secuencia" },
        { status: 400 }
      );
    }

    const { data: existingSequence } = await supabase
      .from("project_visual_sequence")
      .select("asset_id")
      .eq("project_id", projectId);

    const existingAssetIds = new Set((existingSequence ?? []).map((s) => s.asset_id));
    const newAssets = assets.filter((a) => !existingAssetIds.has(a.id));

    if (newAssets.length === 0) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        message: "Todos los assets ya estan en la secuencia",
      });
    }

    const startOrder = (existingSequence ?? []).length;

    const rows = newAssets.map((asset, index) => ({
      project_id: projectId,
      asset_id: asset.id,
      sequence_order: startOrder + index,
      scene_type: "image",
      role: asset.is_primary ? "cover" : "support",
      motion_preset: "static",
      duration_ratio: 1.0,
      overlay_title: startOrder + index === 0,
      overlay_subtitles: true,
      overlay_avatar: false,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("project_visual_sequence")
      .insert(rows)
      .select("*");

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      added: inserted?.length ?? 0,
      sequence: inserted ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error inesperado" },
      { status: 500 }
    );
  }
}

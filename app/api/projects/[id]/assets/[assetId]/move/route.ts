import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; assetId: string }> }
) {
  try {
    const { id: projectId, assetId } = await context.params;
    const supabase = getSupabaseAdmin();

    const body = await request.json();
    const direction = body?.direction;

    if (direction !== "up" && direction !== "down") {
      return NextResponse.json(
        { error: "Dirección inválida" },
        { status: 400 }
      );
    }

    const { data: assets, error: assetsError } = await supabase
      .from("project_assets")
      .select("id, sort_order")
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

    const rows = assets ?? [];
    const currentIndex = rows.findIndex((row) => row.id === assetId);

    if (currentIndex === -1) {
      return NextResponse.json(
        { error: "No se encontró la imagen del proyecto" },
        { status: 404 }
      );
    }

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= rows.length) {
      return NextResponse.json({ ok: true, unchanged: true });
    }

    const reordered = [...rows];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    for (let index = 0; index < reordered.length; index++) {
      const row = reordered[index];

      const { error: updateError } = await supabase
        .from("project_assets")
        .update({ sort_order: index })
        .eq("id", row.id);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
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

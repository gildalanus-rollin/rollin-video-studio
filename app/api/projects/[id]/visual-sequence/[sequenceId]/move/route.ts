import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; sequenceId: string }> }
) {
  try {
    const { id: projectId, sequenceId } = await context.params;
    const supabase = getSupabaseAdmin();

    const body = await request.json();
    const direction = body?.direction;

    if (direction !== "up" && direction !== "down") {
      return NextResponse.json(
        { error: "Dirección inválida" },
        { status: 400 }
      );
    }

    const { data: rows, error: rowsError } = await supabase
      .from("project_visual_sequence")
      .select("id, sequence_order")
      .eq("project_id", projectId)
      .order("sequence_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (rowsError) {
      return NextResponse.json(
        { error: rowsError.message },
        { status: 500 }
      );
    }

    const sequence = rows ?? [];
    const currentIndex = sequence.findIndex((row) => row.id === sequenceId);

    if (currentIndex === -1) {
      return NextResponse.json(
        { error: "No se encontró la escena" },
        { status: 404 }
      );
    }

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= sequence.length) {
      return NextResponse.json({ ok: true, unchanged: true });
    }

    const reordered = [...sequence];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    for (let index = 0; index < reordered.length; index++) {
      const row = reordered[index];

      const { error: updateError } = await supabase
        .from("project_visual_sequence")
        .update({ sequence_order: index })
        .eq("id", row.id)
        .eq("project_id", projectId);

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

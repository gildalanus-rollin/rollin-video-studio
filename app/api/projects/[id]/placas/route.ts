import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const MOMENTO_ORDEN: Record<string, number> = { inicio: 1, mitad: 2, final: 3 };

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await context.params;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("project_placas")
      .select("titulo, antetitulo, momento")
      .eq("project_id", projectId)
      .order("orden", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ placas: data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await context.params;
    const { placas } = await request.json();
    const supabase = getSupabaseAdmin();

    await supabase.from("project_placas").delete().eq("project_id", projectId);

    if (placas && placas.length > 0) {
      const validMomentos = new Set(["inicio", "mitad", "final"]);
      const rows = placas
        .filter((p: { momento: string }) => validMomentos.has(p.momento))
        .map((p: { titulo: string; antetitulo?: string; momento: string }) => ({
          project_id: projectId,
          titulo: p.titulo ?? "",
          antetitulo: p.antetitulo || null,
          momento: p.momento,
          orden: MOMENTO_ORDEN[p.momento],
        }));
      if (rows.length > 0) {
        const { error } = await supabase.from("project_placas").insert(rows);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 });
  }
}

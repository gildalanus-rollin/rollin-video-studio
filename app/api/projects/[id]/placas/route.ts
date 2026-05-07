import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await context.params;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("project_placas")
      .select("*")
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

    // Delete existing and re-insert
    await supabase.from("project_placas").delete().eq("project_id", projectId);

    if (placas && placas.length > 0) {
      const rows = placas.map((p: { texto: string; momento_segundos: number; duracion_segundos: number; posicion?: string; alineacion?: string }, i: number) => ({
        project_id: projectId,
        texto: p.texto,
        momento_segundos: p.momento_segundos,
        duracion_segundos: p.duracion_segundos ?? 4,
        posicion: p.posicion ?? "center",
        alineacion: p.alineacion ?? "center",
        orden: i + 1,
      }));
      const { error } = await supabase.from("project_placas").insert(rows);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 });
  }
}

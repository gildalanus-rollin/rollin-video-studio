import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { buildProjectNotes, parseProjectNotes } from "@/lib/projectNotes";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, mainSourceUrl, secondarySourceUrl, mode } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Falta projectId" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    if (mode === "save-main") {
      const { error } = await supabase
        .from("projects")
        .update({ main_source_url: (mainSourceUrl || "").trim() })
        .eq("id", projectId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    }

    if (mode === "add-secondary") {
      const { data, error } = await supabase
        .from("projects")
        .select("notes")
        .eq("id", projectId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const parsed = parseProjectNotes(
        (data as { notes: string | null } | null)?.notes ?? null
      );

      const nextSecondary = (secondarySourceUrl || "").trim();

      if (!nextSecondary) {
        return NextResponse.json(
          { error: "La fuente secundaria está vacía." },
          { status: 400 }
        );
      }

      const deduped = [...new Set([...parsed.secondarySources, nextSecondary])];

      const notes = buildProjectNotes({
        ...parsed,
        secondarySources: deduped,
      });

      const { error: updateError } = await supabase
        .from("projects")
        .update({ notes })
        .eq("id", projectId);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Modo inválido." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Error guardando fuentes",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildProjectNotes, parseProjectNotes } from "@/lib/projectNotes";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, mainSourceUrl, secondarySourceUrl, mode } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Faltan variables de entorno de Supabase en el servidor." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    if (mode === "save-main") {
      const { error } = await supabase
        .from("projects")
        .update({ main_source_url: mainSourceUrl || "" })
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

      const notes = buildProjectNotes({
        ...parsed,
        secondarySources: [...parsed.secondarySources, nextSecondary],
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
  } catch {
    return NextResponse.json(
      { error: "Error guardando fuentes" },
      { status: 500 }
    );
  }
}

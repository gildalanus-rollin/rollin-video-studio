import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { buildProjectNotes, parseProjectNotes } from "@/lib/projectNotes";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, narrationMode, voiceOption, avatarOption } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Falta projectId" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

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

    const notes = buildProjectNotes({
      ...parsed,
      narrationMode: (narrationMode || "").trim(),
      voiceOption: (voiceOption || "").trim(),
      avatarOption: (avatarOption || "").trim(),
    });

    const { error: updateError } = await supabase
      .from("projects")
      .update({ notes })
      .eq("id", projectId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error guardando narración",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await context.params;
    const { musicPath } = await request.json();

    if (!musicPath) {
      return NextResponse.json({ error: "musicPath es requerido" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const notes = await supabase
      .from("projects")
      .select("notes")
      .eq("id", projectId)
      .single();

    const currentNotes = notes.data?.notes ?? "";
    const newNotes = currentNotes.includes("###SELECTED_MUSIC###")
      ? currentNotes.replace(/###SELECTED_MUSIC###[\s\S]*?###END_SELECTED_MUSIC###/, `###SELECTED_MUSIC###\n${musicPath}\n###END_SELECTED_MUSIC###`)
      : currentNotes + `\n###SELECTED_MUSIC###\n${musicPath}\n###END_SELECTED_MUSIC###`;

    const { error } = await supabase
      .from("projects")
      .update({ notes: newNotes })
      .eq("id", projectId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error inesperado" },
      { status: 500 }
    );
  }
}

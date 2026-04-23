import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, category, duration_limit_seconds, output_format, main_source_url, notes } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "El título es requerido." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("projects")
      .insert([{
        title: title.trim(),
        category,
        status: "draft",
        duration_limit_seconds,
        output_format,
        main_source_url: main_source_url || null,
        notes: notes || null,
      }])
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error inesperado" },
      { status: 500 }
    );
  }
}

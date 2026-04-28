import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const [{ data: profiles }, { data: seoConfig }] = await Promise.all([
      supabase.from("editorial_profiles").select("id, category, system_prompt").order("category"),
      supabase.from("seo_config").select("id, name, prompt").eq("name", "titulo_seo").single(),
    ]);
    return NextResponse.json({ profiles: profiles ?? [], seoConfig: seoConfig ?? null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { type, id, prompt } = await req.json();
    if (!id || !prompt) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });

    const supabase = getSupabaseAdmin();

    if (type === "editorial") {
      const { error } = await supabase
        .from("editorial_profiles")
        .update({ system_prompt: prompt, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else if (type === "seo") {
      const { error } = await supabase
        .from("seo_config")
        .update({ prompt, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { projectId } = await req.json();
    if (!projectId) return NextResponse.json({ error: "Falta projectId" }, { status: 400 });
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "Falta OPENAI_API_KEY" }, { status: 500 });

    const supabase = getSupabaseAdmin();
    const { data: project } = await supabase.from("projects").select("title, notes, render_script").eq("id", projectId).single();
    const { data: seoConfig } = await supabase.from("seo_config").select("prompt").eq("name", "titulo_seo").single();

    if (!seoConfig?.prompt) return NextResponse.json({ error: "No hay prompt SEO configurado" }, { status: 400 });

    const content = [
      project?.render_script && `Guion: ${project.render_script}`,
      project?.title && `Título actual: ${project.title}`,
    ].filter(Boolean).join("\n\n");

    if (!content) return NextResponse.json({ error: "El proyecto no tiene contenido para generar títulos SEO" }, { status: 400 });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: "gpt-4.1-mini", messages: [{ role: "system", content: seoConfig.prompt }, { role: "user", content }], max_tokens: 800 }),
    });

    const result = await response.json();
    const text = result.choices?.[0]?.message?.content || "";
    return NextResponse.json({ ok: true, suggestions: text });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error inesperado" }, { status: 500 });
  }
}

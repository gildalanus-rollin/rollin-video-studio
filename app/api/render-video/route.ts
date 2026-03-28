import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseProjectNotes } from "@/lib/projectNotes";

function safeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !publishableKey) {
      return NextResponse.json(
        { error: "Faltan variables de entorno de Supabase en el servidor." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, publishableKey);

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const parsed = parseProjectNotes(data.notes);
    const baseName = safeFileName(data.title || "video-export");
    const fileName = `${baseName}.mp4`;

    const { renderVideo } = await import("@/lib/renderVideo");

    const result = await renderVideo({
      title: data.title,
      script: parsed.summary,
      image: parsed.selectedImage,
      music: parsed.selectedMusic,
      outputFileName: fileName,
    });

    const uploadResponse = await fetch(`${new URL(req.url).origin}/api/upload-video`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filePath: result.outputLocation,
        fileName,
      }),
    });

    const uploadJson = await uploadResponse.json();

    if (!uploadResponse.ok) {
      return NextResponse.json(
        { error: uploadJson.error || "No se pudo subir el video." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      fileName,
      outputLocation: result.outputLocation,
      url: uploadJson.url,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "No se pudo renderizar el video." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseProjectNotes } from "@/lib/projectNotes";
import fs from "fs/promises";

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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

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

    // leer archivo generado
    const fileBuffer = await fs.readFile(result.outputLocation);

    // subir a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("exports")
      .upload(fileName, fileBuffer, {
        contentType: "video/mp4",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({
        success: false,
        error: uploadError.message,
      });
    }

    // obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from("exports")
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      fileName,
      url: publicUrlData.publicUrl,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "No se pudo renderizar el video." },
      { status: 500 }
    );
  }
}

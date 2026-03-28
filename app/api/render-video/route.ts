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

async function resolveStorageUrl(
  supabase: ReturnType<typeof createClient>,
  rawValue: string | null | undefined,
  bucketName: string
) {
  if (!rawValue) return null;

  if (rawValue.startsWith("http://") || rawValue.startsWith("https://")) {
    return rawValue;
  }

  const prefix = `${bucketName}/`;

  if (!rawValue.startsWith(prefix)) {
    return null;
  }

  const filePath = rawValue.replace(new RegExp(`^${bucketName}/`), "");

  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(filePath, 60 * 60);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
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
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !publishableKey || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Faltan variables de entorno de Supabase en el servidor." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, publishableKey);
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

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

    const internalImageUrl = await resolveStorageUrl(
      supabaseAdmin,
      parsed.selectedImage,
      "images"
    );

    const imageUrl = internalImageUrl || parsed.externalImageUrl || null;

    const musicUrl = await resolveStorageUrl(
      supabaseAdmin,
      parsed.selectedMusic,
      "music"
    );

    const { renderVideo } = await import("@/lib/renderVideo");

    const result = await renderVideo({
      title: data.title,
      script: parsed.summary,
      image: imageUrl,
      music: musicUrl,
      outputFileName: fileName,
    });

    const fileBuffer = await fs.readFile(result.outputLocation);

    const { error: uploadError } = await supabaseAdmin.storage
      .from("videos")
      .upload(fileName, fileBuffer, {
        contentType: "video/mp4",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("videos")
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      fileName,
      outputLocation: result.outputLocation,
      url: publicUrlData.publicUrl,
      debug: {
        imageUsed: imageUrl,
        musicUsed: musicUrl,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "No se pudo renderizar el video." },
      { status: 500 }
    );
  }
}

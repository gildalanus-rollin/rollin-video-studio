import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

function sanitizeFilename(filename: string) {
  return filename
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdmin();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Falta el archivo de video" },
        { status: 400 }
      );
    }

    if (!file.type || !file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "Solo se permiten archivos de video" },
        { status: 400 }
      );
    }

    const folderRaw = formData.get("folder");
    const folder =
      typeof folderRaw === "string" && folderRaw.trim()
        ? folderRaw.trim().replace(/^\/+|\/+$/g, "")
        : "projects/uploads";

    const safeName = sanitizeFilename(file.name || "video.mp4");
    const fileId = randomUUID();
    const storagePath = `${folder}/${fileId}-${safeName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("videos")
      .getPublicUrl(storagePath);

    return NextResponse.json({
      ok: true,
      path: storagePath,
      url: publicUrlData.publicUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Error subiendo el video",
      },
      { status: 500 }
    );
  }
}

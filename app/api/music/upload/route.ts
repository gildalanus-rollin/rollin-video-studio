import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdmin();
    const formData = await request.formData();
    const files = formData.getAll("files").filter((f) => f instanceof File) as File[];

    if (!files.length) return NextResponse.json({ error: "No se enviaron archivos" }, { status: 400 });

    for (const file of files) {
      const safeName = file.name.normalize("NFKD").replace(/[^\w.\-]+/g, "-").toLowerCase();
      const buffer = Buffer.from(await file.arrayBuffer());
      const { error } = await supabase.storage.from("music").upload(safeName, buffer, {
        contentType: file.type || "audio/mpeg",
        upsert: true,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage
      .from("music")
      .list("", { limit: 100, sortBy: { column: "name", order: "asc" } });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const files = (data ?? []).map((file) => {
      const { data: urlData } = supabase.storage.from("music").getPublicUrl(file.name);
      return { name: file.name, created_at: file.created_at, url: urlData.publicUrl };
    });

    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 500 });
  }
}

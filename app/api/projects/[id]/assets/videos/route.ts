import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await context.params;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("project_assets")
      .select("*")
      .eq("project_id", projectId)
      .eq("asset_type", "video")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const assets = (data ?? []).map((asset) => {
      let resolvedUrl: string | null = null;

      if (asset.storage_bucket && asset.storage_path) {
        const { data: publicUrlData } = supabase.storage
          .from(asset.storage_bucket)
          .getPublicUrl(asset.storage_path);
        resolvedUrl = publicUrlData.publicUrl;
      } else if (asset.source_type === "url" && asset.value) {
        resolvedUrl = asset.value;
      }

      return { ...asset, resolved_url: resolvedUrl };
    });

    return NextResponse.json({ assets });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error inesperado" },
      { status: 500 }
    );
  }
}

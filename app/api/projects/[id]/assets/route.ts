import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type AssetRow = {
  id: string;
  project_id: string;
  asset_type: string;
  source_type: string;
  value: string;
  label: string;
  sort_order: number;
  is_selected: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
  storage_bucket: string | null;
  storage_path: string | null;
  original_filename: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  is_primary: boolean;
  status: string;
  updated_at: string;
};

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
      .eq("asset_type", "image")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const assets = ((data ?? []) as AssetRow[]).map((asset) => {
      let resolvedUrl: string | null = null;

      if (asset.storage_bucket && asset.storage_path) {
        const { data: publicUrlData } = supabase.storage
          .from(asset.storage_bucket)
          .getPublicUrl(asset.storage_path);

        resolvedUrl = publicUrlData.publicUrl;
      } else if (asset.source_type === "url" && asset.value) {
        resolvedUrl = asset.value;
      }

      return {
        ...asset,
        resolved_url: resolvedUrl,
      };
    });

    return NextResponse.json({ assets });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Error inesperado",
      },
      { status: 500 }
    );
  }
}

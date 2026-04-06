import { NextResponse } from "next/server";
import { parseProjectNotes } from "@/lib/projectNotes";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type ProjectAsset = {
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const parsed = parseProjectNotes(data.notes);

    const { data: assetRows, error: assetsError } = await supabase
      .from("project_assets")
      .select("*")
      .eq("project_id", projectId)
      .eq("asset_type", "image")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (assetsError) {
      return NextResponse.json({ error: assetsError.message }, { status: 500 });
    }

    const assets = (assetRows ?? []) as ProjectAsset[];

    const selectedAsset =
      assets.find((asset) => asset.is_primary) ??
      assets[0] ??
      null;

    let resolvedImage = parsed.selectedImage || "";

    if (selectedAsset) {
      if (selectedAsset.storage_bucket && selectedAsset.storage_path) {
        const { data: publicUrlData } = supabase.storage
          .from(selectedAsset.storage_bucket)
          .getPublicUrl(selectedAsset.storage_path);

        resolvedImage = publicUrlData.publicUrl;
      } else if (selectedAsset.source_type === "url" && selectedAsset.value) {
        resolvedImage = selectedAsset.value;
      } else if (selectedAsset.value) {
        resolvedImage = selectedAsset.value;
      }
    }

    const exportData = {
      title: data.title,
      summary: parsed.summary,
      script:
        (typeof data.render_script === "string" && data.render_script.trim()) ||
        parsed.summary,
      mainSource: data.main_source_url,
      secondarySources: parsed.secondarySources,
      image: resolvedImage,
      video: parsed.selectedVideo,
      music: parsed.selectedMusic,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      export: exportData,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

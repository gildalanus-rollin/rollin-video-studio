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
      .from("project_visual_sequence")
      .select(`
        *,
        asset:project_assets (
          id,
          label,
          original_filename,
          sort_order,
          is_primary,
          storage_bucket,
          storage_path,
          source_type,
          value
        )
      `)
      .eq("project_id", projectId)
      .order("sequence_order", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const rows = (data ?? []).map((row: any) => {
      let resolvedUrl: string | null = null;

      if (row.asset?.storage_bucket && row.asset?.storage_path) {
        const { data: publicUrlData } = supabase.storage
          .from(row.asset.storage_bucket)
          .getPublicUrl(row.asset.storage_path);

        resolvedUrl = publicUrlData.publicUrl;
      } else if (row.asset?.source_type === "url" && row.asset?.value) {
        resolvedUrl = row.asset.value;
      }

      return {
        ...row,
        resolved_url: resolvedUrl,
      };
    });

    return NextResponse.json({
      ok: true,
      sequence: rows,
    });
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

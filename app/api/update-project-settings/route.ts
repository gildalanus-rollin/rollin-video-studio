import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const ALLOWED_STATUSES = ["draft", "ready", "archived"] as const;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      projectId,
      editorialProfile,
      narrativePreset,
      durationLimitSeconds,
      outputFormat,
      subtitleEnabled,
      status,
    } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Falta projectId" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const normalizedStatus =
      typeof status === "string" && ALLOWED_STATUSES.includes(status as (typeof ALLOWED_STATUSES)[number])
        ? status
        : "draft";

    const { error } = await supabase
      .from("projects")
      .update({
        editorial_profile: editorialProfile || "explicativo",
        category: editorialProfile || "explicativo",
        narrative_preset: narrativePreset || "titulo-resumen-foto",
        duration_limit_seconds: Number(durationLimitSeconds) || 15,
        output_format: outputFormat || "16:9",
        subtitle_enabled: Boolean(subtitleEnabled),
        status: normalizedStatus,
      })
      .eq("id", projectId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error actualizando ajustes del proyecto",
      },
      { status: 500 }
    );
  }
}

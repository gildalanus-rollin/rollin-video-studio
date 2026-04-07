import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const ALLOWED_ROLES = ["cover", "support", "closing"] as const;
const ALLOWED_MOTION_PRESETS = ["static", "pan", "zoom-in", "zoom-out"] as const;

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; sequenceId: string }> }
) {
  try {
    const { id: projectId, sequenceId } = await context.params;
    const supabase = getSupabaseAdmin();

    const body = await request.json();

    const patch: Record<string, unknown> = {};

    if (typeof body.role === "string") {
      if (!ALLOWED_ROLES.includes(body.role)) {
        return NextResponse.json(
          { error: "Role inválido" },
          { status: 400 }
        );
      }
      patch.role = body.role;
    }

    if (typeof body.motion_preset === "string") {
      if (!ALLOWED_MOTION_PRESETS.includes(body.motion_preset)) {
        return NextResponse.json(
          { error: "Motion preset inválido" },
          { status: 400 }
        );
      }
      patch.motion_preset = body.motion_preset;
    }

    if (typeof body.overlay_title === "boolean") {
      patch.overlay_title = body.overlay_title;
    }

    if (typeof body.overlay_subtitles === "boolean") {
      patch.overlay_subtitles = body.overlay_subtitles;
    }

    if (typeof body.overlay_avatar === "boolean") {
      patch.overlay_avatar = body.overlay_avatar;
    }

    if (typeof body.duration_ratio === "number") {
      if (body.duration_ratio <= 0) {
        return NextResponse.json(
          { error: "duration_ratio debe ser mayor a 0" },
          { status: 400 }
        );
      }
      patch.duration_ratio = body.duration_ratio;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: "No hay cambios para aplicar" },
        { status: 400 }
      );
    }

    const { data: updatedRow, error } = await supabase
      .from("project_visual_sequence")
      .update(patch)
      .eq("id", sequenceId)
      .eq("project_id", projectId)
      .select("*")
      .single();

    if (error || !updatedRow) {
      return NextResponse.json(
        { error: error?.message || "No se pudo actualizar la escena" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      row: updatedRow,
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

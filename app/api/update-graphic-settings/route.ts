import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      projectId,
      graphicTitleSize,
      graphicTitlePosition,
      avatarEnabled,
      subtitlePosition,
      subtitleSize,
    } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Falta projectId" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("projects")
      .update({
        graphic_title_size: graphicTitleSize || "md",
        graphic_title_position: graphicTitlePosition || "bottom-left",
        avatar_enabled: Boolean(avatarEnabled),
        subtitle_position: subtitlePosition || "bottom-center",
        subtitle_size: subtitleSize || "md",
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
            : "Error actualizando ajustes de gráfica",
      },
      { status: 500 }
    );
  }
}

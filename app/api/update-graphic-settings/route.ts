import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Faltan variables de entorno de Supabase en el servidor." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

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
  } catch {
    return NextResponse.json(
      { error: "Error actualizando ajustes de gráfica" },
      { status: 500 }
    );
  }
}

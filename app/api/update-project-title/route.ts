import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectId, title } = body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxenhkb3RwemJycGFwY3ZqbW54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ1NjQ4MSwiZXhwIjoyMDkwMDMyNDgxfQ.H9pPBNpIiej5c9G8FNWMiQY9qbS5ydEustZpo7mZQ7I
    );

    const { error } = await supabase
      .from("projects")
      .update({ title })
      .eq("id", projectId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Error actualizando título" },
      { status: 500 }
    );
  }
}

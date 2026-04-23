import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VOICES = [
  { id: "onyx", name: "Onyx", gender: "M", style: "Broadcaster" },
  { id: "echo", name: "Echo", gender: "M", style: "Suave" },
  { id: "fable", name: "Fable", gender: "M", style: "Expresivo" },
  { id: "nova", name: "Nova", gender: "F", style: "Cálida" },
  { id: "shimmer", name: "Shimmer", gender: "F", style: "Clara" },
  { id: "alloy", name: "Alloy", gender: "F", style: "Neutra" },
];

export async function POST(req: NextRequest) {
  try {
    const { projectId, voiceId, text } = await req.json();

    if (!projectId || !voiceId || !text?.trim()) {
      return NextResponse.json(
        { error: "Faltan parámetros: projectId, voiceId y text son requeridos." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Falta OPENAI_API_KEY en el servidor." },
        { status: 500 }
      );
    }

    const voice = VOICES.find((v) => v.id === voiceId);
    if (!voice) {
      return NextResponse.json({ error: "Voice ID no válido." }, { status: 400 });
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text.trim(),
        voice: voiceId,
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `OpenAI TTS error: ${error}` },
        { status: 500 }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(audioBuffer);

    const supabase = getSupabaseAdmin();
    const fileName = `projects/${projectId}/voiceover-${Date.now()}.mp3`;

    const { error: uploadError } = await supabase.storage
      .from("audio")
      .upload(fileName, buffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Error subiendo audio: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("audio")
      .getPublicUrl(fileName);

    const voiceoverUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
      .from("projects")
      .update({ voiceover_url: voiceoverUrl })
      .eq("id", projectId);

    if (updateError) {
      return NextResponse.json(
        { error: `Error guardando URL: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      url: voiceoverUrl,
      voice: voice.name,
      fileName,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error inesperado" },
      { status: 500 }
    );
  }
}

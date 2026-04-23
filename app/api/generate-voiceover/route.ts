import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VOICES = [
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", gender: "male", style: "broadcaster" },
  { id: "nPczCjzI2devNBz1zQrb", name: "Brian", gender: "male", style: "serious" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", gender: "male", style: "storyteller" },
  { id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda", gender: "female", style: "professional" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", gender: "female", style: "confident" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", gender: "female", style: "educator" },
];

export { VOICES };

export async function POST(req: NextRequest) {
  try {
    const { projectId, voiceId, text } = await req.json();

    if (!projectId || !voiceId || !text?.trim()) {
      return NextResponse.json(
        { error: "Faltan parámetros: projectId, voiceId y text son requeridos." },
        { status: 400 }
      );
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: "Falta ELEVENLABS_API_KEY en el servidor." },
        { status: 500 }
      );
    }

    const voice = VOICES.find((v) => v.id === voiceId);
    if (!voice) {
      return NextResponse.json(
        { error: "Voice ID no válido." },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `ElevenLabs error: ${error}` },
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

    return NextResponse.json({
      ok: true,
      url: publicUrlData.publicUrl,
      voice: voice.name,
      fileName,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error inesperado",
      },
      { status: 500 }
    );
  }
}

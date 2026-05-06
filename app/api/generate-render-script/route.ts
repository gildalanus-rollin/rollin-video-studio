import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeLength(durationLimitSeconds?: number) {
  const seconds = Number(durationLimitSeconds) || 15;

  if (seconds <= 15) return "short";
  if (seconds <= 30) return "medium";
  return "long";
}

function getInstructionByLength(length: "short" | "medium" | "long", seconds: number) {
  // 2.5 palabras/segundo, dejamos 20% de margen
  const maxWords = Math.floor(seconds * 3.0 * 0.85);
  return `Escribí una locución de MÁXIMO ${maxWords} palabras en total. Es OBLIGATORIO no superar ese límite. El audio debe durar menos de ${seconds} segundos.`;
}

export async function POST(req: NextRequest) {
  try {
    const { title, summary, durationLimitSeconds } = await req.json();

    if (!summary || typeof summary !== "string" || !summary.trim()) {
      return NextResponse.json(
        { error: "Falta el resumen base para generar la locución." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Falta OPENAI_API_KEY en el servidor." },
        { status: 500 }
      );
    }

    const length = normalizeLength(durationLimitSeconds);
    const seconds = Number(durationLimitSeconds) || 15;

    const systemPrompt = [
      "Sos un redactor periodístico audiovisual especializado en video.",
      "Tu tarea es escribir el guion de locución final para un video informativo.",
      "ESTRUCTURA OBLIGATORIA: 1) HOOK: La primera frase debe ser el dato más sorprendente, la cifra más impactante o la pregunta que genera curiosidad inmediata. No puede ser una introducción genérica. 2) DESARROLLO: Explicá el contexto en frases cortas y directas. 3) CIERRE: Terminá con una conclusión o dato que quede resonando.",
      "La locución debe sonar natural, clara, directa y periodística.",
      "No uses viñetas ni títulos.",
      "Cada frase debe poder funcionar también como subtítulo.",
      "No inventes datos que no estén en el material provisto.",
      "Priorizá claridad oral por sobre la escritura formal.",
      getInstructionByLength(length, seconds),
    ].join(" ");

    const userPrompt = `Título del proyecto:
${title || "Sin título"}

Resumen editorial base:
${summary}`;

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
        }),
      }
    );

    const openaiJson = await openaiResponse.json();

    if (!openaiResponse.ok) {
      return NextResponse.json(
        {
          error:
            openaiJson?.error?.message ||
            "OpenAI devolvió un error al generar la locución.",
        },
        { status: 500 }
      );
    }

    const renderScript = openaiJson?.choices?.[0]?.message?.content?.trim();

    if (!renderScript) {
      return NextResponse.json(
        { error: "No se recibió locución desde OpenAI." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      renderScript,
      meta: {
        length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error inesperado al generar la locución.",
      },
      { status: 500 }
    );
  }
}

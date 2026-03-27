import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<\/(p|div|section|article|h1|h2|h3|h4|li|br)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function extractTitle(html: string) {
  const ogTitle = html.match(
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
  );
  if (ogTitle?.[1]) return ogTitle[1].trim();

  const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleTag?.[1]) return stripHtml(titleTag[1]).trim();

  return "";
}

function extractReadableText(html: string) {
  const articleMatch = html.match(/<article[\s\S]*?<\/article>/i);
  const source = articleMatch?.[0] ?? html;
  const text = stripHtml(source);
  return text.slice(0, 12000);
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Falta la URL principal." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Falta OPENAI_API_KEY en el servidor." },
        { status: 500 }
      );
    }

    const articleResponse = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      },
      cache: "no-store",
    });

    if (!articleResponse.ok) {
      return NextResponse.json(
        { error: `No se pudo leer la nota: ${articleResponse.status}` },
        { status: 400 }
      );
    }

    const html = await articleResponse.text();
    const title = extractTitle(html);
    const articleText = extractReadableText(html);

    if (!articleText || articleText.length < 200) {
      return NextResponse.json(
        { error: "No se pudo extraer suficiente contenido del enlace." },
        { status: 400 }
      );
    }

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
          messages: [
            {
              role: "system",
              content:
                "Sos un redactor periodístico audiovisual. Debes resumir una noticia en español para un video informativo corto. Entrega 4 líneas breves, claras y concretas, sin viñetas, una debajo de la otra. No inventes nada que no esté en el contenido provisto. Priorizá hechos, protagonistas y contexto útil para un video de hasta 2 minutos.",
            },
            {
              role: "user",
              content: `URL: ${url}

Título detectado:
${title || "Sin título detectado"}

Contenido extraído:
${articleText}`,
            },
          ],
          temperature: 0.2,
        }),
      }
    );

    const openaiJson = await openaiResponse.json();

    if (!openaiResponse.ok) {
      return NextResponse.json(
        {
          error:
            openaiJson?.error?.message ||
            "OpenAI devolvió un error al generar el resumen.",
        },
        { status: 500 }
      );
    }

    const summary = openaiJson?.choices?.[0]?.message?.content?.trim();

    if (!summary) {
      return NextResponse.json(
        { error: "No se recibió resumen desde OpenAI." },
        { status: 500 }
      );
    }

    return NextResponse.json({ summary });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error inesperado al generar el resumen.",
      },
      { status: 500 }
    );
  }
}

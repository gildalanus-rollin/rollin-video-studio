import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type SourceMaterial = {
  url: string;
  status: number;
  title: string;
  description: string;
  articleText: string;
};

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<\/(p|div|section|article|main|h1|h2|h3|h4|li|br)>/gi, "\n")
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
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"]+)["']/i
  );
  if (ogTitle?.[1]) return ogTitle[1].trim();

  const twitterTitle = html.match(
    /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"]+)["']/i
  );
  if (twitterTitle?.[1]) return twitterTitle[1].trim();

  const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleTag?.[1]) return stripHtml(titleTag[1]).trim();

  return "";
}

function extractDescription(html: string) {
  const ogDescription = html.match(
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"]+)["']/i
  );
  if (ogDescription?.[1]) return ogDescription[1].trim();

  const metaDescription = html.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"]+)["']/i
  );
  if (metaDescription?.[1]) return metaDescription[1].trim();

  const twitterDescription = html.match(
    /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"]+)["']/i
  );
  if (twitterDescription?.[1]) return twitterDescription[1].trim();

  return "";
}

function extractJsonLdArticleBody(html: string) {
  const matches = html.match(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );

  if (!matches) return "";

  for (const block of matches) {
    const jsonMatch = block.match(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
    );

    if (!jsonMatch?.[1]) continue;

    try {
      const parsed = JSON.parse(jsonMatch[1]);
      const candidates = Array.isArray(parsed) ? parsed : [parsed];

      for (const item of candidates) {
        if (item?.articleBody && typeof item.articleBody === "string") {
          return item.articleBody.trim();
        }
      }
    } catch {
      // seguir
    }
  }

  return "";
}

function extractReadableText(html: string) {
  const articleBody = extractJsonLdArticleBody(html);
  if (articleBody) return articleBody.slice(0, 12000);

  const articleMatch = html.match(/<article[\s\S]*?<\/article>/i);
  if (articleMatch?.[0]) return stripHtml(articleMatch[0]).slice(0, 12000);

  const mainMatch = html.match(/<main[\s\S]*?<\/main>/i);
  if (mainMatch?.[0]) return stripHtml(mainMatch[0]).slice(0, 12000);

  const bodyMatch = html.match(/<body[\s\S]*?<\/body>/i);
  if (bodyMatch?.[0]) return stripHtml(bodyMatch[0]).slice(0, 12000);

  return stripHtml(html).slice(0, 12000);
}

function normalizeLength(value: unknown) {
  if (value === "short" || value === "medium" || value === "long") {
    return value;
  }
  return "medium";
}

function getLengthInstruction(length: "short" | "medium" | "long") {
  switch (length) {
    case "short":
      return "Entregá 2 líneas breves y muy directas, pensadas para un video corto de 10 a 15 segundos.";
    case "long":
      return "Entregá 5 o 6 líneas breves, claras y concretas, pensadas para un video de 30 a 45 segundos.";
    case "medium":
    default:
      return "Entregá 4 líneas breves, claras y concretas, pensadas para un video de 15 a 30 segundos.";
  }
}

async function fetchSourceMaterial(url: string): Promise<SourceMaterial | null> {
  let html = "";
  let status = 200;

  try {
    const articleResponse = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
        "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      },
      cache: "no-store",
      redirect: "follow",
    });

    status = articleResponse.status;

    if (!articleResponse.ok) {
      return {
        url,
        status,
        title: "",
        description: "",
        articleText: "",
      };
    }

    html = await articleResponse.text();

    return {
      url,
      status,
      title: extractTitle(html),
      description: extractDescription(html),
      articleText: extractReadableText(html),
    };
  } catch {
    return {
      url,
      status: 0,
      title: "",
      description: "",
      articleText: "",
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, urls, length } = body;

    const requestedUrls = [
      ...(Array.isArray(urls) ? urls : []),
      ...(typeof url === "string" ? [url] : []),
    ]
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);

    const uniqueUrls = [...new Set(requestedUrls)];
    const normalizedLength = normalizeLength(length);

    if (!uniqueUrls.length) {
      return NextResponse.json(
        { error: "Falta al menos una URL fuente." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Falta OPENAI_API_KEY en el servidor." },
        { status: 500 }
      );
    }

    const materials = await Promise.all(uniqueUrls.map(fetchSourceMaterial));

    const usableSources = materials.filter((item): item is SourceMaterial => {
      if (!item) return false;
      const combined = [item.title, item.description, item.articleText]
        .filter(Boolean)
        .join("\n\n")
        .trim();
      return combined.length >= 80;
    });

    if (!usableSources.length) {
      return NextResponse.json(
        {
          error:
            "No se pudo extraer suficiente contenido de las fuentes provistas.",
        },
        { status: 400 }
      );
    }

    const systemPrompt = [
      "Sos un redactor periodístico audiovisual.",
      "Debes resumir una noticia en español para un video informativo corto.",
      getLengthInstruction(normalizedLength),
      "Podés recibir varias fuentes sobre el mismo tema.",
      "Integrá la información coincidente y priorizá hechos, protagonistas y contexto útil.",
      "No inventes nada que no esté en el material provisto.",
      "No uses viñetas.",
      "Entregá una línea debajo de la otra.",
    ].join(" ");

    const sourceBlocks = usableSources
      .map(
        (source, index) => `FUENTE ${index + 1}
URL: ${source.url}

Título:
${source.title || "Sin título detectado"}

Descripción:
${source.description || "Sin descripción detectada"}

Contenido extraído:
${source.articleText || "Sin contenido amplio extraído"}

Estado de acceso:
${source.status}`
      )
      .join("\n\n--------------------\n\n");

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
              content: systemPrompt,
            },
            {
              role: "user",
              content: sourceBlocks,
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

    return NextResponse.json({
      summary,
      meta: {
        length: normalizedLength,
        sourcesUsed: usableSources.length,
      },
    });
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

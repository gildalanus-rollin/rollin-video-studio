type Props = {
  title: string;
  imageUrl: string;
  outputFormat: string;
  narrativePreset: string;
  graphicTitleSize?: string | null;
  graphicTitlePosition?: string | null;
  avatarEnabled?: boolean | null;
  subtitleEnabled?: boolean | null;
  subtitlePosition?: string | null;
  subtitleSize?: string | null;
  subtitleText?: string | null;
};

function getAspectClass(outputFormat: string) {
  switch (outputFormat) {
    case "9:16":
      return "aspect-[9/16] max-w-[280px]";
    case "1:1":
      return "aspect-square max-w-[420px]";
    case "16:9":
    default:
      return "aspect-video max-w-[560px]";
  }
}

function getEffectiveTitleSize(
  outputFormat: string,
  requestedSize?: string | null
) {
  if (outputFormat === "1:1" && requestedSize === "lg") return "md";
  if (outputFormat === "9:16" && requestedSize === "lg") return "md";
  return requestedSize || "md";
}

function getTitleSizeClass(
  outputFormat: string,
  requestedSize?: string | null
) {
  const size = getEffectiveTitleSize(outputFormat, requestedSize);

  if (outputFormat === "9:16") {
    switch (size) {
      case "sm":
        return "text-sm leading-tight";
      case "lg":
        return "text-2xl leading-[1.05]";
      case "md":
      default:
        return "text-xl leading-[1.08]";
    }
  }

  if (outputFormat === "1:1") {
    switch (size) {
      case "sm":
        return "text-lg leading-tight";
      case "lg":
        return "text-3xl leading-[1.04]";
      case "md":
      default:
        return "text-2xl leading-[1.06]";
    }
  }

  switch (size) {
    case "sm":
      return "text-base md:text-xl leading-tight";
    case "lg":
      return "text-2xl md:text-4xl leading-[1.02]";
    case "md":
    default:
      return "text-xl md:text-3xl leading-[1.05]";
  }
}

function getSubtitleSizeClass(
  outputFormat: string,
  size?: string | null
) {
  if (outputFormat === "9:16") {
    switch (size) {
      case "sm":
        return "text-[10px]";
      case "lg":
        return "text-sm";
      case "md":
      default:
        return "text-xs";
    }
  }

  switch (size) {
    case "sm":
      return "text-[10px] md:text-xs";
    case "lg":
      return "text-sm md:text-base";
    case "md":
    default:
      return "text-xs md:text-sm";
  }
}

function getTitlePositionClasses(
  position?: string | null,
  subtitleEnabled?: boolean | null,
  subtitlePosition?: string | null
) {
  const subtitleAtBottom =
    subtitleEnabled &&
    (subtitlePosition === "bottom-left" ||
      subtitlePosition === "bottom-center" ||
      subtitlePosition === "bottom-right" ||
      !subtitlePosition);

  switch (position) {
    case "top-left":
      return "left-0 top-0 items-start p-4 md:p-5";
    case "top-center":
      return "inset-x-0 top-0 items-center p-4 md:p-5";
    case "top-right":
      return "right-0 top-0 items-end p-4 md:p-5";
    case "bottom-center":
      return subtitleAtBottom
        ? "inset-x-0 bottom-16 items-center p-4 md:p-5"
        : "inset-x-0 bottom-0 items-center p-4 md:p-5";
    case "bottom-right":
      return subtitleAtBottom
        ? "right-0 bottom-16 items-end p-4 md:p-5"
        : "right-0 bottom-0 items-end p-4 md:p-5";
    case "bottom-left":
    default:
      return subtitleAtBottom
        ? "left-0 bottom-16 items-start p-4 md:p-5"
        : "left-0 bottom-0 items-start p-4 md:p-5";
  }
}

function getSubtitlePositionClasses(position?: string | null) {
  switch (position) {
    case "top-left":
      return "left-4 top-4 justify-start";
    case "top-center":
      return "inset-x-0 top-4 justify-center px-4";
    case "top-right":
      return "right-4 top-4 justify-end";
    case "bottom-left":
      return "left-4 bottom-3 justify-start";
    case "bottom-right":
      return "right-4 bottom-3 justify-end";
    case "bottom-center":
    default:
      return "inset-x-0 bottom-3 justify-center px-4";
  }
}

function splitLongBlock(block: string) {
  const words = block.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= 42) {
      current = candidate;
    } else {
      if (current) chunks.push(current);
      current = word;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

function buildSubtitleBlocks(text?: string | null) {
  const clean = (text || "").trim();
  if (!clean) return [];

  const byLines = clean
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (byLines.length > 1) {
    return byLines.flatMap((line) => splitLongBlock(line)).slice(0, 8);
  }

  const sentences =
    clean.match(/[^.!?\n]+[.!?]?/g)?.map((item) => item.trim()).filter(Boolean) || [];

  if (sentences.length > 0) {
    const blocks: string[] = [];
    let current = "";

    for (const sentence of sentences) {
      const candidate = current ? `${current} ${sentence}` : sentence;

      if (candidate.length <= 64) {
        current = candidate;
      } else {
        if (current) blocks.push(current);
        current = sentence;
      }
    }

    if (current) blocks.push(current);

    return blocks.flatMap((block) => splitLongBlock(block)).slice(0, 8);
  }

  return splitLongBlock(clean).slice(0, 8);
}

function getTitleWidthClass(outputFormat: string) {
  switch (outputFormat) {
    case "9:16":
      return "max-w-[78%]";
    case "1:1":
      return "max-w-[82%]";
    case "16:9":
    default:
      return "max-w-[72%]";
  }
}

function getSubtitleWidthClass(outputFormat: string) {
  switch (outputFormat) {
    case "9:16":
      return "max-w-[78%]";
    case "1:1":
      return "max-w-[82%]";
    case "16:9":
    default:
      return "max-w-[62%]";
  }
}

export default function GraphicPreview({
  title,
  imageUrl,
  outputFormat,
  narrativePreset,
  graphicTitleSize,
  graphicTitlePosition,
  avatarEnabled,
  subtitleEnabled,
  subtitlePosition,
  subtitleSize,
  subtitleText,
}: Props) {
  const showAvatar =
    narrativePreset === "titulo-resumen-foto-avatar" && Boolean(avatarEnabled);

  const subtitleBlocks = buildSubtitleBlocks(subtitleText);
  const previewSubtitle = subtitleBlocks[0] || "";

  return (
    <div className="space-y-4">
      <div
        className={`relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 ${getAspectClass(
          outputFormat
        )}`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Preview gráfica"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-slate-900" />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/75" />

        {showAvatar ? (
          <div className="absolute right-4 top-4 z-20 h-24 w-20 rounded-2xl border border-white/20 bg-slate-800/90 shadow-lg md:h-28 md:w-24">
            <div className="flex h-full items-center justify-center px-2 text-center text-[10px] uppercase tracking-wide text-white/80">
              avatar
            </div>
          </div>
        ) : null}

        <div
          className={`absolute z-10 flex max-w-full ${getTitlePositionClasses(
            graphicTitlePosition,
            subtitleEnabled,
            subtitlePosition
          )}`}
        >
          <div className={getTitleWidthClass(outputFormat)}>
            <div className="inline-flex rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white/85 backdrop-blur">
              preview gráfica
            </div>

            <h3
              className={`mt-3 font-semibold text-white ${getTitleSizeClass(
                outputFormat,
                graphicTitleSize
              )}`}
            >
              {title || "Título del proyecto"}
            </h3>
          </div>
        </div>

        {subtitleEnabled && previewSubtitle ? (
          <div
            className={`absolute z-30 flex ${getSubtitlePositionClasses(
              subtitlePosition
            )}`}
          >
            <div
              className={`${getSubtitleWidthClass(
                outputFormat
              )} rounded-lg border border-white/15 bg-black/75 px-3 py-1.5 text-center font-medium text-white shadow-lg ${getSubtitleSizeClass(
                outputFormat,
                subtitleSize
              )}`}
            >
              <div className="line-clamp-2">{previewSubtitle}</div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 md:grid-cols-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          formato: <span className="font-medium text-slate-900">{outputFormat}</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          preset: <span className="font-medium text-slate-900">{narrativePreset}</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          título: <span className="font-medium text-slate-900">{getEffectiveTitleSize(outputFormat, graphicTitleSize)}</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          avatar: <span className="font-medium text-slate-900">{showAvatar ? "sí" : "no"}</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          subtítulo pos: <span className="font-medium text-slate-900">{subtitlePosition || "bottom-center"}</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          subtítulo size: <span className="font-medium text-slate-900">{subtitleSize || "md"}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-400">
          bloques de subtítulo
        </p>

        {subtitleBlocks.length > 0 ? (
          <div className="mt-3 space-y-2">
            {subtitleBlocks.map((block, index) => (
              <div
                key={`${block}-${index}`}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-700"
              >
                {index + 1}. {block}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            Todavía no hay guion cargado para previsualizar subtítulos.
          </p>
        )}
      </div>
    </div>
  );
}

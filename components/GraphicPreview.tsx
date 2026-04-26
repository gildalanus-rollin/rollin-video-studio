import { buildSubtitleBlocks } from "@/lib/subtitles";

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
  _outputFormat: string,
  requestedSize?: string | null
) {
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
        return "text-base leading-tight";
      case "lg":
        return "text-3xl leading-[1.03]";
      case "md":
      default:
        return "text-3xl leading-[1.04]";
    }
  }

  if (outputFormat === "1:1") {
    switch (size) {
      case "sm":
        return "text-xl leading-tight";
      case "lg":
        return "text-4xl leading-[1.02]";
      case "md":
      default:
        return "text-3xl leading-[1.04]";
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
              {previewSubtitle}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

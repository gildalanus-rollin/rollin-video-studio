type Props = {
  title: string;
  imageUrl: string;
  outputFormat: string;
  narrativePreset: string;
  graphicTitleSize?: string | null;
  graphicTitlePosition?: string | null;
  avatarEnabled?: boolean | null;
  subtitleEnabled?: boolean | null;
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

function getTitleSizeClass(size?: string | null) {
  switch (size) {
    case "sm":
      return "text-base md:text-xl";
    case "lg":
      return "text-xl md:text-3xl";
    case "md":
    default:
      return "text-lg md:text-2xl";
  }
}

function getPositionClasses(position?: string | null) {
  switch (position) {
    case "top-left":
      return "inset-x-0 top-0 p-4 md:p-5 items-start";
    case "top-center":
      return "inset-x-0 top-0 p-4 md:p-5 items-center";
    case "top-right":
      return "inset-x-0 top-0 p-4 md:p-5 items-end";
    case "bottom-center":
      return "inset-x-0 bottom-0 p-4 md:p-5 items-center";
    case "bottom-right":
      return "inset-x-0 bottom-0 p-4 md:p-5 items-end";
    case "bottom-left":
    default:
      return "inset-x-0 bottom-0 p-4 md:p-5 items-start";
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
}: Props) {
  const showAvatar =
    narrativePreset === "titulo-resumen-foto-avatar" && Boolean(avatarEnabled);

  return (
    <div className="space-y-3">
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
          <div className="absolute right-4 top-4 h-24 w-20 rounded-2xl border border-white/20 bg-slate-800/90 shadow-lg md:h-28 md:w-24">
            <div className="flex h-full items-center justify-center px-2 text-center text-[10px] uppercase tracking-wide text-white/80">
              avatar
            </div>
          </div>
        ) : null}

        <div className={`absolute flex ${getPositionClasses(graphicTitlePosition)}`}>
          <div className="max-w-[90%]">
            <div className="inline-flex rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white/85 backdrop-blur">
              preview gráfica
            </div>

            <h3
              className={`mt-3 font-semibold leading-tight text-white ${getTitleSizeClass(
                graphicTitleSize
              )}`}
            >
              {title || "Título del proyecto"}
            </h3>
          </div>
        </div>

        {subtitleEnabled ? (
          <div className="absolute inset-x-0 bottom-3 flex justify-center px-4">
            <div className="rounded-lg bg-black/65 px-3 py-1.5 text-center text-xs font-medium text-white md:text-sm">
              ejemplo de subtítulo en preview
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 md:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          formato: <span className="font-medium text-slate-900">{outputFormat}</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          preset: <span className="font-medium text-slate-900">{narrativePreset}</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          título: <span className="font-medium text-slate-900">{graphicTitleSize || "md"}</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          avatar: <span className="font-medium text-slate-900">{showAvatar ? "sí" : "no"}</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          subtítulos: <span className="font-medium text-slate-900">{subtitleEnabled ? "sí" : "no"}</span>
        </div>
      </div>
    </div>
  );
}

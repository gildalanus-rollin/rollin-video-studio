import GraphicPreview from "@/components/GraphicPreview";
import GraphicSettingsEditor from "@/components/GraphicSettingsEditor";
import PlacasEditor from "@/components/PlacasEditor";

type Props = {
  projectId: string;
  title: string;
  imageUrl: string;
  outputFormat: string;
  narrativePreset: string;
  graphicTitleSize: string;
  graphicTitlePosition: string;
  avatarEnabled: boolean;
  subtitleEnabled: boolean;
  subtitlePosition: string;
  subtitleSize: string;
  subtitleText: string;
  durationLimitSeconds: number;
};

export default function ProjectGraphicPanel({
  projectId,
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
  durationLimitSeconds,
}: Props) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        3. gráfica
      </p>
      <h2 className="mt-2 text-xl font-semibold text-slate-900">
        vista editorial y ajustes visuales
      </h2>

      <div className="mt-5 space-y-4">
        <GraphicPreview
          title={title}
          imageUrl={imageUrl}
          outputFormat={outputFormat}
          narrativePreset={narrativePreset}
          graphicTitleSize={graphicTitleSize}
          graphicTitlePosition={graphicTitlePosition}
          avatarEnabled={avatarEnabled}
          subtitleEnabled={subtitleEnabled}
          subtitlePosition={subtitlePosition}
          subtitleSize={subtitleSize}
          subtitleText={subtitleText}
        />

        <GraphicSettingsEditor
          projectId={projectId}
          initialGraphicTitleSize={graphicTitleSize}
          initialGraphicTitlePosition={graphicTitlePosition}
          initialAvatarEnabled={avatarEnabled}
          initialSubtitlePosition={subtitlePosition}
          initialSubtitleSize={subtitleSize}
        />

        <PlacasEditor projectId={projectId} durationLimitSeconds={durationLimitSeconds} />

        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          Este bloque usa como base la imagen principal del proyecto y el
          guion de render para que la lectura editorial sea más consistente.
        </div>
      </div>
    </section>
  );
}

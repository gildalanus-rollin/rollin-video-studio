import GraphicPreview from "@/components/GraphicPreview";
import GraphicSettingsEditor from "@/components/GraphicSettingsEditor";

type Props = {
  projectId: string;
  title: string;
  imageUrl: string;
  outputFormat: string;
  narrativePreset: string;
  avatarEnabled: boolean;
  subtitleEnabled: boolean;
  subtitleColor: string;
  subtitleText: string;
  category: string;
  date: string;
};

export default function ProjectGraphicPanel({
  projectId,
  title,
  imageUrl,
  outputFormat,
  narrativePreset,
  avatarEnabled,
  subtitleEnabled,
  subtitleColor,
  subtitleText,
  category,
  date,
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-pink-500 to-fuchsia-500" />
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        3. grafica
      </p>
      <h2 className="mt-2 text-xl font-semibold text-slate-900">
        vista editorial y ajustes visuales
      </h2>

      <div className="mt-5 space-y-4">
        <GraphicPreview
          projectId={projectId}
          title={title}
          imageUrl={imageUrl}
          outputFormat={outputFormat}
          narrativePreset={narrativePreset}
          avatarEnabled={avatarEnabled}
          subtitleEnabled={subtitleEnabled}
          subtitleColor={subtitleColor}
          subtitleText={subtitleText}
          category={category}
          date={date}
        />

        <GraphicSettingsEditor
          projectId={projectId}
          initialAvatarEnabled={avatarEnabled}
          initialSubtitleColor={subtitleColor}
        />

        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          Este bloque usa como base la imagen principal del proyecto y el
          guion de render para que la lectura editorial sea mas consistente.
        </div>
      </div>
    </section>
  );
}

import GenerateExportButton from "@/components/GenerateExportButton";

type Props = {
  projectId: string;
};

export default function ProjectExportPanel({ projectId }: Props) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        4. export y render
      </p>
      <h2 className="mt-2 text-xl font-semibold text-slate-900">
        salida del proyecto
      </h2>

      <div className="mt-5 space-y-3">
        <GenerateExportButton projectId={projectId} />

        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
          El export toma el título, el resumen editorial, el render_script,
          la imagen principal y la secuencia visual del proyecto.
        </div>
      </div>
    </section>
  );
}

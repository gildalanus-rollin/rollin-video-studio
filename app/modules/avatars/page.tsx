import Link from "next/link";

const avatarGroups = [
  {
    title: "presentador serio",
    description:
      "Avatares para piezas de política, economía, contexto y noticias duras.",
  },
  {
    title: "explicador neutro",
    description:
      "Perfiles sobrios y claros para videos informativos y resúmenes de datos.",
  },
  {
    title: "entretenimiento / liviano",
    description:
      "Avatares más ágiles para espectáculos, tendencias y contenidos virales.",
  },
  {
    title: "marca editorial",
    description:
      "Perfiles consistentes para generar identidad visual estable en ciertas series.",
  },
];

export default function AvatarsModulePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <Link
          href="/modules"
          className="inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          ← volver a módulos
        </Link>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            módulo
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            avatares IA
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Este módulo organiza los avatares del estudio por intención editorial
            para después poder asignarlos a proyectos, series o formatos.
          </p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {avatarGroups.map((item) => (
          <div
            key={item.title}
            className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              grupo
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              {item.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {item.description}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-[28px] border border-dashed border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm leading-6 text-slate-600">
          Próximo paso de este módulo: mostrar una biblioteca real de avatares
          seleccionables y asociarlos a perfiles editoriales o proyectos.
        </p>
      </section>
    </div>
  );
}

import Link from "next/link";

const musicGroups = [
  {
    title: "tensión / urgente",
    description:
      "Pistas para breaking news, política caliente, economía y temas sensibles.",
  },
  {
    title: "serio / explicativo",
    description:
      "Bases sobrias para informes, contexto, análisis y desarrollo editorial.",
  },
  {
    title: "liviano / espectáculos",
    description:
      "Climas más ágiles para entretenimiento, historias virales y cultura pop.",
  },
  {
    title: "cierre / impacto",
    description:
      "Música para remate final, cierre de pieza y salida con más fuerza.",
  },
];

export default function MusicModulePage() {
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
            música editorial
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Este módulo organiza la música del estudio para que después puedas
            navegar pistas por clima editorial y usar el bucket real <strong>music</strong>.
          </p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {musicGroups.map((item) => (
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
          Próximo paso de este módulo: mostrar y ordenar el contenido real del
          bucket <strong>music</strong> de Supabase.
        </p>
      </section>
    </div>
  );
}

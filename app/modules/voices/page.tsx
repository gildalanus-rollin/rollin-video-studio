import Link from "next/link";

const voiceGroups = [
  {
    title: "seria informativa",
    description:
      "Locución sobria para política, economía, informes y desarrollo editorial.",
  },
  {
    title: "urgente / breaking",
    description:
      "Voz con más tensión y velocidad para noticias de alto impacto o último momento.",
  },
  {
    title: "explicativa / clara",
    description:
      "Tono didáctico para piezas que ordenan datos, contexto y explicación.",
  },
  {
    title: "liviana / entretenimiento",
    description:
      "Lectura más ágil para espectáculos, curiosidades, historias virales y cultura pop.",
  },
];

export default function VoicesModulePage() {
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
            voces IA
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Este módulo organiza las voces del estudio por intención editorial,
            para después poder elegir narración según el tipo de video.
          </p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {voiceGroups.map((item) => (
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
          Próximo paso de este módulo: convertir estas categorías en una biblioteca
          real de voces seleccionables dentro del flujo de producción.
        </p>
      </section>
    </div>
  );
}

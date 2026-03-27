import Link from "next/link";

const modules = [
  {
    title: "assets",
    description:
      "Imágenes, videos, overlays, recursos visuales y materiales de apoyo.",
    status: "activo",
    href: "/modules/assets",
  },
  {
    title: "prompts editoriales",
    description:
      "Perfiles, enfoques de redacción, tonos y estructuras para cada video.",
    status: "activo",
    href: "/modules/prompts",
  },
  {
    title: "voces IA",
    description:
      "Selección de voces, estilos narrativos y configuración de locución.",
    status: "activo",
    href: "/modules/voices",
  },
  {
    title: "música",
    description:
      "Biblioteca musical para climas, ritmos y cierres editoriales.",
    status: "activo",
    href: "/modules/music",
  },
  {
    title: "avatares",
    description:
      "Presentadores o figuras IA para piezas automatizadas o híbridas.",
    status: "activo",
    href: "/modules/avatars",
  },
  {
    title: "exportaciones",
    description:
      "Salidas finales, formatos, versiones y control del material entregable.",
    status: "activo",
    href: "/modules/exports",
  },
];

export default function ModulesPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              módulos
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              centro de módulos del estudio
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Esta sección organiza las piezas clave del flujo editorial:
              materiales, prompts, voces, música, avatares y exportaciones.
            </p>
          </div>

          <Link
            href="/projects"
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            volver a proyectos
          </Link>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {modules.map((module) =>
          module.href ? (
            <Link
              key={module.title}
              href={module.href}
              className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {module.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {module.description}
                  </p>
                </div>

                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  {module.status}
                </span>
              </div>
            </Link>
          ) : (
            <div
              key={module.title}
              className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {module.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {module.description}
                  </p>
                </div>

                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  {module.status}
                </span>
              </div>
            </div>
          )
        )}
      </section>
    </div>
  );
}

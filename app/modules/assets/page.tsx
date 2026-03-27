import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function AssetsModulePage() {
  const [imagesRes, videosRes, musicRes, avatarsRes, exportsRes] =
    await Promise.all([
      supabase.storage.from("images").list("", { limit: 10 }),
      supabase.storage.from("videos").list("", { limit: 10 }),
      supabase.storage.from("music").list("", { limit: 10 }),
      supabase.storage.from("avatars").list("", { limit: 10 }),
      supabase.storage.from("exports").list("", { limit: 10 }),
    ]);

  const buckets = [
    {
      title: "images",
      description:
        "Fotos, placas, fondos, recursos gráficos y material visual de apoyo.",
      href: "/modules/assets/images",
      result: imagesRes,
    },
    {
      title: "videos",
      description:
        "Clips, recortes, videos fuente, tomas secundarias y material de archivo.",
      href: "/modules/assets/videos",
      result: videosRes,
    },
    {
      title: "music",
      description:
        "Bases, climas, pistas de tensión, ambientación y cierres musicales.",
      href: "/modules/assets/music",
      result: musicRes,
    },
    {
      title: "avatars",
      description:
        "Recursos visuales o identidades IA para presentadores y piezas automáticas.",
      href: "/modules/assets/avatars",
      result: avatarsRes,
    },
    {
      title: "exports",
      description:
        "Versiones finales, renders, entregables y salidas listas para publicar.",
      href: "/modules/exports",
      result: exportsRes,
    },
  ];

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
            assets del estudio
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Este módulo ahora chequea el estado real de los buckets de Supabase
            para mostrar si están conectados, vacíos o con error.
          </p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {buckets.map((item) => {
          const hasError = !!item.result.error;
          const count = item.result.data?.length ?? 0;

          const statusLabel = hasError
            ? "error"
            : count > 0
            ? `${count} visibles`
            : "vacío";

          const statusClass = hasError
            ? "border-red-200 bg-red-50 text-red-700"
            : count > 0
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-slate-200 bg-slate-50 text-slate-600";

          return (
            <Link
              key={item.title}
              href={item.href}
              className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                    bucket
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>
                </div>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClass}`}
                >
                  {statusLabel}
                </span>
              </div>

              {item.result.error ? (
                <p className="mt-4 text-sm text-red-600">
                  {item.result.error.message}
                </p>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  {count > 0
                    ? "El bucket devolvió contenido visible."
                    : "El bucket respondió, pero no devolvió archivos visibles en la raíz."}
                </p>
              )}
            </Link>
          );
        })}
      </section>
    </div>
  );
}

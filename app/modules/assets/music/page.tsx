import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AssetSelectButton from "@/components/AssetSelectButton";

type PageProps = {
  searchParams: Promise<{
    projectId?: string;
  }>;
};

export default async function MusicAssetsPage({ searchParams }: PageProps) {
  const { projectId } = await searchParams;

  const { data, error } = await supabase.storage
    .from("music")
    .list("", {
      limit: 50,
      sortBy: { column: "name", order: "asc" },
    });

  const files = data ?? [];

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <Link
          href={projectId ? `/projects/${projectId}` : "/modules/assets"}
          className="inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          ← {projectId ? "volver al proyecto" : "volver a assets"}
        </Link>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            assets
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            music
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Esta sección intenta leer el bucket <strong>music</strong> de Supabase
            y mostrar los archivos disponibles.
          </p>

          {projectId ? (
            <div className="mt-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              seleccionando una música para este proyecto
            </div>
          ) : null}
        </div>
      </section>

      {error ? (
        <section className="rounded-[28px] border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm font-medium text-red-700">
            Error al leer el bucket music: {error.message}
          </p>
          <p className="mt-2 text-sm text-red-600">
            Esto no rompe la app. Solo indica que todavía falta permiso o acceso
            correcto al bucket.
          </p>
        </section>
      ) : files.length === 0 ? (
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">
            El bucket <strong>music</strong> respondió, pero no devolvió archivos.
          </p>
        </section>
      ) : (
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                bucket real
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">
                archivos encontrados
              </h2>
            </div>

            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              {files.length} archivos
            </span>
          </div>

          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id ?? file.name}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-sm font-medium text-slate-900">{file.name}</p>

                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                  {file.created_at ? (
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
                      creado: {new Date(file.created_at).toLocaleString("es-AR")}
                    </span>
                  ) : null}

                  {file.updated_at ? (
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
                      actualizado: {new Date(file.updated_at).toLocaleString("es-AR")}
                    </span>
                  ) : null}
                </div>

                {projectId ? (
                  <AssetSelectButton
                    projectId={projectId}
                    assetType="music"
                    assetValue={`music/${file.name}`}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Project = {
  id: string;
  title: string;
  category: string | null;
  status: string;
  duration_limit_seconds: number;
  output_format: string;
  created_at: string;
  main_source_url: string | null;
};

export default async function ProjectsPage() {
  let projects: Project[] = [];
  let errorMessage = "";

  try {
    const { data, error } = await supabase
      .from("projects")
      .select(
        "id, title, category, status, duration_limit_seconds, output_format, created_at, main_source_url"
      )
      .order("created_at", { ascending: false });

    if (error) {
      errorMessage = error.message;
    }

    projects = (data ?? []) as Project[];
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Error al leer proyectos";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            proyectos
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            panel de proyectos
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Acá ves todos los proyectos guardados en la base, con acceso rápido al
            detalle y a la fuente principal.
          </p>
        </div>

        <Link
          href="/projects/new"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          nuevo proyecto
        </Link>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Error al leer proyectos: {errorMessage}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          No hay proyectos cargados todavía.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {project.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {project.category ?? "General"}
                  </p>
                </div>

                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  {project.status}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    duración
                  </p>
                  <p className="mt-1 font-medium text-slate-900">
                    {project.duration_limit_seconds}s
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    formato
                  </p>
                  <p className="mt-1 font-medium text-slate-900">
                    {project.output_format}
                  </p>
                </div>
              </div>

              <div className="mt-4 text-sm text-slate-500">
                Creado: {new Date(project.created_at).toLocaleString("es-AR")}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {project.main_source_url ? (
                  <a
                    href={project.main_source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    ver fuente principal
                  </a>
                ) : (
                  <span className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                    sin fuente principal
                  </span>
                )}

                <Link
                  href={`/projects/${project.id}`}
                  className="inline-flex items-center rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  ver detalle
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

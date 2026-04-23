export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import DeleteProjectButton from "@/components/DeleteProjectButton";

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

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-amber-50 text-amber-700 border-amber-200",
  ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
  archived: "bg-slate-100 text-slate-500 border-slate-200",
};

export default async function ProjectsPage() {
  let projects: Project[] = [];
  let errorMessage = "";

  try {
    const { data, error } = await supabase
      .from("projects")
      .select("id, title, category, status, duration_limit_seconds, output_format, created_at, main_source_url")
      .order("created_at", { ascending: false });

    if (error) errorMessage = error.message;
    projects = (data ?? []) as Project[];
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Error al leer proyectos";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            redaccion
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Proyectos
          </h1>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          + Nuevo proyecto
        </Link>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {!errorMessage && projects.length === 0 && (
        <div className="rounded-[28px] border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-700">No hay proyectos todavía</p>
          <Link
            href="/projects/new"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            + Nuevo proyecto
          </Link>
        </div>
      )}

      {projects.length > 0 && (
        <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={"flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50" + (index !== 0 ? " border-t border-slate-100" : "")}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={"inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium " + (STATUS_COLORS[project.status] ?? STATUS_COLORS.draft)}>
                    {project.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    {project.category ?? "general"}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                  {project.title}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {project.output_format} · {project.duration_limit_seconds}s · {new Date(project.created_at).toLocaleDateString("es-AR")}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {project.main_source_url && (
                  <a
                    href={String(project.main_source_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    fuente
                  </a>
                )}
                <Link
                  href={"/projects/" + project.id}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800"
                >
                  editar
                </Link>
                <DeleteProjectButton
                  projectId={project.id}
                  projectTitle={project.title}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

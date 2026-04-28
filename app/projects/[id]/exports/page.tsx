import { getSupabaseAdmin } from "@/lib/supabase-admin";
import Link from "next/link";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectExportsPage({ params }: PageProps) {
  const { id: projectId } = await params;
  const supabase = getSupabaseAdmin();

  const { data: project } = await supabase
    .from("projects")
    .select("title")
    .eq("id", projectId)
    .single();

  const { data: exports } = await supabase
    .from("project_exports")
    .select("id, video_url, duration_seconds, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href={`/projects/${projectId}`} className="text-sm text-slate-400 hover:text-slate-700">
          ← volver al proyecto
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Exports</h1>
        {project?.title && <p className="mt-1 text-sm text-slate-500">{project.title}</p>}
      </div>

      {!exports || exports.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-sm text-slate-500">No hay exports todavía.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
          {exports.map((exp, index) => (
            <div
              key={exp.id}
              className={"flex items-center justify-between gap-4 px-5 py-4 " + (index !== 0 ? "border-t border-slate-100" : "")}
            >
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Export {exports.length - index}
                  {exp.duration_seconds && (
                    <span className="ml-2 text-xs text-slate-400">{exp.duration_seconds}s</span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {new Date(exp.created_at).toLocaleString("es-AR")}
                </p>
              </div>
              <a
                href={exp.video_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
              >
                ver video
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

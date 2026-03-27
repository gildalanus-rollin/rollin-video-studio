import Link from "next/link";
import { supabase } from "@/lib/supabase";

type PromptProfile = {
  id: string;
  name: string;
  category: string | null;
  tone: string | null;
  max_duration_seconds: number;
  use_avatar: boolean;
  subtitle_style: string;
};

export default async function PromptsModulePage() {
  const { data, error } = await supabase
    .from("prompt_profiles")
    .select(
      "id, name, category, tone, max_duration_seconds, use_avatar, subtitle_style"
    )
    .eq("active", true)
    .order("name");

  const profiles = (data ?? []) as PromptProfile[];

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
            prompts editoriales
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Acá se concentran los perfiles editoriales activos para definir tono,
            duración, uso de avatar y estilo de subtítulos.
          </p>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Error al leer prompt_profiles: {error.message}
        </div>
      ) : profiles.length === 0 ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          No hay perfiles editoriales activos.
        </div>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {profile.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {profile.category ?? "General"}
                  </p>
                </div>

                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  {profile.max_duration_seconds}s
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    tono
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {profile.tone ?? "No definido"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    avatar IA
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {profile.use_avatar ? "sí" : "no"}
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  subtitulado
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {profile.subtitle_style}
                </p>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

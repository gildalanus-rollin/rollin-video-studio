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

const quickActions = [
  {
    title: "nuevo proyecto",
    description: "Creá una noticia o pieza nueva con estructura editorial clara.",
    href: "/projects/new",
  },
  {
    title: "ver proyectos",
    description: "Revisá borradores, estados y materiales ya cargados.",
    href: "/projects",
  },
  {
    title: "biblioteca editorial",
    description: "Pensado para assets, prompts, voces, música y avatares IA.",
    href: "/projects",
  },
];

const modules = [
  "assets visuales",
  "prompts editoriales",
  "voces IA",
  "música",
  "avatares",
  "subtítulos",
];

export default async function Home() {
  const { data, error } = await supabase
    .from("prompt_profiles")
    .select(
      "id, name, category, tone, max_duration_seconds, use_avatar, subtitle_style"
    )
    .eq("active", true)
    .order("name");

  const profiles = (data ?? []) as PromptProfile[];

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              home
            </p>

            <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              un estudio editorial claro, cómodo y listo para producir
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Esta base ya está conectada a Supabase y preparada para crecer como
              una plataforma de producción: proyectos, cargas editoriales, assets,
              perfiles de tono, voces, música y flujos simples pero sólidos.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/projects/new"
                className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                crear proyecto
              </Link>

              <Link
                href="/projects"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                abrir panel de proyectos
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              estado general
            </p>

            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">stack</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  Next.js + Supabase + Railway
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">perfiles activos</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {profiles.length}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">objetivo visual</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  limpio, profesional y productivo
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {quickActions.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
          >
            <p className="text-lg font-semibold text-slate-900">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {item.description}
            </p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                módulos base
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">
                estructura del estudio
              </h2>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {modules.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            base editorial
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">
            perfiles activos desde Supabase
          </h2>

          <div className="mt-6">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Error al leer Supabase: {error.message}
              </div>
            ) : profiles.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                No hay perfiles activos todavía.
              </div>
            ) : (
              <div className="space-y-3">
                {profiles.slice(0, 4).map((profile) => (
                  <div
                    key={profile.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">
                          {profile.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {profile.category ?? "General"} ·{" "}
                          {profile.tone ?? "Sin tono definido"}
                        </p>
                      </div>

                      <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {profile.max_duration_seconds}s
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                      <span className="rounded-full border border-slate-200 px-2.5 py-1">
                        avatar: {profile.use_avatar ? "sí" : "no"}
                      </span>
                      <span className="rounded-full border border-slate-200 px-2.5 py-1">
                        subtítulos: {profile.subtitle_style}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

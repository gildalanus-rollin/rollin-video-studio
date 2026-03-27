"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const categories = [
  "General",
  "Política",
  "Economía",
  "Sociedad",
  "Espectáculos",
  "Deportes",
  "Tecnología",
];

const formats = ["9:16", "16:9", "Ambos"];

const durations = [30, 45, 60, 90];

const subtitleStyles = ["Burned-in", "Dinámicos", "Limpios", "Sin subtítulos"];

export default function NewProjectPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [mainSourceUrl, setMainSourceUrl] = useState("");
  const [secondarySources, setSecondarySources] = useState("");
  const [category, setCategory] = useState("General");
  const [duration, setDuration] = useState(60);
  const [format, setFormat] = useState("9:16");
  const [subtitleStyle, setSubtitleStyle] = useState("Burned-in");
  const [loading, setLoading] = useState(false);

  const isDisabled = loading || title.trim().length < 4;

  const handleCreate = async () => {
    if (isDisabled) return;

    setLoading(true);

    const formattedNotes = secondarySources.trim()
      ? `Fuentes secundarias:\n${secondarySources.trim()}`
      : null;

    const { error } = await supabase.from("projects").insert([
      {
        title: title.trim(),
        category,
        status: "draft",
        duration_limit_seconds: duration,
        output_format: format,
        main_source_url: mainSourceUrl.trim() || null,
        notes: formattedNotes,
      },
    ]);

    setLoading(false);

    if (error) {
      alert("Error al crear proyecto");
      return;
    }

    router.push("/projects");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          nuevo proyecto
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          crear pieza editorial
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Empezá una noticia o video nuevo con una estructura simple, clara y
          pensada para el flujo editorial.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                título del proyecto
              </label>
              <input
                placeholder="Ej: Milei habló en el Congreso y dejó una frase fuerte"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <p className="mt-2 text-xs text-slate-500">
                Usá un título de trabajo claro. Después lo podés ajustar.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                fuente principal
              </label>
              <input
                type="url"
                placeholder="Pegá acá el link principal de la noticia, video o fuente"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                value={mainSourceUrl}
                onChange={(e) => setMainSourceUrl(e.target.value)}
              />
              <p className="mt-2 text-xs text-slate-500">
                Esto se guarda como referencia principal del proyecto.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                fuentes secundarias
              </label>
              <textarea
                rows={6}
                placeholder={"Pegá acá varias fuentes, una por línea\nhttps://sitio1.com/nota\nhttps://sitio2.com/video\nhttps://sitio3.com/galeria"}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                value={secondarySources}
                onChange={(e) => setSecondarySources(e.target.value)}
              />
              <p className="mt-2 text-xs text-slate-500">
                Podés mezclar notas, videos, galerías o cualquier otra fuente útil para el resumen.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                categoría
              </label>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-slate-700">
                duración objetivo
              </label>
              <div className="flex flex-wrap gap-3">
                {durations.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setDuration(item)}
                    className={
                      duration === item
                        ? "rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                        : "rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    }
                  >
                    {item}s
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-slate-700">
                formato de salida
              </label>
              <div className="flex flex-wrap gap-3">
                {formats.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFormat(item)}
                    className={
                      format === item
                        ? "rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                        : "rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    }
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                subtitulado
              </label>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                value={subtitleStyle}
                onChange={(e) => setSubtitleStyle(e.target.value)}
              >
                {subtitleStyles.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-500">
                Esto por ahora queda en la interfaz para definir el estilo editorial.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleCreate}
                disabled={isDisabled}
                className={
                  isDisabled
                    ? "inline-flex items-center rounded-xl bg-slate-300 px-5 py-3 text-sm font-medium text-white"
                    : "inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                }
              >
                {loading ? "creando..." : "crear proyecto"}
              </button>
            </div>
          </div>
        </section>

        <aside className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            resumen
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">
            configuración inicial
          </h2>

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                título
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {title.trim() || "sin definir todavía"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                fuente principal
              </p>
              <p className="mt-1 break-all text-sm font-medium text-slate-900">
                {mainSourceUrl.trim() || "sin link cargado todavía"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                fuentes secundarias
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-slate-900">
                {secondarySources.trim() || "sin fuentes secundarias todavía"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                categoría
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {category}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                duración
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {duration} segundos
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                formato
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {format}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                subtitulado
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {subtitleStyle}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              Esta pantalla después puede crecer con fuente principal, assets,
              prompt editorial, voz, música y avatar IA. Ahora también permite
              elegir salida vertical, horizontal o ambas.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

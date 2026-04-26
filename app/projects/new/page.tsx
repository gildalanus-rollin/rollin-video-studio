"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["General", "Política", "Economía", "Sociedad", "Espectáculos", "Deportes", "Tecnología", "Música", "Life Style", "Internacional"];
const FORMATS = ["9:16", "16:9", "1:1"];
const DURATIONS = [15, 30, 45, 60];

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [mainSourceUrl, setMainSourceUrl] = useState("");
  const [category, setCategory] = useState("General");
  const [duration, setDuration] = useState(30);
  const [format, setFormat] = useState("9:16");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isDisabled = loading || title.trim().length < 4;

  const handleCreate = async () => {
    if (isDisabled) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          duration_limit_seconds: duration,
          output_format: format,
          main_source_url: mainSourceUrl.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "No se pudo crear el proyecto.");
        return;
      }
      router.push("/projects/" + json.id);
      router.refresh();
    } catch {
      setError("No se pudo crear el proyecto. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">nueva pieza</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Crear proyecto</h1>
      </div>
      <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Título <span className="text-slate-400">(mínimo 4 caracteres)</span></label>
            <input placeholder="Ej: Milei habló en el Congreso" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Fuente principal</label>
            <input type="url" placeholder="https://..." className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400" value={mainSourceUrl} onChange={(e) => setMainSourceUrl(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Categoría</label>
            <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Duración</label>
              <div className="flex gap-2">
                {DURATIONS.map((d) => (<button key={d} type="button" onClick={() => setDuration(d)} className={duration === d ? "flex-1 rounded-xl bg-slate-900 py-2 text-sm font-medium text-white" : "flex-1 rounded-xl border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"}>{d}s</button>))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Formato</label>
              <div className="flex gap-2">
                {FORMATS.map((f) => (<button key={f} type="button" onClick={() => setFormat(f)} className={format === f ? "flex-1 rounded-xl bg-slate-900 py-2 text-sm font-medium text-white" : "flex-1 rounded-xl border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"}>{f}</button>))}
              </div>
            </div>
          </div>
          {error && (<p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>)}
          <div className="flex items-center gap-3 pt-1">
            <button onClick={handleCreate} disabled={isDisabled} className={isDisabled ? "rounded-xl bg-slate-300 px-5 py-2.5 text-sm font-medium text-white" : "rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"}>{loading ? "creando..." : "Crear proyecto"}</button>
            <a href="/projects" className="text-sm text-slate-400 transition hover:text-slate-600">cancelar</a>
          </div>
        </div>
      </div>
    </div>
  );
}

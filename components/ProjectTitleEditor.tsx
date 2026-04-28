"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  projectId: string;
  initialTitle: string;
};

export default function ProjectTitleEditor({ projectId, initialTitle }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [seoSuggestions, setSeoSuggestions] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const cleanTitle = title.trim();
    if (!cleanTitle) { setSaving(false); setMessage("El título no puede quedar vacío."); return; }
    try {
      const response = await fetch("/api/update-project-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, title: cleanTitle }),
      });
      const result = await response.json();
      setSaving(false);
      if (!response.ok) { setMessage(`Error: ${result.error || "Error desconocido"}`); return; }
      setMessage("Título guardado.");
      router.push(`/projects/${projectId}`);
      router.refresh();
    } catch (error) {
      setSaving(false);
      setMessage(error instanceof Error ? error.message : "Error al guardar.");
    }
  };

  const handleGenerateSEO = async () => {
    setGenerating(true);
    setMessage("");
    setSeoSuggestions("");
    try {
      const response = await fetch("/api/generate-seo-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const result = await response.json();
      setGenerating(false);
      if (!response.ok) { setMessage(result.error || "Error al generar títulos SEO."); return; }
      setSeoSuggestions(result.suggestions);
    } catch (error) {
      setGenerating(false);
      setMessage(error instanceof Error ? error.message : "Error inesperado.");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">título del proyecto</p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Editar título"
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
        />
        <button type="button" onClick={handleSave} disabled={saving}
          className={saving ? "rounded-xl bg-slate-300 px-4 py-3 text-sm font-medium text-white" : "rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"}>
          {saving ? "guardando..." : "guardar título"}
        </button>
        <button type="button" onClick={handleGenerateSEO} disabled={generating}
          className={generating ? "rounded-xl bg-slate-300 px-4 py-3 text-sm font-medium text-white" : "rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"}>
          {generating ? "generando..." : "✦ SEO"}
        </button>
      </div>
      {message && <p className="mt-3 text-sm text-slate-500">{message}</p>}
      {seoSuggestions && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">sugerencias SEO</p>
          <pre className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{seoSuggestions}</pre>
        </div>
      )}
    </div>
  );
}

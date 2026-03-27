"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { buildProjectNotes } from "@/lib/projectNotes";

type Props = {
  projectId: string;
  mainSourceUrl: string;
  initialSecondarySources: string[];
  initialSummary: string;
  initialSelectedImage: string;
  initialSelectedVideo: string;
  initialSelectedMusic: string;
  initialExternalImageUrl: string;
  initialExternalVideoUrl: string;
};

export default function ProjectSummaryEditor({
  projectId,
  mainSourceUrl,
  initialSecondarySources,
  initialSummary,
  initialSelectedImage,
  initialSelectedVideo,
  initialSelectedMusic,
  initialExternalImageUrl,
  initialExternalVideoUrl,
}: Props) {
  const [summary, setSummary] = useState(initialSummary);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");

  const saveSummaryValue = async (nextSummary: string) => {
    const notes = buildProjectNotes({
      secondarySources: initialSecondarySources,
      summary: nextSummary,
      selectedImage: initialSelectedImage,
      selectedVideo: initialSelectedVideo,
      selectedMusic: initialSelectedMusic,
      externalImageUrl: initialExternalImageUrl,
      externalVideoUrl: initialExternalVideoUrl,
      narrationMode: "",
    });

    const { error } = await supabase
      .from("projects")
      .update({ notes })
      .eq("id", projectId);

    return error;
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    const error = await saveSummaryValue(summary);

    setSaving(false);

    if (error) {
      setMessage("Error al guardar el resumen.");
      return;
    }

    setMessage("Resumen guardado.");
  };

  const handleGenerate = async () => {
    if (!mainSourceUrl) {
      setMessage("Este proyecto no tiene fuente principal.");
      return;
    }

    setGenerating(true);
    setMessage("");

    try {
      const response = await fetch("/api/generate-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: mainSourceUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        setGenerating(false);
        setMessage(result?.error || "No se pudo generar el resumen.");
        return;
      }

      const generatedSummary = result.summary || "";
      setSummary(generatedSummary);

      const error = await saveSummaryValue(generatedSummary);

      setGenerating(false);

      if (error) {
        setMessage("Se generó el resumen, pero no se pudo guardar.");
        return;
      }

      setMessage("Resumen generado y guardado.");
    } catch (error) {
      setGenerating(false);
      setMessage(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al generar el resumen."
      );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">
        resumen base / texto animado
      </p>

      <textarea
        rows={10}
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="Escribí acá el resumen base que después puede convertirse en texto animado sobre fotos o video."
        className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-slate-400"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className={
            generating
              ? "rounded-xl bg-slate-300 px-4 py-2 text-sm font-medium text-white"
              : "rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          }
        >
          {generating ? "generando..." : "generar desde fuente principal"}
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={
            saving
              ? "rounded-xl bg-slate-300 px-4 py-2 text-sm font-medium text-white"
              : "rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          }
        >
          {saving ? "guardando..." : "guardar resumen"}
        </button>

        {message ? (
          <span className="text-sm text-slate-500">{message}</span>
        ) : null}
      </div>
    </div>
  );
}

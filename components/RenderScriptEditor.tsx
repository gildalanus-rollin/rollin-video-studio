"use client";

import { useState } from "react";

type Props = {
  projectId: string;
  initialRenderScript: string;
  title?: string;
  summary?: string;
  durationLimitSeconds?: number;
};

export default function RenderScriptEditor({
  projectId,
  initialRenderScript,
  title = "",
  summary = "",
  durationLimitSeconds = 15,
}: Props) {
  const [renderScript, setRenderScript] = useState(initialRenderScript || "");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");

  const saveRenderScriptValue = async (nextRenderScript: string) => {
    const response = await fetch("/api/save-render-script", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectId,
        renderScript: nextRenderScript,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "No se pudo guardar el guion.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      await saveRenderScriptValue(renderScript);
      setMessage("Guion guardado.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Error al guardar guion: ${error.message}`
          : "Error al guardar guion."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!summary.trim()) {
      setMessage("Primero generá o escribí un resumen base.");
      return;
    }

    setGenerating(true);
    setMessage("");

    try {
      const response = await fetch("/api/generate-render-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          summary,
          durationLimitSeconds,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result?.error || "No se pudo generar la locución.");
        return;
      }

      const generatedRenderScript = result.renderScript || "";
      setRenderScript(generatedRenderScript);

      await saveRenderScriptValue(generatedRenderScript);
      setMessage("Locución generada y guardada.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al generar la locución."
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">
        guion de locución / avatar / subtítulos
      </p>

      <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-600">
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
          duración: <span className="font-medium text-slate-900">{durationLimitSeconds}s</span>
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
          subtítulos: <span className="font-medium text-slate-900">siguen esta locución</span>
        </span>
      </div>

      <textarea
        rows={10}
        value={renderScript}
        onChange={(e) => setRenderScript(e.target.value)}
        placeholder="Acá va el texto que efectivamente va a decir el avatar o la locución. Los subtítulos deben seguir este guion, no el resumen editorial."
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
          {generating ? "generando..." : "generar locución"}
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
          {saving ? "guardando..." : "guardar guion"}
        </button>

        {message ? <span className="text-sm text-slate-500">{message}</span> : null}
      </div>
    </div>
  );
}

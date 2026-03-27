"use client";

import { useState } from "react";

type Props = {
  projectId: string;
};

export default function GenerateExportButton({ projectId }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/render-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResult(`Error: ${data.error || "No se pudo generar el video."}`);
        setLoading(false);
        return;
      }

      setResult(`Video generado en: ${data.outputLocation}`);
      setLoading(false);
    } catch (error) {
      setResult(
        error instanceof Error
          ? `Error: ${error.message}`
          : "Error inesperado al generar el video."
      );
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">
        export final
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className={
            loading
              ? "rounded-xl bg-slate-300 px-4 py-2 text-sm font-medium text-white"
              : "rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          }
        >
          {loading ? "generando video..." : "generar video mp4"}
        </button>
      </div>

      {result ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
          {result}
        </div>
      ) : null}
    </div>
  );
}

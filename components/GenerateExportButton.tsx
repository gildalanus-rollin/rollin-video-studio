"use client";

import { useState } from "react";

type Props = {
  projectId: string;
};

export default function GenerateExportButton({ projectId }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const handleGenerate = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/generate-export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResult(`Error: ${data.error || "No se pudo generar el export."}`);
        setLoading(false);
        return;
      }

      setResult(JSON.stringify(data.export, null, 2));
      setLoading(false);
    } catch (error) {
      setResult(
        error instanceof Error
          ? `Error: ${error.message}`
          : "Error inesperado al generar el export."
      );
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">
        generar export
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
          {loading ? "generando..." : "generar export"}
        </button>
      </div>

      {result ? (
        <pre className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-6 text-slate-700">
{result}
        </pre>
      ) : null}
    </div>
  );
}

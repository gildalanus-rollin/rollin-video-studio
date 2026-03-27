"use client";

import { useState } from "react";

type Props = {
  projectId: string;
};

export default function GenerateExportButton({ projectId }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [fileName, setFileName] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setResult("");
    setVideoUrl("");
    setFileName("");

    try {
      const response = await fetch("/api/render-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setResult(`Error: ${data.error || "No se pudo generar el video."}`);
        setLoading(false);
        return;
      }

      setFileName(data.fileName || "");
      setVideoUrl(data.url || "");
      setResult("Video generado correctamente.");
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

        {videoUrl ? (
          <a
            href={videoUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            ver video
          </a>
        ) : null}
      </div>

      {result ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
          <p>{result}</p>
          {fileName ? <p className="mt-2">Archivo: {fileName}</p> : null}
          {videoUrl ? (
            <p className="mt-2 break-all">
              URL:{" "}
              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
              >
                {videoUrl}
              </a>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

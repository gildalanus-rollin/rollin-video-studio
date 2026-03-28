"use client";

import { useState } from "react";

type Props = {
  projectId: string;
};

export default function GenerateExportButton({ projectId }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [fileName, setFileName] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setMessage("");
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
      setLoading(false);

      if (!response.ok || !data.success) {
        setMessage(`Error: ${data.error || "No se pudo generar el video."}`);
        return;
      }

      setFileName(data.fileName || "");
      setVideoUrl(data.url || "");
      setMessage("Video generado correctamente.");
    } catch (error) {
      setLoading(false);
      setMessage(
        error instanceof Error
          ? `Error: ${error.message}`
          : "Error inesperado al generar el video."
      );
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

      {message ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
          <p>{message}</p>
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

"use client";

import { useState } from "react";

type Props = {
  projectId: string;
  initialRenderScript: string;
};

export default function RenderScriptEditor({
  projectId,
  initialRenderScript,
}: Props) {
  const [renderScript, setRenderScript] = useState(initialRenderScript || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/save-render-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          renderScript,
        }),
      });

      const result = await response.json();
      setSaving(false);

      if (!response.ok) {
        setMessage(
          `Error al guardar texto final: ${result.error || "Error desconocido"}`
        );
        return;
      }

      setMessage("Texto final guardado.");
    } catch (error) {
      setSaving(false);
      setMessage(
        error instanceof Error
          ? `Error al guardar texto final: ${error.message}`
          : "Error al guardar texto final."
      );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">
        texto final para locución y subtítulos
      </p>

      <textarea
        rows={10}
        value={renderScript}
        onChange={(e) => setRenderScript(e.target.value)}
        placeholder="Acá va el texto final que después va a alimentar locución, subtítulos y avatar."
        className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-slate-400"
      />

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={
            saving
              ? "rounded-xl bg-slate-300 px-4 py-2 text-sm font-medium text-white"
              : "rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          }
        >
          {saving ? "guardando..." : "guardar texto final"}
        </button>

        {message ? <span className="text-sm text-slate-500">{message}</span> : null}
      </div>
    </div>
  );
}

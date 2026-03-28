"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  projectId: string;
  initialTitle: string;
};

export default function ProjectTitleEditor({
  projectId,
  initialTitle,
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setSaving(false);
      setMessage("El título no puede quedar vacío.");
      return;
    }

    try {
      const response = await fetch("/api/update-project-title", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          title: cleanTitle,
        }),
      });

      const result = await response.json();

      setSaving(false);

      if (!response.ok) {
        setMessage(`Error al guardar el título: ${result.error || "Error desconocido"}`);
        return;
      }

      setMessage("Título guardado.");
      router.push(`/projects/${projectId}`);
      router.refresh();
    } catch (error) {
      setSaving(false);
      setMessage(
        error instanceof Error
          ? `Error al guardar el título: ${error.message}`
          : "Error al guardar el título."
      );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">
        título del proyecto
      </p>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Editar título"
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
        />

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={
            saving
              ? "rounded-xl bg-slate-300 px-4 py-3 text-sm font-medium text-white"
              : "rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          }
        >
          {saving ? "guardando..." : "guardar título"}
        </button>
      </div>

      {message ? <p className="mt-3 text-sm text-slate-500">{message}</p> : null}
    </div>
  );
}

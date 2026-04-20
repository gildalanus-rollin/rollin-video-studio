"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  projectId: string;
};

export default function ClearMusicButton({ projectId }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleClear() {
    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/save-music", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          selectedMusic: "",
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.error || "No se pudo quitar la música");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al quitar la música");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => void handleClear()}
        disabled={saving}
        className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "quitando..." : "sin música"}
      </button>

      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SourcesEditor({
  projectId,
  currentMain,
}: {
  projectId: string;
  currentMain: string;
}) {
  const router = useRouter();
  const [main, setMain] = useState(currentMain || "");
  const [secondary, setSecondary] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const saveMain = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/save-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, mainSourceUrl: main, mode: "save-main" }),
      });
      const result = await response.json();
      setLoading(false);
      if (!response.ok) {
        setMessage(`Error: ${result.error || "Error desconocido"}`);
        return;
      }
      setMessage("Fuente principal guardada.");
      router.refresh();
    } catch (error) {
      setLoading(false);
      setMessage(error instanceof Error ? error.message : "Error al guardar.");
    }
  };

  const clearMain = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/save-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, mainSourceUrl: "", mode: "save-main" }),
      });
      setLoading(false);
      if (response.ok) {
        setMain("");
        setMessage("Fuente principal eliminada.");
        router.refresh();
      }
    } catch {
      setLoading(false);
    }
  };

  const addSecondary = async () => {
    if (!secondary.trim()) return;
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/save-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, secondarySourceUrl: secondary, mode: "add-secondary" }),
      });
      const result = await response.json();
      setLoading(false);
      if (!response.ok) {
        setMessage(`Error: ${result.error || "Error desconocido"}`);
        return;
      }
      setSecondary("");
      setMessage("Fuente secundaria agregada.");
      router.refresh();
    } catch (error) {
      setLoading(false);
      setMessage(error instanceof Error ? error.message : "Error al agregar.");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={main}
          onChange={(e) => setMain(e.target.value)}
          placeholder="pegar fuente principal"
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
        <button
          onClick={saveMain}
          disabled={loading}
          className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white transition hover:bg-slate-800 disabled:bg-slate-300"
        >
          guardar
        </button>
        {main && (
          <button
            onClick={clearMain}
            disabled={loading}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100"
          >
            quitar
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={secondary}
          onChange={(e) => setSecondary(e.target.value)}
          placeholder="agregar fuente secundaria"
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          onKeyDown={(e) => e.key === "Enter" && addSecondary()}
        />
        <button
          onClick={addSecondary}
          disabled={loading || !secondary.trim()}
          className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white transition hover:bg-slate-800 disabled:bg-slate-300"
        >
          +
        </button>
      </div>

      {message && <p className="text-xs text-slate-500">{message}</p>}
    </div>
  );
}

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          mainSourceUrl: main,
          mode: "save-main",
        }),
      });

      const result = await response.json();
      setLoading(false);

      if (!response.ok) {
        setMessage(
          `Error al guardar la fuente principal: ${result.error || "Error desconocido"}`
        );
        return;
      }

      setMessage("Fuente principal guardada.");
      router.refresh();
    } catch (error) {
      setLoading(false);
      setMessage(
        error instanceof Error
          ? `Error al guardar la fuente principal: ${error.message}`
          : "Error al guardar la fuente principal."
      );
    }
  };

  const addSecondary = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/save-sources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          secondarySourceUrl: secondary,
          mode: "add-secondary",
        }),
      });

      const result = await response.json();
      setLoading(false);

      if (!response.ok) {
        setMessage(
          `Error al guardar la fuente secundaria: ${result.error || "Error desconocido"}`
        );
        return;
      }

      setSecondary("");
      setMessage("Fuente secundaria agregada.");
      router.refresh();
    } catch (error) {
      setLoading(false);
      setMessage(
        error instanceof Error
          ? `Error al guardar la fuente secundaria: ${error.message}`
          : "Error al guardar la fuente secundaria."
      );
    }
  };

  return (
    <div className="mt-3 space-y-3">
      <div className="flex gap-2">
        <input
          value={main}
          onChange={(e) => setMain(e.target.value)}
          placeholder="pegar fuente principal"
          className="flex-1 rounded-xl border px-3 py-2 text-sm"
        />
        <button
          onClick={saveMain}
          disabled={loading}
          className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white disabled:bg-slate-300"
        >
          guardar
        </button>
      </div>

      <div className="flex gap-2">
        <input
          value={secondary}
          onChange={(e) => setSecondary(e.target.value)}
          placeholder="agregar fuente secundaria"
          className="flex-1 rounded-xl border px-3 py-2 text-sm"
        />
        <button
          onClick={addSecondary}
          disabled={loading}
          className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white disabled:bg-slate-300"
        >
          +
        </button>
      </div>

      {message ? <p className="text-sm text-slate-500">{message}</p> : null}
    </div>
  );
}

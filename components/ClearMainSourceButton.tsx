"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  projectId: string;
};

export default function ClearMainSourceButton({ projectId }: Props) {
  const router = useRouter();
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState("");

  const handleClear = async () => {
    setClearing(true);
    setMessage("");

    try {
      const response = await fetch("/api/clear-main-source", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId }),
      });

      const result = await response.json();

      setClearing(false);

      if (!response.ok) {
        setMessage(
          `Error al quitar la fuente principal: ${result.error || "Error desconocido"}`
        );
        return;
      }

      router.push(`/projects/${projectId}`);
      router.refresh();
    } catch (error) {
      setClearing(false);
      setMessage(
        error instanceof Error
          ? `Error al quitar la fuente principal: ${error.message}`
          : "Error al quitar la fuente principal."
      );
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClear}
        disabled={clearing}
        className={
          clearing
            ? "rounded-xl bg-slate-300 px-3 py-2 text-sm font-medium text-white"
            : "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        }
      >
        {clearing ? "quitando..." : "🗑 quitar"}
      </button>

      {message ? <p className="mt-2 text-sm text-red-600">{message}</p> : null}
    </div>
  );
}

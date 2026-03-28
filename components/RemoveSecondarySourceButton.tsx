"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  projectId: string;
  sourceToRemove: string;
};

export default function RemoveSecondarySourceButton({
  projectId,
  sourceToRemove,
}: Props) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);
  const [message, setMessage] = useState("");

  const handleRemove = async () => {
    setRemoving(true);
    setMessage("");

    try {
      const response = await fetch("/api/remove-secondary-source", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          sourceToRemove,
        }),
      });

      const result = await response.json();
      setRemoving(false);

      if (!response.ok) {
        setMessage(
          `Error al quitar la fuente secundaria: ${result.error || "Error desconocido"}`
        );
        return;
      }

      router.refresh();
    } catch (error) {
      setRemoving(false);
      setMessage(
        error instanceof Error
          ? `Error al quitar la fuente secundaria: ${error.message}`
          : "Error al quitar la fuente secundaria."
      );
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleRemove}
        disabled={removing}
        className={
          removing
            ? "rounded-xl bg-slate-300 px-3 py-2 text-sm font-medium text-white"
            : "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        }
      >
        {removing ? "quitando..." : "🗑 quitar"}
      </button>

      {message ? <p className="mt-2 text-sm text-red-600">{message}</p> : null}
    </div>
  );
}

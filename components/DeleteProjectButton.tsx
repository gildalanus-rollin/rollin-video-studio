"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  projectId: string;
  projectTitle?: string;
};

export default function DeleteProjectButton({
  projectId,
  projectTitle = "este proyecto",
}: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      `¿Querés eliminar "${projectTitle}"? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.error || "No se pudo eliminar el proyecto");
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar el proyecto"
      );
      setDeleting(false);
      return;
    }

    setDeleting(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => void handleDelete()}
        disabled={deleting}
        className="inline-flex items-center rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {deleting ? "eliminando..." : "eliminar"}
      </button>

      {error ? (
        <span className="text-xs text-red-600">{error}</span>
      ) : null}
    </div>
  );
}

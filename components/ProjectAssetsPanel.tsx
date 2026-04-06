"use client";

import { useEffect, useRef, useState } from "react";

type Asset = {
  id: string;
  label: string;
  sort_order: number;
  is_primary: boolean;
  resolved_url: string | null;
  original_filename: string | null;
  status: string;
};

export default function ProjectAssetsPanel({
  projectId,
}: {
  projectId: string;
}) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [updatingPrimaryId, setUpdatingPrimaryId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function loadAssets() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/projects/${projectId}/assets`, {
        cache: "no-store",
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.error || "No se pudieron cargar las fotos");
      }

      setAssets(Array.isArray(json.assets) ? json.assets : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar fotos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAssets();
  }, [projectId]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();

      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(`/api/projects/${projectId}/assets/upload`, {
        method: "POST",
        body: formData,
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.error || "No se pudieron subir las fotos");
      }

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      await loadAssets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir fotos");
    } finally {
      setUploading(false);
    }
  }

  async function handleSetPrimary(assetId: string) {
    try {
      setUpdatingPrimaryId(assetId);
      setError("");

      const response = await fetch(
        `/api/projects/${projectId}/assets/${assetId}/primary`,
        {
          method: "POST",
        }
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.error || "No se pudo marcar la imagen principal");
      }

      await loadAssets();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al marcar la imagen principal"
      );
    } finally {
      setUpdatingPrimaryId(null);
    }
  }

  async function handleMove(assetId: string, direction: "up" | "down") {
    try {
      setMovingId(assetId);
      setError("");

      const response = await fetch(
        `/api/projects/${projectId}/assets/${assetId}/move`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ direction }),
        }
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.error || "No se pudo reordenar la imagen");
      }

      await loadAssets();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al reordenar la imagen"
      );
    } finally {
      setMovingId(null);
    }
  }

  async function handleDelete(assetId: string) {
    const confirmed = window.confirm(
      "¿Querés eliminar esta foto del proyecto?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(assetId);
      setError("");

      const response = await fetch(
        `/api/projects/${projectId}/assets/${assetId}`,
        {
          method: "DELETE",
        }
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.error || "No se pudo eliminar la imagen");
      }

      await loadAssets();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar la imagen"
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            fotos del proyecto
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Podés cargar varias imágenes, elegir una principal y ordenar la
            secuencia base del proyecto.
          </p>
        </div>

        <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
          {uploading ? "subiendo..." : "subir fotos"}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => void handleFiles(event.target.files)}
          />
        </label>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="mt-4 text-sm text-slate-500">Cargando fotos...</p>
      ) : assets.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          Todavía no hay fotos cargadas en este proyecto.
        </p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          {assets.map((asset, index) => {
            const isFirst = index === 0;
            const isLast = index === assets.length - 1;
            const isBusy =
              updatingPrimaryId === asset.id ||
              movingId === asset.id ||
              deletingId === asset.id;

            return (
              <div
                key={asset.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                {asset.resolved_url ? (
                  <img
                    src={asset.resolved_url}
                    alt={asset.original_filename || asset.label || "foto del proyecto"}
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-slate-100 text-sm text-slate-400">
                    sin preview
                  </div>
                )}

                <div className="space-y-3 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      orden {asset.sort_order}
                    </span>

                    {asset.is_primary ? (
                      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-emerald-700">
                        principal
                      </span>
                    ) : null}
                  </div>

                  <p className="truncate text-sm font-medium text-slate-900">
                    {asset.original_filename || asset.label || "imagen"}
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => void handleSetPrimary(asset.id)}
                      disabled={asset.is_primary || isBusy}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {asset.is_primary
                        ? "principal"
                        : updatingPrimaryId === asset.id
                        ? "guardando..."
                        : "marcar principal"}
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDelete(asset.id)}
                      disabled={isBusy}
                      className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === asset.id ? "eliminando..." : "eliminar"}
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleMove(asset.id, "up")}
                      disabled={isFirst || isBusy}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {movingId === asset.id ? "moviendo..." : "subir"}
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleMove(asset.id, "down")}
                      disabled={isLast || isBusy}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {movingId === asset.id ? "moviendo..." : "bajar"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

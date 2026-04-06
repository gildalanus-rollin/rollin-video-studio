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

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            fotos del proyecto
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Podés cargar varias imágenes. Por ahora el render seguirá usando una
            sola imagen principal.
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
          {assets.map((asset) => (
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

              <div className="space-y-2 p-3">
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

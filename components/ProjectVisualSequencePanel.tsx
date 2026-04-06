"use client";

import { useEffect, useState } from "react";

type SequenceRow = {
  id: string;
  sequence_order: number;
  scene_type: string;
  role: string;
  motion_preset: string;
  duration_ratio: number;
  overlay_title: boolean;
  overlay_subtitles: boolean;
  overlay_avatar: boolean;
  resolved_url: string | null;
  asset?: {
    id: string;
    label: string | null;
    original_filename: string | null;
    is_primary: boolean;
  } | null;
};

export default function ProjectVisualSequencePanel({
  projectId,
}: {
  projectId: string;
}) {
  const [rows, setRows] = useState<SequenceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState("");

  async function loadSequence() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/projects/${projectId}/visual-sequence`, {
        cache: "no-store",
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.error || "No se pudo cargar la secuencia visual");
      }

      setRows(Array.isArray(json.sequence) ? json.sequence : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar la secuencia visual"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSequence();
  }, [projectId]);

  async function handleInitialize() {
    try {
      setInitializing(true);
      setError("");

      const response = await fetch(
        `/api/projects/${projectId}/visual-sequence/init`,
        {
          method: "POST",
        }
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error(
          json?.error || "No se pudo inicializar la secuencia visual"
        );
      }

      await loadSequence();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al inicializar la secuencia visual"
      );
    } finally {
      setInitializing(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            secuencia visual
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Define el orden narrativo base de las imágenes del proyecto, separado
            de la biblioteca de assets.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleInitialize()}
          disabled={initializing}
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {initializing ? "inicializando..." : "inicializar secuencia"}
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="mt-4 text-sm text-slate-500">
          Cargando secuencia visual...
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          Todavía no hay secuencia visual creada para este proyecto.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="rounded-2xl border border-slate-200 bg-white p-3"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
                <div className="w-full max-w-[220px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  {row.resolved_url ? (
                    <img
                      src={row.resolved_url}
                      alt={
                        row.asset?.original_filename ||
                        row.asset?.label ||
                        "frame de secuencia"
                      }
                      className="aspect-video w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-video items-center justify-center text-sm text-slate-400">
                      sin preview
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      orden {row.sequence_order}
                    </span>

                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      {row.scene_type}
                    </span>

                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                      {row.role}
                    </span>

                    {row.asset?.is_primary ? (
                      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-emerald-700">
                        asset principal
                      </span>
                    ) : null}
                  </div>

                  <p className="truncate text-sm font-medium text-slate-900">
                    {row.asset?.original_filename || row.asset?.label || "asset"}
                  </p>

                  <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-3">
                    <div>
                      <span className="font-medium text-slate-900">motion:</span>{" "}
                      {row.motion_preset}
                    </div>
                    <div>
                      <span className="font-medium text-slate-900">duración:</span>{" "}
                      {row.duration_ratio}
                    </div>
                    <div>
                      <span className="font-medium text-slate-900">title:</span>{" "}
                      {row.overlay_title ? "on" : "off"}
                    </div>
                    <div>
                      <span className="font-medium text-slate-900">subtitles:</span>{" "}
                      {row.overlay_subtitles ? "on" : "off"}
                    </div>
                    <div>
                      <span className="font-medium text-slate-900">avatar:</span>{" "}
                      {row.overlay_avatar ? "on" : "off"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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

const ROLE_OPTIONS = ["cover", "support", "closing"] as const;
const MOTION_OPTIONS = ["static", "pan", "zoom-in", "zoom-out"] as const;

export default function ProjectVisualSequencePanel({
  projectId,
}: {
  projectId: string;
}) {
  const [rows, setRows] = useState<SequenceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
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

  async function patchRow(
    sequenceId: string,
    patch: Partial<
      Pick<
        SequenceRow,
        | "role"
        | "motion_preset"
        | "overlay_title"
        | "overlay_subtitles"
        | "overlay_avatar"
      >
    >
  ) {
    try {
      setUpdatingId(sequenceId);
      setError("");

      const response = await fetch(
        `/api/projects/${projectId}/visual-sequence/${sequenceId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(patch),
        }
      );

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.error || "No se pudo actualizar la escena");
      }

      await loadSequence();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar la escena"
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function moveRow(sequenceId: string, direction: "up" | "down") {
    try {
      setMovingId(sequenceId);
      setError("");

      const response = await fetch(
        `/api/projects/${projectId}/visual-sequence/${sequenceId}/move`,
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
        throw new Error(json?.error || "No se pudo mover la escena");
      }

      await loadSequence();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al mover la escena"
      );
    } finally {
      setMovingId(null);
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
            Define el orden narrativo base de las imágenes del proyecto.
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
        <div className="mt-4 space-y-4">
          {rows.map((row, index) => {
            const isFirst = index === 0;
            const isLast = index === rows.length - 1;
            const isUpdating = updatingId === row.id;
            const isMoving = movingId === row.id;
            const isBusy = isUpdating || isMoving;

            const toggleClass = (active: boolean) =>
              active
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100";

            return (
              <div
                key={row.id}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="grid gap-4 xl:grid-cols-[260px_1fr]">
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
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

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          orden {row.sequence_order}
                        </span>

                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          {row.scene_type}
                        </span>

                        {row.asset?.is_primary ? (
                          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-emerald-700">
                            asset principal
                          </span>
                        ) : null}
                      </div>

                      <p className="text-sm font-medium text-slate-900">
                        {row.asset?.original_filename || row.asset?.label || "asset"}
                      </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="space-y-1 text-sm">
                        <span className="block text-slate-600">rol editorial</span>
                        <select
                          value={row.role}
                          disabled={isBusy}
                          onChange={(event) =>
                            void patchRow(row.id, { role: event.target.value })
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                        >
                          {ROLE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="space-y-1 text-sm">
                        <span className="block text-slate-600">movimiento</span>
                        <select
                          value={row.motion_preset}
                          disabled={isBusy}
                          onChange={(event) =>
                            void patchRow(row.id, {
                              motion_preset: event.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                        >
                          {MOTION_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">overlays</p>

                      <div className="grid gap-2 sm:grid-cols-3">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            void patchRow(row.id, {
                              overlay_title: !row.overlay_title,
                            })
                          }
                          className={`rounded-xl border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${toggleClass(
                            row.overlay_title
                          )}`}
                        >
                          título
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            void patchRow(row.id, {
                              overlay_subtitles: !row.overlay_subtitles,
                            })
                          }
                          className={`rounded-xl border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${toggleClass(
                            row.overlay_subtitles
                          )}`}
                        >
                          subtítulos
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            void patchRow(row.id, {
                              overlay_avatar: !row.overlay_avatar,
                            })
                          }
                          className={`rounded-xl border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${toggleClass(
                            row.overlay_avatar
                          )}`}
                        >
                          avatar
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void moveRow(row.id, "up")}
                        disabled={isFirst || isBusy}
                        className="inline-flex min-w-[120px] items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isMoving ? "moviendo..." : "subir"}
                      </button>

                      <button
                        type="button"
                        onClick={() => void moveRow(row.id, "down")}
                        disabled={isLast || isBusy}
                        className="inline-flex min-w-[120px] items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isMoving ? "moviendo..." : "bajar"}
                      </button>
                    </div>
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

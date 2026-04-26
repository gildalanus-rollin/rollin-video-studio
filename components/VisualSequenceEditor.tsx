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
  asset_type: string;
};

type SequenceRow = {
  id: string;
  sequence_order: number;
  role: string;
  motion_preset: string;
  overlay_title: boolean;
  overlay_subtitles: boolean;
  overlay_avatar: boolean;
  asset_id: string | null;
};

const ROLES = ["cover", "support", "closing"] as const;
const MOTIONS = ["static", "pan", "zoom-in", "zoom-out"] as const;

export default function VisualSequenceEditor({ projectId }: { projectId: string }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [sequence, setSequence] = useState<SequenceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  async function loadAll() {
    try {
      setLoading(true);
      setError("");
      const [imgRes, vidRes, seqRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/assets`, { cache: "no-store" }),
        fetch(`/api/projects/${projectId}/assets/videos`, { cache: "no-store" }),
        fetch(`/api/projects/${projectId}/visual-sequence`, { cache: "no-store" }),
      ]);
      const imgJson = await imgRes.json();
      const vidJson = await vidRes.json();
      const seqJson = await seqRes.json();

      const images = (Array.isArray(imgJson.assets) ? imgJson.assets : []).map(
        (a: Asset) => ({ ...a, asset_type: "image" })
      );
      const videos = (Array.isArray(vidJson.assets) ? vidJson.assets : []).map(
        (a: Asset) => ({ ...a, asset_type: "video" })
      );
      const all = [...images, ...videos].sort((a, b) => a.sort_order - b.sort_order);
      setAssets(all);
      setSequence(Array.isArray(seqJson.sequence) ? seqJson.sequence : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadAll(); }, [projectId]);

  async function handleImageFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    try {
      setUploadingImage(true);
      setError("");
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("files", f));
      const res = await fetch(`/api/projects/${projectId}/assets/upload`, { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Error al subir");
      if (imageInputRef.current) imageInputRef.current.value = "";
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir fotos");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleVideoFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    try {
      setUploadingVideo(true);
      setError("");
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("files", f));
      const res = await fetch(`/api/projects/${projectId}/assets/upload-video`, { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Error al subir");
      if (videoInputRef.current) videoInputRef.current.value = "";
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir videos");
    } finally {
      setUploadingVideo(false);
    }
  }

  async function handleSetPrimary(assetId: string) {
    await fetch(`/api/projects/${projectId}/assets/${assetId}/primary`, { method: "POST" });
    await loadAll();
  }

  async function handleDelete(assetId: string) {
    if (!confirm("Eliminar este archivo?")) return;
    try {
      setDeletingId(assetId);
      const res = await fetch(`/api/projects/${projectId}/assets/${assetId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Error al eliminar");
      if (selectedId === assetId) setSelectedId(null);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  }

  async function patchSequence(sequenceId: string, patch: Record<string, unknown>) {
    await fetch(`/api/projects/${projectId}/visual-sequence/${sequenceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    await loadAll();
  }

  async function handleInitSequence() {
    await fetch(`/api/projects/${projectId}/visual-sequence/init`, { method: "POST" });
    await loadAll();
  }

  async function handleMoveToPosition(assetId: string, currentIndex: number, targetIndex: number) {
    if (targetIndex === currentIndex) return;
    const steps = Math.abs(targetIndex - currentIndex);
    const direction = targetIndex > currentIndex ? "down" : "up";
    for (let s = 0; s < steps; s++) {
      await fetch(`/api/projects/${projectId}/assets/${assetId}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });
    }
    await loadAll();
  }

  const selectedAsset = assets.find((a) => a.id === selectedId) ?? null;
  const selectedSeq = sequence.find((s) => s.asset_id === selectedId) ?? null;
  const primaryAsset = assets.find((a) => a.is_primary) ?? assets[0] ?? null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            secuencia visual
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Fotos y videos · Click para editar ajustes
          </p>
        </div>
        <div className="flex gap-2">
          <label className="inline-flex cursor-pointer items-center rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100">
            {uploadingImage ? "subiendo..." : "+ fotos"}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => void handleImageFiles(e.target.files)}
            />
          </label>
          <label className="inline-flex cursor-pointer items-center rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100">
            {uploadingVideo ? "subiendo..." : "+ video"}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/x-mp4,.mp4"
              className="hidden"
              onChange={(e) => void handleVideoFiles(e.target.files)}
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-4 text-xs text-slate-400">Cargando...</p>
      ) : assets.length === 0 ? (
        <div className="mt-4 flex h-20 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white">
          <p className="text-xs text-slate-400">No hay fotos ni videos. Subí el primero.</p>
        </div>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto pb-2">
            <div className="flex gap-3">
              {assets.map((asset, index) => (
                <div key={asset.id} className="group relative shrink-0 flex flex-col items-center gap-1">
                  <p className="text-[10px] font-semibold text-slate-400">
                    {asset.asset_type === "video" ? "🎬" : "🖼"} {index + 1}
                  </p>

                  <div
                    className={
                      "relative h-20 w-28 overflow-hidden rounded-xl border-2 cursor-pointer transition " +
                      (selectedId === asset.id
                        ? "border-slate-900 ring-2 ring-slate-900 ring-offset-1"
                        : asset.id === primaryAsset?.id
                        ? "border-slate-400"
                        : "border-slate-200")
                    }
                    onClick={() => setSelectedId(asset.id === selectedId ? null : asset.id)}
                  >
                    {asset.asset_type === "video" && asset.resolved_url ? (
                      <video
                        src={asset.resolved_url}
                        className="h-full w-full object-cover"
                        muted
                        preload="metadata"
                        onLoadedMetadata={(e) => {
                          (e.target as HTMLVideoElement).currentTime = 1;
                        }}
                      />
                    ) : asset.asset_type === "video" ? (
                      <div className="flex h-full w-full items-center justify-center bg-slate-800">
                        <span className="text-2xl">🎬</span>
                      </div>
                    ) : asset.resolved_url ? (
                      <img
                        src={asset.resolved_url}
                        alt={asset.original_filename ?? "foto"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs text-slate-400">
                        sin preview
                      </div>
                    )}

                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 opacity-0 transition group-hover:opacity-100">
                      {asset.id !== primaryAsset?.id && asset.asset_type === "image" && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); void handleSetPrimary(asset.id); }}
                          className="rounded-lg bg-white px-2 py-0.5 text-[10px] font-medium text-slate-900"
                        >
                          portada
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); void handleDelete(asset.id); }}
                        disabled={deletingId === asset.id}
                        className="rounded-lg bg-red-500 px-2 py-0.5 text-[10px] font-medium text-white"
                      >
                        {deletingId === asset.id ? "..." : "eliminar"}
                      </button>
                    </div>

                    {asset.id === primaryAsset?.id && (
                      <div className="absolute left-1 top-1 rounded-md bg-slate-900 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                        portada
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedAsset && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-slate-700">
                  {selectedAsset.asset_type === "video" ? "🎬 " : "🖼 "}
                  {selectedAsset.original_filename ?? selectedAsset.label}
                </p>
                {sequence.length === 0 && (
                  <button
                    type="button"
                    onClick={() => void handleInitSequence()}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    inicializar secuencia
                  </button>
                )}
              </div>

              <div className="mt-3">
                <p className="mb-1.5 text-xs uppercase tracking-wide text-slate-400">posición</p>
                <div className="flex gap-2 flex-wrap">
                  {assets.map((a, i) => {
                    const currentIndex = assets.findIndex((x) => x.id === selectedAsset.id);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => void handleMoveToPosition(selectedAsset.id, currentIndex, i)}
                        className={
                          a.id === selectedAsset.id
                            ? "rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
                            : "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                        }
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedSeq ? (
                <div className="mt-3 space-y-3">
                  <div>
                    <p className="mb-1.5 text-xs uppercase tracking-wide text-slate-400">rol</p>
                    <div className="flex gap-2">
                      {ROLES.map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => void patchSequence(selectedSeq.id, { role })}
                          className={
                            selectedSeq.role === role
                              ? "rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
                              : "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                          }
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-1.5 text-xs uppercase tracking-wide text-slate-400">movimiento</p>
                    <div className="flex gap-2">
                      {MOTIONS.map((motion) => (
                        <button
                          key={motion}
                          type="button"
                          onClick={() => void patchSequence(selectedSeq.id, { motion_preset: motion })}
                          className={
                            selectedSeq.motion_preset === motion
                              ? "rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
                              : "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                          }
                        >
                          {motion}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-1.5 text-xs uppercase tracking-wide text-slate-400">overlays</p>
                    <div className="flex gap-2">
                      {[
                        { key: "overlay_title", label: "título" },
                        { key: "overlay_subtitles", label: "subtítulos" },
                        { key: "overlay_avatar", label: "avatar" },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            void patchSequence(selectedSeq.id, {
                              [key]: !selectedSeq[key as keyof SequenceRow],
                            })
                          }
                          className={
                            selectedSeq[key as keyof SequenceRow]
                              ? "rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
                              : "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                          }
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-400">
                  Inicializá la secuencia para editar los ajustes de cada archivo.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

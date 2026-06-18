"use client";

import { useEffect, useState, useCallback } from "react";

type Asset = {
  id: string;
  label: string;
  original_filename: string;
};

type SequenceScene = {
  id: string;
  sequence_order: number;
  scene_type: string;
  motion_preset: string;
  duration_ratio: number;
  asset: Asset | null;
  resolved_url: string | null;
};

const MOTION_PRESETS = ["static", "pan", "zoom-in", "zoom-out"];

export default function VisualSequenceEditor({ projectId }: { projectId: string }) {
  const [scenes, setScenes] = useState<SequenceScene[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/visual-sequence`);
      const json = await res.json();
      if (json.sequence) setScenes(json.sequence);
    } catch {}
    setLoading(false);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const selectedScene = scenes.find((s) => s.id === selected) ?? null;

  const moveScene = async (id: string, newOrder: number) => {
    const scene = scenes.find((s) => s.id === id);
    if (!scene) return;
    const others = scenes.filter((s) => s.id !== id);
    others.splice(newOrder - 1, 0, scene);
    const reordered = others.map((s, i) => ({ ...s, sequence_order: i }));
    setScenes(reordered);
    await saveOrder(reordered);
  };

  const updateMotion = async (id: string, motion: string) => {
    const updated = scenes.map((s) => s.id === id ? { ...s, motion_preset: motion } : s);
    setScenes(updated);
    await saveMotion(id, motion);
  };

  const saveOrder = async (ordered: SequenceScene[]) => {
    setSaving(true);
    try {
      await fetch(`/api/projects/${projectId}/visual-sequence/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: ordered.map((s) => ({ id: s.id, sequenceOrder: s.sequence_order })) }),
      });
    } catch {}
    setSaving(false);
  };

  const saveMotion = async (id: string, motion: string) => {
    try {
      await fetch(`/api/projects/${projectId}/visual-sequence/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motionPreset: motion }),
      });
    } catch {}
  };

  const removeScene = async (id: string) => {
    try {
      await fetch(`/api/projects/${projectId}/visual-sequence/${id}`, { method: "DELETE" });
      setScenes(scenes.filter((s) => s.id !== id));
      if (selected === id) setSelected(null);
    } catch {}
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      await fetch(`/api/projects/${projectId}/assets/upload-image`, { method: "POST", body: formData });
    }
    await fetch(`/api/projects/${projectId}/visual-sequence/init`, { method: "POST" });
    await load();
    e.target.value = "";
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    await fetch(`/api/projects/${projectId}/assets/upload-video`, { method: "POST", body: formData });
    await fetch(`/api/projects/${projectId}/visual-sequence/init`, { method: "POST" });
    await load();
    e.target.value = "";
  };

  if (loading) return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-400">Cargando secuencia...</p></div>;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          secuencia visual {saving && <span className="text-slate-300 ml-1">guardando...</span>}
        </p>
        <div className="flex gap-2">
          <label className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
            + fotos
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          </label>
          <label className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50">
            + video
            <input type="file" accept="video/mp4" className="hidden" onChange={handleVideoUpload} />
          </label>
        </div>
      </div>

      {scenes.length === 0 ? (
        <p className="text-xs text-slate-400">Sin imágenes o videos. Agregá desde los botones de arriba.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {scenes.map((scene, index) => {
            const isVideo = /\.(mp4|mov|webm)$/i.test(scene.asset?.original_filename || "");
            return (
              <div
                key={scene.id}
                onClick={() => setSelected(selected === scene.id ? null : scene.id)}
                className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition ${selected === scene.id ? "border-slate-900" : "border-transparent"}`}
                style={{ width: 80, height: 80 }}
              >
                {scene.resolved_url ? (
                  isVideo ? (
                    <video src={scene.resolved_url} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={scene.resolved_url} alt="" className="w-full h-full object-cover" />
                  )
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                    <span className="text-slate-400 text-xs">?</span>
                  </div>
                )}
                <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] rounded px-1">{index + 1}</span>
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 bg-slate-900 text-white text-[9px] rounded px-1">PORTADA</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedScene && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-600 truncate">{selectedScene.asset?.label || "Sin asset"}</p>
            <button type="button" onClick={() => removeScene(selectedScene.id)} className="text-xs text-red-400 hover:text-red-600">quitar</button>
          </div>

          <div>
            <label className="text-xs text-slate-400">Posición</label>
            <div className="mt-1 flex flex-wrap gap-1">
              {scenes.map((_, i) => (
                <button key={i} type="button"
                  onClick={() => moveScene(selectedScene.id, i + 1)}
                  className={selectedScene.sequence_order === i ? "rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-medium text-white" : "rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400">Movimiento</label>
            <div className="mt-1 flex flex-wrap gap-1">
              {MOTION_PRESETS.map((m) => (
                <button key={m} type="button"
                  onClick={() => updateMotion(selectedScene.id, m)}
                  className={selectedScene.motion_preset === m ? "rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-medium text-white" : "rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

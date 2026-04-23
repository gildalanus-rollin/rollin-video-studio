"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type MusicFile = {
  name: string;
  created_at: string | null;
  url: string;
};

export default function MusicAssetsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId");

  const [files, setFiles] = useState<MusicFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function loadFiles() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/music/list");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error al cargar música");
      setFiles(json.files ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadFiles(); }, []);

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    try {
      setUploading(true);
      setError("");
      const formData = new FormData();
      Array.from(fileList).forEach((f) => formData.append("files", f));
      const res = await fetch("/api/music/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error al subir");
      if (inputRef.current) inputRef.current.value = "";
      await loadFiles();
      setSuccess("Audio subido correctamente.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir audio");
    } finally {
      setUploading(false);
    }
  }

  async function handleSelect(fileName: string) {
    if (!projectId) return;
    try {
      setSelecting(fileName);
      setError("");
      const res = await fetch(`/api/projects/${projectId}/select-music`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ musicPath: `music/${fileName}` }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error al seleccionar");
      router.push(`/projects/${projectId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al seleccionar música");
    } finally {
      setSelecting(null);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            biblioteca de música
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            {projectId ? "Elegir música para el proyecto" : "Música"}
          </h1>
        </div>
        <label className="inline-flex cursor-pointer items-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
          {uploading ? "subiendo..." : "+ subir audio"}
          <input
            ref={inputRef}
            type="file"
            accept="audio/mpeg,audio/mp3,audio/wav,audio/aiff,audio/x-aiff,audio/aif,.mp3,.wav,.aif,.aiff"
            multiple
            className="hidden"
            onChange={(e) => void handleUpload(e.target.files)}
          />
        </label>
      </div>

      {projectId && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push(`/projects/${projectId}`)}
            className="text-sm text-slate-400 transition hover:text-slate-600"
          >
            ← volver al proyecto
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Cargando música...</p>
      ) : files.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-sm text-slate-500">No hay música en la biblioteca. Subí el primer archivo.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
          {files.map((file, index) => (
            <div
              key={file.name}
              className={"flex items-center gap-4 px-5 py-4 " + (index !== 0 ? "border-t border-slate-100" : "")}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  🎵 {file.name}
                </p>
                {file.created_at && (
                  <p className="mt-0.5 text-xs text-slate-400">
                    {new Date(file.created_at).toLocaleDateString("es-AR")}
                  </p>
                )}
                <audio controls src={file.url} className="mt-2 w-full h-8" />
              </div>

              {projectId && (
                <button
                  type="button"
                  onClick={() => void handleSelect(file.name)}
                  disabled={selecting === file.name}
                  className={
                    selecting === file.name
                      ? "shrink-0 rounded-xl bg-slate-300 px-4 py-2 text-sm font-medium text-white"
                      : "shrink-0 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  }
                >
                  {selecting === file.name ? "seleccionando..." : "usar"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

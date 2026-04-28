"use client";

import { useEffect, useState } from "react";

type Export = {
  id: string;
  video_url: string;
  duration_seconds: number | null;
  created_at: string;
};

export default function ExportsHistory({ projectId }: { projectId: string }) {
  const [exports, setExports] = useState<Export[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadExports() {
    try {
      const res = await fetch(`/api/projects/${projectId}/exports`, { cache: "no-store" });
      const json = await res.json();
      setExports(json.exports ?? []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { void loadExports(); }, [projectId]);

  if (loading) return <p className="text-xs text-slate-400">Cargando historial...</p>;
  if (exports.length === 0) return <p className="text-xs text-slate-400">No hay exports todavía.</p>;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">historial de exports</p>
      {exports.map((exp, index) => (
        <div key={exp.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-900">
              Export {exports.length - index}
              {exp.duration_seconds && <span className="ml-2 text-xs text-slate-400">{exp.duration_seconds}s</span>}
            </p>
            <p className="text-xs text-slate-400">
              {new Date(exp.created_at).toLocaleString("es-AR")}
            </p>
          </div>
          
            href={exp.video_url}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
          >
            ver video
          </a>
        </div>
      ))}
    </div>
  );
}

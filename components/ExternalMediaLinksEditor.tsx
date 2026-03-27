"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { buildProjectNotes } from "@/lib/projectNotes";

type Props = {
  projectId: string;
  initialSecondarySources: string[];
  initialSummary: string;
  initialSelectedImage: string;
  initialSelectedVideo: string;
  initialSelectedMusic: string;
  initialExternalImageUrl: string;
  initialExternalVideoUrl: string;
  initialNarrationMode: string;
};

export default function ExternalMediaLinksEditor({
  projectId,
  initialSecondarySources,
  initialSummary,
  initialSelectedImage,
  initialSelectedVideo,
  initialSelectedMusic,
  initialExternalImageUrl,
  initialExternalVideoUrl,
  initialNarrationMode,
}: Props) {
  const router = useRouter();
  const [externalImageUrl, setExternalImageUrl] = useState(initialExternalImageUrl);
  const [externalVideoUrl, setExternalVideoUrl] = useState(initialExternalVideoUrl);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    const notes = buildProjectNotes({
      secondarySources: initialSecondarySources,
      summary: initialSummary,
      selectedImage: initialSelectedImage,
      selectedVideo: initialSelectedVideo,
      selectedMusic: initialSelectedMusic,
      externalImageUrl,
      externalVideoUrl,
      narrationMode: initialNarrationMode,
    });

    const { error } = await supabase
      .from("projects")
      .update({ notes })
      .eq("id", projectId);

    setSaving(false);

    if (error) {
      setMessage("Error al guardar los links externos.");
      return;
    }

    setMessage("Links externos guardados.");
    router.push(`/projects/${projectId}`);
    router.refresh();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">
        links externos de apoyo
      </p>

      <div className="mt-3 space-y-3">
        <input
          type="url"
          value={externalImageUrl}
          onChange={(e) => setExternalImageUrl(e.target.value)}
          placeholder="Pegá un link directo de imagen"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
        />

        <input
          type="url"
          value={externalVideoUrl}
          onChange={(e) => setExternalVideoUrl(e.target.value)}
          placeholder="Pegá un link directo de video"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={
            saving
              ? "rounded-xl bg-slate-300 px-4 py-2 text-sm font-medium text-white"
              : "rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          }
        >
          {saving ? "guardando..." : "guardar links"}
        </button>

        {message ? (
          <span className="text-sm text-slate-500">{message}</span>
        ) : null}
      </div>
    </div>
  );
}

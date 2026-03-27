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

const options = [
  { value: "", label: "sin definir" },
  { value: "sin voz", label: "sin voz" },
  { value: "voz ia", label: "voz IA" },
  { value: "avatar heygen", label: "avatar HeyGen" },
];

export default function NarrationModeEditor({
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
  const [mode, setMode] = useState(initialNarrationMode);
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
      externalImageUrl: initialExternalImageUrl,
      externalVideoUrl: initialExternalVideoUrl,
      narrationMode: mode,
    });

    const { error } = await supabase
      .from("projects")
      .update({ notes })
      .eq("id", projectId);

    setSaving(false);

    if (error) {
      setMessage("Error al guardar voz/avatar.");
      return;
    }

    setMessage("Voz/avatar guardado.");
    router.push(`/projects/${projectId}`);
    router.refresh();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">
        voz / avatar
      </p>

      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
      >
        {options.map((option) => (
          <option key={option.value || "empty"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div className="mt-3 flex items-center gap-3">
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
          {saving ? "guardando..." : "guardar selección"}
        </button>

        {message ? <span className="text-sm text-slate-500">{message}</span> : null}
      </div>
    </div>
  );
}

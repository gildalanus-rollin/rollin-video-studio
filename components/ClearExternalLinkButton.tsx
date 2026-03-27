"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { buildProjectNotes, parseProjectNotes } from "@/lib/projectNotes";

type Props = {
  projectId: string;
  linkType: "image" | "video";
};

export default function ClearExternalLinkButton({
  projectId,
  linkType,
}: Props) {
  const router = useRouter();
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState("");

  const handleClear = async () => {
    setClearing(true);
    setMessage("");

    const { data, error } = await supabase
      .from("projects")
      .select("notes")
      .eq("id", projectId)
      .single();

    if (error) {
      setClearing(false);
      setMessage(`Error al leer el proyecto: ${error.message}`);
      return;
    }

    const parsed = parseProjectNotes((data as { notes: string | null }).notes);

    const nextNotes = buildProjectNotes({
      secondarySources: parsed.secondarySources,
      summary: parsed.summary,
      selectedImage: parsed.selectedImage,
      selectedVideo: parsed.selectedVideo,
      selectedMusic: parsed.selectedMusic,
      externalImageUrl: linkType === "image" ? "" : parsed.externalImageUrl,
      externalVideoUrl: linkType === "video" ? "" : parsed.externalVideoUrl,
      narrationMode: parsed.narrationMode,
    });

    const { error: updateError } = await supabase
      .from("projects")
      .update({ notes: nextNotes })
      .eq("id", projectId);

    if (updateError) {
      setClearing(false);
      setMessage(`Error al quitar el link: ${updateError.message}`);
      return;
    }

    router.push(`/projects/${projectId}`);
    router.refresh();
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClear}
        disabled={clearing}
        className={
          clearing
            ? "rounded-xl bg-slate-300 px-3 py-2 text-sm font-medium text-white"
            : "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        }
      >
        {clearing ? "quitando..." : "🗑 quitar"}
      </button>

      {message ? <p className="mt-2 text-sm text-red-600">{message}</p> : null}
    </div>
  );
}

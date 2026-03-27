"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { buildProjectNotes, parseProjectNotes } from "@/lib/projectNotes";

type Props = {
  projectId: string;
  sourceToRemove: string;
};

export default function RemoveSecondarySourceButton({
  projectId,
  sourceToRemove,
}: Props) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);
  const [message, setMessage] = useState("");

  const handleRemove = async () => {
    setRemoving(true);
    setMessage("");

    const { data, error } = await supabase
      .from("projects")
      .select("notes")
      .eq("id", projectId)
      .single();

    if (error) {
      setRemoving(false);
      setMessage(`Error al leer el proyecto: ${error.message}`);
      return;
    }

    const parsed = parseProjectNotes((data as { notes: string | null }).notes);

    const nextNotes = buildProjectNotes({
      secondarySources: parsed.secondarySources.filter(
        (item) => item !== sourceToRemove
      ),
      summary: parsed.summary,
      selectedImage: parsed.selectedImage,
      selectedVideo: parsed.selectedVideo,
      selectedMusic: parsed.selectedMusic,
      externalImageUrl: parsed.externalImageUrl,
      externalVideoUrl: parsed.externalVideoUrl,
      narrationMode: parsed.narrationMode,
    });

    const { error: updateError } = await supabase
      .from("projects")
      .update({ notes: nextNotes })
      .eq("id", projectId);

    if (updateError) {
      setRemoving(false);
      setMessage(`Error al quitar la fuente: ${updateError.message}`);
      return;
    }

    router.push(`/projects/${projectId}`);
    router.refresh();
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleRemove}
        disabled={removing}
        className={
          removing
            ? "rounded-xl bg-slate-300 px-3 py-2 text-sm font-medium text-white"
            : "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        }
      >
        {removing ? "quitando..." : "🗑 quitar"}
      </button>

      {message ? <p className="mt-2 text-sm text-red-600">{message}</p> : null}
    </div>
  );
}

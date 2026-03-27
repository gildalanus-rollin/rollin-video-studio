"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { buildProjectNotes, parseProjectNotes } from "@/lib/projectNotes";

type Props = {
  projectId: string;
  assetType: "image" | "video" | "music";
  assetValue: string;
};

export default function AssetSelectButton({
  projectId,
  assetType,
  assetValue,
}: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSelect = async () => {
    setSaving(true);
    setMessage("");

    try {
      const { data, error } = await supabase
        .from("projects")
        .select("notes")
        .eq("id", projectId)
        .single();

      if (error) {
        setSaving(false);
        setMessage(`Error al leer el proyecto: ${error.message}`);
        return;
      }

      const parsed = parseProjectNotes((data as { notes: string | null }).notes);

      const nextNotes = buildProjectNotes({
        secondarySources: parsed.secondarySources,
        summary: parsed.summary,
        selectedImage:
          assetType === "image" ? assetValue : parsed.selectedImage,
        selectedVideo:
          assetType === "video" ? assetValue : parsed.selectedVideo,
        selectedMusic:
          assetType === "music" ? assetValue : parsed.selectedMusic,
        externalImageUrl: parsed.externalImageUrl,
        externalVideoUrl: parsed.externalVideoUrl,
        narrationMode: parsed.narrationMode,
      });

      const { data: updatedRows, error: updateError } = await supabase
        .from("projects")
        .update({ notes: nextNotes })
        .eq("id", projectId)
        .select("id, notes");

      if (updateError) {
        setSaving(false);
        setMessage(`Error al guardar la selección: ${updateError.message}`);
        return;
      }

      if (!updatedRows || updatedRows.length === 0) {
        setSaving(false);
        setMessage(
          "No se pudo actualizar el proyecto. Probablemente falta permiso de UPDATE en Supabase."
        );
        return;
      }

      router.push(`/projects/${projectId}`);
      router.refresh();
    } catch (err) {
      setSaving(false);
      setMessage(
        err instanceof Error ? err.message : "Ocurrió un error inesperado."
      );
    }
  };

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={handleSelect}
        disabled={saving}
        className={
          saving
            ? "rounded-xl bg-slate-300 px-3 py-2 text-sm font-medium text-white"
            : "rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        }
      >
        {saving ? "guardando..." : "usar en este proyecto"}
      </button>

      {message ? <p className="mt-2 text-sm text-red-600">{message}</p> : null}
    </div>
  );
}

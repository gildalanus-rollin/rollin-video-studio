"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  projectId: string;
  initialGraphicTitleSize?: string | null;
  initialGraphicTitlePosition?: string | null;
  initialAvatarEnabled?: boolean | null;
  initialSubtitlePosition?: string | null;
  initialSubtitleSize?: string | null;
};

const TITLE_POSITIONS = [
  { value: "top-left", label: "Arriba izquierda" },
  { value: "top-center", label: "Arriba centro" },
  { value: "bottom-left", label: "Abajo izquierda" },
  { value: "bottom-center", label: "Abajo centro" },
];

export default function GraphicSettingsEditor({
  projectId,
  initialGraphicTitleSize,
  initialGraphicTitlePosition,
  initialAvatarEnabled,
  initialSubtitlePosition,
  initialSubtitleSize,
}: Props) {
  const router = useRouter();
  const [graphicTitlePosition, setGraphicTitlePosition] = useState(
    initialGraphicTitlePosition || "bottom-left"
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async (position: string) => {
    setGraphicTitlePosition(position);
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/update-graphic-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          graphicTitleSize: initialGraphicTitleSize || "md",
          graphicTitlePosition: position,
          avatarEnabled: initialAvatarEnabled ?? false,
          subtitlePosition: initialSubtitlePosition || "bottom-center",
          subtitleSize: initialSubtitleSize || "md",
        }),
      });
      setSaving(false);
      if (response.ok) {
        setMessage("Guardado.");
        router.refresh();
      }
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        posición del título
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {TITLE_POSITIONS.map((pos) => (
          <button
            key={pos.value}
            type="button"
            disabled={saving}
            onClick={() => handleSave(pos.value)}
            className={
              graphicTitlePosition === pos.value
                ? "rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                : "rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            }
          >
            {pos.label}
          </button>
        ))}
      </div>
      {message && <p className="mt-2 text-xs text-slate-500">{message}</p>}
    </div>
  );
}

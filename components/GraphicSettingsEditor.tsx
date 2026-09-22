"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  projectId: string;
  initialAvatarEnabled?: boolean | null;
  initialSubtitleColor?: string | null;
};

const SUBTITLE_COLORS = [
  { value: "blanco", label: "Blanco" },
  { value: "amarillo", label: "Amarillo" },
];

export default function GraphicSettingsEditor({
  projectId,
  initialAvatarEnabled,
  initialSubtitleColor,
}: Props) {
  const router = useRouter();
  const [subtitleColor, setSubtitleColor] = useState(
    initialSubtitleColor || "blanco"
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async (updates: { subtitleColor?: string }) => {
    const newSubtitleColor = updates.subtitleColor ?? subtitleColor;

    if (updates.subtitleColor) setSubtitleColor(updates.subtitleColor);

    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/update-graphic-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          avatarEnabled: initialAvatarEnabled ?? false,
          subtitleColor: newSubtitleColor,
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
    <div className="space-y-4">
      {/* Color de subtitulos */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          color de subtitulos
        </p>
        <div className="mt-3 flex gap-2">
          {SUBTITLE_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              disabled={saving}
              onClick={() => handleSave({ subtitleColor: c.value })}
              className={
                subtitleColor === c.value
                  ? "flex-1 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                  : "flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              }
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {message && <p className="text-xs text-slate-500">{message}</p>}
    </div>
  );
}

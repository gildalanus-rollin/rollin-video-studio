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

const SUBTITLE_POSITIONS = [
  { value: "top-center", label: "Arriba" },
  { value: "middle-center", label: "Centro" },
  { value: "bottom-center", label: "Abajo" },
];

const SUBTITLE_SIZES = [
  { value: "sm", label: "Chico" },
  { value: "md", label: "Mediano" },
  { value: "lg", label: "Grande" },
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
  const [titlePosition, setTitlePosition] = useState(
    initialGraphicTitlePosition || "bottom-left"
  );
  const [subtitlePosition, setSubtitlePosition] = useState(
    initialSubtitlePosition || "bottom-center"
  );
  const [subtitleSize, setSubtitleSize] = useState(
    initialSubtitleSize || "md"
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async (updates: {
    titlePosition?: string;
    subtitlePosition?: string;
    subtitleSize?: string;
  }) => {
    const newTitlePosition = updates.titlePosition ?? titlePosition;
    const newSubtitlePosition = updates.subtitlePosition ?? subtitlePosition;
    const newSubtitleSize = updates.subtitleSize ?? subtitleSize;

    if (updates.titlePosition) setTitlePosition(updates.titlePosition);
    if (updates.subtitlePosition) setSubtitlePosition(updates.subtitlePosition);
    if (updates.subtitleSize) setSubtitleSize(updates.subtitleSize);

    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/update-graphic-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          graphicTitleSize: initialGraphicTitleSize || "md",
          graphicTitlePosition: newTitlePosition,
          avatarEnabled: initialAvatarEnabled ?? false,
          subtitlePosition: newSubtitlePosition,
          subtitleSize: newSubtitleSize,
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
      {/* Posición del título */}
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
              onClick={() => handleSave({ titlePosition: pos.value })}
              className={
                titlePosition === pos.value
                  ? "rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                  : "rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              }
            >
              {pos.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subtítulos */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          subtítulos
        </p>
        <div className="mt-3 space-y-3">
          <div>
            <p className="mb-2 text-xs text-slate-500">Posición</p>
            <div className="flex gap-2">
              {SUBTITLE_POSITIONS.map((pos) => (
                <button
                  key={pos.value}
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave({ subtitlePosition: pos.value })}
                  className={
                    subtitlePosition === pos.value
                      ? "flex-1 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                      : "flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                  }
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs text-slate-500">Tamaño</p>
            <div className="flex gap-2">
              {SUBTITLE_SIZES.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave({ subtitleSize: size.value })}
                  className={
                    subtitleSize === size.value
                      ? "flex-1 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                      : "flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                  }
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {message && <p className="text-xs text-slate-500">{message}</p>}
    </div>
  );
}

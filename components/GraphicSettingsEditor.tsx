"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  projectId: string;
  initialGraphicTitleSize?: string | null;
  initialGraphicTitlePosition?: string | null;
  initialAvatarEnabled?: boolean | null;
};

const sizeOptions = [
  { value: "sm", label: "chico" },
  { value: "md", label: "mediano" },
  { value: "lg", label: "grande" },
];

const positionOptions = [
  { value: "top-left", label: "arriba izquierda" },
  { value: "top-center", label: "arriba centro" },
  { value: "top-right", label: "arriba derecha" },
  { value: "bottom-left", label: "abajo izquierda" },
  { value: "bottom-center", label: "abajo centro" },
  { value: "bottom-right", label: "abajo derecha" },
];

export default function GraphicSettingsEditor({
  projectId,
  initialGraphicTitleSize,
  initialGraphicTitlePosition,
  initialAvatarEnabled,
}: Props) {
  const router = useRouter();
  const [graphicTitleSize, setGraphicTitleSize] = useState(
    initialGraphicTitleSize || "md"
  );
  const [graphicTitlePosition, setGraphicTitlePosition] = useState(
    initialGraphicTitlePosition || "bottom-left"
  );
  const [avatarEnabled, setAvatarEnabled] = useState(
    initialAvatarEnabled ?? true
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/update-graphic-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          graphicTitleSize,
          graphicTitlePosition,
          avatarEnabled,
        }),
      });

      const result = await response.json();
      setSaving(false);

      if (!response.ok) {
        setMessage(
          `Error al guardar gráfica: ${result.error || "Error desconocido"}`
        );
        return;
      }

      setMessage("Gráfica guardada.");
      router.refresh();
    } catch (error) {
      setSaving(false);
      setMessage(
        error instanceof Error
          ? `Error al guardar gráfica: ${error.message}`
          : "Error al guardar gráfica."
      );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">
        ajustes de gráfica
      </p>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            tamaño del título
          </label>
          <select
            value={graphicTitleSize}
            onChange={(e) => setGraphicTitleSize(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          >
            {sizeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            posición del título
          </label>
          <select
            value={graphicTitlePosition}
            onChange={(e) => setGraphicTitlePosition(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          >
            {positionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            avatar
          </label>
          <select
            value={avatarEnabled ? "on" : "off"}
            onChange={(e) => setAvatarEnabled(e.target.value === "on")}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          >
            <option value="on">mostrar</option>
            <option value="off">ocultar</option>
          </select>
        </div>
      </div>

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
          {saving ? "guardando..." : "guardar gráfica"}
        </button>

        {message ? <span className="text-sm text-slate-500">{message}</span> : null}
      </div>
    </div>
  );
}

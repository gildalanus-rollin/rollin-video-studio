"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  projectId: string;
  initialCategory: string;
  initialDurationLimitSeconds: number;
  initialOutputFormat: string;
  initialNarrativePreset?: string;
  initialSubtitleEnabled?: boolean | null;
  initialStatus?: string | null;
};

const editorialProfiles = [
  "urgente",
  "explicativo",
  "contexto",
  "impacto",
  "seguimiento",
];

const durationOptions = [10, 15, 30, 45];

const narrativePresets = [
  {
    value: "titulo-resumen-foto",
    label: "título + resumen + foto",
  },
  {
    value: "titulo-resumen-foto-avatar",
    label: "título + resumen + foto + avatar",
  },
];

const statusOptions = [
  { value: "draft", label: "draft" },
  { value: "ready", label: "ready" },
  { value: "archived", label: "archived" },
];

export default function ProjectSettingsEditor({
  projectId,
  initialCategory,
  initialDurationLimitSeconds,
  initialOutputFormat,
  initialNarrativePreset,
  initialSubtitleEnabled,
  initialStatus,
}: Props) {
  const router = useRouter();
  const [editorialProfile, setEditorialProfile] = useState(
    initialCategory || "explicativo"
  );
  const [narrativePreset, setNarrativePreset] = useState(
    initialNarrativePreset || "titulo-resumen-foto"
  );
  const [durationLimitSeconds, setDurationLimitSeconds] = useState(
    durationOptions.includes(initialDurationLimitSeconds)
      ? initialDurationLimitSeconds
      : 15
  );
  const [outputFormat, setOutputFormat] = useState(initialOutputFormat || "16:9");
  const [subtitleEnabled, setSubtitleEnabled] = useState(
    initialSubtitleEnabled ?? true
  );
  const [status, setStatus] = useState(initialStatus || "draft");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/update-project-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          editorialProfile,
          narrativePreset,
          durationLimitSeconds,
          outputFormat,
          subtitleEnabled,
          status,
        }),
      });

      const result = await response.json();
      setSaving(false);

      if (!response.ok) {
        setMessage(
          `Error al guardar ajustes: ${result.error || "Error desconocido"}`
        );
        return;
      }

      setMessage("Ajustes guardados.");
      router.refresh();
    } catch (error) {
      setSaving(false);
      setMessage(
        error instanceof Error
          ? `Error al guardar ajustes: ${error.message}`
          : "Error al guardar ajustes."
      );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">
        enfoque y export
      </p>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">


        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            perfil editorial
          </label>
          <select
            value={editorialProfile}
            onChange={(e) => setEditorialProfile(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          >
            {editorialProfiles.map((profile) => (
              <option key={profile} value={profile}>
                {profile}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            preset narrativo
          </label>
          <select
            value={narrativePreset}
            onChange={(e) => setNarrativePreset(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          >
            {narrativePresets.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            duración objetivo
          </label>
          <select
            value={durationLimitSeconds}
            onChange={(e) => setDurationLimitSeconds(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          >
            {durationOptions.map((seconds) => (
              <option key={seconds} value={seconds}>
                {seconds}s
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            formato de salida
          </label>
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          >
            <option value="16:9">16:9</option>
            <option value="9:16">9:16</option>
            <option value="1:1">1:1</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            subtítulos
          </label>
          <select
            value={subtitleEnabled ? "on" : "off"}
            onChange={(e) => setSubtitleEnabled(e.target.value === "on")}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
          >
            <option value="on">sí</option>
            <option value="off">no</option>
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
          {saving ? "guardando..." : "guardar ajustes"}
        </button>

        {message ? <span className="text-sm text-slate-500">{message}</span> : null}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  projectId: string;
  initialNarrationMode: string;
  initialVoiceOption?: string;
  initialAvatarOption?: string;
};

const modeOptions = [
  { value: "", label: "sin definir" },
  { value: "sin voz", label: "sin voz" },
  { value: "voz ia", label: "voz IA" },
  { value: "avatar heygen", label: "avatar HeyGen" },
];

const voiceOptions = [
  { value: "", label: "sin definir" },
  { value: "neutral", label: "neutral" },
  { value: "informativa", label: "informativa" },
  { value: "grave", label: "grave" },
];

const avatarOptions = [
  { value: "", label: "sin definir" },
  { value: "presentador-1", label: "presentador 1" },
  { value: "presentador-2", label: "presentador 2" },
];

function getModeDescription(mode: string) {
  switch (mode) {
    case "sin voz":
      return "El video sale con música y/o subtítulos, sin locución.";
    case "voz ia":
      return "La locución se genera con voz IA. Los subtítulos deben seguir ese guion.";
    case "avatar heygen":
      return "El avatar interpreta la locución. Los subtítulos siguen el mismo texto.";
    default:
      return "Definí cómo sale el audio o la presencia en cámara del video.";
  }
}

export default function NarrationModeEditor({
  projectId,
  initialNarrationMode,
  initialVoiceOption = "",
  initialAvatarOption = "",
}: Props) {
  const router = useRouter();
  const [mode, setMode] = useState(initialNarrationMode || "");
  const [voiceOption, setVoiceOption] = useState(initialVoiceOption || "");
  const [avatarOption, setAvatarOption] = useState(initialAvatarOption || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const voiceEnabled = mode === "voz ia" || mode === "avatar heygen";
  const avatarEnabled = mode === "avatar heygen";

  const modeLabel = useMemo(() => {
    return modeOptions.find((option) => option.value === mode)?.label || "sin definir";
  }, [mode]);

  const currentVoiceLabel = useMemo(() => {
    return voiceOptions.find((option) => option.value === voiceOption)?.label || "sin definir";
  }, [voiceOption]);

  const currentAvatarLabel = useMemo(() => {
    return avatarOptions.find((option) => option.value === avatarOption)?.label || "sin definir";
  }, [avatarOption]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/save-narration-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          narrationMode: mode,
          voiceOption: voiceEnabled ? voiceOption : "",
          avatarOption: avatarEnabled ? avatarOption : "",
        }),
      });

      const result = await response.json();
      setSaving(false);

      if (!response.ok) {
        setMessage(
          `Error al guardar voz/avatar: ${result.error || "Error desconocido"}`
        );
        return;
      }

      setMessage("Locución / avatar guardado.");
      router.refresh();
    } catch (error) {
      setSaving(false);
      setMessage(
        error instanceof Error
          ? `Error al guardar voz/avatar: ${error.message}`
          : "Error al guardar voz/avatar."
      );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            locución / avatar
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">
            salida de voz del proyecto
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Definí si el video sale sin voz, con voz IA o con avatar. La locución
            es el texto maestro y de ahí salen los subtítulos.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            modo: <span className="font-medium text-slate-900">{modeLabel}</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            voz: <span className="font-medium text-slate-900">{voiceEnabled ? currentVoiceLabel : "no aplica"}</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            avatar: <span className="font-medium text-slate-900">{avatarEnabled ? currentAvatarLabel : "no aplica"}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm leading-6 text-slate-600">
          {getModeDescription(mode)}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-3">
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            modo de salida
          </label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
          >
            {modeOptions.map((option) => (
              <option key={option.value || "empty"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            voz
          </label>
          <select
            value={voiceOption}
            onChange={(e) => setVoiceOption(e.target.value)}
            disabled={!voiceEnabled}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            {voiceOptions.map((option) => (
              <option key={option.value || "empty"} value={option.value}>
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
            value={avatarOption}
            onChange={(e) => setAvatarOption(e.target.value)}
            disabled={!avatarEnabled}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            {avatarOptions.map((option) => (
              <option key={option.value || "empty"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-slate-400">
          criterio editorial
        </p>
        <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-600">
          <li>• El resumen informa el enfoque editorial.</li>
          <li>• La locución define exactamente qué se dice.</li>
          <li>• Los subtítulos deben seguir la locución, no el resumen.</li>
        </ul>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
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

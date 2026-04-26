"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  projectId: string;
  initialNarrationMode: string;
  initialVoiceOption?: string;
  initialAvatarOption?: string;
};

const MODES = [
  { value: "sin voz", label: "Sin voz", description: "Solo música y subtítulos" },
  { value: "voz ia", label: "Voz IA", description: "Locución generada por IA" },
];

export default function NarrationModeEditor({
  projectId,
  initialNarrationMode,
  initialVoiceOption = "",
  initialAvatarOption = "",
}: Props) {
  const router = useRouter();
  const [mode, setMode] = useState(initialNarrationMode || "voz ia");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const save = async (newMode: string) => {
    setMode(newMode);
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/save-narration-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          narrationMode: newMode,
          voiceOption: initialVoiceOption,
          avatarOption: initialAvatarOption,
        }),
      });
      if (res.ok) {
        setMessage("Guardado.");
        router.refresh();
      }
    } catch {}
    setSaving(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        locución
      </p>
      <div className="mt-3 flex gap-2">
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            disabled={saving}
            onClick={() => save(m.value)}
            className={
              mode === m.value
                ? "flex-1 rounded-xl bg-slate-900 px-4 py-3 text-left transition"
                : "flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:bg-slate-100"
            }
          >
            <p className={mode === m.value ? "text-sm font-semibold text-white" : "text-sm font-semibold text-slate-700"}>
              {m.label}
            </p>
            <p className={mode === m.value ? "mt-0.5 text-xs text-slate-400" : "mt-0.5 text-xs text-slate-400"}>
              {m.description}
            </p>
          </button>
        ))}
      </div>
      {message && <p className="mt-2 text-xs text-slate-500">{message}</p>}
    </div>
  );
}

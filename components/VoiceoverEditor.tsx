"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const VOICES = [
  { id: "onyx", name: "Onyx", gender: "M", style: "Broadcaster" },
  { id: "echo", name: "Echo", gender: "M", style: "Suave" },
  { id: "fable", name: "Fable", gender: "M", style: "Expresivo" },
  { id: "nova", name: "Nova", gender: "F", style: "Cálida" },
  { id: "shimmer", name: "Shimmer", gender: "F", style: "Clara" },
  { id: "alloy", name: "Alloy", gender: "F", style: "Neutra" },
];

type Props = {
  projectId: string;
  renderScript: string;
  currentVoiceoverUrl?: string;
};

export default function VoiceoverEditor({
  projectId,
  renderScript,
  currentVoiceoverUrl,
}: Props) {
  const router = useRouter();
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [audioUrl, setAudioUrl] = useState(currentVoiceoverUrl || "");

  const handleGenerate = async () => {
    if (!renderScript.trim()) {
      setMessage("Primero generá o escribí el guion de locución.");
      return;
    }

    setGenerating(true);
    setMessage("");

    try {
      const response = await fetch("/api/generate-voiceover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          voiceId: selectedVoice,
          text: renderScript,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "No se pudo generar la voz.");
        return;
      }

      setAudioUrl(result.url);
      setMessage(`Voz generada con ${result.voice}.`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Error inesperado.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">
        voz en off — openai tts
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {VOICES.map((voice) => (
          <button
            key={voice.id}
            type="button"
            onClick={() => setSelectedVoice(voice.id)}
            className={
              selectedVoice === voice.id
                ? "rounded-xl border border-slate-900 bg-slate-900 px-3 py-2 text-left text-sm text-white"
                : "rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
            }
          >
            <span className="font-medium">{voice.name}</span>
            <span className="ml-1.5 text-xs opacity-60">
              {voice.gender} · {voice.style}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className={
            generating
              ? "rounded-xl bg-slate-300 px-4 py-2 text-sm font-medium text-white"
              : "rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          }
        >
          {generating ? "generando voz..." : "generar voz en off"}
        </button>

        {message && (
          <span className="text-sm text-slate-500">{message}</span>
        )}
      </div>

      {audioUrl && (
        <div className="mt-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
            preview
          </p>
          <audio controls src={audioUrl} className="w-full rounded-xl" />
        </div>
      )}

      {!renderScript.trim() && (
        <p className="mt-3 text-xs text-slate-400">
          Necesitás un guion de locución en el tab Editorial para generar la voz.
        </p>
      )}
    </div>
  );
}

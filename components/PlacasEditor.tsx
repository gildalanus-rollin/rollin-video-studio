"use client";

import { useEffect, useState } from "react";

type Momento = "inicio" | "mitad" | "final";

type Placa = {
  momento: Momento;
  titulo: string;
  antetitulo: string;
};

const MOMENTOS: { value: Momento; label: string }[] = [
  { value: "inicio", label: "Inicio" },
  { value: "mitad", label: "Mitad" },
  { value: "final", label: "Final" },
];

export default function PlacasEditor({ projectId }: { projectId: string }) {
  const [placas, setPlacas] = useState<Placa[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/projects/${projectId}/placas`)
      .then((r) => r.json())
      .then((json) => {
        if (json.placas?.length > 0) setPlacas(json.placas);
      });
  }, [projectId]);

  const isActive = (momento: Momento) => placas.some((p) => p.momento === momento);
  const getPlaca = (momento: Momento) => placas.find((p) => p.momento === momento);

  const toggleMomento = (momento: Momento) => {
    let updated: Placa[];
    if (isActive(momento)) {
      updated = placas.filter((p) => p.momento !== momento);
    } else {
      updated = [...placas, { momento, titulo: "", antetitulo: "" }];
    }
    setPlacas(updated);
    saveData(updated);
  };

  const updateField = (momento: Momento, field: "titulo" | "antetitulo", value: string) => {
    const updated = placas.map((p) => (p.momento === momento ? { ...p, [field]: value } : p));
    setPlacas(updated);
    clearTimeout((window as any)._placasTimeout);
    (window as any)._placasTimeout = setTimeout(() => saveData(updated), 1200);
  };

  const saveData = async (data: Placa[]) => {
    setSaving(true);
    try {
      await fetch(`/api/projects/${projectId}/placas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placas: data }),
      });
      setMessage("Guardado.");
      setTimeout(() => setMessage(""), 2000);
    } catch {
      setMessage("Error.");
    }
    setSaving(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        graficas ({placas.length}/3)
        {saving && <span className="ml-2 text-slate-300"> guardando...</span>}
        {message && <span className="ml-2 text-emerald-500"> {message}</span>}
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Elegi entre 0 y 3 momentos. Cuando ninguno esta activo en pantalla, se muestran los subtitulos.
      </p>

      <div className="mt-3 flex gap-2">
        {MOMENTOS.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => toggleMomento(m.value)}
            className={
              isActive(m.value)
                ? "flex-1 rounded-xl bg-slate-900 py-2 text-sm font-medium text-white"
                : "flex-1 rounded-xl border border-slate-200 bg-white py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            }
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {MOMENTOS.filter((m) => isActive(m.value)).map((m) => {
          const placa = getPlaca(m.value)!;
          return (
            <div key={m.value} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-600">{m.label}</p>
              <div>
                <label className="text-xs text-slate-400">Titulo</label>
                <textarea
                  rows={2}
                  value={placa.titulo}
                  onChange={(e) => updateField(m.value, "titulo", e.target.value)}
                  placeholder="Titulo de la placa..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Antetitulo (opcional)</label>
                <input
                  type="text"
                  value={placa.antetitulo}
                  onChange={(e) => updateField(m.value, "antetitulo", e.target.value)}
                  placeholder="Linea corta arriba de la categoria..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

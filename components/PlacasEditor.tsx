"use client";

import { useEffect, useState } from "react";

type Placa = {
  texto: string;
  momento_segundos: number;
  duracion_segundos: number;
  posicion: "top" | "center";
};

const PLACA_VACIA: Placa = {
  texto: "",
  momento_segundos: 0,
  duracion_segundos: 4,
  posicion: "center",
};

export default function PlacasEditor({
  projectId,
  durationLimitSeconds,
}: {
  projectId: string;
  durationLimitSeconds: number;
}) {
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

  const addPlaca = () => {
    if (placas.length >= 3) return;
    const nuevas = [...placas, { ...PLACA_VACIA, momento_segundos: Math.floor(durationLimitSeconds / (placas.length + 2)) }];
    setPlacas(nuevas);
  };

  const removePlaca = (index: number) => {
    const nuevas = placas.filter((_, i) => i !== index);
    setPlacas(nuevas);
    saveData(nuevas);
  };

  const updatePlaca = (index: number, field: keyof Placa, value: string | number) => {
    const updated = [...placas];
    updated[index] = { ...updated[index], [field]: value };
    setPlacas(updated);
    if (field === "texto") {
      clearTimeout((window as any)._placasTimeout);
      (window as any)._placasTimeout = setTimeout(() => saveData(updated), 1200);
    } else {
      saveData(updated);
    }
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
    } catch { setMessage("Error."); }
    setSaving(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          titulos adicionales ({placas.length}/3)
          {saving && <span className="ml-2 text-slate-300"> guardando...</span>}
          {message && <span className="ml-2 text-emerald-500"> {message}</span>}
        </p>
        {placas.length < 3 && (
          <button type="button" onClick={addPlaca} className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100">
            + agregar titulo
          </button>
        )}
      </div>
      {placas.length === 0 && (
        <p className="mt-3 text-xs text-slate-400">Agrega hasta 3 titulos que aparecen en momentos especificos del video.</p>
      )}
      <div className="mt-3 space-y-4">
        {placas.map((placa, index) => (
          <div key={index} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600">Titulo {index + 1}</p>
              <button type="button" onClick={() => removePlaca(index)} className="text-xs text-red-400 hover:text-red-600">quitar</button>
            </div>
            <textarea rows={2} value={placa.texto} onChange={(e) => updatePlaca(index, "texto", e.target.value)} placeholder="Texto del titulo..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:bg-white" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400">Aparece a los (seg)</label>
                <input type="number" min={0} max={durationLimitSeconds} value={placa.momento_segundos} onChange={(e) => updatePlaca(index, "momento_segundos", Number(e.target.value))} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Duracion (seg)</label>
                <input type="number" min={1} max={15} value={placa.duracion_segundos} onChange={(e) => updatePlaca(index, "duracion_segundos", Number(e.target.value))} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400">Posicion</label>
              <div className="mt-1 flex gap-2">
                {(["top", "center"] as const).map((pos) => (
                  <button key={pos} type="button" onClick={() => updatePlaca(index, "posicion", pos)}
                    className={placa.posicion === pos ? "flex-1 rounded-xl bg-slate-900 py-1.5 text-xs font-medium text-white" : "flex-1 rounded-xl border border-slate-200 bg-white py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"}>
                    {pos === "top" ? "Arriba" : "Centro"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

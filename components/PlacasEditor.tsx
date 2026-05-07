"use client";

import { useEffect, useState } from "react";

type Placa = {
  texto: string;
  momento_segundos: number;
  duracion_segundos: number;
  posicion: "top" | "center";
  alineacion: "center" | "left";
};

const PLACA_VACIA: Placa = { texto: "", momento_segundos: 0, duracion_segundos: 4, posicion: "center", alineacion: "center" };

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
      .then((json) => { if (json.placas?.length > 0) setPlacas(json.placas); });
  }, [projectId]);

  const addPlaca = () => {
    if (placas.length >= 3) return;
    setPlacas([...placas, { ...PLACA_VACIA, momento_segundos: Math.floor(durationLimitSeconds / (placas.length + 2)) }]);
  };

  const removePlaca = (index: number) => setPlacas(placas.filter((_, i) => i !== index));

  const updatePlaca = (index: number, field: keyof Placa, value: string | number) => {
    const updated = [...placas];
    updated[index] = { ...updated[index], [field]: value };
    setPlacas(updated);
  };

  const save = async (placasToSave = placas) => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`/api/projects/${projectId}/placas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placas: placasToSave }),
      });
      if (res.ok) setMessage("Guardado.");
      else setMessage("Error al guardar.");
    } catch { setMessage("Error al guardar."); }
    setSaving(false);
  };

  const updatePlacaAndSave = (index: number, field: keyof Placa, value: string | number) => {
    const updated = [...placas];
    updated[index] = { ...updated[index], [field]: value };
    setPlacas(updated);
    // Auto-save after text changes
    if (field === "texto") {
      clearTimeout((window as any)._placasTimeout);
      (window as any)._placasTimeout = setTimeout(() => save(updated), 1500);
    } else {
      save(updated);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">placas de texto ({placas.length}/3)</p>
        {placas.length < 3 && (
          <button type="button" onClick={addPlaca} className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100">
            + agregar placa
          </button>
        )}
      </div>
      {placas.length === 0 && (
        <p className="mt-3 text-xs text-slate-400">Sin placas. Agregá hasta 3 textos que aparecen en momentos específicos del video.</p>
      )}
      <div className="mt-3 space-y-3">
        {placas.map((placa, index) => (
          <div key={index} className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">Placa {index + 1}</p>
              <button type="button" onClick={() => removePlaca(index)} className="text-xs text-red-400 hover:text-red-600">quitar</button>
            </div>
            <textarea rows={2} value={placa.texto} onChange={(e) => updatePlacaAndSave(index, "texto", e.target.value)} placeholder="Texto de la placa..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:bg-white" />
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-slate-400">Aparece a los (segundos)</label>
                <input type="number" min={0} max={durationLimitSeconds} value={placa.momento_segundos} onChange={(e) => updatePlacaAndSave(index, "momento_segundos", Number(e.target.value))} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-400">Duración (segundos)</label>
                <input type="number" min={1} max={10} value={placa.duracion_segundos} onChange={(e) => updatePlacaAndSave(index, "duracion_segundos", Number(e.target.value))} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400" />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-slate-400">Posición vertical</label>
                <div className="mt-1 flex gap-2">
                  {(["top", "center"] as const).map((pos) => (
                    <button key={pos} type="button"
                      onClick={() => updatePlacaAndSave(index, "posicion", pos)}
                      className={placa.posicion === pos ? "flex-1 rounded-xl bg-slate-900 py-1.5 text-xs font-medium text-white" : "flex-1 rounded-xl border border-slate-200 bg-white py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"}>
                      {pos === "top" ? "Arriba" : "Centro"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-400">Alineación</label>
                <div className="mt-1 flex gap-2">
                  {(["center", "left"] as const).map((alin) => (
                    <button key={alin} type="button"
                      onClick={() => updatePlacaAndSave(index, "alineacion", alin)}
                      className={placa.alineacion === alin ? "flex-1 rounded-xl bg-slate-900 py-1.5 text-xs font-medium text-white" : "flex-1 rounded-xl border border-slate-200 bg-white py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"}>
                      {alin === "center" ? "Centro" : "Izquierda"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {placas.length > 0 && (
        <div className="mt-3 flex items-center gap-3">
          <button type="button" onClick={() => save()} disabled={saving} className={saving ? "rounded-xl bg-slate-300 px-4 py-2 text-sm font-medium text-white" : "rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"}>
            {saving ? "guardando..." : "guardar placas"}
          </button>
          {message && <p className="text-xs text-slate-500">{message}</p>}
        </div>
      )}
    </div>
  );
}

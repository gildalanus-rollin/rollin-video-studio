"use client";

import { useEffect, useState } from "react";

type EditorialProfile = {
  id: string;
  category: string;
  system_prompt: string;
};

type SeoConfig = {
  id: string;
  name: string;
  prompt: string;
};

export default function AdminPromptsPage() {
  const [profiles, setProfiles] = useState<EditorialProfile[]>([]);
  const [seoConfig, setSeoConfig] = useState<SeoConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/prompts");
      const json = await res.json();
      setProfiles(json.profiles ?? []);
      setSeoConfig(json.seoConfig ?? null);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { void loadData(); }, []);

  async function saveProfile(id: string, prompt: string) {
    setSaving(id);
    setMessage("");
    try {
      const res = await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "editorial", id, prompt }),
      });
      if (res.ok) setMessage("Guardado.");
      else setMessage("Error al guardar.");
    } catch { setMessage("Error al guardar."); }
    setSaving(null);
  }

  async function saveSeo(id: string, prompt: string) {
    setSaving("seo");
    setMessage("");
    try {
      const res = await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "seo", id, prompt }),
      });
      if (res.ok) setMessage("Guardado.");
      else setMessage("Error al guardar.");
    } catch { setMessage("Error al guardar."); }
    setSaving(null);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">administración</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Prompts editoriales</h1>
        <p className="mt-1 text-sm text-slate-500">Editá los prompts por categoría y el prompt SEO.</p>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Cargando...</p>
      ) : (
        <div className="space-y-4">
          {profiles.map((profile) => (
            <ProfileEditor
              key={profile.id}
              profile={profile}
              saving={saving === profile.id}
              onSave={(prompt) => saveProfile(profile.id, prompt)}
            />
          ))}

          {seoConfig && (
            <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">SEO — títulos y descripciones</p>
              <PromptTextarea
                initialValue={seoConfig.prompt}
                saving={saving === "seo"}
                onSave={(prompt) => saveSeo(seoConfig.id, prompt)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProfileEditor({ profile, saving, onSave }: {
  profile: EditorialProfile;
  saving: boolean;
  onSave: (prompt: string) => void;
}) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{profile.category}</p>
      <PromptTextarea initialValue={profile.system_prompt} saving={saving} onSave={onSave} />
    </div>
  );
}

function PromptTextarea({ initialValue, saving, onSave }: {
  initialValue: string;
  saving: boolean;
  onSave: (prompt: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <div className="mt-3 space-y-2">
      <textarea
        rows={5}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
      />
      <button
        type="button"
        disabled={saving}
        onClick={() => onSave(value)}
        className={saving
          ? "rounded-xl bg-slate-300 px-4 py-2 text-sm font-medium text-white"
          : "rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        }
      >
        {saving ? "guardando..." : "guardar"}
      </button>
    </div>
  );
}

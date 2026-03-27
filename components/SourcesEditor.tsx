"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { buildProjectNotes, parseProjectNotes } from "@/lib/projectNotes";

export default function SourcesEditor({
  projectId,
  currentMain,
}: {
  projectId: string;
  currentMain: string;
}) {
  const router = useRouter();
  const [main, setMain] = useState(currentMain || "");
  const [secondary, setSecondary] = useState("");
  const [loading, setLoading] = useState(false);

  const saveMain = async () => {
    setLoading(true);
    await supabase.from("projects").update({ main_source_url: main }).eq("id", projectId);
    router.refresh();
  };

  const addSecondary = async () => {
    setLoading(true);

    const { data } = await supabase
      .from("projects")
      .select("notes")
      .eq("id", projectId)
      .single();

    const parsed = parseProjectNotes((data as { notes: string | null } | null)?.notes ?? null);

    const notes = buildProjectNotes({
      ...parsed,
      secondarySources: [...parsed.secondarySources, secondary],
    });

    await supabase.from("projects").update({ notes }).eq("id", projectId);

    setSecondary("");
    router.refresh();
  };

  return (
    <div className="space-y-3 mt-3">
      <div className="flex gap-2">
        <input
          value={main}
          onChange={(e) => setMain(e.target.value)}
          placeholder="pegar fuente principal"
          className="flex-1 border rounded-xl px-3 py-2 text-sm"
        />
        <button
          onClick={saveMain}
          className="bg-slate-900 text-white px-3 py-2 rounded-xl text-sm"
        >
          guardar
        </button>
      </div>

      <div className="flex gap-2">
        <input
          value={secondary}
          onChange={(e) => setSecondary(e.target.value)}
          placeholder="agregar fuente secundaria"
          className="flex-1 border rounded-xl px-3 py-2 text-sm"
        />
        <button
          onClick={addSecondary}
          className="bg-slate-900 text-white px-3 py-2 rounded-xl text-sm"
        >
          +
        </button>
      </div>
    </div>
  );
}

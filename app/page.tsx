import { supabase } from '@/lib/supabase'

type PromptProfile = {
  id: string
  name: string
  category: string | null
  tone: string | null
  max_duration_seconds: number
  use_avatar: boolean
  subtitle_style: string
}

export default async function Home() {
  const { data, error } = await supabase
    .from('prompt_profiles')
    .select('id, name, category, tone, max_duration_seconds, use_avatar, subtitle_style')
    .eq('active', true)
    .order('name')

  const profiles = (data ?? []) as PromptProfile[]

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-900 p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Rollin Video Studio</h1>
        <p className="text-lg text-neutral-600 mb-8">
          Base inicial conectada. Ya estamos leyendo perfiles editoriales desde Supabase.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl bg-white border border-neutral-200 p-6">
            <h2 className="font-semibold text-lg mb-2">Proyectos</h2>
            <p className="text-sm text-neutral-500">
              Noticias, borradores y videos en proceso.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-neutral-200 p-6">
            <h2 className="font-semibold text-lg mb-2">Assets</h2>
            <p className="text-sm text-neutral-500">
              Música, imágenes, overlays y videos de apoyo.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-neutral-200 p-6">
            <h2 className="font-semibold text-lg mb-2">Prompts editoriales</h2>
            <p className="text-sm text-neutral-500">
              Perfiles reales cargados desde la base.
            </p>
          </div>
        </div>

        <section className="rounded-2xl bg-white border border-neutral-200 p-6">
          <h2 className="text-2xl font-semibold mb-4">Perfiles editoriales activos</h2>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              Error al leer Supabase: {error.message}
            </div>
          ) : profiles.length === 0 ? (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-neutral-600">
              No hay perfiles activos todavía.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profiles.map((profile) => (
                <div key={profile.id} className="rounded-2xl border border-neutral-200 p-5">
                  <h3 className="text-lg font-semibold mb-2">{profile.name}</h3>
                  <div className="text-sm text-neutral-600 space-y-1">
                    <p><strong>Categoría:</strong> {profile.category ?? 'General'}</p>
                    <p><strong>Tono:</strong> {profile.tone ?? 'No definido'}</p>
                    <p><strong>Duración máxima:</strong> {profile.max_duration_seconds}s</p>
                    <p><strong>Avatar IA:</strong> {profile.use_avatar ? 'Sí' : 'No'}</p>
                    <p><strong>Subtítulos:</strong> {profile.subtitle_style}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

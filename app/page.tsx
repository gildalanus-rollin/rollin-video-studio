export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-900 p-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Rollin Video Studio</h1>
        <p className="text-lg text-neutral-600 mb-8">
          Base inicial conectada. Próximo paso: leer datos desde Supabase.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              Bajadas editoriales para cada tipo de video.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

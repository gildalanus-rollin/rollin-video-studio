'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type PromptProfile = {
  id: string
  name: string
}

export default function NewProjectPage() {
  const [profiles, setProfiles] = useState<PromptProfile[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Política')
  const [mainSourceUrl, setMainSourceUrl] = useState('')
  const [secondarySources, setSecondarySources] = useState('')
  const [durationLimit, setDurationLimit] = useState(90)
  const [outputFormat, setOutputFormat] = useState('9:16')
  const [promptProfileId, setPromptProfileId] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const loadProfiles = async () => {
      const { data, error } = await supabase
        .from('prompt_profiles')
        .select('id, name')
        .eq('active', true)
        .order('name')

      if (error) {
        setError(`No se pudieron cargar los perfiles: ${error.message}`)
      } else {
        setProfiles(data ?? [])
        if (data && data.length > 0) {
          setPromptProfileId(data[0].id)
        }
      }

      setLoadingProfiles(false)
    }

    loadProfiles()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)

    const secondarySourceUrls = secondarySources
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)

    const { error } = await supabase.from('projects').insert({
      title,
      category,
      main_source_url: mainSourceUrl,
      secondary_source_urls: secondarySourceUrls,
      duration_limit_seconds: durationLimit,
      output_format: outputFormat,
      prompt_profile_id: promptProfileId || null,
      notes,
      status: 'draft',
    })

    if (error) {
      setError(`No se pudo guardar el proyecto: ${error.message}`)
    } else {
      setMessage('Proyecto guardado correctamente.')
      setTitle('')
      setCategory('Política')
      setMainSourceUrl('')
      setSecondarySources('')
      setDurationLimit(90)
      setOutputFormat('9:16')
      setNotes('')
    }

    setSaving(false)
  }

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-900 p-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Nuevo proyecto</h1>
          <p className="text-lg text-neutral-600">
            Cargá una noticia, elegí el perfil editorial y guardá el proyecto en la 
base.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white border border-neutral-200 p-6 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium mb-2">Título interno</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-xl border border-neutral-300 px-4 py-3"
              placeholder="Ej: reforma laboral marzo 2026"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3"
            >
              <option>Política</option>
              <option>Economía</option>
              <option>Espectáculos</option>
              <option>Deportes</option>
              <option>Internacionales</option>
              <option>General</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Link principal</label>
            <input
              type="url"
              value={mainSourceUrl}
              onChange={(e) => setMainSourceUrl(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Links secundarios
            </label>
            <textarea
              value={secondarySources}
              onChange={(e) => setSecondarySources(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3"
              placeholder={'Un link por línea'}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Duración máxima</label>
              <select
                value={durationLimit}
                onChange={(e) => setDurationLimit(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 px-4 py-3"
              >
                <option value={60}>60 segundos</option>
                <option value={90}>90 segundos</option>
                <option value={120}>120 segundos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Formato</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-3"
              >
                <option value="9:16">9:16</option>
                <option value="16:9">16:9</option>
                <option value="1:1">1:1</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Perfil editorial</label>
            <select
              value={promptProfileId}
              onChange={(e) => setPromptProfileId(e.target.value)}
              disabled={loadingProfiles}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3"
            >
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notas editoriales</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className="w-full rounded-xl border border-neutral-300 px-4 py-3"
              placeholder="Ej: priorizar conflicto, sumar cifras y cierre fuerte"
            />
          </div>

          {message ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 
text-green-700">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 
text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-neutral-900 text-white px-6 py-3 font-medium 
disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar proyecto'}
          </button>
        </form>
      </div>
    </main>
  )
}

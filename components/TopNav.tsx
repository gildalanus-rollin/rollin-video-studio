import Link from 'next/link'

export default function TopNav() {
  return (
    <nav className="mb-8 flex items-center gap-3 text-sm">
      <Link
        href="/"
        className="rounded-full border border-neutral-300 bg-white px-4 
py-2 text-neutral-700 hover:bg-neutral-50"
      >
        Inicio
      </Link>

      <Link
        href="/projects"
        className="rounded-full border border-neutral-300 bg-white px-4 
py-2 text-neutral-700 hover:bg-neutral-50"
      >
        Proyectos
      </Link>

      <Link
        href="/projects/new"
        className="rounded-full bg-neutral-900 px-4 py-2 text-white 
hover:opacity-90"
      >
        Nuevo proyecto
      </Link>
    </nav>
  )
}

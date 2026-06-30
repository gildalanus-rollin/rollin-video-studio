import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { FolderOpen, FilePlus2, Settings } from "lucide-react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rollin Studio",
  description: "Plataforma de producción editorial",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#f5f7fb] text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-[1400px]">
          {/* Sidebar */}
          <aside className="hidden w-[220px] shrink-0 bg-[#14161c] lg:flex lg:flex-col">
            <div className="px-5 py-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Rollin Studio
              </p>
              <p className="mt-1 text-base font-semibold text-white">
                producción editorial
              </p>
            </div>
            <nav className="flex-1 space-y-0.5 px-3">
              <Link
                href="/projects"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <FolderOpen size={17} strokeWidth={1.75} />
                Proyectos
              </Link>
              <Link
                href="/projects/new"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <FilePlus2 size={17} strokeWidth={1.75} />
                Nuevo proyecto
              </Link>
              <Link
                href="/admin/prompts"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <Settings size={17} strokeWidth={1.75} />
                Prompts
              </Link>
            </nav>
            <div className="border-t border-white/10 px-5 py-4">
              <p className="text-xs text-white/30">
                v1.0 · Railway + Supabase
              </p>
            </div>
          </aside>
          {/* Main */}
          <main className="flex-1 overflow-x-hidden">
            <div className="px-4 py-6 sm:px-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}

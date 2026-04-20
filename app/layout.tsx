import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { createClient } from "@/lib/supabase-server";
import LogoutButton from "@/components/LogoutButton";
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
  title: "Video Studio",
  description: "Estudio editorial de producción",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#f5f7fb] text-slate-900">
        <div className="min-h-screen">
          <div className="mx-auto flex min-h-screen max-w-[1600px]">
            <aside className="hidden w-[260px] border-r border-slate-200 bg-white px-5 py-6 lg:block">
              <div className="mb-8">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  editorial studio
                </p>
                <h1 className="mt-2 text-xl font-semibold text-slate-900">
                  video workflow
                </h1>
                {user && (
                  <p className="mt-1 truncate text-xs text-slate-400">
                    {user.email}
                  </p>
                )}
              </div>

              <nav className="space-y-2">
                <Link
                  href="/"
                  className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Inicio
                </Link>
                <Link
                  href="/projects"
                  className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Proyectos
                </Link>
                <Link
                  href="/projects/new"
                  className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Nuevo proyecto
                </Link>
                <Link
                  href="/modules"
                  className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Módulos
                </Link>
              </nav>

              {user && (
                <div className="mt-8">
                  <LogoutButton />
                </div>
              )}
            </aside>

            <main className="flex-1">
              <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
                <div className="px-4 py-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                        panel de trabajo
                      </p>
                      <h2 className="mt-1 text-lg font-semibold text-slate-900">
                        estudio de producción editorial
                      </h2>
                    </div>
                    <div className="flex items-center gap-3">
                      {user && <LogoutButton />}
                      <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
                        online
                      </div>
                    </div>
                  </div>
                </div>
              </header>

              <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}

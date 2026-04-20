"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

type Mode = "login" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setError("Email o contraseña incorrectos.");
      return;
    }

    router.push("/");
    router.refresh();
  };

  const handleForgot = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    setSuccess("");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError("No se pudo enviar el email. Verificá la dirección.");
      return;
    }

    setSuccess("Te enviamos un email con el link para resetear tu contraseña.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            editorial studio
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            {mode === "login" ? "iniciar sesión" : "recuperar contraseña"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {mode === "login"
              ? "Ingresá con tu cuenta de redacción."
              : "Te mandamos un link para resetear tu contraseña."}
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@redaccion.com"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                onKeyDown={(e) => e.key === "Enter" && mode === "login" && handleLogin()}
              />
            </div>

            {mode === "login" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
            )}

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                {success}
              </p>
            )}

            {mode === "login" ? (
              <button
                type="button"
                onClick={handleLogin}
                disabled={loading || !email.trim() || !password.trim()}
                className={
                  loading || !email.trim() || !password.trim()
                    ? "w-full rounded-xl bg-slate-300 px-4 py-3 text-sm font-medium text-white"
                    : "w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                }
              >
                {loading ? "ingresando..." : "ingresar"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleForgot}
                disabled={loading || !email.trim()}
                className={
                  loading || !email.trim()
                    ? "w-full rounded-xl bg-slate-300 px-4 py-3 text-sm font-medium text-white"
                    : "w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                }
              >
                {loading ? "enviando..." : "enviar link de recuperación"}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "forgot" : "login");
                setError("");
                setSuccess("");
              }}
              className="w-full text-center text-sm text-slate-500 transition hover:text-slate-700"
            >
              {mode === "login" ? "olvidé mi contraseña" : "volver al login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

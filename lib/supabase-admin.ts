import { createClient } from "@supabase/supabase-js";

function getEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== "" ? value : undefined;
}

export function getSupabaseAdmin() {
  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");

  const adminKey =
    getEnv("SUPABASE_SECRET_KEY") ||
    getEnv("SUPABASE_SERVICE_ROLE_KEY") ||
    getEnv("SUPABASE_SERVICE_ROLE") ||
    getEnv("SUPABASE_SERVICE_ROLE_SECRET");

  if (!supabaseUrl) {
    throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!adminKey) {
    throw new Error("Falta clave admin de Supabase en el servidor");
  }

  return createClient(supabaseUrl, adminKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

  return NextResponse.json({
    hasUrl: Boolean(url),
    hasKey: Boolean(key),
    urlPreview: url ? `${url.slice(0, 40)}...` : "",
    keyPreview: key ? `${key.slice(0, 12)}...` : "",
  });
}

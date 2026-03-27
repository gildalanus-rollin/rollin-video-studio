import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("fileName");

    if (!fileName) {
      return NextResponse.json({ error: "Missing fileName" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "out", fileName);
    const fileBuffer = await fs.readFile(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `inline; filename="${fileName}"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "No se pudo leer el video." },
      { status: 404 }
    );
  }
}

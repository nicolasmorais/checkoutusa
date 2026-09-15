import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const pixels = await prisma.taboolaPixel.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(pixels);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const pixelId = typeof body.pixelId === "string" ? body.pixelId.trim() : "";

  if (!name || !pixelId) {
    return NextResponse.json({ error: "Name and Pixel ID are required" }, { status: 400 });
  }

  const pixel = await prisma.taboolaPixel.create({ data: { name, pixelId } });
  return NextResponse.json(pixel);
}

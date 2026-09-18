import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { endpoint } = await req.json();
  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
  }

  await prisma.pushSubscription.deleteMany({ where: { endpoint } });

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { z } from "zod";

const SINGLETON_ID = "singleton";

const shippingSchema = z.object({
  label: z.string().min(1),
  estimatedDays: z.string().min(1),
  priceCents: z.number().int().nonnegative(),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const settings = await prisma.shippingSettings.upsert({
    where: { id: SINGLETON_ID },
    update: {},
    create: { id: SINGLETON_ID },
  });

  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const parsed = shippingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const settings = await prisma.shippingSettings.upsert({
    where: { id: SINGLETON_ID },
    update: parsed.data,
    create: { id: SINGLETON_ID, ...parsed.data },
  });

  return NextResponse.json(settings);
}

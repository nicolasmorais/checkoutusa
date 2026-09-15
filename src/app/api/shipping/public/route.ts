import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.shippingSettings.findUnique({ where: { id: "singleton" } });

  return NextResponse.json({
    label: settings?.label ?? "Standard Shipping",
    estimatedDays: settings?.estimatedDays ?? "5-7 business days",
    priceCents: settings?.priceCents ?? 599,
  });
}

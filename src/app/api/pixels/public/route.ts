import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.pixelSettings.findUnique({ where: { id: "singleton" } });
  return NextResponse.json({
    metaPixelId: settings?.metaPixelId ?? null,
    tiktokPixelId: settings?.tiktokPixelId ?? null,
    googleAdsId: settings?.googleAdsId ?? null,
    googleConversionLabel: settings?.googleConversionLabel ?? null,
    ga4MeasurementId: settings?.ga4MeasurementId ?? null,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

const SINGLETON_ID = "singleton";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const settings = await prisma.pixelSettings.upsert({
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
  const settings = await prisma.pixelSettings.upsert({
    where: { id: SINGLETON_ID },
    update: {
      metaPixelId: body.metaPixelId || null,
      metaAccessToken: body.metaAccessToken || null,
      tiktokPixelId: body.tiktokPixelId || null,
      tiktokAccessToken: body.tiktokAccessToken || null,
      googleAdsId: body.googleAdsId || null,
      googleConversionLabel: body.googleConversionLabel || null,
      ga4MeasurementId: body.ga4MeasurementId || null,
      ga4ApiSecret: body.ga4ApiSecret || null,
    },
    create: {
      id: SINGLETON_ID,
      metaPixelId: body.metaPixelId || null,
      metaAccessToken: body.metaAccessToken || null,
      tiktokPixelId: body.tiktokPixelId || null,
      tiktokAccessToken: body.tiktokAccessToken || null,
      googleAdsId: body.googleAdsId || null,
      googleConversionLabel: body.googleConversionLabel || null,
      ga4MeasurementId: body.ga4MeasurementId || null,
      ga4ApiSecret: body.ga4ApiSecret || null,
    },
  });
  return NextResponse.json(settings);
}

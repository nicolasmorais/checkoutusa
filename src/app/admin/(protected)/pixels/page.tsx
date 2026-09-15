import { prisma } from "@/lib/prisma";
import { PixelsFormClient } from "./PixelsFormClient";

export default async function PixelsPage() {
  const settings = await prisma.pixelSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  return (
    <PixelsFormClient
      initial={{
        metaPixelId: settings.metaPixelId ?? "",
        metaAccessToken: settings.metaAccessToken ?? "",
        tiktokPixelId: settings.tiktokPixelId ?? "",
        tiktokAccessToken: settings.tiktokAccessToken ?? "",
        googleAdsId: settings.googleAdsId ?? "",
        googleConversionLabel: settings.googleConversionLabel ?? "",
        ga4MeasurementId: settings.ga4MeasurementId ?? "",
        ga4ApiSecret: settings.ga4ApiSecret ?? "",
      }}
    />
  );
}

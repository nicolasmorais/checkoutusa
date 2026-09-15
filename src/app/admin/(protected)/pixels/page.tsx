import { prisma } from "@/lib/prisma";
import { PixelsFormClient } from "./PixelsFormClient";
import { TaboolaPixelsManager } from "./TaboolaPixelsManager";

export default async function PixelsPage() {
  const [settings, taboolaPixels] = await Promise.all([
    prisma.pixelSettings.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton" },
    }),
    prisma.taboolaPixel.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="max-w-2xl space-y-8">
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
      <TaboolaPixelsManager
        initial={taboolaPixels.map((p) => ({ id: p.id, name: p.name, pixelId: p.pixelId }))}
      />
    </div>
  );
}

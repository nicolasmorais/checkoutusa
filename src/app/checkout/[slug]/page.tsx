import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CheckoutClient } from "./CheckoutClient";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, checkoutSettings, shippingSettings, pixelSettings] = await Promise.all([
    prisma.product.findUnique({ where: { slug } }),
    prisma.checkoutSettings.findUnique({ where: { id: "singleton" } }),
    prisma.shippingSettings.findUnique({ where: { id: "singleton" } }),
    prisma.pixelSettings.findUnique({ where: { id: "singleton" } }),
  ]);

  if (!product || !product.active) notFound();

  return (
    <Suspense fallback={<div className="p-16 text-center text-neutral-600">Loading...</div>}>
      <CheckoutClient
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          imageUrl: product.imageUrl,
          priceCents: product.priceCents,
          compareAtCents: product.compareAtCents,
          currency: product.currency,
          requiresShipping: product.requiresShipping,
          taboolaPixelId: product.taboolaPixelId,
        }}
        initialLogoUrl={checkoutSettings?.logoUrl ?? null}
        initialAnnouncementBar={{
          enabled: checkoutSettings?.announcementBarEnabled ?? true,
          text: checkoutSettings?.announcementBarText ?? "You've got free shipping!",
          bgColor: checkoutSettings?.announcementBarBgColor ?? "#008060",
          textColor: checkoutSettings?.announcementBarTextColor ?? "#ffffff",
          fontSize: checkoutSettings?.announcementBarFontSize ?? 12,
        }}
        initialShipping={{
          label: shippingSettings?.label ?? "Standard Shipping",
          estimatedDays: shippingSettings?.estimatedDays ?? "5-7 business days",
          priceCents: shippingSettings?.priceCents ?? 599,
        }}
        initialPixelSettings={{
          metaPixelId: pixelSettings?.metaPixelId ?? null,
          tiktokPixelId: pixelSettings?.tiktokPixelId ?? null,
          googleAdsId: pixelSettings?.googleAdsId ?? null,
          googleConversionLabel: pixelSettings?.googleConversionLabel ?? null,
          ga4MeasurementId: pixelSettings?.ga4MeasurementId ?? null,
        }}
      />
    </Suspense>
  );
}

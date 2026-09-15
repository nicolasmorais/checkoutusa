import { prisma } from "@/lib/prisma";
import { ShippingFormClient } from "./ShippingFormClient";

export default async function ShippingSettingsPage() {
  const settings = await prisma.shippingSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  return (
    <ShippingFormClient
      initial={{ label: settings.label, estimatedDays: settings.estimatedDays, priceCents: settings.priceCents }}
    />
  );
}

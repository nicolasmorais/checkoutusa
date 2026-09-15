import { prisma } from "@/lib/prisma";
import { CheckoutSettingsFormClient } from "./CheckoutSettingsFormClient";

export default async function CheckoutSettingsPage() {
  const settings = await prisma.checkoutSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  return (
    <CheckoutSettingsFormClient
      initialLogoUrl={settings.logoUrl ?? ""}
      initialAnnouncementBarEnabled={settings.announcementBarEnabled}
      initialAnnouncementBarText={settings.announcementBarText}
      initialAnnouncementBarBgColor={settings.announcementBarBgColor}
      initialAnnouncementBarTextColor={settings.announcementBarTextColor}
      initialAnnouncementBarFontSize={settings.announcementBarFontSize}
    />
  );
}

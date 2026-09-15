import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.checkoutSettings.findUnique({ where: { id: "singleton" } });
  return NextResponse.json({
    logoUrl: settings?.logoUrl ?? null,
    announcementBarEnabled: settings?.announcementBarEnabled ?? true,
    announcementBarText: settings?.announcementBarText ?? "You've got free shipping!",
    announcementBarBgColor: settings?.announcementBarBgColor ?? "#008060",
    announcementBarTextColor: settings?.announcementBarTextColor ?? "#ffffff",
    announcementBarFontSize: settings?.announcementBarFontSize ?? 12,
    buttonColor: settings?.buttonColor ?? "#008060",
    buttonTextColor: settings?.buttonTextColor ?? "#ffffff",
  });
}

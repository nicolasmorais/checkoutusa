import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

const SINGLETON_ID = "singleton";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const settings = await prisma.checkoutSettings.upsert({
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
  const logoUrl = typeof body.logoUrl === "string" ? body.logoUrl.trim() : "";
  const announcementBarEnabled = Boolean(body.announcementBarEnabled);
  const announcementBarText =
    typeof body.announcementBarText === "string" ? body.announcementBarText.trim() : "";
  const HEX_RE = /^#[0-9a-fA-F]{6}$/;
  const announcementBarBgColor =
    typeof body.announcementBarBgColor === "string" && HEX_RE.test(body.announcementBarBgColor)
      ? body.announcementBarBgColor
      : "#008060";
  const announcementBarTextColor =
    typeof body.announcementBarTextColor === "string" && HEX_RE.test(body.announcementBarTextColor)
      ? body.announcementBarTextColor
      : "#ffffff";
  const announcementBarFontSize = Math.min(
    32,
    Math.max(10, Number.isFinite(Number(body.announcementBarFontSize)) ? Number(body.announcementBarFontSize) : 12)
  );
  const buttonColor =
    typeof body.buttonColor === "string" && HEX_RE.test(body.buttonColor) ? body.buttonColor : "#008060";
  const buttonTextColor =
    typeof body.buttonTextColor === "string" && HEX_RE.test(body.buttonTextColor)
      ? body.buttonTextColor
      : "#ffffff";

  const data = {
    logoUrl: logoUrl || null,
    announcementBarEnabled,
    announcementBarText,
    announcementBarBgColor,
    announcementBarTextColor,
    announcementBarFontSize,
    buttonColor,
    buttonTextColor,
  };

  const settings = await prisma.checkoutSettings.upsert({
    where: { id: SINGLETON_ID },
    update: data,
    create: { id: SINGLETON_ID, ...data },
  });

  return NextResponse.json(settings);
}

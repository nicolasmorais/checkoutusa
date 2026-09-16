import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { DEFAULT_EMAIL_SUBJECT, DEFAULT_EMAIL_BODY } from "@/lib/email-templates";

const SINGLETON_ID = "singleton";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const template = await prisma.emailTemplate.upsert({
    where: { id: SINGLETON_ID },
    update: {},
    create: {
      id: SINGLETON_ID,
      subject: DEFAULT_EMAIL_SUBJECT,
      bodyHtml: DEFAULT_EMAIL_BODY,
    },
  });

  return NextResponse.json(template);
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  if (typeof body.subject !== "string" || typeof body.bodyHtml !== "string") {
    return NextResponse.json({ error: "subject and bodyHtml are required" }, { status: 400 });
  }
  const resendApiKey = typeof body.resendApiKey === "string" ? body.resendApiKey.trim() : "";
  const resendFromEmail = typeof body.resendFromEmail === "string" ? body.resendFromEmail.trim() : "";

  const data = {
    subject: body.subject,
    bodyHtml: body.bodyHtml,
    resendApiKey: resendApiKey || null,
    resendFromEmail: resendFromEmail || null,
  };

  const template = await prisma.emailTemplate.upsert({
    where: { id: SINGLETON_ID },
    update: data,
    create: { id: SINGLETON_ID, ...data },
  });

  return NextResponse.json(template);
}

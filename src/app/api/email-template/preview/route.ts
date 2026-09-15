import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { renderEmailPreview } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  if (typeof body.subject !== "string" || typeof body.bodyHtml !== "string") {
    return NextResponse.json({ error: "subject and bodyHtml are required" }, { status: 400 });
  }

  const rendered = renderEmailPreview(body.subject, body.bodyHtml);
  return NextResponse.json(rendered);
}

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { sendOrderConfirmationEmail } from "@/lib/send-order-email";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  try {
    const result = await sendOrderConfirmationEmail(id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
}

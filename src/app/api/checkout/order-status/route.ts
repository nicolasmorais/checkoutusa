import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      number: true,
      status: true,
      currency: true,
      subtotalCents: true,
      shippingCents: true,
      totalCents: true,
      customerName: true,
      customerEmail: true,
      shippingAddressLine1: true,
      shippingAddressLine2: true,
      shippingCity: true,
      shippingState: true,
      shippingPostalCode: true,
      createdAt: true,
      purchaseEventSent: true,
      taboolaPixelId: true,
      items: {
        select: {
          name: true,
          quantity: true,
          priceCents: true,
          productId: true,
          product: { select: { slug: true } },
        },
      },
    },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (order.status === "paid" && !order.purchaseEventSent) {
    await prisma.order.update({ where: { id: order.id }, data: { purchaseEventSent: true } });
  }

  return NextResponse.json({ ...order, purchaseEventSent: undefined, shouldFirePurchase: order.status === "paid" && !order.purchaseEventSent });
}

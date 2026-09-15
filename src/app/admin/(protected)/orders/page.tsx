import { prisma } from "@/lib/prisma";
import { OrdersListClient } from "./OrdersListClient";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: { items: { select: { name: true, quantity: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <OrdersListClient
      initialOrders={orders.map((o) => ({
        id: o.id,
        number: o.number,
        status: o.status,
        totalCents: o.totalCents,
        currency: o.currency,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        createdAt: o.createdAt.toISOString(),
        items: o.items,
      }))}
    />
  );
}

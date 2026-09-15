import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [paidOrders, todayOrders, statusGroups, last30, previous30, topItems, recentOrders] =
    await Promise.all([
      prisma.order.findMany({ where: { status: "paid" }, select: { totalCents: true, createdAt: true } }),
      prisma.order.count({ where: { status: "paid", createdAt: { gte: startOfToday } } }),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.order.findMany({
        where: { status: "paid", createdAt: { gte: thirtyDaysAgo } },
        select: { totalCents: true, createdAt: true },
      }),
      prisma.order.findMany({
        where: { status: "paid", createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        select: { totalCents: true },
      }),
      prisma.orderItem.findMany({
        where: { order: { status: "paid" } },
        select: { name: true, quantity: true, priceCents: true },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          number: true,
          status: true,
          totalCents: true,
          currency: true,
          customerName: true,
          createdAt: true,
        },
      }),
    ]);

  const totalRevenueCents = paidOrders.reduce((sum, o) => sum + o.totalCents, 0);
  const totalOrders = paidOrders.length;
  const avgOrderValueCents = totalOrders > 0 ? Math.round(totalRevenueCents / totalOrders) : 0;

  const allOrdersCount = statusGroups.reduce((sum, g) => sum + g._count._all, 0);
  const paidCount = statusGroups.find((g) => g.status === "paid")?._count._all ?? 0;
  const conversionRate = allOrdersCount > 0 ? paidCount / allOrdersCount : 0;

  const revenueLast30 = last30.reduce((sum, o) => sum + o.totalCents, 0);
  const revenuePrevious30 = previous30.reduce((sum, o) => sum + o.totalCents, 0);
  const revenueChangePct =
    revenuePrevious30 > 0
      ? ((revenueLast30 - revenuePrevious30) / revenuePrevious30) * 100
      : revenueLast30 > 0
        ? 100
        : 0;

  const byDay = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    byDay.set(key, 0);
  }
  for (const o of last30) {
    const key = o.createdAt.toISOString().slice(0, 10);
    if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + o.totalCents);
  }
  const salesByDay = Array.from(byDay.entries()).map(([date, cents]) => ({ date, revenue: cents / 100 }));

  const productRevenue = new Map<string, number>();
  for (const item of topItems) {
    productRevenue.set(item.name, (productRevenue.get(item.name) ?? 0) + item.priceCents * item.quantity);
  }
  const topProducts = Array.from(productRevenue.entries())
    .map(([name, cents]) => ({ name, revenue: cents / 100 }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const orderStatusCounts = statusGroups
    .map((g) => ({ status: g.status, count: g._count._all }))
    .sort((a, b) => b.count - a.count);

  return {
    totalRevenueCents,
    totalOrders,
    avgOrderValueCents,
    ordersToday: todayOrders,
    conversionRate,
    revenueLast30Cents: revenueLast30,
    revenueChangePct,
    salesByDay,
    topProducts,
    orderStatusCounts,
    recentOrders: recentOrders.map((o) => ({ ...o, createdAt: o.createdAt.toISOString() })),
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

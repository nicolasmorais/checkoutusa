"use client";

import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, ArrowRight } from "lucide-react";
import { formatCents, cn } from "@/lib/utils";
import type { DashboardData } from "@/lib/dashboard-data";

const BLUE = "#2a78d6";

const STATUS_META: Record<string, { label: string; dot: string }> = {
  paid: { label: "Paid", dot: "#0ca30c" },
  pending: { label: "Pending", dot: "#fab219" },
  shipped: { label: "Shipped", dot: "#2a78d6" },
  delivered: { label: "Delivered", dot: "#0ca30c" },
  failed: { label: "Failed", dot: "#d03b3b" },
  refunded: { label: "Refunded", dot: "#898781" },
  canceled: { label: "Canceled", dot: "#898781" },
};

const STATUS_BADGE: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-neutral-200 text-neutral-600",
  canceled: "bg-neutral-200 text-neutral-600",
};

function StatCard({
  label,
  value,
  deltaPct,
}: {
  label: string;
  value: string;
  deltaPct?: number;
}) {
  const isUp = (deltaPct ?? 0) >= 0;
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <div className="mt-1.5 flex items-baseline gap-2">
        <p className="text-2xl font-semibold text-neutral-900">{value}</p>
        {deltaPct !== undefined && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              isUp ? "text-[#006300]" : "text-[#d03b3b]"
            )}
          >
            {isUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(deltaPct).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}

export function DashboardView({ data }: { data: DashboardData }) {
  const maxProductRevenue = Math.max(1, ...data.topProducts.map((p) => p.revenue));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Sales dashboard</h1>
        <p className="mt-0.5 text-sm text-neutral-500">Last 30 days</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Revenue (30d)"
          value={formatCents(data.revenueLast30Cents)}
          deltaPct={data.revenueChangePct}
        />
        <StatCard label="Paid orders" value={String(data.totalOrders)} />
        <StatCard label="Avg. order value" value={formatCents(data.avgOrderValueCents)} />
        <StatCard label="Conversion rate" value={`${(data.conversionRate * 100).toFixed(1)}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue chart */}
        <div className="rounded-lg border border-neutral-200 bg-white p-5 lg:col-span-2">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-medium text-neutral-900">Revenue trend</h2>
            <span className="text-xs text-neutral-400">Daily, last 30 days</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.salesByDay} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BLUE} stopOpacity={0.12} />
                  <stop offset="100%" stopColor={BLUE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="0" stroke="#e1e0d9" />
              <XAxis
                dataKey="date"
                tickFormatter={(d: string) => d.slice(5)}
                tickLine={false}
                axisLine={{ stroke: "#c3c2b7" }}
                fontSize={11}
                stroke="#898781"
                minTickGap={24}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={11}
                stroke="#898781"
                tickFormatter={(v) => `$${v}`}
                width={46}
              />
              <Tooltip
                cursor={{ stroke: "#c3c2b7", strokeWidth: 1 }}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e1e0d9",
                  fontSize: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}
                formatter={(v) => [`$${Number(v).toFixed(2)}`, "Revenue"]}
                labelFormatter={(d) => d}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={BLUE}
                strokeWidth={2}
                fill="url(#rev)"
                dot={false}
                activeDot={{ r: 4, fill: BLUE, stroke: "#fcfcfb", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order status breakdown */}
        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          <h2 className="mb-4 font-medium text-neutral-900">Orders by status</h2>
          {data.orderStatusCounts.length === 0 ? (
            <p className="text-sm text-neutral-400">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {data.orderStatusCounts.map((s) => {
                const meta = STATUS_META[s.status] ?? { label: s.status, dot: "#898781" };
                const total = data.orderStatusCounts.reduce((sum, x) => sum + x.count, 0);
                const pct = total > 0 ? (s.count / total) * 100 : 0;
                return (
                  <div key={s.status}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-neutral-700">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.dot }} />
                        {meta.label}
                      </span>
                      <span className="font-medium text-neutral-900">{s.count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: meta.dot }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top products */}
        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          <h2 className="mb-4 font-medium text-neutral-900">Top products by revenue</h2>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-neutral-400">No paid orders yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(140, data.topProducts.length * 44)}>
              <BarChart
                data={data.topProducts}
                layout="vertical"
                margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
                barCategoryGap={14}
              >
                <XAxis type="number" hide domain={[0, maxProductRevenue * 1.15]} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="#52514e"
                />
                <Tooltip
                  cursor={{ fill: "#f9f9f7" }}
                  contentStyle={{ borderRadius: 8, border: "1px solid #e1e0d9", fontSize: 12 }}
                  formatter={(v) => [`$${Number(v).toFixed(2)}`, "Revenue"]}
                />
                <Bar dataKey="revenue" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {data.topProducts.map((_, i) => (
                    <Cell key={i} fill={BLUE} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent orders */}
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
            <h2 className="font-medium text-neutral-900">Recent orders</h2>
            <Link href="/admin/orders" className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900">
              View all
              <ArrowRight size={12} />
            </Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <p className="p-5 text-sm text-neutral-400">No orders yet.</p>
          ) : (
            <div>
              {data.recentOrders.map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/orders/${o.id}`}
                  className="flex items-center justify-between border-b border-neutral-50 px-5 py-3 text-sm last:border-0 hover:bg-neutral-50"
                >
                  <div>
                    <p className="font-medium text-neutral-900">#{o.number} · {o.customerName}</p>
                    <p className="text-xs text-neutral-400">
                      {new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-neutral-900">{formatCents(o.totalCents, o.currency)}</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", STATUS_BADGE[o.status] ?? "bg-neutral-100 text-neutral-600")}>
                      {o.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

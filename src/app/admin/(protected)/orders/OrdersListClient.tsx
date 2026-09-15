"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { formatCents } from "@/lib/utils";
import { STATUS_OPTIONS, STATUS_COLORS } from "@/components/OrderStatusSelect";

type Order = {
  id: string;
  number: number;
  status: string;
  totalCents: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  items: { name: string; quantity: number }[];
};

export function OrdersListClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState("");
  const [query, setQuery] = useState("");
  const isFirstRender = useRef(true);

  function load() {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (query) params.set("q", query);
    fetch(`/api/orders?${params.toString()}`)
      .then((r) => r.json())
      .then(setOrders);
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    load();
  }, [statusFilter, query]);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success("Order updated");
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    } else {
      toast.error("Failed to update order");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Orders</h1>

      <div className="flex gap-3">
        <input
          placeholder="Search by name or email"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-neutral-100">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                    #{o.number}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                    {o.customerName}
                  </Link>
                  <div className="text-xs text-neutral-500">{o.customerEmail}</div>
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {o.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                </td>
                <td className="px-4 py-3">{formatCents(o.totalCents, o.currency)}</td>
                <td className="px-4 py-3 text-neutral-500">{new Date(o.createdAt).toLocaleString("en-US")}</td>
                <td className="px-4 py-3">
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    className={`rounded-full border-0 px-2 py-1 text-xs font-medium ${STATUS_COLORS[o.status] ?? "bg-neutral-100"}`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-6 text-center text-neutral-500">No orders found.</p>}
      </div>
    </div>
  );
}

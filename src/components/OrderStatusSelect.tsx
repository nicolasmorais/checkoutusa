"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

const STATUS_OPTIONS = ["pending", "paid", "shipped", "delivered", "failed", "refunded", "canceled"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-green-100 text-green-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-neutral-200 text-neutral-600",
  canceled: "bg-neutral-200 text-neutral-600",
};

export { STATUS_OPTIONS, STATUS_COLORS };

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();

  async function updateStatus(newStatus: string) {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      toast.success("Order updated");
      router.refresh();
    } else {
      toast.error("Failed to update order");
    }
  }

  return (
    <select
      value={status}
      onChange={(e) => updateStatus(e.target.value)}
      className={`rounded-full border-0 px-3 py-1.5 text-sm font-medium ${STATUS_COLORS[status] ?? "bg-neutral-100"}`}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

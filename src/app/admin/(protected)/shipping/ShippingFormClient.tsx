"use client";

import { useState } from "react";
import { toast } from "sonner";

export function ShippingFormClient({
  initial,
}: {
  initial: { label: string; estimatedDays: string; priceCents: number };
}) {
  const [label, setLabel] = useState(initial.label);
  const [estimatedDays, setEstimatedDays] = useState(initial.estimatedDays);
  const [price, setPrice] = useState((initial.priceCents / 100).toString());
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const priceCents = Math.round(parseFloat(price || "0") * 100);
    const res = await fetch("/api/shipping", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, estimatedDays, priceCents }),
    });
    setSaving(false);
    if (res.ok) toast.success("Shipping settings saved");
    else toast.error("Failed to save shipping settings");
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Shipping</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          Flat rate applied at checkout to every physical product.
        </p>
      </div>

      <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6">
        <div>
          <label className="text-sm font-medium">Label</label>
          <input
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Estimated delivery</label>
          <input
            placeholder="5-7 business days"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
            value={estimatedDays}
            onChange={(e) => setEstimatedDays(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Price (USD)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <p className="mt-1 text-xs text-neutral-500">Set to 0 for free shipping.</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save shipping settings"}
        </button>
      </div>
    </div>
  );
}

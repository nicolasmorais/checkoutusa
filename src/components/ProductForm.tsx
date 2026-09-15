"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  priceCents: number;
  compareAtCents: number | null;
  active: boolean;
  requiresShipping: boolean;
  stock: number | null;
  taboolaPixelId: string;
};

export function ProductForm({ initial }: { initial?: ProductFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(
    initial ?? {
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      priceCents: 0,
      compareAtCents: null,
      active: true,
      requiresShipping: true,
      stock: null,
      taboolaPixelId: "",
    }
  );
  const [price, setPrice] = useState((initial ? initial.priceCents / 100 : 0).toString());
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const priceCents = Math.round(parseFloat(price || "0") * 100);
    const payload = { ...values, priceCents };

    const url = values.id ? `/api/products/${values.id}` : "/api/products";
    const method = values.id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (res.ok) {
      toast.success(values.id ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    } else {
      const data = await res.json();
      if (typeof data.error === "string") {
        toast.error(data.error);
      } else {
        const fieldErrors = data.error?.fieldErrors ?? {};
        const firstMessage = Object.values(fieldErrors).flat().find((m): m is string => typeof m === "string");
        toast.error(firstMessage ?? "Failed to save product");
      }
    }
  }

  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4 rounded-lg border border-neutral-200 bg-white p-6">
      <div>
        <label className="text-sm font-medium">Name</label>
        <input
          required
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Slug (checkout URL)</label>
        <input
          placeholder="auto-generated from name if empty"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
          value={values.slug}
          onChange={(e) => update("slug", e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
          rows={3}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Image URL</label>
        <input
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
          value={values.imageUrl}
          onChange={(e) => update("imageUrl", e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Price (USD)</label>
        <input
          required
          type="number"
          step="0.01"
          min="0"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Stock (leave empty for unlimited)</label>
        <input
          type="number"
          min="0"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
          value={values.stock ?? ""}
          onChange={(e) => update("stock", e.target.value === "" ? null : Number(e.target.value))}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Taboola Pixel ID (optional)</label>
        <input
          placeholder="1234567"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
          value={values.taboolaPixelId}
          onChange={(e) => update("taboolaPixelId", e.target.value)}
        />
        <p className="mt-1 text-xs text-neutral-500">
          Fires a page view on this product&apos;s checkout and a purchase event on success — separate from the global pixels.
        </p>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.active}
            onChange={(e) => update("active", e.target.checked)}
          />
          Active
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.requiresShipping}
            onChange={(e) => update("requiresShipping", e.target.checked)}
          />
          Physical product (requires shipping)
        </label>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save product"}
      </button>
    </form>
  );
}

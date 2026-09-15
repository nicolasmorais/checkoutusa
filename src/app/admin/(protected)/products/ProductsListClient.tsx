"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Copy, Check, ExternalLink } from "lucide-react";
import { formatCents } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  currency: string;
  active: boolean;
  stock: number | null;
};

export function ProductsListClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } else {
      toast.error("Failed to delete product");
    }
  }

  async function handleCopyLink(slug: string) {
    const url = `${window.location.origin}/checkout/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    toast.success("Checkout link copied");
    setTimeout(() => setCopiedSlug((s) => (s === slug ? null : s)), 1500);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link href="/admin/products/new" className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
          + New product
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Checkout link</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-neutral-100">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">{formatCents(p.priceCents, p.currency)}</td>
                <td className="px-4 py-3">{p.stock ?? "∞"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${p.active ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>
                    {p.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`/checkout/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 hover:underline"
                      title="Open checkout"
                    >
                      /checkout/{p.slug}
                      <ExternalLink size={12} />
                    </a>
                    <button
                      onClick={() => handleCopyLink(p.slug)}
                      title="Copy checkout link"
                      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
                    >
                      {copiedSlug === p.slug ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/products/${p.id}`} className="mr-3 text-neutral-600 hover:underline">
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-6 text-center text-neutral-500">No products yet.</p>}
      </div>
    </div>
  );
}

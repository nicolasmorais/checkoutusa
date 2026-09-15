"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { IntegrationCard } from "./IntegrationCard";

export type TaboolaPixelRow = { id: string; name: string; pixelId: string };

export function TaboolaPixelsManager({ initial }: { initial: TaboolaPixelRow[] }) {
  const router = useRouter();
  const [pixels, setPixels] = useState(initial);
  const [name, setName] = useState("");
  const [pixelId, setPixelId] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !pixelId.trim()) return;
    setSaving(true);
    const res = await fetch("/api/taboola-pixels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, pixelId }),
    });
    setSaving(false);
    if (res.ok) {
      const created = await res.json();
      setPixels((p) => [created, ...p]);
      setName("");
      setPixelId("");
      toast.success("Taboola pixel added");
      router.refresh();
    } else {
      toast.error("Failed to add pixel");
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/taboola-pixels/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPixels((p) => p.filter((x) => x.id !== id));
      toast.success("Pixel removed");
      router.refresh();
    } else {
      toast.error("Failed to remove pixel");
    }
  }

  return (
    <IntegrationCard letter="Tb" color="#0053A0" title="Taboola" connected={pixels.length > 0}>
      <p className="-mt-1 mb-1 text-xs text-neutral-400">
        Register the pixels you use, then activate one per product from the product page.
      </p>

      <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="text-xs font-medium text-neutral-600">Name</label>
          <input
            placeholder="Campaign A"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="text-xs font-medium text-neutral-600">Pixel ID</label>
          <input
            placeholder="1234567"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            value={pixelId}
            onChange={(e) => setPixelId(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-1.5 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          <Plus size={15} />
          {saving ? "Adding..." : "Add"}
        </button>
      </form>

      {pixels.length > 0 ? (
        <div className="overflow-hidden rounded-md border border-neutral-200">
          {pixels.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 border-b border-neutral-100 px-3.5 py-2.5 last:border-0 hover:bg-neutral-50"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-neutral-900">{p.name}</p>
                <p className="font-mono text-xs text-neutral-400">{p.pixelId}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(p.id)}
                className="flex-shrink-0 rounded-md p-1.5 text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
                aria-label={`Remove ${p.name}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-neutral-200 py-6 text-center text-sm text-neutral-400">
          No Taboola pixels registered yet.
        </p>
      )}
    </IntegrationCard>
  );
}

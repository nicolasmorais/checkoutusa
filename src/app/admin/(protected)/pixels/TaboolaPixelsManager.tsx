"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
    <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6">
      <div>
        <h2 className="font-medium">Taboola</h2>
        <p className="mt-0.5 text-xs text-neutral-500">
          Register the Taboola pixels you use, then activate one per product from the product page.
        </p>
      </div>

      <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="text-sm font-medium">Name</label>
          <input
            placeholder="Campaign A"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium">Pixel ID</label>
          <input
            placeholder="1234567"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
            value={pixelId}
            onChange={(e) => setPixelId(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Adding..." : "Add pixel"}
        </button>
      </form>

      {pixels.length > 0 ? (
        <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200">
          {pixels.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-neutral-500">{p.pixelId}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(p.id)}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-neutral-500">No Taboola pixels registered yet.</p>
      )}
    </div>
  );
}

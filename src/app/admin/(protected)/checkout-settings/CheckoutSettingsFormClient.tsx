"use client";

import { useState } from "react";
import { toast } from "sonner";

export function CheckoutSettingsFormClient({
  initialLogoUrl,
  initialAnnouncementBarEnabled,
  initialAnnouncementBarText,
  initialAnnouncementBarBgColor,
  initialAnnouncementBarTextColor,
  initialAnnouncementBarFontSize,
}: {
  initialLogoUrl: string;
  initialAnnouncementBarEnabled: boolean;
  initialAnnouncementBarText: string;
  initialAnnouncementBarBgColor: string;
  initialAnnouncementBarTextColor: string;
  initialAnnouncementBarFontSize: number;
}) {
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [announcementBarEnabled, setAnnouncementBarEnabled] = useState(initialAnnouncementBarEnabled);
  const [announcementBarText, setAnnouncementBarText] = useState(initialAnnouncementBarText);
  const [announcementBarBgColor, setAnnouncementBarBgColor] = useState(initialAnnouncementBarBgColor);
  const [announcementBarTextColor, setAnnouncementBarTextColor] = useState(initialAnnouncementBarTextColor);
  const [announcementBarFontSize, setAnnouncementBarFontSize] = useState(initialAnnouncementBarFontSize);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/checkout-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        logoUrl,
        announcementBarEnabled,
        announcementBarText,
        announcementBarBgColor,
        announcementBarTextColor,
        announcementBarFontSize,
      }),
    });
    setSaving(false);
    if (res.ok) toast.success("Checkout settings saved");
    else toast.error("Failed to save checkout settings");
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Checkout settings</h1>
        <p className="mt-0.5 text-sm text-neutral-500">Branding shown to customers on the checkout page.</p>
      </div>

      <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6">
        <div>
          <label className="text-sm font-medium">Logo URL</label>
          <input
            placeholder="https://example.com/logo.png"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
          />
          <p className="mt-1 text-xs text-neutral-500">
            Shown at the top of every checkout page instead of the product name. Leave empty to show the product name as text.
          </p>
        </div>

        {logoUrl && (
          <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
            <p className="mb-2 text-xs font-medium text-neutral-500">Preview</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt="Logo preview" className="h-8 w-auto object-contain" />
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save checkout settings"}
        </button>
      </div>

      <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium">Announcement bar</label>
            <p className="mt-0.5 text-xs text-neutral-500">
              Thin bar shown right below the header on the checkout page.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={announcementBarEnabled}
            onClick={() => setAnnouncementBarEnabled((v) => !v)}
            className={`relative h-6 w-11 flex-shrink-0 rounded-full transition ${
              announcementBarEnabled ? "bg-neutral-900" : "bg-neutral-300"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                announcementBarEnabled ? "left-5" : "left-0.5"
              }`}
            />
          </button>
        </div>

        <div>
          <label className="text-sm font-medium">Bar text</label>
          <input
            placeholder="You've got free shipping!"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
            value={announcementBarText}
            onChange={(e) => setAnnouncementBarText(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Background color</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="color"
                value={announcementBarBgColor}
                onChange={(e) => setAnnouncementBarBgColor(e.target.value)}
                className="h-9 w-11 cursor-pointer rounded-md border border-neutral-300 p-1"
              />
              <input
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                value={announcementBarBgColor}
                onChange={(e) => setAnnouncementBarBgColor(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Text color</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="color"
                value={announcementBarTextColor}
                onChange={(e) => setAnnouncementBarTextColor(e.target.value)}
                className="h-9 w-11 cursor-pointer rounded-md border border-neutral-300 p-1"
              />
              <input
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                value={announcementBarTextColor}
                onChange={(e) => setAnnouncementBarTextColor(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Font size ({announcementBarFontSize}px)</label>
          <input
            type="range"
            min={10}
            max={32}
            value={announcementBarFontSize}
            onChange={(e) => setAnnouncementBarFontSize(Number(e.target.value))}
            className="mt-2 w-full"
          />
        </div>

        {announcementBarEnabled && announcementBarText && (
          <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4">
            <p className="mb-2 text-xs font-medium text-neutral-500">Preview</p>
            <div
              className="rounded-md py-2 text-center font-medium"
              style={{
                backgroundColor: announcementBarBgColor,
                color: announcementBarTextColor,
                fontSize: announcementBarFontSize,
              }}
            >
              {announcementBarText}
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save checkout settings"}
        </button>
      </div>
    </div>
  );
}

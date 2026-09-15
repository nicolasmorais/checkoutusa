"use client";

import { useState } from "react";
import { toast } from "sonner";

type PixelSettings = {
  metaPixelId: string;
  metaAccessToken: string;
  tiktokPixelId: string;
  tiktokAccessToken: string;
  googleAdsId: string;
  googleConversionLabel: string;
  ga4MeasurementId: string;
  ga4ApiSecret: string;
};

function Field({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}

export function PixelsFormClient({ initial }: { initial: PixelSettings }) {
  const [values, setValues] = useState<PixelSettings>(initial);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof PixelSettings>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/pixels", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    if (res.ok) toast.success("Pixel settings saved");
    else toast.error("Failed to save settings");
  }

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-semibold">Tracking pixels</h1>

      <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="font-medium">Meta (Facebook/Instagram)</h2>
        <Field label="Pixel ID" value={values.metaPixelId} onChange={(v) => update("metaPixelId", v)} />
        <Field
          label="Conversions API access token (optional)"
          value={values.metaAccessToken}
          onChange={(v) => update("metaAccessToken", v)}
          hint="Enables server-side Purchase events for better attribution."
        />
      </div>

      <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="font-medium">TikTok</h2>
        <Field label="Pixel ID" value={values.tiktokPixelId} onChange={(v) => update("tiktokPixelId", v)} />
        <Field
          label="Events API access token (optional)"
          value={values.tiktokAccessToken}
          onChange={(v) => update("tiktokAccessToken", v)}
        />
      </div>

      <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="font-medium">Google Ads / Analytics</h2>
        <Field label="Google Ads Conversion ID (AW-XXXXXXX)" value={values.googleAdsId} onChange={(v) => update("googleAdsId", v)} />
        <Field label="Conversion label" value={values.googleConversionLabel} onChange={(v) => update("googleConversionLabel", v)} />
        <Field label="GA4 Measurement ID (G-XXXXXXX)" value={values.ga4MeasurementId} onChange={(v) => update("ga4MeasurementId", v)} />
        <Field
          label="GA4 API secret (optional, for Measurement Protocol)"
          value={values.ga4ApiSecret}
          onChange={(v) => update("ga4ApiSecret", v)}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save settings"}
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { IntegrationCard, Field } from "./IntegrationCard";

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

export function PixelsFormClient({ initial }: { initial: PixelSettings }) {
  const [values, setValues] = useState<PixelSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof PixelSettings>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/pixels", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Pixel settings saved");
      setSaved(true);
    } else {
      toast.error("Failed to save settings");
    }
  }

  const connectedCount = [values.metaPixelId, values.tiktokPixelId, values.googleAdsId, values.ga4MeasurementId].filter(
    Boolean
  ).length;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Tracking pixels</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            Connect ad platforms to track conversions on the checkout.
          </p>
        </div>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
          {connectedCount} of 4 connected
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <IntegrationCard letter="M" color="#0866FF" title="Meta (Facebook/Instagram)" connected={!!values.metaPixelId}>
          <Field label="Pixel ID" placeholder="123456789012345" value={values.metaPixelId} onChange={(v) => update("metaPixelId", v)} />
          <Field
            label="Conversions API access token"
            placeholder="Optional"
            value={values.metaAccessToken}
            onChange={(v) => update("metaAccessToken", v)}
            hint="Enables server-side Purchase events for better attribution."
          />
        </IntegrationCard>

        <IntegrationCard letter="T" color="#000000" title="TikTok" connected={!!values.tiktokPixelId}>
          <Field label="Pixel ID" placeholder="CXXXXXXXXXXXXXXXXXXX" value={values.tiktokPixelId} onChange={(v) => update("tiktokPixelId", v)} />
          <Field
            label="Events API access token"
            placeholder="Optional"
            value={values.tiktokAccessToken}
            onChange={(v) => update("tiktokAccessToken", v)}
          />
        </IntegrationCard>

        <IntegrationCard
          letter="G"
          color="#2a78d6"
          title="Google Ads / Analytics"
          connected={!!values.googleAdsId || !!values.ga4MeasurementId}
          className="lg:col-span-2"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Google Ads Conversion ID" placeholder="AW-XXXXXXX" value={values.googleAdsId} onChange={(v) => update("googleAdsId", v)} />
            <Field label="Conversion label" placeholder="Optional" value={values.googleConversionLabel} onChange={(v) => update("googleConversionLabel", v)} />
            <Field label="GA4 Measurement ID" placeholder="G-XXXXXXX" value={values.ga4MeasurementId} onChange={(v) => update("ga4MeasurementId", v)} />
            <Field
              label="GA4 API secret"
              placeholder="Optional — Measurement Protocol"
              value={values.ga4ApiSecret}
              onChange={(v) => update("ga4ApiSecret", v)}
            />
          </div>
        </IntegrationCard>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save settings"}
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-xs font-medium text-green-700">
            <Check size={14} /> Saved
          </span>
        )}
      </div>
    </>
  );
}

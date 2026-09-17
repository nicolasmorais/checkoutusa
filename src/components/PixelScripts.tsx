"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

type PublicPixelSettings = {
  metaPixelId: string | null;
  tiktokPixelId: string | null;
  googleAdsId: string | null;
  googleConversionLabel: string | null;
  ga4MeasurementId: string | null;
};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: { load: (id: string) => void; page: () => void; track: (event: string, params?: Record<string, unknown>) => void };
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    _tfa?: { push: (event: Record<string, unknown>) => void };
  }
}

export function usePixelSettings(initial?: PublicPixelSettings) {
  const [settings, setSettings] = useState<PublicPixelSettings | null>(initial ?? null);

  useEffect(() => {
    if (initial) return;
    fetch("/api/pixels/public")
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => setSettings(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return settings;
}

export function PixelScripts({
  settings,
  taboolaPixelId,
  taboolaEvent,
}: {
  settings: PublicPixelSettings | null;
  taboolaPixelId?: string | null;
  taboolaEvent?: string | null;
}) {
  return (
    <>
      {taboolaPixelId && (
        <Script id="taboola-pixel" strategy="afterInteractive">
          {`
            window._tfa = window._tfa || [];
            ${taboolaEvent ? `window._tfa.push({notify: 'event', name: ${JSON.stringify(taboolaEvent)}, id: ${JSON.stringify(taboolaPixelId)}});` : ""}
            !function (t, f, a, x) {
              if (!document.getElementById(x)) {
                t.async = 1; t.src = a; t.id = x; f.parentNode.insertBefore(t, f);
              }
            }(document.createElement('script'),
            document.getElementsByTagName('script')[0],
            '//cdn.taboola.com/libtrc/unip/${taboolaPixelId}/tfa.js',
            'tb_tfa_script');
          `}
        </Script>
      )}

      {settings?.metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${settings.metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {settings?.tiktokPixelId && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<e.length;n++)ttq.setAndDefer(e,e[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var s=document.createElement("script");s.type="text/javascript",s.async=!0,s.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(s,a)};
              ttq.load('${settings.tiktokPixelId}');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
      )}

      {settings?.ga4MeasurementId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${settings.ga4MeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${settings.ga4MeasurementId}');
            `}
          </Script>
        </>
      )}
    </>
  );
}

export function firePurchaseEvent(
  settings: PublicPixelSettings | null,
  data: { value: number; currency: string; orderId: string },
  taboolaPixelId?: string | null
) {
  if (taboolaPixelId && window._tfa) {
    window._tfa.push({
      notify: "event",
      name: "make_purchase",
      id: taboolaPixelId,
      revenue: String(data.value),
      currency: data.currency.toUpperCase(),
      orderId: data.orderId,
    });
  }

  if (!settings) return;

  if (settings.metaPixelId && window.fbq) {
    window.fbq("track", "Purchase", { value: data.value, currency: data.currency.toUpperCase() });
  }
  if (settings.tiktokPixelId && window.ttq) {
    window.ttq.track("CompletePayment", { value: data.value, currency: data.currency.toUpperCase() });
  }
  if (settings.ga4MeasurementId && window.gtag) {
    window.gtag("event", "purchase", {
      transaction_id: data.orderId,
      value: data.value,
      currency: data.currency.toUpperCase(),
    });
  }
  if (settings.googleAdsId && settings.googleConversionLabel && window.gtag) {
    window.gtag("event", "conversion", {
      send_to: `${settings.googleAdsId}/${settings.googleConversionLabel}`,
      value: data.value,
      currency: data.currency.toUpperCase(),
      transaction_id: data.orderId,
    });
  }
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { PixelScripts, usePixelSettings, firePurchaseEvent } from "@/components/PixelScripts";
import { formatCents } from "@/lib/utils";

type OrderStatus = {
  id: string;
  number: number;
  status: string;
  currency: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  customerName: string;
  customerEmail: string;
  shippingAddressLine1: string | null;
  shippingAddressLine2: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingPostalCode: string | null;
  createdAt: string;
  shouldFirePurchase: boolean;
  taboolaPixelId: string | null;
  items: { name: string; quantity: number; priceCents: number; productId: string; product: { slug: string } | null }[];
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const pixelSettings = usePixelSettings();
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [fired, setFired] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      const res = await fetch(`/api/checkout/order-status?orderId=${orderId}`);
      if (res.ok) {
        const data: OrderStatus = await res.json();
        setOrder(data);
        if (data.status === "paid" || data.status === "failed" || attempts >= 10) clearInterval(interval);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    if (order?.shouldFirePurchase && pixelSettings && !fired) {
      firePurchaseEvent(
        pixelSettings,
        {
          value: order.totalCents / 100,
          currency: order.currency,
          orderId: order.id,
        },
        order.taboolaPixelId
      );
      setFired(true);
    }
  }, [order, pixelSettings, fired]);

  const retrySlug = order?.items[0]?.product?.slug;
  const shippingAddress = order?.shippingAddressLine1
    ? [
        [order.shippingAddressLine1, order.shippingAddressLine2].filter(Boolean).join(", "),
        [order.shippingCity, order.shippingState, order.shippingPostalCode].filter(Boolean).join(", "),
      ]
    : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12">
      <PixelScripts settings={pixelSettings} taboolaPixelId={order?.taboolaPixelId} />
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_10px_30px_rgba(0,0,0,0.04)]">
        {!order && (
          <div className="py-8 text-center">
            <Loader2 size={40} className="mx-auto animate-spin text-neutral-400" />
            <h1 className="mt-4 text-lg font-semibold">Confirming your payment</h1>
            <p className="mt-1 text-sm text-neutral-500">This will only take a moment.</p>
          </div>
        )}

        {order && order.status === "paid" && (
          <div>
            <div className="text-center">
              <CheckCircle2 size={44} className="mx-auto text-[#008060]" />
              <h1 className="mt-4 text-xl font-semibold text-neutral-900">Payment confirmed</h1>
              <p className="mt-1 text-sm text-neutral-500">
                Order #{order.number} ·{" "}
                {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
              <p className="mt-4 text-sm text-neutral-600">
                A confirmation email is on its way to <span className="font-medium text-neutral-900">{order.customerEmail}</span>.
                Thank you for your purchase, {order.customerName.split(" ")[0]}!
              </p>
            </div>

            <div className="mt-6 space-y-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-neutral-700">
                    {item.name} <span className="text-neutral-400">× {item.quantity}</span>
                  </span>
                  <span className="font-medium text-neutral-900">
                    {formatCents(item.priceCents * item.quantity, order.currency)}
                  </span>
                </div>
              ))}
              <div className="space-y-1.5 border-t border-neutral-200 pt-3 text-sm">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span>
                  <span>{formatCents(order.subtotalCents, order.currency)}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Shipping</span>
                  <span>{order.shippingCents > 0 ? formatCents(order.shippingCents, order.currency) : "Free"}</span>
                </div>
                <div className="flex justify-between pt-1 text-base font-semibold text-neutral-900">
                  <span>Total</span>
                  <span>{formatCents(order.totalCents, order.currency)}</span>
                </div>
              </div>
            </div>

            {shippingAddress && (
              <div className="mt-4 rounded-lg border border-neutral-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Shipping to</p>
                <p className="mt-1 text-sm text-neutral-700">{order.customerName}</p>
                <p className="text-sm text-neutral-500">{shippingAddress[0]}</p>
                <p className="text-sm text-neutral-500">{shippingAddress[1]}</p>
              </div>
            )}
          </div>
        )}

        {order && order.status === "failed" && (
          <div className="text-center">
            <XCircle size={44} className="mx-auto text-red-600" />
            <h1 className="mt-4 text-xl font-semibold text-neutral-900">Card declined</h1>
            <p className="mt-1 text-sm text-neutral-500">Order #{order.number}</p>
            <p className="mt-4 text-sm text-neutral-600">
              Your bank declined this payment for {formatCents(order.totalCents, order.currency)}. No charge was made
              to your card.
            </p>
            <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-left text-sm text-neutral-600">
              <p className="font-medium text-neutral-900">A few things to try:</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Double-check the card number, expiry date, and CVC</li>
                <li>Make sure the card has enough available balance</li>
                <li>Try a different card or payment method</li>
              </ul>
            </div>
            {retrySlug && (
              <Link
                href={`/checkout/${retrySlug}`}
                className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-[#008060] py-3 text-sm font-semibold text-white transition hover:bg-[#006e52]"
              >
                Try again
              </Link>
            )}
          </div>
        )}

        {order && order.status === "pending" && (
          <div className="py-8 text-center">
            <Loader2 size={40} className="mx-auto animate-spin text-neutral-400" />
            <h1 className="mt-4 text-lg font-semibold">Still processing</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Your payment is being verified. This page will update automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-neutral-600">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}

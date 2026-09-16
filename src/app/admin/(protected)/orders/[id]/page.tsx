import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatCents } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/OrderStatusSelect";
import { EmailLogCard } from "./EmailLogCard";

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="text-right font-medium text-neutral-900">{value}</span>
    </div>
  );
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, emailLogs: { orderBy: { createdAt: "desc" } } },
  });

  if (!order) notFound();

  const shippingAddress = [order.shippingAddressLine1, order.shippingAddressLine2]
    .filter(Boolean)
    .join(", ");
  const cityStateZip = [order.shippingCity, order.shippingState, order.shippingPostalCode]
    .filter(Boolean)
    .join(", ");

  const hasAttribution =
    order.utmSource ||
    order.utmMedium ||
    order.utmCampaign ||
    order.utmContent ||
    order.utmTerm ||
    order.fbclid ||
    order.gclid ||
    order.ttclid;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/orders" className="mb-3 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900">
          <ArrowLeft size={14} />
          Back to orders
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Order #{order.number}</h1>
            <p className="mt-0.5 text-sm text-neutral-500">
              Placed {new Date(order.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </div>
          <OrderStatusSelect orderId={order.id} status={order.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <div className="border-b border-neutral-100 px-5 py-3">
              <h2 className="text-sm font-semibold">Items</h2>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-50 last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-medium text-neutral-900">{item.name}</p>
                      <p className="text-xs text-neutral-500">Qty {item.quantity}</p>
                    </td>
                    <td className="px-5 py-3 text-right text-neutral-600">
                      {formatCents(item.priceCents, order.currency)} each
                    </td>
                    <td className="px-5 py-3 text-right font-medium">
                      {formatCents(item.priceCents * item.quantity, order.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="space-y-1 border-t border-neutral-100 px-5 py-4">
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Subtotal</span>
                <span>{formatCents(order.subtotalCents, order.currency)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Shipping</span>
                <span>{order.shippingCents > 0 ? formatCents(order.shippingCents, order.currency) : "Free"}</span>
              </div>
              <div className="flex justify-between pt-1 text-base font-semibold">
                <span>Total</span>
                <span>{formatCents(order.totalCents, order.currency)}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-neutral-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold">Customer</h2>
              <InfoRow label="Name" value={order.customerName} />
              <InfoRow label="Email" value={order.customerEmail} />
              <InfoRow label="Phone" value={order.customerPhone} />
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold">Shipping address</h2>
              {shippingAddress ? (
                <p className="text-sm leading-relaxed text-neutral-700">
                  {shippingAddress}
                  <br />
                  {cityStateZip}
                  <br />
                  {order.shippingCountry}
                </p>
              ) : (
                <p className="text-sm text-neutral-400">No shipping required.</p>
              )}
            </div>
          </div>

          {hasAttribution && (
            <div className="rounded-lg border border-neutral-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold">Attribution</h2>
              <div className="grid gap-x-6 sm:grid-cols-2">
                <div>
                  <InfoRow label="UTM source" value={order.utmSource} />
                  <InfoRow label="UTM medium" value={order.utmMedium} />
                  <InfoRow label="UTM campaign" value={order.utmCampaign} />
                  <InfoRow label="UTM content" value={order.utmContent} />
                  <InfoRow label="UTM term" value={order.utmTerm} />
                </div>
                <div>
                  <InfoRow label="Facebook click ID" value={order.fbclid} />
                  <InfoRow label="Google click ID" value={order.gclid} />
                  <InfoRow label="TikTok click ID" value={order.ttclid} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold">Payment</h2>
            <InfoRow label="Currency" value={order.currency.toUpperCase()} />
            <InfoRow
              label="Paid at"
              value={order.paidAt ? new Date(order.paidAt).toLocaleString("en-US") : undefined}
            />
            <InfoRow label="Payment intent" value={order.stripePaymentIntentId} />
            <InfoRow label="Charge ID" value={order.stripeChargeId} />
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold">Device & network</h2>
            <InfoRow label="IP address" value={order.ipAddress} />
            <InfoRow label="User agent" value={order.userAgent ? order.userAgent.slice(0, 60) + (order.userAgent.length > 60 ? "…" : "") : undefined} />
          </div>

          <EmailLogCard
            orderId={order.id}
            logs={order.emailLogs.map((log) => ({
              id: log.id,
              type: log.type,
              toEmail: log.toEmail,
              status: log.status,
              errorMessage: log.errorMessage,
              createdAt: log.createdAt.toISOString(),
            }))}
          />
        </div>
      </div>
    </div>
  );
}

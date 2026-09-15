import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { resend, RESEND_FROM_EMAIL } from "@/lib/resend";
import { renderEmailTemplate, DEFAULT_EMAIL_SUBJECT, DEFAULT_EMAIL_BODY } from "@/lib/email-templates";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata?.orderId;
      if (orderId) {
        const existing = await prisma.order.findUnique({ where: { id: orderId } });
        if (existing && existing.status !== "paid") {
          const order = await prisma.order.update({
            where: { id: orderId },
            data: {
              status: "paid",
              paidAt: new Date(),
              stripeChargeId: typeof pi.latest_charge === "string" ? pi.latest_charge : undefined,
            },
            include: { items: true },
          });

          const template = await prisma.emailTemplate.findUnique({ where: { id: "singleton" } });
          const { subject, html } = renderEmailTemplate(
            template?.subject ?? DEFAULT_EMAIL_SUBJECT,
            template?.bodyHtml ?? DEFAULT_EMAIL_BODY,
            order
          );
          try {
            await resend.emails.send({
              from: RESEND_FROM_EMAIL,
              to: order.customerEmail,
              subject,
              html,
            });
          } catch (err) {
            console.error("Failed to send order confirmation email", err);
          }
        }
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata?.orderId;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "failed" },
        });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

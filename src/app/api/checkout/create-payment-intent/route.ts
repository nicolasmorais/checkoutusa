import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

const FULL_NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ'-]{2,}(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ'-]{2,})+$/;
const CITY_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ'\-\s]{2,}$/;
const ZIP_REGEX = /^\d{5}(-\d{4})?$/;
// NANP (US/Canada) rule: area code and exchange code can't start with 0 or 1.
const US_PHONE_DIGITS_REGEX = /^[2-9]\d{2}[2-9]\d{6}$/;

function usPhoneDigits(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
}

const schema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(50).default(1),
  customerName: z
    .string()
    .trim()
    .regex(FULL_NAME_REGEX, "Enter your first and last name"),
  customerEmail: z.string().trim().email(),
  customerPhone: z
    .string()
    .trim()
    .refine((v) => US_PHONE_DIGITS_REGEX.test(usPhoneDigits(v)), "Enter a valid US phone number"),
  shippingAddressLine1: z.string().trim().min(3),
  shippingAddressLine2: z.string().trim().min(1),
  shippingCity: z.string().trim().regex(CITY_REGEX, "Enter a valid city"),
  shippingState: z.string().min(1),
  shippingPostalCode: z.string().trim().regex(ZIP_REGEX, "Enter a valid ZIP code"),
  shippingCountry: z.string().default("US"),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional(),
  fbclid: z.string().optional(),
  gclid: z.string().optional(),
  ttclid: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product || !product.active) {
    return NextResponse.json({ error: "Product not available" }, { status: 404 });
  }
  if (product.stock !== null && product.stock < data.quantity) {
    return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
  }

  const shippingSettings = product.requiresShipping
    ? await prisma.shippingSettings.upsert({
        where: { id: "singleton" },
        update: {},
        create: { id: "singleton" },
      })
    : null;

  const subtotalCents = product.priceCents * data.quantity;
  const shippingCents = shippingSettings?.priceCents ?? 0;
  const totalCents = subtotalCents + shippingCents;

  const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;

  const order = await prisma.order.create({
    data: {
      status: "pending",
      currency: product.currency,
      subtotalCents,
      shippingCents,
      totalCents,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      shippingAddressLine1: data.shippingAddressLine1,
      shippingAddressLine2: data.shippingAddressLine2,
      shippingCity: data.shippingCity,
      shippingState: data.shippingState,
      shippingPostalCode: data.shippingPostalCode,
      shippingCountry: data.shippingCountry,
      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      utmContent: data.utmContent,
      utmTerm: data.utmTerm,
      fbclid: data.fbclid,
      gclid: data.gclid,
      ttclid: data.ttclid,
      ipAddress,
      userAgent,
      taboolaPixelId: product.taboolaPixelId,
      items: {
        create: [
          {
            productId: product.id,
            name: product.name,
            quantity: data.quantity,
            priceCents: product.priceCents,
          },
        ],
      },
    },
  });

  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalCents,
    currency: product.currency,
    automatic_payment_methods: { enabled: true },
    receipt_email: data.customerEmail,
    metadata: {
      orderId: order.id,
      orderNumber: String(order.number),
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripePaymentIntentId: paymentIntent.id },
  });

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    orderId: order.id,
    totalCents,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
  priceCents: z.number().int().positive(),
  compareAtCents: z.number().int().positive().optional().nullable(),
  currency: z.string().default("usd"),
  active: z.boolean().default(true),
  requiresShipping: z.boolean().default(true),
  stock: z.number().int().nonnegative().optional().nullable(),
  taboolaPixelId: z.string().optional().nullable(),
});

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const slug = data.slug ? slugify(data.slug) : slugify(data.name);

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      priceCents: data.priceCents,
      compareAtCents: data.compareAtCents || null,
      currency: data.currency,
      active: data.active,
      requiresShipping: data.requiresShipping,
      stock: data.stock ?? null,
      taboolaPixelId: data.taboolaPixelId || null,
    },
  });

  return NextResponse.json(product, { status: 201 });
}

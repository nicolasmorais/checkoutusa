import { prisma } from "@/lib/prisma";
import { ProductsListClient } from "./ProductsListClient";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, slug: true, priceCents: true, currency: true, active: true, stock: true },
  });

  return <ProductsListClient initialProducts={products} />;
}

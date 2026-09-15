import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit product</h1>
      <ProductForm
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description ?? "",
          imageUrl: product.imageUrl ?? "",
          priceCents: product.priceCents,
          compareAtCents: product.compareAtCents,
          active: product.active,
          requiresShipping: product.requiresShipping,
          stock: product.stock,
          taboolaPixelId: product.taboolaPixelId ?? "",
        }}
      />
    </div>
  );
}

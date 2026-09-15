import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/ProductForm";

export default async function NewProductPage() {
  const taboolaPixels = await prisma.taboolaPixel.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New product</h1>
      <ProductForm taboolaPixels={taboolaPixels} />
    </div>
  );
}

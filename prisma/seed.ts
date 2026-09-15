import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.pixelSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  const existing = await prisma.product.findUnique({ where: { slug: "demo-product" } });
  if (!existing) {
    await prisma.product.create({
      data: {
        name: "Demo Product",
        slug: "demo-product",
        description: "Sample physical product for testing checkout.",
        priceCents: 4999,
        currency: "usd",
        requiresShipping: true,
        active: true,
      },
    });
    console.log("Demo product created (slug: demo-product)");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

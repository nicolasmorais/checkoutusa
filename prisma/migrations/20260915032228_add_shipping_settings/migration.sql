-- CreateTable
CREATE TABLE "shipping_settings" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'Standard Shipping',
    "estimatedDays" TEXT NOT NULL DEFAULT '5-7 business days',
    "priceCents" INTEGER NOT NULL DEFAULT 599,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_settings_pkey" PRIMARY KEY ("id")
);

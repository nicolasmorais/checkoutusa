-- CreateTable
CREATE TABLE "taboola_pixels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pixelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "taboola_pixels_pkey" PRIMARY KEY ("id")
);

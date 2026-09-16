-- CreateTable
CREATE TABLE "order_email_logs" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'confirmation',
    "toEmail" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "resendId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_email_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "order_email_logs" ADD CONSTRAINT "order_email_logs_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

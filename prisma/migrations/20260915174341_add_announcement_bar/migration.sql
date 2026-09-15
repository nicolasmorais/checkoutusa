-- AlterTable
ALTER TABLE "checkout_settings" ADD COLUMN     "announcementBarEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "announcementBarText" TEXT NOT NULL DEFAULT 'You''ve got free shipping!';

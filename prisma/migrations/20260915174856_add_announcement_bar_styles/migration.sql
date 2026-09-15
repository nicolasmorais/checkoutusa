-- AlterTable
ALTER TABLE "checkout_settings" ADD COLUMN     "announcementBarBgColor" TEXT NOT NULL DEFAULT '#008060',
ADD COLUMN     "announcementBarFontSize" INTEGER NOT NULL DEFAULT 12,
ADD COLUMN     "announcementBarTextColor" TEXT NOT NULL DEFAULT '#ffffff';

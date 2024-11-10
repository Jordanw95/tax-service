/*
  Warnings:

  - Added the required column `date` to the `SalesItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SalesItem" DROP CONSTRAINT "SalesItem_salesEventId_fkey";

-- AlterTable
ALTER TABLE "SalesItem" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "salesEventId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "SalesItem" ADD CONSTRAINT "SalesItem_salesEventId_fkey" FOREIGN KEY ("salesEventId") REFERENCES "SalesEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

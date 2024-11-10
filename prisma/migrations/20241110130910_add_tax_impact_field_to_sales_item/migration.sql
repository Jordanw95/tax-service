/*
  Warnings:

  - Added the required column `taxImpact` to the `SalesItem` table without a default value. This is not possible if the table is not empty.
  - Made the column `salesEventId` on table `SalesItem` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "SalesItem" DROP CONSTRAINT "SalesItem_salesEventId_fkey";

-- AlterTable
ALTER TABLE "SalesItem" ADD COLUMN     "taxImpact" INTEGER NOT NULL,
ALTER COLUMN "salesEventId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "SalesItem" ADD CONSTRAINT "SalesItem_salesEventId_fkey" FOREIGN KEY ("salesEventId") REFERENCES "SalesEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - Changed the type of `taxPosition` on the `TaxPositionEntry` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "TaxPositionEntry" DROP COLUMN "taxPosition",
ADD COLUMN     "taxPosition" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "SalesEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL DEFAULT 'SALES',
    "date" TIMESTAMP(3) NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "totalTaxImpact" INTEGER NOT NULL,
    "totalCost" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesItem" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL,
    "salesEventId" TEXT NOT NULL,

    CONSTRAINT "SalesItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalesEvent_invoiceId_key" ON "SalesEvent"("invoiceId");

-- CreateIndex
CREATE INDEX "SalesEvent_invoiceId_idx" ON "SalesEvent"("invoiceId");

-- CreateIndex
CREATE INDEX "SalesEvent_date_idx" ON "SalesEvent"("date");

-- CreateIndex
CREATE INDEX "SalesItem_itemId_idx" ON "SalesItem"("itemId");

-- CreateIndex
CREATE INDEX "SalesItem_salesEventId_idx" ON "SalesItem"("salesEventId");

-- CreateIndex
CREATE INDEX "TaxPositionEntry_date_idx" ON "TaxPositionEntry"("date");

-- AddForeignKey
ALTER TABLE "SalesItem" ADD CONSTRAINT "SalesItem_salesEventId_fkey" FOREIGN KEY ("salesEventId") REFERENCES "SalesEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[itemId]` on the table `SalesItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SalesItem_itemId_key" ON "SalesItem"("itemId");

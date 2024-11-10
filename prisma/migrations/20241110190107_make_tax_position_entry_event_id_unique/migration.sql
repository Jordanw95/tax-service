/*
  Warnings:

  - A unique constraint covering the columns `[eventId]` on the table `TaxPositionEntry` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TaxPositionEntry_eventId_key" ON "TaxPositionEntry"("eventId");

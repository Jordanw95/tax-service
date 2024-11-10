/*
  Warnings:

  - Added the required column `eventId` to the `TaxPositionEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventType` to the `TaxPositionEntry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TaxPositionEntry" ADD COLUMN     "eventId" TEXT NOT NULL,
ADD COLUMN     "eventType" TEXT NOT NULL;

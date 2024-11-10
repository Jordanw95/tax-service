/*
  Warnings:

  - Added the required column `taxPositionDelta` to the `TaxPositionEntry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TaxPositionEntry" ADD COLUMN     "taxPositionDelta" TEXT NOT NULL;

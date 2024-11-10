/*
  Warnings:

  - Changed the type of `taxPositionDelta` on the `TaxPositionEntry` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "TaxPositionEntry" DROP COLUMN "taxPositionDelta",
ADD COLUMN     "taxPositionDelta" INTEGER NOT NULL;

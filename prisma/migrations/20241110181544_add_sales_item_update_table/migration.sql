-- CreateTable
CREATE TABLE "SalesItemUpdate" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SalesItemUpdate_pkey" PRIMARY KEY ("id")
);

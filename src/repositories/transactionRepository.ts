import { prisma } from '../utils/db';
import {
  SalesEvent,
  TaxPaymentEvent,
  SalesItemUpdate,
  SalesItem,
  type Prisma,
} from '@prisma/client';
import { ModifySalesItemRequest } from '../types';

export class TransactionRepository {
  createSalesEvent = async (
    data: Prisma.SalesEventCreateInput
  ): Promise<SalesEvent> => {
    const salesEvent = await prisma.salesEvent.create({
      data,
      include: {
        salesItems: true,
      },
    });
    return salesEvent;
  };

  createTaxPaymentEvent = async (
    data: Prisma.TaxPaymentEventCreateInput
  ): Promise<TaxPaymentEvent> => {
    const taxPaymentEvent = await prisma.taxPaymentEvent.create({
      data,
    });
    return taxPaymentEvent;
  };

  createSalesItemUpdate = async (
    data: Prisma.SalesItemUpdateCreateInput
  ): Promise<SalesItemUpdate> => {
    const salesItemUpdate = await prisma.salesItemUpdate.create({
      data,
    });
    return salesItemUpdate;
  };

  getMostRecentSalesItemUpdate = async (
    itemId: string
  ): Promise<SalesItemUpdate | null> => {
    const salesItemUpdate = await prisma.salesItemUpdate.findFirst({
      where: { itemId },
      orderBy: { date: 'desc' },
    });
    return salesItemUpdate;
  };

  getSalesEventByInvoiceId = async (
    invoiceId: string
  ): Promise<SalesEvent | null> => {
    const salesEvent = await prisma.salesEvent.findUnique({
      where: { invoiceId },
    });
    return salesEvent;
  };

  getSalesItemByItemId = async (itemId: string): Promise<SalesItem | null> => {
    const salesItem = await prisma.salesItem.findUnique({ where: { itemId } });
    return salesItem;
  };

  updateSalesItem = async (
    salesItem: SalesItem,
    data: Prisma.SalesItemUpdateInput
  ) => {
    const updatedSalesItem = await prisma.salesItem.update({
      where: { id: salesItem.id },
      data,
    });
    return updatedSalesItem;
  };

  createSalesItem = async (
    data: Prisma.SalesItemCreateInput
  ): Promise<SalesItem> => {
    const salesItem = await prisma.salesItem.create({
      data,
    });
    return salesItem;
  };

  getSalesItemsBySalesEventId = async (
    salesEventId: string
  ): Promise<SalesItem[]> => {
    const salesItems = await prisma.salesItem.findMany({
      where: { salesEventId },
    });
    return salesItems;
  };

  getSalesEventById = async (
    salesEventId: string
  ): Promise<SalesEvent | null> => {
    const salesEvent = await prisma.salesEvent.findUnique({
      where: { id: salesEventId },
    });
    return salesEvent;
  };

  updateSalesEvent = async (
    salesEventId: string,
    data: Prisma.SalesEventUpdateInput
  ) => {
    const salesEvent = await prisma.salesEvent.update({
      where: { id: salesEventId },
      data,
    });
    return salesEvent;
  };
}

import { prisma } from '../utils/db';
import { SalesEvent, TaxPaymentEvent, type Prisma } from '@prisma/client';

export class TransactionRepository {
  async createSalesEvent(
    data: Prisma.SalesEventCreateInput
  ): Promise<SalesEvent> {
    const salesEvent = await prisma.salesEvent.create({
      data,
      include: {
        salesItems: true,
      },
    });
    return salesEvent;
  }

  createTaxPaymentEvent = async (
    data: Prisma.TaxPaymentEventCreateInput
  ): Promise<TaxPaymentEvent> => {
    const taxPaymentEvent = await prisma.taxPaymentEvent.create({
      data,
    });
    return taxPaymentEvent;
  };
}

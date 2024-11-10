import { prisma } from '../utils/db';
import { SalesEvent, type Prisma } from '@prisma/client';
import { CreateSalesEventDto } from '../types/dtos';

export class SalesRepository {
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
}

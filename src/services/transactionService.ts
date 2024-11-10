import { TaxPositionRepository } from '../repositories/taxPositionRepository';
import { SalesEvent, type Prisma } from '@prisma/client';
import { SalesRepository } from '../repositories/salesRepository';
import { TaxPositionService } from './taxPositionService';
import {
  CreateSalesEventRequest,
  SalesEventResponse,
  CreateTaxPaymentRequest,
} from '../types';
import { GenericTaxEvent } from '../types/types';
import { serialize } from '../utils/serializer';

export class TransactionService {
  private salesRepository: SalesRepository;

  constructor() {
    this.salesRepository = new SalesRepository();
  }

  mapToSalesEventCreate = (
    dto: CreateSalesEventRequest
  ): Prisma.SalesEventCreateInput => {
    // replace this with class-transformer?
    const totalCost = dto.items.reduce((sum, item) => sum + item.cost, 0);
    const totalTaxImpact = dto.items.reduce(
      (sum, item) => sum + Math.round(item.cost * item.taxRate),
      0
    );

    return {
      eventType: dto.eventType,
      date: new Date(dto.date),
      invoiceId: dto.invoiceId,
      totalCost,
      totalTaxImpact,
      salesItems: {
        create: dto.items.map(item => ({
          itemId: item.itemId,
          cost: item.cost,
          taxRate: item.taxRate,
          taxImpact: Math.round(item.cost * item.taxRate),
          date: new Date(dto.date),
        })),
      },
    };
  };

  handleCreateSalesEvent = async (
    dto: CreateSalesEventRequest
  ): Promise<SalesEventResponse> => {
    const salesEventCreateInput = this.mapToSalesEventCreate(dto);
    const salesEvent = await this.salesRepository.createSalesEvent(
      salesEventCreateInput
    );
    // TODO check for sales ammendments here and modify accordingly
    const taxEvent: GenericTaxEvent = {
      date: salesEvent.date.toISOString(),
      taxPositionDelta: salesEvent.totalTaxImpact,
      eventId: salesEvent.id,
      eventType: salesEvent.eventType,
    };
    const taxPositionService = new TaxPositionService();
    await taxPositionService.createTaxPositionEntryFromEvent(taxEvent);
    return serialize(SalesEventResponse, salesEvent);
  };

  handleCreateTaxPayment = async (
    dto: CreateTaxPaymentRequest
  ): Promise<void> => {};
}

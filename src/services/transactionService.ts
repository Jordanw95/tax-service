import { TaxPositionRepository } from '../repositories/taxPositionRepository';
import { SalesEvent, TaxPaymentEvent, type Prisma } from '@prisma/client';
import { TransactionRepository } from '../repositories/transactionRepository';
import { TaxPositionService } from './taxPositionService';
import {
  CreateSalesEventRequest,
  SalesEventResponse,
  CreateTaxPaymentRequest,
} from '../types';
import { GenericTaxEvent } from '../types/types';
import { serialize } from '../utils/serializer';

export class TransactionService {
  private transactionRepository: TransactionRepository;

  constructor() {
    this.transactionRepository = new TransactionRepository();
  }

  mapToSalesEventCreate = (
    data: CreateSalesEventRequest
  ): Prisma.SalesEventCreateInput => {
    const totalCost = data.items.reduce((sum, item) => sum + item.cost, 0);
    const totalTaxImpact = data.items.reduce(
      (sum, item) => sum + Math.round(item.cost * item.taxRate),
      0
    );

    return {
      eventType: data.eventType,
      date: new Date(data.date),
      invoiceId: data.invoiceId,
      totalCost,
      totalTaxImpact,
      salesItems: {
        create: data.items.map(item => ({
          itemId: item.itemId,
          cost: item.cost,
          taxRate: item.taxRate,
          taxImpact: Math.round(item.cost * item.taxRate),
          date: new Date(data.date),
        })),
      },
    };
  };

  handleCreateSalesEvent = async (
    data: CreateSalesEventRequest
  ): Promise<SalesEventResponse> => {
    const salesEventCreateInput = this.mapToSalesEventCreate(data);
    const salesEvent = await this.transactionRepository.createSalesEvent(
      salesEventCreateInput
    );
    // TODO check for sales ammendments here and modify accordingly
    const taxEvent: GenericTaxEvent = {
      date: salesEvent.date.toISOString(),
      taxPositionDelta: salesEvent.totalTaxImpact,
      eventId: salesEvent.id,
      eventType: 'SALES',
    };
    const taxPositionService = new TaxPositionService();
    await taxPositionService.createTaxPositionEntryFromEvent(taxEvent);
    return serialize(SalesEventResponse, salesEvent);
  };

  mapToTaxPaymentCreate = (
    data: CreateTaxPaymentRequest
  ): Prisma.TaxPaymentEventCreateInput => {
    return {
      date: new Date(data.date),
      amount: data.amount,
    };
  };

  handleCreateTaxPayment = async (
    data: CreateTaxPaymentRequest
  ): Promise<void> => {
    const taxPaymentCreateInput = this.mapToTaxPaymentCreate(data);
    const taxPaymentEvent =
      await this.transactionRepository.createTaxPaymentEvent(
        taxPaymentCreateInput
      );

    const taxEvent: GenericTaxEvent = {
      date: taxPaymentEvent.date.toISOString(),
      taxPositionDelta: -taxPaymentEvent.amount,
      eventId: taxPaymentEvent.id,
      eventType: 'TAX_PAYMENT',
    };
    const taxPositionService = new TaxPositionService();
    await taxPositionService.createTaxPositionEntryFromEvent(taxEvent);
  };
}

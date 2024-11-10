import { TaxPositionRepository } from '../repositories/taxPositionRepository';
import {
  SalesEvent,
  TaxPaymentEvent,
  SalesItem,
  SalesItemUpdate,
  type Prisma,
} from '@prisma/client';
import { TransactionRepository } from '../repositories/transactionRepository';
import { TaxPositionService } from './taxPositionService';
import {
  CreateSalesEventRequest,
  SalesEventResponse,
  CreateTaxPaymentRequest,
  ModifySalesItemRequest,
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

  mapToSalesItemUpdate = (
    data: ModifySalesItemRequest
  ): Prisma.SalesItemUpdateCreateInput => {
    return {
      date: new Date(data.date),
      invoiceId: data.invoiceId,
      itemId: data.itemId,
      cost: data.cost,
      taxRate: data.taxRate,
    };
  };

  handleCreateSalesItem = async (
    data: SalesItemUpdate,
    relatedSalesEvent: SalesEvent
  ) => {
    const salesItemCreateInput: Prisma.SalesItemCreateInput = {
      itemId: data.itemId,
      cost: data.cost,
      taxRate: data.taxRate,
      date: data.date,
      taxImpact: Math.round(data.cost * data.taxRate),
      salesEvent: { connect: { id: relatedSalesEvent.id } },
    };
    await this.transactionRepository.createSalesItem(salesItemCreateInput);
  };

  handleUpdateOrCreateSalesItem = async (
    data: ModifySalesItemRequest,
    relatedSalesEvent: SalesEvent
  ) => {
    // We should always make use of the most recent item update
    const mostRecentSalesItemUpdate =
      (await this.transactionRepository.getMostRecentSalesItemUpdate(
        data.itemId
      )) as SalesItemUpdate;

    const relatedSalesItem =
      await this.transactionRepository.getSalesItemByItemId(data.itemId);

    if (!relatedSalesItem) {
      // A sales item with this itemId does not exist yet, but the sale does. Must create
      // the new item for the sale and update sales and tax position accordingly
      await this.handleCreateSalesItem(
        mostRecentSalesItemUpdate,
        relatedSalesEvent
      );
      return;
    } else {
      // A sales item with this itemId exists, we should modify the existing item and update
      // sales and tax position accordingly
      this.transactionRepository.updateSalesItem(relatedSalesItem, {
        date: mostRecentSalesItemUpdate.date,
        cost: mostRecentSalesItemUpdate.cost,
        taxRate: mostRecentSalesItemUpdate.taxRate,
        taxImpact: Math.round(
          mostRecentSalesItemUpdate.cost * mostRecentSalesItemUpdate.taxRate
        ),
      });
      return;
    }
  };

  handleUpdateSalesEvent = async (salesEventId: string) => {
    // Update the sales event with the total cost and total tax impact
    const salesEvent =
      await this.transactionRepository.getSalesEventById(salesEventId);
    if (!salesEvent) {
      throw new Error(`Failed to get sales event with id ${salesEventId}`);
    }
    const salesEventItems =
      await this.transactionRepository.getSalesItemsBySalesEventId(
        salesEventId
      );
    const totalCost = salesEventItems.reduce((sum, item) => sum + item.cost, 0);
    const totalTaxImpact = salesEventItems.reduce(
      (sum, item) => sum + item.taxImpact,
      0
    );
    const updatedEvent = await this.transactionRepository.updateSalesEvent(
      salesEventId,
      {
        totalCost,
        totalTaxImpact,
      }
    );
    return updatedEvent;
  };

  handleUpdateTaxPosition = async (salesEvent: SalesEvent) => {
    const taxPositionService = new TaxPositionService();
    const taxEvent: GenericTaxEvent = {
      date: salesEvent.date.toISOString(),
      taxPositionDelta: salesEvent.totalTaxImpact,
      eventId: salesEvent.id,
      eventType: 'SALES',
    };
    await taxPositionService.updateTaxPositionEntryFromEvent(taxEvent);
  };

  handleModifySalesEventItem = async (data: ModifySalesItemRequest) => {
    const salesItemUpdateCreateInput = this.mapToSalesItemUpdate(data);
    await this.transactionRepository.createSalesItemUpdate(
      salesItemUpdateCreateInput
    );

    const relatedSalesEvent =
      await this.transactionRepository.getSalesEventByInvoiceId(data.invoiceId);
    if (!relatedSalesEvent) {
      // In this case, the salesEvent has not been created yet and we will handle the
      // ammendment in the future
      return;
    }

    await this.handleUpdateOrCreateSalesItem(data, relatedSalesEvent);
    const updatedSalesEvent = await this.handleUpdateSalesEvent(
      relatedSalesEvent.id
    );
    if (!updatedSalesEvent) {
      throw new Error('Failed to update sales event');
    }
    await this.handleUpdateTaxPosition(updatedSalesEvent);
  };
}

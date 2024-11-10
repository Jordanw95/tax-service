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

  handleCreateSalesItems = async (
    data: CreateSalesEventRequest,
    salesEvent: SalesEvent
  ) => {
    // First create a salesItemUpdate for each item
    for (const item of data.items) {
      await this.transactionRepository.createSalesItemUpdate({
        date: data.date,
        invoiceId: data.invoiceId,
        itemId: item.itemId,
        cost: item.cost,
        taxRate: item.taxRate,
      });
    }
    const upToDateSalesUpdates =
      await this.transactionRepository.getMostRecentSalesUpdatesForSalesEvent(
        data.invoiceId
      );
    const salesItemCreateManyInput: Prisma.SalesItemCreateManyInput[] =
      upToDateSalesUpdates.map(update => ({
        itemId: update.itemId,
        cost: update.cost,
        taxRate: update.taxRate,
        date: update.date,
        taxImpact: Math.round(update.cost * update.taxRate),
        salesEventId: salesEvent.id,
      }));
    return await this.transactionRepository.createSalesItems(
      salesItemCreateManyInput
    );
  };

  mapToSalesEventCreate = (
    data: CreateSalesEventRequest
  ): Prisma.SalesEventCreateInput => {
    return {
      eventType: data.eventType,
      date: new Date(data.date),
      invoiceId: data.invoiceId,
      totalCost: 0,
      totalTaxImpact: 0,
    };
  };

  handleCreateSalesEvent = async (
    data: CreateSalesEventRequest
  ): Promise<SalesEventResponse> => {
    // Create the initial sdales event without items
    const salesEventCreateInput = this.mapToSalesEventCreate(data);
    const initialSalesEvent = await this.transactionRepository.createSalesEvent(
      salesEventCreateInput
    );
    // Create the sales items for the sales event, checking for SalesEventItems and using the
    // most recent item update to create the item
    await this.handleCreateSalesItems(data, initialSalesEvent);
    // Update the sales event with the total cost and total tax impact
    const salesEvent = await this.handleUpdateSalesEvent(initialSalesEvent.id);
    // Create a tax position entry for the sales event
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
      await this.transactionRepository.updateSalesItem(relatedSalesItem, {
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

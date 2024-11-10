import { TaxPositionRepository } from '../repositories/taxPositionRepository';
import { TaxPositionEntry, type Prisma } from '@prisma/client';
import { GenericTaxEvent } from '../types/types';

export class TaxPositionService {
  private taxPositionRepository: TaxPositionRepository;

  constructor() {
    this.taxPositionRepository = new TaxPositionRepository();
  }

  async getTaxPositionEntry(date: string): Promise<TaxPositionEntry | null> {
    const taxPosition =
      await this.taxPositionRepository.getRelevantTaxPosition(date);
    return taxPosition;
  }

  async calculateNewTaxPositionAmount(event: GenericTaxEvent): Promise<number> {
    // We can calculate the new tax position by adding the tax position delta to the
    // most recent previous tax position
    const previousTaxPositionEntry = await this.getTaxPositionEntry(event.date);
    const previousTaxPosition = previousTaxPositionEntry?.taxPosition || 0;
    const newTaxPositionAmount = previousTaxPosition + event.taxPositionDelta;
    return newTaxPositionAmount;
  }

  async handleCreateTaxPositionEntry(
    event: GenericTaxEvent
  ): Promise<TaxPositionEntry> {
    const taxPositionAmount = await this.calculateNewTaxPositionAmount(event);
    const taxPositionEntryInput: Prisma.TaxPositionEntryCreateInput = {
      date: new Date(event.date),
      taxPosition: taxPositionAmount,
      taxPositionDelta: event.taxPositionDelta,
      eventId: event.eventId,
      eventType: event.eventType,
    };
    const taxPositionEntry =
      await this.taxPositionRepository.createTaxPositionEntry(
        taxPositionEntryInput
      );
    return taxPositionEntry;
  }

  async createTaxPositionEntryFromEvent(
    event: GenericTaxEvent
  ): Promise<TaxPositionEntry> {
    const taxPositionEntry = await this.handleCreateTaxPositionEntry(event);
    // Need to handle all future tax position entries now
    return taxPositionEntry;
  }
}

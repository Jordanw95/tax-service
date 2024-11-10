import { TaxPositionRepository } from '../repositories/taxPositionRepository';
import { TaxPositionEntry, type Prisma } from '@prisma/client';
import { GenericTaxEvent } from '../types/types';

export class TaxPositionService {
  private taxPositionRepository: TaxPositionRepository;

  constructor() {
    this.taxPositionRepository = new TaxPositionRepository();
  }

  getTaxPositionEntry = async (
    date: string
  ): Promise<TaxPositionEntry | null> => {
    const taxPosition =
      await this.taxPositionRepository.getRelevantTaxPosition(date);
    return taxPosition;
  };

  calculateNewTaxPositionAmount = async (
    event: GenericTaxEvent
  ): Promise<number> => {
    // We can calculate the new tax position by adding the tax position delta to the
    // most recent previous tax position.
    // We exclude the current event id to prevent counting the current event as part of the tax position
    const previousTaxPositionEntry =
      await this.taxPositionRepository.getRelevantTaxPosition(event.date, [
        event.eventId,
      ]);
    const previousTaxPosition = previousTaxPositionEntry?.taxPosition || 0;
    const newTaxPositionAmount = previousTaxPosition + event.taxPositionDelta;
    return newTaxPositionAmount;
  };

  handleCreateTaxPositionEntry = async (
    event: GenericTaxEvent
  ): Promise<TaxPositionEntry> => {
    // Use the latest recent tax position with the provided tax event to calculate a new tax position
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
  };

  updateAllFutureTaxPositionEntries = async (
    event: GenericTaxEvent,
    newTaxPosition: number
  ): Promise<void> => {
    // Due to the chain like nature of tax position, we need to update all future tax position
    // entries when a new tax position entry is created
    const futureTaxPositionEntries =
      await this.taxPositionRepository.getFutureTaxPositionEntries(event.date);
    if (futureTaxPositionEntries.length === 0) {
      return;
    }
    let runningTaxPosition = newTaxPosition;
    const newTaxPositions = futureTaxPositionEntries.map<{
      id: number;
      taxPosition: number;
    }>(entry => {
      const newTaxPosition = runningTaxPosition + entry.taxPositionDelta;
      runningTaxPosition = newTaxPosition;
      return {
        id: entry.id,
        taxPosition: newTaxPosition,
      };
    });
    await this.taxPositionRepository.updateManyTaxPositionsEntries(
      newTaxPositions
    );
  };

  createTaxPositionEntryFromEvent = async (
    event: GenericTaxEvent
  ): Promise<TaxPositionEntry> => {
    const taxPositionEntry = await this.handleCreateTaxPositionEntry(event);
    await this.updateAllFutureTaxPositionEntries(
      event,
      taxPositionEntry.taxPosition
    );
    return taxPositionEntry;
  };

  updateTaxPositionEntryFromEvent = async (
    event: GenericTaxEvent
  ): Promise<TaxPositionEntry> => {
    const newTaxPositionAmount =
      await this.calculateNewTaxPositionAmount(event);
    console.log(newTaxPositionAmount);
    const taxPositionEntry =
      await this.taxPositionRepository.updateTaxPositionEntry(event.eventId, {
        taxPosition: newTaxPositionAmount,
      });
    await this.updateAllFutureTaxPositionEntries(
      event,
      taxPositionEntry.taxPosition
    );
    return taxPositionEntry;
  };
}

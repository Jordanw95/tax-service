import { prisma } from '../utils/db';
import { TaxPositionEntry } from '@prisma/client';

export class TaxPositionRepository {
  async getRelevantTaxPosition(): Promise<TaxPositionEntry | null> {
    // The relevant tax position is the most recent tax position entry
    // that has a date in the past of the date of the request
    const taxPosition = await prisma.taxPositionEntry.findFirst();
    return taxPosition;
  }
}

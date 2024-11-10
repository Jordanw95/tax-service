import { prisma } from '../utils/db';
import { TaxPositionEntry, type Prisma } from '@prisma/client';

export class TaxPositionRepository {
  async getRelevantTaxPosition(date: string): Promise<TaxPositionEntry | null> {
    // The relevant tax position is the most recent tax position entry
    // that has a date in the past of the date provided
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date parameter');
    }
    const taxPosition = await prisma.taxPositionEntry.findFirst({
      where: {
        date: {
          lte: date,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
    return taxPosition;
  }

  async createTaxPositionEntry(
    data: Prisma.TaxPositionEntryCreateInput
  ): Promise<TaxPositionEntry> {
    const taxPositionEntry = await prisma.taxPositionEntry.create({
      data,
    });
    return taxPositionEntry;
  }
}

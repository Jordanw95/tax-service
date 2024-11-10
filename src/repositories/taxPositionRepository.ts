import { prisma } from '../utils/db';
import { TaxPositionEntry, Prisma } from '@prisma/client';

export class TaxPositionRepository {
  getRelevantTaxPosition = async (
    date: string,
    excludingIds: string[] = []
  ): Promise<TaxPositionEntry | null> => {
    // The relevant tax position is the most recent tax position entry
    // that has a date in the past of the date provided
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date parameter');
    }
    const taxPosition = await prisma.taxPositionEntry.findFirst({
      where: {
        date: {
          lte: dateObj.toISOString(),
        },
        ...(excludingIds.length > 0 && {
          NOT: {
            eventId: { in: excludingIds },
          },
        }),
      },
      orderBy: {
        date: 'desc',
      },
    });
    return taxPosition;
  };

  getFutureTaxPositionEntries = async (
    date: string
  ): Promise<TaxPositionEntry[]> => {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date parameter');
    }
    const taxPositionEntries = await prisma.taxPositionEntry.findMany({
      where: {
        date: {
          gt: date,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
    return taxPositionEntries;
  };

  updateManyTaxPositionsEntries = async (
    updates: { id: number; taxPosition: number }[]
  ): Promise<void> => {
    // This function will likely be used to update many future tax positions entries
    // so use raw SQL so postgresSQL can optimse entire operation as a single unit.
    // There may well be a way to do this with prisma but I couldn't find it
    const values = updates.map(u => `(${u.id}, ${u.taxPosition})`).join(',');

    await prisma.$transaction(async tx => {
      await tx.$executeRaw`
        UPDATE "TaxPositionEntry" AS t
        SET "taxPosition" = c.new_tax_position
        FROM (VALUES ${Prisma.raw(values)}) 
        AS c(id, new_tax_position)
        WHERE t.id = c.id
      `;
    });
  };

  createTaxPositionEntry = async (
    data: Prisma.TaxPositionEntryCreateInput
  ): Promise<TaxPositionEntry> => {
    const taxPositionEntry = await prisma.taxPositionEntry.create({
      data,
    });
    return taxPositionEntry;
  };

  updateTaxPositionEntry = async (
    eventId: string,
    data: Prisma.TaxPositionEntryUpdateInput
  ): Promise<TaxPositionEntry> => {
    const taxPositionEntry = await prisma.taxPositionEntry.update({
      where: { eventId },
      data,
    });
    return taxPositionEntry;
  };
}

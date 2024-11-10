import { TaxPositionRepository } from '../repositories/taxPositionRepository';
import { TaxPositionEntry } from '@prisma/client';

export class TaxPositionService {
  private taxPositionRepository: TaxPositionRepository;

  constructor() {
    this.taxPositionRepository = new TaxPositionRepository();
  }

  async getTaxPosition(): Promise<TaxPositionEntry | null> {
    const taxPosition =
      await this.taxPositionRepository.getRelevantTaxPosition();
    return taxPosition;
  }
}

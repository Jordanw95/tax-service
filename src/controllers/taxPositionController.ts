import { Request, Response, NextFunction } from 'express';
import { TaxPositionService } from '../services/taxPositionService';
import { TaxPositionDto } from '../types/dtos';
import { serialize } from '../utils/serializer';

export class TaxPositionController {
  private taxPositionService: TaxPositionService;

  constructor() {
    this.taxPositionService = new TaxPositionService();
  }

  getTaxPosition = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const taxPosition = await this.taxPositionService.getTaxPosition();
      const serializedTaxPosition = serialize(TaxPositionDto, taxPosition);
      res.json(serializedTaxPosition);
    } catch (error) {
      next(error);
    }
  };
}

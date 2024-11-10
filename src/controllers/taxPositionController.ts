import { Request, Response, NextFunction } from 'express';
import { TaxPositionService } from '../services/taxPositionService';
import { TaxPositionResponse } from '../types';
import { serialize } from '../utils/serializer';
import { TaxPositionNotFoundError } from '../types/errors';
export class TaxPositionController {
  private taxPositionService: TaxPositionService;

  constructor() {
    this.taxPositionService = new TaxPositionService();
  }

  getTaxPosition = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const date = req.query.date as string;
      if (!date || typeof date !== 'string') {
        throw new Error('Date parameter is required');
      }
      const taxPosition =
        await this.taxPositionService.getTaxPositionEntry(date);

      if (!taxPosition) {
        throw new TaxPositionNotFoundError();
      }

      const serializedTaxPosition = serialize(TaxPositionResponse, taxPosition);
      res.json(serializedTaxPosition);
    } catch (error) {
      next(error);
    }
  };
}

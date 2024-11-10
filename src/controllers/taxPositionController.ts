import { Request, Response, NextFunction } from 'express';
import { TaxPositionService } from '../services/taxPositionService';
import { TaxPositionResponse } from '../types';
import { serialize } from '../utils/serializer';
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
        const dateObj = new Date(date);
        res.json({
          taxPosition: 0,
          date: dateObj.toISOString(),
        });
      }

      const serializedTaxPosition = serialize(TaxPositionResponse, taxPosition);
      // We want the date from the request, not the date from the tax position
      res.json({ ...serializedTaxPosition, date });
    } catch (error) {
      next(error);
    }
  };
}

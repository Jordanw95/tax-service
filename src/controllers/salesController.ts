import { Request, Response, NextFunction } from 'express';
import { SalesService } from '../services/salesService';
import { createSalesEventSchema } from '../utils/validators';

export class SalesController {
  private salesService: SalesService;

  constructor() {
    this.salesService = new SalesService();
  }

  createSalesEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validatedDto = createSalesEventSchema.parse(req.body);
      await this.salesService.handleCreateSalesEvent(validatedDto);
      res.status(201).json({ message: 'Sales event created successfully' });
    } catch (error) {
      next(error);
    }
  };
}

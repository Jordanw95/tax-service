import { Request, Response, NextFunction } from 'express';
import { TransactionService } from '../services/transactionService';
import {
  createSalesEventSchema,
  createTaxPaymentSchema,
  modifySalesItemSchema,
} from '../utils/validators';

export class TransactionController {
  private transactionService: TransactionService;

  constructor() {
    this.transactionService = new TransactionService();
  }

  postTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eventType = req?.body?.eventType;
      if (!eventType) {
        throw new Error('Event type is required');
      }
      if (eventType === 'SALES') {
        return await this.createSalesEvent(req, res, next);
      }
      if (eventType === 'TAX_PAYMENT') {
        return await this.createTaxPayment(req, res, next);
      }
      throw new Error('Invalid event type');
    } catch (error) {
      next(error);
    }
  };

  createTaxPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validatedDto = createTaxPaymentSchema.parse(req.body);
      await this.transactionService.handleCreateTaxPayment(validatedDto);
      res.status(201).json({ message: 'Tax payment created successfully' });
    } catch (error) {
      next(error);
    }
  };

  createSalesEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validatedDto = createSalesEventSchema.parse(req.body);
      const salesEvent =
        await this.transactionService.handleCreateSalesEvent(validatedDto);
      res.status(201).json(salesEvent);
    } catch (error) {
      next(error);
    }
  };

  patchSalesEventItem = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validatedDto = modifySalesItemSchema.parse(req.body);
      await this.transactionService.handleModifySalesEventItem(validatedDto);
      res
        .status(200)
        .json({ message: 'Sales event item modified successfully' });
    } catch (error) {
      next(error);
    }
  };
}

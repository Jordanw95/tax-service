import { Router } from 'express';
import { TaxPositionController } from '../controllers/taxPositionController';
import { TransactionController } from '../controllers/transactionController';

const router = Router();

const taxPositionController = new TaxPositionController();
const transactionController = new TransactionController();
router.get('/tax-position', taxPositionController.getTaxPosition);
router.post('/transactions', transactionController.postTransaction);

export default router;

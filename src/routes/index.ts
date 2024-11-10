import { Router } from 'express';
import { TaxPositionController } from '../controllers/taxPositionController';
import { SalesController } from '../controllers/salesController';
const router = Router();

const taxPositionController = new TaxPositionController();
const salesController = new SalesController();
router.get('/position', taxPositionController.getTaxPosition);
router.post('/sales', salesController.createSalesEvent);

export default router;

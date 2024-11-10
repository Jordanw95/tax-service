import { Router } from 'express';
import { TaxPositionController } from '../controllers/taxPositionController';

const router = Router();

const taxPositionController = new TaxPositionController();

router.get('/position', taxPositionController.getTaxPosition);

export default router;

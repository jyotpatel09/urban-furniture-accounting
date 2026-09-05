import { Router } from 'express';
import { getGeneralLedger } from './ledger.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', getGeneralLedger);

export default router;

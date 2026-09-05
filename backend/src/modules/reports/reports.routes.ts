import { Router } from 'express';
import { getProfitLossReport, getBalanceSheetReport } from './reports.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/profit-loss', getProfitLossReport);
router.get('/balance-sheet', getBalanceSheetReport);

export default router;

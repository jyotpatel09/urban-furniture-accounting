import { Router } from 'express';
import { getProfitLossReport, getBalanceSheetReport } from './reports.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

import { requireRole } from '../../middleware/role.middleware.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('ADMIN', 'ACCOUNTANT'));

router.get('/profit-loss', getProfitLossReport);
router.get('/balance-sheet', getBalanceSheetReport);

export default router;

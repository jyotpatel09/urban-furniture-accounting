import { Router } from 'express';
import { getGeneralLedger } from './ledger.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

import { requireRole } from '../../middleware/role.middleware.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('ADMIN', 'ACCOUNTANT'));

router.get('/', getGeneralLedger);

export default router;

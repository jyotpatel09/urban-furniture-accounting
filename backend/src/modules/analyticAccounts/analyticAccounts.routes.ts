import { Router } from 'express';
import { getAnalyticAccounts, createAnalyticAccount, createAnalyticAccountSchema } from './analyticAccounts.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validateBody } from '../../middleware/validation.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', getAnalyticAccounts);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT'), validateBody(createAnalyticAccountSchema), createAnalyticAccount);

export default router;

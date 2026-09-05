import { Router } from 'express';
import { getBudgets, getBudgetById, createBudget, createBudgetSchema } from './budgets.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validateBody } from '../../middleware/validation.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', getBudgets);
router.get('/:id', getBudgetById);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT'), validateBody(createBudgetSchema), createBudget);

export default router;

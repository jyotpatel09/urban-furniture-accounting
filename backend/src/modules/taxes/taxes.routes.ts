import { Router } from 'express';
import { getTaxes, createTax, createTaxSchema } from './taxes.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validateBody } from '../../middleware/validation.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', getTaxes);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT'), validateBody(createTaxSchema), createTax);

export default router;

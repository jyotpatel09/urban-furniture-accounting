import { Router } from 'express';
import { getPayments, createPayment, createPaymentSchema } from './payments.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validateBody } from '../../middleware/validation.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', getPayments);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT'), validateBody(createPaymentSchema), createPayment);

export default router;

import { Router } from 'express';
import {
  getSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  confirmSalesOrder,
  cancelSalesOrder,
  createSalesOrderSchema,
} from './sales.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validateBody } from '../../middleware/validation.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', getSalesOrders);
router.get('/:id', getSalesOrderById);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT'), validateBody(createSalesOrderSchema), createSalesOrder);
router.post('/:id/confirm', requireRole('ADMIN', 'ACCOUNTANT'), confirmSalesOrder);
router.post('/:id/cancel', requireRole('ADMIN', 'ACCOUNTANT'), cancelSalesOrder);

export default router;

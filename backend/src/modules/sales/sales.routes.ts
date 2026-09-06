import { Router } from 'express';
import {
  getSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  confirmSalesOrder,
  cancelSalesOrder,
  createSalesOrderSchema,
  createInvoiceFromOrder,
} from './sales.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validateBody } from '../../middleware/validation.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', getSalesOrders);
router.get('/:id', getSalesOrderById);
router.post('/', requireRole('ADMIN', 'SALES_PURCHASE'), validateBody(createSalesOrderSchema), createSalesOrder);
router.post('/:id/confirm', requireRole('ADMIN', 'SALES_PURCHASE'), confirmSalesOrder);
router.post('/:id/cancel', requireRole('ADMIN', 'SALES_PURCHASE'), cancelSalesOrder);
router.post('/:id/create-invoice', requireRole('ADMIN', 'ACCOUNTANT', 'SALES_PURCHASE'), createInvoiceFromOrder);

export default router;


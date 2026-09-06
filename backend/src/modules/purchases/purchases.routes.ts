import { Router } from 'express';
import {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  confirmPurchaseOrder,
  receivePurchaseOrder,
  createPurchaseOrderSchema,
  createBillFromOrder,
} from './purchases.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validateBody } from '../../middleware/validation.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', getPurchaseOrders);
router.get('/:id', getPurchaseOrderById);
router.post('/', requireRole('ADMIN', 'SALES_PURCHASE'), validateBody(createPurchaseOrderSchema), createPurchaseOrder);
router.post('/:id/confirm', requireRole('ADMIN', 'SALES_PURCHASE'), confirmPurchaseOrder);
router.post('/:id/receive', requireRole('ADMIN', 'SALES_PURCHASE'), receivePurchaseOrder);
router.post('/:id/create-bill', requireRole('ADMIN', 'ACCOUNTANT', 'SALES_PURCHASE'), createBillFromOrder);

export default router;


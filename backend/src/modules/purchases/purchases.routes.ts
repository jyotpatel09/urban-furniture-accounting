import { Router } from 'express';
import {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  confirmPurchaseOrder,
  receivePurchaseOrder,
  createPurchaseOrderSchema,
} from './purchases.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validateBody } from '../../middleware/validation.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', getPurchaseOrders);
router.get('/:id', getPurchaseOrderById);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT'), validateBody(createPurchaseOrderSchema), createPurchaseOrder);
router.post('/:id/confirm', requireRole('ADMIN', 'ACCOUNTANT'), confirmPurchaseOrder);
router.post('/:id/receive', requireRole('ADMIN', 'ACCOUNTANT'), receivePurchaseOrder);

export default router;

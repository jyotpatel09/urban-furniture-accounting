import { Router } from 'express';
import {
  getVendorBills,
  getVendorBillById,
  createVendorBill,
  postVendorBill,
  createVendorBillSchema,
} from './vendorBills.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validateBody } from '../../middleware/validation.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', getVendorBills);
router.get('/:id', getVendorBillById);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT', 'SALES_PURCHASE'), validateBody(createVendorBillSchema), createVendorBill);
router.post('/:id/post', requireRole('ADMIN', 'ACCOUNTANT'), postVendorBill);

export default router;

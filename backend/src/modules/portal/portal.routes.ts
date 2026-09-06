import { Router } from 'express';
import {
  getPortalProfile,
  getPortalInvoices,
  getPortalInvoiceById,
  getPortalPayments,
} from './portal.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('SALES_PURCHASE', 'ADMIN'));

router.get('/me', getPortalProfile);
router.get('/invoices', getPortalInvoices);
router.get('/invoices/:id', getPortalInvoiceById);
router.get('/payments', getPortalPayments);

export default router;

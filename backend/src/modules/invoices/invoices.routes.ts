import { Router } from 'express';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  postInvoice,
  createInvoiceSchema,
} from './invoices.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validateBody } from '../../middleware/validation.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT', 'SALES_PURCHASE'), validateBody(createInvoiceSchema), createInvoice);
router.post('/:id/post', requireRole('ADMIN', 'ACCOUNTANT'), postInvoice);

export default router;

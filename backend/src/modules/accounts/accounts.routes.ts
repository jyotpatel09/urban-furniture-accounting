import { Router } from 'express';
import {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountLedger,
  createAccountSchema,
  updateAccountSchema,
} from './accounts.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validateBody } from '../../middleware/validation.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getAccounts);
router.get('/:id', getAccountById);
router.get('/:id/ledger', getAccountLedger);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT'), validateBody(createAccountSchema), createAccount);
router.patch('/:id', requireRole('ADMIN', 'ACCOUNTANT'), validateBody(updateAccountSchema), updateAccount);
router.delete('/:id', requireRole('ADMIN'), deleteAccount);

export default router;

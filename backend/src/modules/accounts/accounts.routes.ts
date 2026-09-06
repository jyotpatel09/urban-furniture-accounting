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
router.use(requireRole('ADMIN', 'ACCOUNTANT'));

router.get('/', getAccounts);
router.get('/:id', getAccountById);
router.get('/:id/ledger', getAccountLedger);
router.post('/', validateBody(createAccountSchema), createAccount);
router.patch('/:id', validateBody(updateAccountSchema), updateAccount);
router.delete('/:id', requireRole('ADMIN'), deleteAccount);

export default router;

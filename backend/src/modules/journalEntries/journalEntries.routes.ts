import { Router } from 'express';
import {
  getJournalEntries,
  getJournalEntryById,
  createJournalEntry,
  cancelJournalEntry,
  createJournalEntrySchema,
} from './journalEntries.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validateBody } from '../../middleware/validation.middleware.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('ADMIN', 'ACCOUNTANT'));

router.get('/', getJournalEntries);
router.get('/:id', getJournalEntryById);
router.post('/', validateBody(createJournalEntrySchema), createJournalEntry);
router.post('/:id/cancel', cancelJournalEntry);

export default router;

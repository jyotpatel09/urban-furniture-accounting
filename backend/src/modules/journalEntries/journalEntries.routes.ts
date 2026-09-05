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

router.get('/', getJournalEntries);
router.get('/:id', getJournalEntryById);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT'), validateBody(createJournalEntrySchema), createJournalEntry);
router.post('/:id/cancel', requireRole('ADMIN', 'ACCOUNTANT'), cancelJournalEntry);

export default router;

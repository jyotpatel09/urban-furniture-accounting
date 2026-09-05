import { Router } from 'express';
import { getJournals, getJournalById, createJournal, updateJournal, createJournalSchema } from './journals.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validateBody } from '../../middleware/validation.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', getJournals);
router.get('/:id', getJournalById);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT'), validateBody(createJournalSchema), createJournal);
router.patch('/:id', requireRole('ADMIN', 'ACCOUNTANT'), updateJournal);

export default router;

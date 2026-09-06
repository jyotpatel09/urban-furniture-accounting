import { Router } from 'express';
import { getJournals, getJournalById, createJournal, updateJournal, createJournalSchema } from './journals.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validateBody } from '../../middleware/validation.middleware.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('ADMIN', 'ACCOUNTANT'));

router.get('/', getJournals);
router.get('/:id', getJournalById);
router.post('/', validateBody(createJournalSchema), createJournal);
router.patch('/:id', updateJournal);

export default router;

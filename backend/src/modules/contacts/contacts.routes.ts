import { Router } from 'express';
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  archiveContact,
  createContactSchema,
  updateContactSchema,
} from './contacts.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validateBody } from '../../middleware/validation.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getContacts);
router.get('/:id', getContactById);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT'), validateBody(createContactSchema), createContact);
router.patch('/:id', requireRole('ADMIN', 'ACCOUNTANT'), validateBody(updateContactSchema), updateContact);
router.delete('/:id', requireRole('ADMIN'), archiveContact);

export default router;

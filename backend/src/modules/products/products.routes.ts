import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  archiveProduct,
  getStockReport,
  getProductStockById,
  createProductSchema,
  updateProductSchema,
} from './products.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validateBody } from '../../middleware/validation.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/stock', getStockReport);
router.get('/:id/stock', getProductStockById);

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT'), validateBody(createProductSchema), createProduct);
router.patch('/:id', requireRole('ADMIN', 'ACCOUNTANT'), validateBody(updateProductSchema), updateProduct);
router.delete('/:id', requireRole('ADMIN'), archiveProduct);

export default router;

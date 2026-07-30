import express from 'express';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../controllers/supplierController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getSuppliers);
router.post('/', requireRole(['ADMIN', 'PEMILIK']), createSupplier);
router.put('/:id', requireRole(['ADMIN', 'PEMILIK']), updateSupplier);
router.delete('/:id', requireRole(['ADMIN']), deleteSupplier);

export default router;

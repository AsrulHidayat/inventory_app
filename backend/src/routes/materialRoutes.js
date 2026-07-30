import express from 'express';
import { getMaterials, getMaterialById, createMaterial, updateMaterial, deleteMaterial, getDashboardSummary } from '../controllers/materialController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/dashboard-summary', getDashboardSummary);
router.get('/', getMaterials);
router.get('/:id', getMaterialById);
router.post('/', requireRole(['ADMIN', 'PEMILIK']), createMaterial);
router.put('/:id', requireRole(['ADMIN', 'PEMILIK']), updateMaterial);
router.delete('/:id', requireRole(['ADMIN']), deleteMaterial);

export default router;

import express from 'express';
import { getStockIn, createStockIn, deleteStockIn, getStockOut, createStockOut, deleteStockOut } from '../controllers/transactionController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

// Barang Masuk
router.get('/in', getStockIn);
router.post('/in', requireRole(['ADMIN', 'PEMILIK']), createStockIn);
router.delete('/in/:id', requireRole(['ADMIN', 'PEMILIK']), deleteStockIn);

// Barang Keluar
router.get('/out', getStockOut);
router.post('/out', requireRole(['ADMIN', 'PEMILIK']), createStockOut);
router.delete('/out/:id', requireRole(['ADMIN', 'PEMILIK']), deleteStockOut);

export default router;

import express from 'express';
import { calculateForecast } from '../controllers/forecastController.js';
import { getInventoryReport, getTransactionsReport } from '../controllers/reportController.js';
import { getUmkms, updateUmkm } from '../controllers/umkmController.js';
import { getNotifications, markAsRead } from '../controllers/notificationController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

export const forecastRouter = express.Router();
forecastRouter.use(authenticateToken);
forecastRouter.get('/calculate', calculateForecast);

export const reportRouter = express.Router();
reportRouter.use(authenticateToken);
reportRouter.get('/inventory', getInventoryReport);
reportRouter.get('/transactions', getTransactionsReport);

export const umkmRouter = express.Router();
umkmRouter.use(authenticateToken);
umkmRouter.get('/', getUmkms);
umkmRouter.put('/:id', requireRole(['ADMIN', 'PEMILIK']), updateUmkm);


export const notificationRouter = express.Router();
notificationRouter.use(authenticateToken);
notificationRouter.get('/', getNotifications);
notificationRouter.put('/read/:id', markAsRead);

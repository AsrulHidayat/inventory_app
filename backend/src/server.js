import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import materialRoutes from './routes/materialRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import { forecastRouter, reportRouter, umkmRouter, notificationRouter } from './routes/otherRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend API Sistem Informasi Persediaan UMKM Toko Kue Gowa aktif!',
    timestamp: new Date()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/forecast', forecastRouter);
app.use('/api/reports', reportRouter);
app.use('/api/umkms', umkmRouter);
app.use('/api/notifications', notificationRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal pada server.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan pada port ${PORT} [http://localhost:${PORT}]`);
});

import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_umkm_gowa_2026';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Akses ditolak. Token tidak ditemukan.' });
  }

  // Handle Mock Token Development Fallback
  if (token.startsWith('mock_jwt_')) {
    let mockUser = null;
    if (token === 'mock_jwt_admin_token_2026') {
      mockUser = await prisma.user.findFirst({
        where: { email: 'admin@gowa.com' },
        include: { role: true, umkm: true }
      });
    } else if (token.includes('pemilik')) {
      const umkmId = Number(token.split('_').pop()) || 1;
      mockUser = await prisma.user.findFirst({
        where: { umkmId },
        include: { role: true, umkm: true }
      });
    }

    if (!mockUser) {
      mockUser = await prisma.user.findFirst({
        include: { role: true, umkm: true }
      });
    }

    if (mockUser) {
      req.user = mockUser;
      return next();
    }
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true, umkm: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Pengguna tidak ditemukan atau token kedaluwarsa.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Token tidak valid atau telah habis masa berlaku.' });
  }
};

export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    const roleName = typeof req.user?.role === 'object' ? req.user?.role?.name : req.user?.role;
    if (!roleName) {
      return res.status(403).json({ success: false, message: 'Akses dilarang. Permintaan tidak memiliki role valid.' });
    }

    if (!allowedRoles.includes(roleName)) {
      return res.status(403).json({ success: false, message: `Akses ditolak. Fitur ini hanya untuk role: ${allowedRoles.join(', ')}` });
    }

    next();
  };
};

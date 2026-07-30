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
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, message: 'Akses dilarang. Permintaan tidak memiliki role valid.' });
    }

    if (!allowedRoles.includes(req.user.role.name)) {
      return res.status(403).json({ success: false, message: `Akses ditolak. Fitur ini hanya untuk role: ${allowedRoles.join(', ')}` });
    }

    next();
  };
};

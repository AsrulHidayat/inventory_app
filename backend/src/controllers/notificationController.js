import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getNotifications = async (req, res) => {
  try {
    const userRole = typeof req.user?.role === 'object' ? req.user.role?.name : req.user?.role;
    const targetUmkmId = req.query.umkmId ? Number(req.query.umkmId) : (userRole === 'PEMILIK' ? req.user.umkmId : null);

    const where = {};
    if (targetUmkmId) {
      where.umkmId = targetUmkmId;
    }

    // Ambil bahan baku toko yang stoknya kritis (0 atau <= minStock)
    const criticalMaterials = await prisma.material.findMany({
      where: {
        ...where,
      },
      include: { umkm: true },
      orderBy: { currentStock: 'asc' },
    });

    const notifications = [];
    criticalMaterials.forEach((mat) => {
      if (mat.currentStock === 0) {
        notifications.push({
          id: `mat-habis-${mat.id}`,
          title: 'Peringatan Stok HABIS!',
          message: `${mat.name} (${mat.umkm?.name || 'Toko'}) telah HABIS (Stok: 0 ${mat.unit})!`,
          type: 'DANGER',
          isRead: false,
          createdAt: mat.updatedAt || new Date().toISOString(),
        });
      } else if (mat.currentStock <= mat.minStock) {
        notifications.push({
          id: `mat-min-${mat.id}`,
          title: 'Peringatan Stok Minimal',
          message: `${mat.name} (${mat.umkm?.name || 'Toko'}) tersisa ${mat.currentStock} ${mat.unit} (Min: ${mat.minStock} ${mat.unit})`,
          type: 'WARNING',
          isRead: false,
          createdAt: mat.updatedAt || new Date().toISOString(),
        });
      }
    });

    return res.json({
      success: true,
      unreadCount: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error('Error getNotifications:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data notifikasi.' });
  }
};

export const markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    if (id === 'all') {
      await prisma.notification.updateMany({
        where: { isRead: false },
        data: { isRead: true }
      });
    } else {
      await prisma.notification.update({
        where: { id: Number(id) },
        data: { isRead: true }
      });
    }
    return res.json({ success: true, message: 'Notifikasi berhasil ditandai sudah dibaca.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui status notifikasi.' });
  }
};

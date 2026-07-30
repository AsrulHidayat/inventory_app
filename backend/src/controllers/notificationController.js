import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    const unreadCount = await prisma.notification.count({
      where: { isRead: false }
    });

    return res.json({
      success: true,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
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

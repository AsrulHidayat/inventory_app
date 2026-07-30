import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUmkms = async (req, res) => {
  try {
    const umkms = await prisma.umkm.findMany({
      include: { _count: { select: { materials: true, users: true } } }
    });
    return res.json({ success: true, data: umkms });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil data UMKM.' });
  }
};

export const updateUmkm = async (req, res) => {
  const { id } = req.params;
  const { name, logo, address, phone } = req.body;
  try {
    const updated = await prisma.umkm.update({
      where: { id: Number(id) },
      data: { name, logo, address, phone }
    });
    return res.json({ success: true, message: 'Data UMKM berhasil diperbarui.', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui data UMKM.' });
  }
};

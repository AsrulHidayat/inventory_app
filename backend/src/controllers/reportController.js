import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getInventoryReport = async (req, res) => {
  try {
    const { umkmId, category, startDate, endDate } = req.query;
    const where = {};

    const roleName = typeof req.user?.role === 'object' ? req.user?.role?.name : req.user?.role;

    if (umkmId) {
      where.umkmId = Number(umkmId);
    } else if (roleName === 'PEMILIK' && req.user?.umkmId) {
      where.umkmId = req.user.umkmId;
    }


    if (category) {
      where.category = category;
    }

    const materials = await prisma.material.findMany({
      where,
      include: { supplier: true, umkm: true },
      orderBy: { name: 'asc' }
    });

    const reportData = materials.map(mat => {
      let status = 'Aman';
      if (mat.currentStock === 0) status = 'Habis';
      else if (mat.currentStock <= mat.minStock) status = 'Hampir Habis';

      return {
        id: mat.id,
        code: mat.code,
        name: mat.name,
        category: mat.category,
        unit: mat.unit,
        minStock: mat.minStock,
        price: mat.price,
        currentStock: mat.currentStock,
        totalAssetValue: mat.currentStock * mat.price,
        supplierName: mat.supplier ? mat.supplier.name : '-',
        umkmName: mat.umkm ? mat.umkm.name : '-',
        status,
      };
    });

    return res.json({ success: true, data: reportData });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menyusun laporan inventaris.' });
  }
};

export const getTransactionsReport = async (req, res) => {
  try {
    const { type = 'in', umkmId, startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (type === 'in') {
      const stockIns = await prisma.stockIn.findMany({
        where: {
          ...dateFilter,
          ...(umkmId && { material: { umkmId: Number(umkmId) } }),
        },
        include: { material: { include: { umkm: true } }, supplier: true, user: true },
        orderBy: { date: 'desc' }
      });
      return res.json({ success: true, type: 'in', data: stockIns });
    } else {
      const stockOuts = await prisma.stockOut.findMany({
        where: {
          ...dateFilter,
          ...(umkmId && { material: { umkmId: Number(umkmId) } }),
        },
        include: { material: { include: { umkm: true } }, user: true },
        orderBy: { date: 'desc' }
      });
      return res.json({ success: true, type: 'out', data: stockOuts });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menyusun laporan transaksi.' });
  }
};

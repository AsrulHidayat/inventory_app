import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// BARANG MASUK (STOCK IN)
export const getStockIn = async (req, res) => {
  try {
    const { umkmId, search, page = 1, limit = 50 } = req.query;
    const where = {};

    if (umkmId) {
      where.material = { umkmId: Number(umkmId) };
    } else if (req.user.role.name === 'PEMILIK' && req.user.umkmId) {
      where.material = { umkmId: req.user.umkmId };
    }

    if (search) {
      where.OR = [
        { transactionCode: { contains: search } },
        { material: { name: { contains: search } } },
        { supplier: { name: { contains: search } } },
      ];
    }

    const total = await prisma.stockIn.count({ where });

    const stockIns = await prisma.stockIn.findMany({
      where,
      include: { material: { include: { umkm: true } }, supplier: true, user: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    return res.json({
      success: true,
      data: stockIns,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      }
    });
  } catch (error) {
    console.error('Error getStockIn:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data barang masuk.' });
  }
};

export const createStockIn = async (req, res) => {
  const { materialId, supplierId, quantity, price, date, notes } = req.body;

  try {
    const mat = await prisma.material.findUnique({ where: { id: Number(materialId) }, include: { umkm: true } });
    if (!mat) {
      return res.status(404).json({ success: false, message: 'Bahan baku tidak ditemukan.' });
    }

    const qty = Number(quantity);
    const itemPrice = price ? parseFloat(price) : mat.price;
    const totalPrice = qty * itemPrice;
    const count = await prisma.stockIn.count();
    const transactionCode = `IN-${Date.now().toString().slice(-6)}-${String(count + 1).padStart(3, '0')}`;

    // Transaction batch
    const [transaction] = await prisma.$transaction([
      prisma.stockIn.create({
        data: {
          transactionCode,
          materialId: Number(materialId),
          supplierId: supplierId ? Number(supplierId) : mat.supplierId,
          quantity: qty,
          price: itemPrice,
          totalPrice,
          date: date ? new Date(date) : new Date(),
          notes: notes || 'Pembelian/Penambahan Stok Baru',
          userId: req.user.id,
        },
        include: { material: true, supplier: true }
      }),
      prisma.material.update({
        where: { id: Number(materialId) },
        data: { currentStock: { increment: qty } }
      })
    ]);

    return res.status(201).json({
      success: true,
      message: `Berhasil menambahkan barang masuk ${mat.name} sebanyak ${qty} ${mat.unit}. Stok otomatis diperbarui.`,
      data: transaction
    });
  } catch (error) {
    console.error('Create stockIn error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mencatat transaksi barang masuk.' });
  }
};

export const deleteStockIn = async (req, res) => {
  const { id } = req.params;
  try {
    const stockIn = await prisma.stockIn.findUnique({ where: { id: Number(id) } });
    if (!stockIn) {
      return res.status(404).json({ success: false, message: 'Data barang masuk tidak ditemukan.' });
    }

    await prisma.$transaction([
      prisma.stockIn.delete({ where: { id: Number(id) } }),
      prisma.material.update({
        where: { id: stockIn.materialId },
        data: { currentStock: { decrement: stockIn.quantity } }
      })
    ]);

    return res.json({ success: true, message: 'Transaksi barang masuk berhasil dihapus & stok dikurangi.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus transaksi barang masuk.' });
  }
};

// BARANG KELUAR (STOCK OUT)
export const getStockOut = async (req, res) => {
  try {
    const { umkmId, search, page = 1, limit = 50 } = req.query;
    const where = {};

    if (umkmId) {
      where.material = { umkmId: Number(umkmId) };
    } else if (req.user.role.name === 'PEMILIK' && req.user.umkmId) {
      where.material = { umkmId: req.user.umkmId };
    }

    if (search) {
      where.OR = [
        { transactionCode: { contains: search } },
        { material: { name: { contains: search } } },
        { productionPurpose: { contains: search } },
      ];
    }

    const total = await prisma.stockOut.count({ where });

    const stockOuts = await prisma.stockOut.findMany({
      where,
      include: { material: { include: { umkm: true } }, user: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    return res.json({
      success: true,
      data: stockOuts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil data barang keluar.' });
  }
};

export const createStockOut = async (req, res) => {
  const { materialId, quantity, productionPurpose, date, notes } = req.body;

  try {
    const mat = await prisma.material.findUnique({ where: { id: Number(materialId) }, include: { umkm: true } });
    if (!mat) {
      return res.status(404).json({ success: false, message: 'Bahan baku tidak ditemukan.' });
    }

    const qty = Number(quantity);

    if (mat.currentStock < qty) {
      return res.status(400).json({
        success: false,
        message: `Stok tidak mencukupi! Stok ${mat.name} saat ini hanya tersisa ${mat.currentStock} ${mat.unit}, sedangkan yang dibutuhkan ${qty} ${mat.unit}.`
      });
    }

    const count = await prisma.stockOut.count();
    const transactionCode = `OUT-${Date.now().toString().slice(-6)}-${String(count + 1).padStart(3, '0')}`;

    const [transaction, updatedMaterial] = await prisma.$transaction([
      prisma.stockOut.create({
        data: {
          transactionCode,
          materialId: Number(materialId),
          quantity: qty,
          productionPurpose: productionPurpose || 'Penggunaan Produksi',
          date: date ? new Date(date) : new Date(),
          notes: notes || '',
          userId: req.user.id,
        },
        include: { material: true }
      }),
      prisma.material.update({
        where: { id: Number(materialId) },
        data: { currentStock: { decrement: qty } }
      })
    ]);

    // Check if new stock drops below minimum threshold -> Trigger notification
    if (updatedMaterial.currentStock <= updatedMaterial.minStock) {
      const type = updatedMaterial.currentStock === 0 ? 'DANGER' : 'WARNING';
      const title = updatedMaterial.currentStock === 0 ? 'Peringatan Stok HABIS!' : 'Peringatan Stok Minimal';
      const message = `Stok bahan baku "${updatedMaterial.name}" (${mat.umkm?.name || 'UMKM'}) tersisa ${updatedMaterial.currentStock} ${updatedMaterial.unit} (Minimal stok aman: ${updatedMaterial.minStock} ${updatedMaterial.unit}).`;

      await prisma.notification.create({
        data: {
          title,
          message,
          type,
        }
      });
    }

    return res.status(201).json({
      success: true,
      message: `Pengeluaran bahan baku ${mat.name} sebanyak ${qty} ${mat.unit} berhasil dicatat. Stok otomatis berkurang.`,
      data: transaction
    });
  } catch (error) {
    console.error('Create stockOut error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mencatat transaksi barang keluar.' });
  }
};

export const deleteStockOut = async (req, res) => {
  const { id } = req.params;
  try {
    const stockOut = await prisma.stockOut.findUnique({ where: { id: Number(id) } });
    if (!stockOut) {
      return res.status(404).json({ success: false, message: 'Data barang keluar tidak ditemukan.' });
    }

    await prisma.$transaction([
      prisma.stockOut.delete({ where: { id: Number(id) } }),
      prisma.material.update({
        where: { id: stockOut.materialId },
        data: { currentStock: { increment: stockOut.quantity } }
      })
    ]);

    return res.json({ success: true, message: 'Transaksi barang keluar berhasil dihapus & stok dikembalikan.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus transaksi barang keluar.' });
  }
};

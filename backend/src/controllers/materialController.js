import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper untuk menghitung status stok
export const getStockStatus = (currentStock, minStock) => {
  if (currentStock === 0) return { status: 'Habis', color: 'danger', code: 'HABIS' };
  if (currentStock <= minStock) return { status: 'Hampir Habis', color: 'warning', code: 'HAMPIR_HABIS' };
  return { status: 'Aman', color: 'success', code: 'AMAN' };
};

export const getMaterials = async (req, res) => {
  try {
    const { search, category, status, umkmId, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 50 } = req.query;

    const where = {};

    // Filter per UMKM jika dispesifikasikan atau jika user adalah Pemilik UMKM
    if (umkmId) {
      where.umkmId = Number(umkmId);
    } else if (req.user.role.name === 'PEMILIK' && req.user.umkmId) {
      where.umkmId = req.user.umkmId;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
      ];
    }

    const total = await prisma.material.count({ where });

    const materials = await prisma.material.findMany({
      where,
      include: { supplier: true, umkm: true },
      orderBy: { [sortBy]: sortOrder },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const items = materials.map(mat => {
      const stockInfo = getStockStatus(mat.currentStock, mat.minStock);
      return {
        ...mat,
        status: stockInfo.status,
        statusCode: stockInfo.code,
        statusColor: stockInfo.color,
      };
    });

    // Filter status jika diminta
    let filteredItems = items;
    if (status) {
      filteredItems = items.filter(item => item.statusCode === status.toUpperCase());
    }

    return res.json({
      success: true,
      data: filteredItems,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      }
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data bahan baku.' });
  }
};

export const getMaterialById = async (req, res) => {
  try {
    const material = await prisma.material.findUnique({
      where: { id: Number(req.params.id) },
      include: { supplier: true, umkm: true, stockIns: { take: 5, orderBy: { date: 'desc' } }, stockOuts: { take: 5, orderBy: { date: 'desc' } } }
    });

    if (!material) {
      return res.status(404).json({ success: false, message: 'Bahan baku tidak ditemukan.' });
    }

    const stockInfo = getStockStatus(material.currentStock, material.minStock);

    return res.json({
      success: true,
      data: {
        ...material,
        status: stockInfo.status,
        statusCode: stockInfo.code,
        statusColor: stockInfo.color,
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil detail bahan baku.' });
  }
};

export const createMaterial = async (req, res) => {
  const { code, name, category, unit, minStock, price, currentStock, supplierId, umkmId } = req.body;

  try {
    const targetUmkmId = umkmId ? Number(umkmId) : (req.user.umkmId || 1);
    
    // Auto generate kode jika tidak dikirim
    let materialCode = code;
    if (!materialCode) {
      const count = await prisma.material.count();
      materialCode = `MAT-${String(count + 1).padStart(3, '0')}`;
    }

    const newMaterial = await prisma.material.create({
      data: {
        code: materialCode,
        name,
        category,
        unit,
        minStock: Number(minStock) || 10,
        price: parseFloat(price) || 0,
        currentStock: Number(currentStock) || 0,
        supplierId: supplierId ? Number(supplierId) : null,
        umkmId: targetUmkmId,
      },
      include: { supplier: true, umkm: true }
    });

    const stockInfo = getStockStatus(newMaterial.currentStock, newMaterial.minStock);

    return res.status(201).json({
      success: true,
      message: 'Bahan baku berhasil ditambahkan.',
      data: {
        ...newMaterial,
        status: stockInfo.status,
        statusCode: stockInfo.code,
        statusColor: stockInfo.color,
      }
    });
  } catch (error) {
    console.error('Create material error:', error);
    return res.status(500).json({ success: false, message: 'Gagal menambahkan bahan baku. Kode barang mungkin sudah terpakai.' });
  }
};

export const updateMaterial = async (req, res) => {
  const { id } = req.params;
  const { code, name, category, unit, minStock, price, currentStock, supplierId, umkmId } = req.body;

  try {
    const updated = await prisma.material.update({
      where: { id: Number(id) },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(category && { category }),
        ...(unit && { unit }),
        ...(minStock !== undefined && { minStock: Number(minStock) }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(currentStock !== undefined && { currentStock: Number(currentStock) }),
        ...(supplierId !== undefined && { supplierId: supplierId ? Number(supplierId) : null }),
        ...(umkmId !== undefined && { umkmId: Number(umkmId) }),
      },
      include: { supplier: true, umkm: true }
    });

    const stockInfo = getStockStatus(updated.currentStock, updated.minStock);

    return res.json({
      success: true,
      message: 'Bahan baku berhasil diperbarui.',
      data: {
        ...updated,
        status: stockInfo.status,
        statusCode: stockInfo.code,
        statusColor: stockInfo.color,
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui data bahan baku.' });
  }
};

export const deleteMaterial = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.material.delete({
      where: { id: Number(id) }
    });

    return res.json({ success: true, message: 'Bahan baku berhasil dihapus.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus bahan baku. Terdapat data transaksi terkait.' });
  }
};

// Summary metrics untuk Dashboard Overview
export const getDashboardSummary = async (req, res) => {
  try {
    const { umkmId } = req.query;
    const where = {};
    if (umkmId) {
      where.umkmId = Number(umkmId);
    } else if (req.user.role.name === 'PEMILIK' && req.user.umkmId) {
      where.umkmId = req.user.umkmId;
    }

    const materials = await prisma.material.findMany({ where });

    let totalJenisBahan = materials.length;
    let totalStokUnit = 0;
    let barangHampirHabis = 0;
    let barangHabis = 0;

    materials.forEach(mat => {
      totalStokUnit += mat.currentStock;
      if (mat.currentStock === 0) barangHabis++;
      else if (mat.currentStock <= mat.minStock) barangHampirHabis++;
    });

    // Barang Masuk & Keluar Hari Ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stockInToday = await prisma.stockIn.aggregate({
      _sum: { quantity: true },
      where: {
        date: { gte: today },
        ...(where.umkmId && { material: { umkmId: where.umkmId } })
      }
    });

    const stockOutToday = await prisma.stockOut.aggregate({
      _sum: { quantity: true },
      where: {
        date: { gte: today },
        ...(where.umkmId && { material: { umkmId: where.umkmId } })
      }
    });

    return res.json({
      success: true,
      data: {
        totalJenisBahan,
        totalStokUnit,
        barangHampirHabis,
        barangHabis,
        barangMasukHariIni: stockInToday._sum.quantity || 0,
        barangKeluarHariIni: stockOutToday._sum.quantity || 0,
      }
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return res.status(500).json({ success: false, message: 'Gagal memuat ringkasan dashboard.' });
  }
};

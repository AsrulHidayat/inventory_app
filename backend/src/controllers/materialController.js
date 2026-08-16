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

    const userRole = typeof req.user?.role === 'object' ? req.user?.role?.name : req.user?.role;

    // Filter per UMKM jika dispesifikasikan atau jika user adalah Pemilik UMKM
    if (umkmId) {
      where.umkmId = Number(umkmId);
    } else if (userRole === 'PEMILIK' && req.user?.umkmId) {
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
    const userRole = typeof req.user?.role === 'object' ? req.user.role?.name : req.user?.role;
    const targetUmkmId = umkmId ? Number(umkmId) : (userRole === 'PEMILIK' ? req.user?.umkmId : null);

    const where = {};
    if (targetUmkmId) {
      where.umkmId = targetUmkmId;
    }

    const materials = await prisma.material.findMany({ 
      where,
      include: { supplier: true, umkm: true }
    });

    let totalJenisBahan = materials.length;
    let totalStokUnit = 0;
    let barangHampirHabis = 0;
    let barangHabis = 0;

    materials.forEach(mat => {
      totalStokUnit += mat.currentStock;
      if (mat.currentStock === 0) barangHabis++;
      else if (mat.currentStock <= mat.minStock) barangHampirHabis++;
    });

    // Barang Masuk & Keluar Hari Ini (00:00:00 sampai sekarang)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const stockInToday = await prisma.stockIn.aggregate({
      _sum: { quantity: true },
      where: {
        date: { gte: startOfToday },
        ...(targetUmkmId ? { material: { umkmId: targetUmkmId } } : {})
      }
    });

    const stockOutToday = await prisma.stockOut.aggregate({
      _sum: { quantity: true },
      where: {
        date: { gte: startOfToday },
        ...(targetUmkmId ? { material: { umkmId: targetUmkmId } } : {})
      }
    });

    // Kalkulasi Real Riwayat Barang Masuk vs Keluar 6 Bulan
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const currentMonthIdx = new Date().getMonth();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIdx - i + 12) % 12;
      last6Months.push(months[idx]);
    }

    // Ambil data transaksi real untuk chart 6 bulan terakhir
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const allStockIns = await prisma.stockIn.findMany({
      where: {
        date: { gte: sixMonthsAgo },
        ...(targetUmkmId ? { material: { umkmId: targetUmkmId } } : {})
      },
      select: { quantity: true, date: true }
    });

    const allStockOuts = await prisma.stockOut.findMany({
      where: {
        date: { gte: sixMonthsAgo },
        ...(targetUmkmId ? { material: { umkmId: targetUmkmId } } : {})
      },
      select: { quantity: true, date: true }
    });

    // Hitung pergerakan murni berdasarkan data transaksi real di database
    const chartMonthly = last6Months.map((bln, idx) => {
      const targetMonthIdx = (currentMonthIdx - (5 - idx) + 12) % 12;
      
      const totalInMonth = allStockIns
        .filter(t => new Date(t.date).getMonth() === targetMonthIdx)
        .reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);

      const totalOutMonth = allStockOuts
        .filter(t => new Date(t.date).getMonth() === targetMonthIdx)
        .reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);

      return {
        bulan: bln,
        masuk: totalInMonth,
        keluar: totalOutMonth
      };
    });

    // Ambil riwayat pemakaian real 4 minggu terakhir
    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

    const recentStockOuts = await prisma.stockOut.findMany({
      where: {
        date: { gte: fourWeeksAgo },
        ...(targetUmkmId ? { material: { umkmId: targetUmkmId } } : {})
      },
      include: { material: true }
    });

    // Pilih top 2 bahan baku berdasarkan total kuantitas pemakaian 4 minggu terakhir
    const usageByMaterial = {};
    recentStockOuts.forEach(o => {
      const name = o.material?.name;
      if (name) {
        usageByMaterial[name] = (usageByMaterial[name] || 0) + (Number(o.quantity) || 0);
      }
    });
    const sortedMaterials = Object.entries(usageByMaterial)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    // Jika tidak ada transaksi, fallback ke 2 bahan baku pertama di list
    const fallbackMaterials = materials.slice(0, 2).map(m => m.name);
    const mat1 = sortedMaterials[0] || fallbackMaterials[0] || 'Bahan 1';
    const mat2 = sortedMaterials[1] || fallbackMaterials[1] || 'Bahan 2';

    // Buat 4 interval mingguan: Mg1 = 3-4 minggu lalu, Mg4 = minggu ini
    const chartUsage = [
      { label: 'Mg 1', startDays: 28, endDays: 21 },
      { label: 'Mg 2', startDays: 21, endDays: 14 },
      { label: 'Mg 3', startDays: 14, endDays: 7 },
      { label: 'Mg 4', startDays: 7, endDays: 0 },
    ].map(slot => {
      const wStart = new Date(now.getTime() - slot.startDays * 24 * 60 * 60 * 1000);
      const wEnd = new Date(now.getTime() - slot.endDays * 24 * 60 * 60 * 1000);
      wEnd.setHours(23, 59, 59, 999); // pastikan akhir hari ini included

      const usageMat1 = recentStockOuts
        .filter(o => o.material?.name === mat1 && new Date(o.date) >= wStart && new Date(o.date) <= wEnd)
        .reduce((sum, o) => sum + (Number(o.quantity) || 0), 0);

      const usageMat2 = recentStockOuts
        .filter(o => o.material?.name === mat2 && new Date(o.date) >= wStart && new Date(o.date) <= wEnd)
        .reduce((sum, o) => sum + (Number(o.quantity) || 0), 0);

      return {
        minggu: slot.label,
        [mat1]: usageMat1,
        [mat2]: usageMat2,
      };
    });

    return res.json({
      success: true,
      data: {
        totalJenisBahan,
        totalStokUnit,
        barangHampirHabis,
        barangHabis,
        barangMasukHariIni: stockInToday._sum?.quantity || 0,
        barangKeluarHariIni: stockOutToday._sum?.quantity || 0,
        chartMonthly,
        chartUsage,
        topMaterialNames: [mat1, mat2]
      }
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return res.status(500).json({ success: false, message: 'Gagal memuat ringkasan dashboard.' });
  }
};

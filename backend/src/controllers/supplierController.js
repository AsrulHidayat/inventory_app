import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSuppliers = async (req, res) => {
  try {
    const { umkmId } = req.query;
    const userRole = typeof req.user?.role === 'object' ? req.user?.role?.name : req.user?.role;
    
    const where = {};
    if (umkmId) {
      where.umkmId = Number(umkmId);
    } else if (userRole === 'PEMILIK' && req.user?.umkmId) {
      where.umkmId = req.user.umkmId;
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: { name: 'asc' },
      include: { _count: { select: { materials: true } } }
    });

    const formatted = suppliers.map(s => {
      let categoriesList = [];
      if (s.categories) {
        try {
          const parsed = JSON.parse(s.categories);
          if (Array.isArray(parsed)) categoriesList = parsed;
          else if (typeof s.categories === 'string') categoriesList = s.categories.split(',').map(c => c.trim()).filter(Boolean);
        } catch (e) {
          if (typeof s.categories === 'string') {
            categoriesList = s.categories.split(',').map(c => c.trim()).filter(Boolean);
          }
        }
      }
      return {
        ...s,
        categoriesList
      };
    });

    return res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('getSuppliers error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data supplier.' });
  }
};

export const createSupplier = async (req, res) => {
  const { code, name, address, phone, email, notes, categories, umkmId } = req.body;
  try {
    const targetUmkmId = umkmId ? Number(umkmId) : (req.user?.umkmId || null);

    let supCode = code;
    if (!supCode) {
      const count = await prisma.supplier.count({
        where: targetUmkmId ? { umkmId: targetUmkmId } : {}
      });
      supCode = `SUP-${String(count + 1).padStart(3, '0')}`;
    }

    const catString = Array.isArray(categories) 
      ? JSON.stringify(categories) 
      : (typeof categories === 'string' ? categories : null);

    const supplier = await prisma.supplier.create({
      data: {
        code: supCode,
        name,
        address: address || null,
        phone: phone || null,
        email: email || null,
        notes: notes || null,
        categories: catString,
        umkmId: targetUmkmId
      }
    });

    let categoriesList = Array.isArray(categories) ? categories : [];

    return res.status(201).json({ 
      success: true, 
      message: 'Supplier berhasil ditambahkan.', 
      data: { ...supplier, categoriesList } 
    });
  } catch (error) {
    console.error('createSupplier error:', error);
    return res.status(500).json({ success: false, message: 'Gagal menambahkan supplier.' });
  }
};

export const updateSupplier = async (req, res) => {
  const { id } = req.params;
  const { code, name, address, phone, email, notes, categories, umkmId } = req.body;
  try {
    const catString = Array.isArray(categories) 
      ? JSON.stringify(categories) 
      : (typeof categories === 'string' ? categories : null);

    const targetId = Number(id);

    const updated = await prisma.supplier.update({
      where: { id: targetId },
      data: {
        code,
        name,
        address: address || null,
        phone: phone || null,
        email: email || null,
        notes: notes || null,
        categories: catString,
        ...(umkmId && { umkmId: Number(umkmId) })
      }
    });

    let categoriesList = Array.isArray(categories) ? categories : [];

    return res.json({ 
      success: true, 
      message: 'Supplier berhasil diperbarui.', 
      data: { ...updated, categoriesList } 
    });
  } catch (error) {
    console.error('updateSupplier error:', error);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui supplier.' });
  }
};

export const deleteSupplier = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.supplier.delete({ where: { id: Number(id) } });
    return res.json({ success: true, message: 'Supplier berhasil dihapus.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus supplier.' });
  }
};

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { materials: true } } }
    });
    return res.json({ success: true, data: suppliers });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil data supplier.' });
  }
};

export const createSupplier = async (req, res) => {
  const { code, name, address, phone, email, notes } = req.body;
  try {
    let supCode = code;
    if (!supCode) {
      const count = await prisma.supplier.count();
      supCode = `SUP-${String(count + 1).padStart(3, '0')}`;
    }

    const supplier = await prisma.supplier.create({
      data: { code: supCode, name, address, phone, email, notes }
    });
    return res.status(201).json({ success: true, message: 'Supplier berhasil ditambahkan.', data: supplier });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menambahkan supplier. Kode supplier mungkin sudah terpakai.' });
  }
};

export const updateSupplier = async (req, res) => {
  const { id } = req.params;
  const { code, name, address, phone, email, notes } = req.body;
  try {
    const updated = await prisma.supplier.update({
      where: { id: Number(id) },
      data: { code, name, address, phone, email, notes }
    });
    return res.json({ success: true, message: 'Supplier berhasil diperbarui.', data: updated });
  } catch (error) {
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

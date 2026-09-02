import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAsaaData() {
  console.log('🚀 Seeding sample materials & transactions for Toko Asaa...');

  const umkmAsaa = await prisma.umkm.findFirst({
    where: { name: 'asaa' }
  });

  if (!umkmAsaa) {
    console.error('UMKM asaa not found');
    return;
  }

  const asaaUser = await prisma.user.findFirst({
    where: { umkmId: umkmAsaa.id }
  });

  if (!asaaUser) {
    console.error('User for asaa not found');
    return;
  }

  // Check or create supplier
  let supplier = await prisma.supplier.findFirst({
    where: { umkmId: umkmAsaa.id }
  });

  if (!supplier) {
    supplier = await prisma.supplier.create({
      data: {
        code: 'SUP-ASA-001',
        name: 'Distributor Sembako Asaa Barokah',
        phone: '081234567890',
        email: 'supplier.asaa@gmail.com',
        address: 'Jl. Poros Gowa No. 99',
        notes: 'Pemasok utama bahan baku Toko Asaa',
        umkmId: umkmAsaa.id,
        categories: JSON.stringify(['Tepung', 'Dairy & Lemak', 'Minyak & Bumbu'])
      }
    });
  }

  // Create 4 Materials for Asaa if not existing
  const materialsToCreate = [
    { code: 'MAT-ASA-001', name: 'Tepung Terigu Segitiga Biru', category: 'Tepung', unit: 'Kg', minStock: 20, price: 13000, currentStock: 35 },
    { code: 'MAT-ASA-002', name: 'Gula Pasir Premium', category: 'Minyak & Bumbu', unit: 'Kg', minStock: 15, price: 17500, currentStock: 18 },
    { code: 'MAT-ASA-003', name: 'Telur Ayam Kampung', category: 'Dairy & Lemak', unit: 'Kg', minStock: 10, price: 31000, currentStock: 8 },
    { code: 'MAT-ASA-004', name: 'Mentega Anchor Butter', category: 'Dairy & Lemak', unit: 'Kg', minStock: 8, price: 95000, currentStock: 5 }
  ];

  const createdMaterials = [];

  for (const mat of materialsToCreate) {
    let existingMat = await prisma.material.findFirst({
      where: { code: mat.code, umkmId: umkmAsaa.id }
    });
    if (!existingMat) {
      existingMat = await prisma.material.create({
        data: {
          ...mat,
          supplierId: supplier.id,
          umkmId: umkmAsaa.id
        }
      });
    }
    createdMaterials.push(existingMat);
  }

  // Monthly transaction data for past 6 months
  const now = new Date();
  const monthsData = [
    { offset: 5, usage: [28, 18, 12, 6], stockIn: [50, 30, 20, 10] },
    { offset: 4, usage: [45, 30, 25, 14], stockIn: [50, 35, 30, 15] },
    { offset: 3, usage: [32, 22, 15, 9], stockIn: [40, 25, 20, 10] },
    { offset: 2, usage: [60, 42, 32, 18], stockIn: [70, 45, 35, 20] },
    { offset: 1, usage: [48, 35, 28, 12], stockIn: [50, 40, 30, 15] },
    { offset: 0, usage: [55, 40, 30, 15], stockIn: [60, 45, 35, 18] },
  ];

  // Clean old stockOut / stockIn for these materials
  const matIds = createdMaterials.map(m => m.id);
  await prisma.stockOut.deleteMany({ where: { materialId: { in: matIds } } });
  await prisma.stockIn.deleteMany({ where: { materialId: { in: matIds } } });

  let stockInCount = 1;
  let stockOutCount = 1;

  for (const item of monthsData) {
    const txDate = new Date(now.getFullYear(), now.getMonth() - item.offset, 15, 10, 0, 0);

    for (let i = 0; i < createdMaterials.length; i++) {
      const mat = createdMaterials[i];
      const inQty = item.stockIn[i];
      const outQty = item.usage[i];

      // Insert StockIn
      await prisma.stockIn.create({
        data: {
          transactionCode: `IN-ASA-${String(stockInCount++).padStart(4, '0')}`,
          materialId: mat.id,
          supplierId: supplier.id,
          quantity: inQty,
          price: mat.price,
          totalPrice: inQty * mat.price,
          date: txDate,
          notes: `Pembelian rutin bulanan ${mat.name}`,
          userId: asaaUser.id
        }
      });

      // Insert StockOut
      await prisma.stockOut.create({
        data: {
          transactionCode: `OUT-ASA-${String(stockOutCount++).padStart(4, '0')}`,
          materialId: mat.id,
          quantity: outQty,
          productionPurpose: `Produksi Kue & Pastry Harian`,
          date: new Date(txDate.getTime() + 5 * 24 * 60 * 60 * 1000),
          notes: `Pemakaian bulanan ${mat.name}`,
          userId: asaaUser.id
        }
      });
    }
  }

  console.log('✅ Success seeding data for Toko Asaa!');
}

seedAsaaData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

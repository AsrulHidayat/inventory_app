import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for UMKM Toko Kue Gowa...');

  // Reset tabel lama
  await prisma.notification.deleteMany();
  await prisma.stockOut.deleteMany();
  await prisma.stockIn.deleteMany();
  await prisma.forecast.deleteMany();
  await prisma.material.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.umkm.deleteMany();
  await prisma.role.deleteMany();
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });

  const pemilikRole = await prisma.role.upsert({
    where: { name: 'PEMILIK' },
    update: {},
    create: { name: 'PEMILIK' },
  });

  // 2. UMKM
  const umkmHR = await prisma.umkm.create({
    data: {
      name: 'Toko Kue HR',
      address: 'Jl. Tumanurung No. 45, Somba Opu, Kabupaten Gowa',
      phone: '081245678901',
      logo: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150&auto=format&fit=crop&q=80',
    },
  });

  const umkmHelda = await prisma.umkm.create({
    data: {
      name: 'Cireng Helda',
      address: 'Jl. Sultan Hasanuddin No. 12, Sungguminasa, Kabupaten Gowa',
      phone: '085299887766',
      logo: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=150&auto=format&fit=crop&q=80',
    },
  });

  const umkmNanda = await prisma.umkm.create({
    data: {
      name: 'Risol Mayo Nanda',
      address: 'Jl. Malino Km. 3, Pattallassang, Kabupaten Gowa',
      phone: '081377665544',
      logo: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 3. Users
  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
  const hashedPasswordUser = await bcrypt.hash('user123', 10);

  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin Utama Gowa',
      email: 'admin@gowa.com',
      password: hashedPasswordAdmin,
      roleId: adminRole.id,
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  await prisma.user.createMany({
    data: [
      {
        name: 'Hj. Rosdiana (Owner HR)',
        email: 'hr@tokokue.com',
        password: hashedPasswordUser,
        roleId: pemilikRole.id,
        umkmId: umkmHR.id,
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Helda Rahmawati',
        email: 'helda@cireng.com',
        password: hashedPasswordUser,
        roleId: pemilikRole.id,
        umkmId: umkmHelda.id,
        photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      },
      {
        name: 'Nanda Putri',
        email: 'nanda@risol.com',
        password: hashedPasswordUser,
        roleId: pemilikRole.id,
        umkmId: umkmNanda.id,
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      },
    ],
  });

  // 4. Suppliers
  const supFlour = await prisma.supplier.create({
    data: {
      code: 'SUP-001',
      name: 'UD Sumber Terigu & Sembako Gowa',
      address: 'Jl. Poros Panciro, Bajeng, Kabupaten Gowa',
      phone: '081144332211',
      email: 'sumberterigu@gmail.com',
      notes: 'Pemasok utama tepung terigu protein tinggi dan sedang',
      umkmId: umkmHR.id,
    },
  });

  const supTelur = await prisma.supplier.create({
    data: {
      code: 'SUP-002',
      name: 'CV Berkah Telur Macini',
      address: 'Jl. Macini Sombala, Somba Opu, Gowa',
      phone: '085311223344',
      email: 'berkahtelur@gowa.co.id',
      notes: 'Suplai telur ayam segar harian',
      umkmId: umkmHR.id,
    },
  });

  const supDairy = await prisma.supplier.create({
    data: {
      code: 'SUP-003',
      name: 'Distributor Bahan Kue Makassar Gowa',
      address: 'Jl. Sultan Alauddin No. 88, Makassar - Gowa',
      phone: '081299001122',
      email: 'bakkerysupplier@gmail.com',
      notes: 'Menyediakan Mentega, Keju, Coklat, dan Mayonnaise',
      umkmId: umkmHR.id,
    },
  });

  // 5. Materials (Bahan Baku per UMKM)
  const materialsData = [
    // Toko Kue HR
    { code: 'MAT-HR-001', name: 'Tepung Terigu Cakra Kembar', category: 'Tepung', unit: 'Kg', minStock: 25, price: 13500, currentStock: 45, supplierId: supFlour.id, umkmId: umkmHR.id },
    { code: 'MAT-HR-002', name: 'Gula Pasir Kristal', category: 'Minyak & Bumbu', unit: 'Kg', minStock: 20, price: 17000, currentStock: 18, supplierId: supFlour.id, umkmId: umkmHR.id },
    { code: 'MAT-HR-003', name: 'Telur Ayam Segar', category: 'Dairy & Lemak', unit: 'Kg', minStock: 15, price: 29000, currentStock: 8, supplierId: supTelur.id, umkmId: umkmHR.id },
    { code: 'MAT-HR-004', name: 'Mentega Wijsman / Butter', category: 'Dairy & Lemak', unit: 'Kg', minStock: 10, price: 110000, currentStock: 3, supplierId: supDairy.id, umkmId: umkmHR.id },
    { code: 'MAT-HR-005', name: 'Keju Cheddar Prochiz', category: 'Isian & Toping', unit: 'Pcs', minStock: 15, price: 22000, currentStock: 0, supplierId: supDairy.id, umkmId: umkmHR.id },
    { code: 'MAT-HR-006', name: 'Coklat Batang Colatta', category: 'Isian & Toping', unit: 'Kg', minStock: 10, price: 55000, currentStock: 12, supplierId: supDairy.id, umkmId: umkmHR.id },

    // Cireng Helda
    { code: 'MAT-CH-001', name: 'Tepung Tapioka / Kanji', category: 'Tepung', unit: 'Kg', minStock: 30, price: 12000, currentStock: 60, supplierId: supFlour.id, umkmId: umkmHelda.id },
    { code: 'MAT-CH-002', name: 'Tepung Terigu Segitiga Biru', category: 'Tepung', unit: 'Kg', minStock: 15, price: 12500, currentStock: 22, supplierId: supFlour.id, umkmId: umkmHelda.id },
    { code: 'MAT-CH-003', name: 'Minyak Goreng Bimoli', category: 'Minyak & Bumbu', unit: 'Liter', minStock: 20, price: 18500, currentStock: 7, supplierId: supFlour.id, umkmId: umkmHelda.id },
    { code: 'MAT-CH-004', name: 'Daun Bawang Segar', category: 'Minyak & Bumbu', unit: 'Kg', minStock: 5, price: 15000, currentStock: 1, supplierId: supFlour.id, umkmId: umkmHelda.id },
    { code: 'MAT-CH-005', name: 'Bawang Putih Halus', category: 'Minyak & Bumbu', unit: 'Kg', minStock: 5, price: 35000, currentStock: 0, supplierId: supFlour.id, umkmId: umkmHelda.id },

    // Risol Mayo Nanda
    { code: 'MAT-RN-001', name: 'Tepung Terigu Segitiga Biru', category: 'Tepung', unit: 'Kg', minStock: 20, price: 12500, currentStock: 35, supplierId: supFlour.id, umkmId: umkmNanda.id },
    { code: 'MAT-RN-002', name: 'Mayonaise Maestro Premium', category: 'Isian & Toping', unit: 'Kg', minStock: 15, price: 32000, currentStock: 12, supplierId: supDairy.id, umkmId: umkmNanda.id },
    { code: 'MAT-RN-003', name: 'Sosis Sapi Kimbo', category: 'Isian & Toping', unit: 'Bungkus', minStock: 10, price: 45000, currentStock: 5, supplierId: supDairy.id, umkmId: umkmNanda.id },
    { code: 'MAT-RN-004', name: 'Telur Ayam Segar', category: 'Dairy & Lemak', unit: 'Kg', minStock: 15, price: 29000, currentStock: 18, supplierId: supTelur.id, umkmId: umkmNanda.id },
    { code: 'MAT-RN-005', name: 'Tepung Panir / Roti', category: 'Tepung', unit: 'Kg', minStock: 10, price: 18000, currentStock: 2, supplierId: supFlour.id, umkmId: umkmNanda.id },
  ];

  for (const mat of materialsData) {
    await prisma.material.create({ data: mat });
  }

  // 6. Notifications Initial
  await prisma.notification.createMany({
    data: [
      { title: 'Peringatan Stok Kritis!', message: 'Bahan Keju Cheddar Prochiz (Toko Kue HR) telah HABIS!', type: 'DANGER' },
      { title: 'Peringatan Stok Minimal', message: 'Stok Mentega Wijsman (Toko Kue HR) tersisa 3 Kg (Minimal: 10 Kg)', type: 'WARNING' },
      { title: 'Peringatan Stok Minimal', message: 'Stok Minyak Goreng Bimoli (Cireng Helda) tersisa 7 Liter (Minimal: 20 Liter)', type: 'WARNING' },
      { title: 'Peringatan Stok Kritis!', message: 'Stok Bawang Putih Halus (Cireng Helda) telah HABIS!', type: 'DANGER' },
      { title: 'Peringatan Stok Minimal', message: 'Stok Tepung Panir (Risol Mayo Nanda) tersisa 2 Kg (Minimal: 10 Kg)', type: 'WARNING' },
    ],
  });

  console.log('✅ Seeding database selesai sukses!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

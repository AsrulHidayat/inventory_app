import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor Token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor Response Handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Token kedaluwarsa / invalid
      console.warn('Session expired or unauthorized. Clearing stored auth session.');
    }
    return Promise.reject(error);
  }
);

export default api;

// Seed Mock Data Fallback jika Backend belum aktif saat pengujian browser
export const INITIAL_MOCK_DATA = {
  umkms: [
    { id: 1, name: 'Toko Kue HR', logo: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150&auto=format&fit=crop&q=80', phone: '081245678901', address: 'Jl. Tumanurung No. 45, Somba Opu, Gowa' },
    { id: 2, name: 'Cireng Helda', logo: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=150&auto=format&fit=crop&q=80', phone: '085299887766', address: 'Jl. Sultan Hasanuddin No. 12, Sungguminasa, Gowa' },
    { id: 3, name: 'Risol Mayo Nanda', logo: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=150&auto=format&fit=crop&q=80', phone: '081377665544', address: 'Jl. Malino Km. 3, Pattallassang, Gowa' },
  ],
  materials: [
    // Toko Kue HR
    { id: 1, code: 'MAT-HR-001', name: 'Tepung Terigu Cakra Kembar', category: 'Tepung', unit: 'Kg', minStock: 25, price: 13500, currentStock: 45, supplierId: 1, umkmId: 1, supplierName: 'UD Sumber Terigu & Sembako Gowa', status: 'Aman', statusCode: 'AMAN', statusColor: 'success' },
    { id: 2, code: 'MAT-HR-002', name: 'Gula Pasir Kristal', category: 'Minyak & Bumbu', unit: 'Kg', minStock: 20, price: 17000, currentStock: 18, supplierId: 1, umkmId: 1, supplierName: 'UD Sumber Terigu & Sembako Gowa', status: 'Hampir Habis', statusCode: 'HAMPIR_HABIS', statusColor: 'warning' },
    { id: 3, code: 'MAT-HR-003', name: 'Telur Ayam Segar', category: 'Dairy & Lemak', unit: 'Kg', minStock: 15, price: 29000, currentStock: 8, supplierId: 2, umkmId: 1, supplierName: 'CV Berkah Telur Macini', status: 'Hampir Habis', statusCode: 'HAMPIR_HABIS', statusColor: 'warning' },
    { id: 4, code: 'MAT-HR-004', name: 'Mentega Wijsman / Butter', category: 'Dairy & Lemak', unit: 'Kg', minStock: 10, price: 110000, currentStock: 3, supplierId: 3, umkmId: 1, supplierName: 'Distributor Bahan Kue Makassar', status: 'Hampir Habis', statusCode: 'HAMPIR_HABIS', statusColor: 'warning' },
    { id: 5, code: 'MAT-HR-005', name: 'Keju Cheddar Prochiz', category: 'Isian & Toping', unit: 'Pcs', minStock: 15, price: 22000, currentStock: 0, supplierId: 3, umkmId: 1, supplierName: 'Distributor Bahan Kue Makassar', status: 'Habis', statusCode: 'HABIS', statusColor: 'danger' },
    { id: 6, code: 'MAT-HR-006', name: 'Coklat Batang Colatta', category: 'Isian & Toping', unit: 'Kg', minStock: 10, price: 55000, currentStock: 12, supplierId: 3, umkmId: 1, supplierName: 'Distributor Bahan Kue Makassar', status: 'Aman', statusCode: 'AMAN', statusColor: 'success' },

    // Cireng Helda
    { id: 7, code: 'MAT-CH-001', name: 'Tepung Tapioka / Kanji', category: 'Tepung', unit: 'Kg', minStock: 30, price: 12000, currentStock: 60, supplierId: 1, umkmId: 2, supplierName: 'UD Sumber Terigu & Sembako Gowa', status: 'Aman', statusCode: 'AMAN', statusColor: 'success' },
    { id: 8, code: 'MAT-CH-002', name: 'Tepung Terigu Segitiga Biru', category: 'Tepung', unit: 'Kg', minStock: 15, price: 12500, currentStock: 22, supplierId: 1, umkmId: 2, supplierName: 'UD Sumber Terigu & Sembako Gowa', status: 'Aman', statusCode: 'AMAN', statusColor: 'success' },
    { id: 9, code: 'MAT-CH-003', name: 'Minyak Goreng Bimoli', category: 'Minyak & Bumbu', unit: 'Liter', minStock: 20, price: 18500, currentStock: 7, supplierId: 1, umkmId: 2, supplierName: 'UD Sumber Terigu & Sembako Gowa', status: 'Hampir Habis', statusCode: 'HAMPIR_HABIS', statusColor: 'warning' },
    { id: 10, code: 'MAT-CH-004', name: 'Daun Bawang Segar', category: 'Minyak & Bumbu', unit: 'Kg', minStock: 5, price: 15000, currentStock: 1, supplierId: 1, umkmId: 2, supplierName: 'UD Sumber Terigu & Sembako Gowa', status: 'Hampir Habis', statusCode: 'HAMPIR_HABIS', statusColor: 'warning' },
    { id: 11, code: 'MAT-CH-005', name: 'Bawang Putih Halus', category: 'Minyak & Bumbu', unit: 'Kg', minStock: 5, price: 35000, currentStock: 0, supplierId: 1, umkmId: 2, supplierName: 'UD Sumber Terigu & Sembako Gowa', status: 'Habis', statusCode: 'HABIS', statusColor: 'danger' },

    // Risol Mayo Nanda
    { id: 12, code: 'MAT-RN-001', name: 'Tepung Terigu Segitiga Biru', category: 'Tepung', unit: 'Kg', minStock: 20, price: 12500, currentStock: 35, supplierId: 1, umkmId: 3, supplierName: 'UD Sumber Terigu & Sembako Gowa', status: 'Aman', statusCode: 'AMAN', statusColor: 'success' },
    { id: 13, code: 'MAT-RN-002', name: 'Mayonaise Maestro Premium', category: 'Isian & Toping', unit: 'Kg', minStock: 15, price: 32000, currentStock: 12, supplierId: 3, umkmId: 3, supplierName: 'Distributor Bahan Kue Makassar', status: 'Hampir Habis', statusCode: 'HAMPIR_HABIS', statusColor: 'warning' },
    { id: 14, code: 'MAT-RN-003', name: 'Sosis Sapi Kimbo', category: 'Isian & Toping', unit: 'Bungkus', minStock: 10, price: 45000, currentStock: 5, supplierId: 3, umkmId: 3, supplierName: 'Distributor Bahan Kue Makassar', status: 'Hampir Habis', statusCode: 'HAMPIR_HABIS', statusColor: 'warning' },
    { id: 15, code: 'MAT-RN-004', name: 'Telur Ayam Segar', category: 'Dairy & Lemak', unit: 'Kg', minStock: 15, price: 29000, currentStock: 18, supplierId: 2, umkmId: 3, supplierName: 'CV Berkah Telur Macini', status: 'Aman', statusCode: 'AMAN', statusColor: 'success' },
    { id: 16, code: 'MAT-RN-005', name: 'Tepung Panir / Roti', category: 'Tepung', unit: 'Kg', minStock: 10, price: 18000, currentStock: 2, supplierId: 1, umkmId: 3, supplierName: 'UD Sumber Terigu & Sembako Gowa', status: 'Hampir Habis', statusCode: 'HAMPIR_HABIS', statusColor: 'warning' },
  ],
  suppliers: [
    { id: 1, code: 'SUP-001', name: 'UD Sumber Terigu & Sembako Gowa', phone: '081144332211', email: 'sumberterigu@gmail.com', address: 'Jl. Poros Panciro, Bajeng, Gowa', notes: 'Supplier utama tepung terigu & minyak' },
    { id: 2, code: 'SUP-002', name: 'CV Berkah Telur Macini', phone: '085311223344', email: 'berkahtelur@gowa.co.id', address: 'Jl. Macini Sombala, Somba Opu, Gowa', notes: 'Supplier telur ayam segar harian' },
    { id: 3, code: 'SUP-003', name: 'Distributor Bahan Kue Makassar Gowa', phone: '081299001122', email: 'bakkerysupplier@gmail.com', address: 'Jl. Sultan Alauddin No. 88, Makassar - Gowa', notes: 'Supplier Mentega, Keju, & Mayonaise' },
  ],
  notifications: [
    { id: 1, title: 'Peringatan Stok HABIS!', message: 'Keju Cheddar Prochiz (Toko Kue HR) telah HABIS (Stok: 0 Pcs)!', type: 'DANGER', isRead: false, createdAt: new Date().toISOString() },
    { id: 2, title: 'Peringatan Stok HABIS!', message: 'Bawang Putih Halus (Cireng Helda) telah HABIS (Stok: 0 Kg)!', type: 'DANGER', isRead: false, createdAt: new Date().toISOString() },
    { id: 3, title: 'Peringatan Stok Minimal', message: 'Mentega Wijsman (Toko Kue HR) tersisa 3 Kg (Min: 10 Kg)', type: 'WARNING', isRead: false, createdAt: new Date().toISOString() },
    { id: 4, title: 'Peringatan Stok Minimal', message: 'Tepung Panir (Risol Mayo Nanda) tersisa 2 Kg (Min: 10 Kg)', type: 'WARNING', isRead: true, createdAt: new Date().toISOString() },
  ]
};

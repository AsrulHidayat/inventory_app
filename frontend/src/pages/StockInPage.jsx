import React, { useState } from 'react';
import { Plus, Search, ArrowDownLeft, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_MOCK_DATA } from '../services/api';
import Modal from '../components/common/Modal';
import Swal from 'sweetalert2';

export default function StockInPage() {
  const { activeUmkmId, user } = useAuth();
  const [materials, setMaterials] = useState(INITIAL_MOCK_DATA.materials);
  const [stockIns, setStockIns] = useState([
    { id: 1, transactionCode: 'IN-00123-001', materialId: 1, materialName: 'Tepung Terigu Cakra Kembar', supplierName: 'UD Sumber Terigu & Sembako Gowa', quantity: 20, unit: 'Kg', price: 13500, totalPrice: 270000, date: '2026-07-28', notes: 'Restok Rutin Mingguan', userName: 'Admin Utama' },
    { id: 2, transactionCode: 'IN-00123-002', materialId: 3, materialName: 'Telur Ayam Segar', supplierName: 'CV Berkah Telur Macini', quantity: 15, unit: 'Kg', price: 29000, totalPrice: 435000, date: '2026-07-29', notes: 'Suplai Telur Harian', userName: 'Hj. Rosdiana' },
    { id: 3, transactionCode: 'IN-00123-003', materialId: 7, materialName: 'Tepung Tapioka / Kanji', supplierName: 'UD Sumber Terigu & Sembako Gowa', quantity: 30, unit: 'Kg', price: 12000, totalPrice: 360000, date: '2026-07-30', notes: 'Restok Cireng', userName: 'Helda Rahmawati' },
  ]);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    materialId: 1,
    supplierId: 1,
    quantity: 10,
    price: 15000,
    date: new Date().toISOString().split('T')[0],
    notes: 'Pembelian barang baru',
  });

  const availableMaterials = materials.filter(m => !activeUmkmId || m.umkmId === activeUmkmId);

  const filteredTransactions = stockIns.filter(t => 
    t.materialName.toLowerCase().includes(search.toLowerCase()) || 
    t.transactionCode.toLowerCase().includes(search.toLowerCase()) ||
    t.supplierName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (e) => {
    e.preventDefault();
    const mat = materials.find(m => m.id === Number(formData.materialId));
    const sup = INITIAL_MOCK_DATA.suppliers.find(s => s.id === Number(formData.supplierId));

    if (!mat) return;

    const qty = Number(formData.quantity);
    const itemPrice = Number(formData.price);
    const totalPrice = qty * itemPrice;
    const count = stockIns.length + 1;
    const code = `IN-${Date.now().toString().slice(-5)}-${String(count).padStart(3, '0')}`;

    const newTx = {
      id: Date.now(),
      transactionCode: code,
      materialId: mat.id,
      materialName: mat.name,
      supplierName: sup ? sup.name : '-',
      quantity: qty,
      unit: mat.unit,
      price: itemPrice,
      totalPrice,
      date: formData.date,
      notes: formData.notes,
      userName: user?.name || 'Admin',
    };

    // Update local materials stock
    setMaterials(prev => prev.map(m => m.id === mat.id ? { ...m, currentStock: m.currentStock + qty } : m));
    setStockIns(prev => [newTx, ...prev]);

    Swal.fire({
      icon: 'success',
      title: 'Barang Masuk Berhasil!',
      text: `Stok ${mat.name} telah bertambah ${qty} ${mat.unit}.`,
      timer: 1500,
      showConfirmButton: false,
    });
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Hapus Transaksi?',
      text: 'Transaksi barang masuk ini akan dihapus.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then((res) => {
      if (res.isConfirmed) {
        setStockIns(prev => prev.filter(t => t.id !== id));
        Swal.fire('Terhapus!', 'Transaksi dihapus.', 'success');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ArrowDownLeft className="w-6 h-6 text-emerald-500" /> Transaksi Barang Masuk
          </h1>
          <p className="text-xs text-slate-400 mt-1">Pencatatan riwayat bahan baku yang diterima dari supplier</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Input Barang Masuk
        </button>
      </div>

      <div className="glass-panel p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode transaksi, bahan baku, atau supplier..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl border border-transparent focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Kode Transaksi</th>
                <th className="py-3 px-4">Bahan Baku</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Jumlah</th>
                <th className="py-3 px-4">Harga / Total</th>
                <th className="py-3 px-4">Petugas</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 text-slate-500 font-medium">{t.date}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">{t.transactionCode}</td>
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">{t.materialName}</td>
                  <td className="py-3 px-4 text-slate-500">{t.supplierName}</td>
                  <td className="py-3 px-4 font-black text-emerald-600 dark:text-emerald-400">+{t.quantity} {t.unit}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800 dark:text-slate-200">Rp {t.totalPrice.toLocaleString('id-ID')}</div>
                    <div className="text-[10px] text-slate-400">@ Rp {t.price.toLocaleString('id-ID')}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{t.userName}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Input Barang Masuk */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Input Transaksi Barang Masuk Baru"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pilih Bahan Baku</label>
            <select
              value={formData.materialId}
              onChange={(e) => {
                const mat = materials.find(m => m.id === Number(e.target.value));
                setFormData({
                  ...formData,
                  materialId: Number(e.target.value),
                  price: mat ? mat.price : 15000,
                  supplierId: mat?.supplierId || 1,
                });
              }}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
            >
              {availableMaterials.map(m => (
                <option key={m.id} value={m.id}>{m.code} - {m.name} (Stok Saat Ini: {m.currentStock} {m.unit})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Jumlah Masuk</label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Harga Satuan (Rp)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Supplier</label>
              <select
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
              >
                {INITIAL_MOCK_DATA.suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Masuk</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Keterangan / Catatan</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
            >
              Simpan Barang Masuk
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

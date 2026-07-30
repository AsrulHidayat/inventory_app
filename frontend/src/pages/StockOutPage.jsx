import React, { useState } from 'react';
import { Plus, Search, ArrowUpRight, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_MOCK_DATA } from '../services/api';
import Modal from '../components/common/Modal';
import Swal from 'sweetalert2';

export default function StockOutPage() {
  const { activeUmkmId, user } = useAuth();
  const [materials, setMaterials] = useState(INITIAL_MOCK_DATA.materials);
  const [stockOuts, setStockOuts] = useState([
    { id: 1, transactionCode: 'OUT-00991-001', materialId: 1, materialName: 'Tepung Terigu Cakra Kembar', productionPurpose: 'Produksi Bolu Gulung & Donat', quantity: 10, unit: 'Kg', date: '2026-07-29', notes: 'Pengeluaran Batch Pagi', userName: 'Admin Utama' },
    { id: 2, transactionCode: 'OUT-00991-002', materialId: 3, materialName: 'Telur Ayam Segar', productionPurpose: 'Produksi Kue Lapis', quantity: 5, unit: 'Kg', date: '2026-07-30', notes: 'Penggunaan Dapur Utama', userName: 'Hj. Rosdiana' },
    { id: 3, transactionCode: 'OUT-00991-003', materialId: 9, materialName: 'Minyak Goreng Bimoli', productionPurpose: 'Goreng Cireng Crispy', quantity: 8, unit: 'Liter', date: '2026-07-30', notes: 'Produksi Cireng Helda', userName: 'Helda Rahmawati' },
  ]);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    materialId: 1,
    quantity: 5,
    productionPurpose: 'Produksi Kue Harian',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const availableMaterials = materials.filter(m => !activeUmkmId || m.umkmId === activeUmkmId);

  const filteredTransactions = stockOuts.filter(t => 
    t.materialName.toLowerCase().includes(search.toLowerCase()) || 
    t.transactionCode.toLowerCase().includes(search.toLowerCase()) ||
    t.productionPurpose.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (e) => {
    e.preventDefault();
    const mat = materials.find(m => m.id === Number(formData.materialId));

    if (!mat) return;

    const qty = Number(formData.quantity);

    // Validasi stok mencukupi
    if (mat.currentStock < qty) {
      Swal.fire({
        icon: 'error',
        title: 'Stok Tidak Mencukupi!',
        text: `Stok ${mat.name} saat ini hanya tersisa ${mat.currentStock} ${mat.unit}, tidak cukup untuk diproses (${qty} ${mat.unit}).`,
        confirmButtonColor: '#EF4444'
      });
      return;
    }

    const count = stockOuts.length + 1;
    const code = `OUT-${Date.now().toString().slice(-5)}-${String(count).padStart(3, '0')}`;
    const newStock = mat.currentStock - qty;

    const newTx = {
      id: Date.now(),
      transactionCode: code,
      materialId: mat.id,
      materialName: mat.name,
      productionPurpose: formData.productionPurpose,
      quantity: qty,
      unit: mat.unit,
      date: formData.date,
      notes: formData.notes,
      userName: user?.name || 'Admin',
    };

    // Update local materials stock
    setMaterials(prev => prev.map(m => m.id === mat.id ? { 
      ...m, 
      currentStock: newStock,
      status: newStock === 0 ? 'Habis' : newStock <= m.minStock ? 'Hampir Habis' : 'Aman',
      statusCode: newStock === 0 ? 'HABIS' : newStock <= m.minStock ? 'HAMPIR_HABIS' : 'AMAN',
      statusColor: newStock === 0 ? 'danger' : newStock <= m.minStock ? 'warning' : 'success',
    } : m));

    setStockOuts(prev => [newTx, ...prev]);

    // Check warning alert
    if (newStock <= mat.minStock) {
      Swal.fire({
        icon: newStock === 0 ? 'error' : 'warning',
        title: newStock === 0 ? 'PERINGATAN: STOK HABIS!' : 'PERINGATAN: STOK MINIMAL',
        text: `Stok ${mat.name} tersisa ${newStock} ${mat.unit}! Disarankan segera melakukan peramalan SMA untuk pengadaan.`,
        confirmButtonColor: '#F59E0B'
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Barang Keluar Dicatat!',
        text: `Stok ${mat.name} otomatis berkurang ${qty} ${mat.unit}. Sisa stok: ${newStock} ${mat.unit}.`,
        timer: 1500,
        showConfirmButton: false,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Hapus Transaksi?',
      text: 'Transaksi barang keluar ini akan dihapus.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then((res) => {
      if (res.isConfirmed) {
        setStockOuts(prev => prev.filter(t => t.id !== id));
        Swal.fire('Terhapus!', 'Transaksi dihapus.', 'success');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ArrowUpRight className="w-6 h-6 text-rose-500" /> Transaksi Barang Keluar
          </h1>
          <p className="text-xs text-slate-400 mt-1">Pencatatan penggunaan bahan baku untuk keperluan produksi kue/kuliner</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Input Barang Keluar
        </button>
      </div>

      <div className="glass-panel p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode transaksi, bahan baku, atau keperluan produksi..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl border border-transparent focus:border-rose-500 focus:outline-none"
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
                <th className="py-3 px-4">Keperluan Produksi</th>
                <th className="py-3 px-4">Jumlah Keluar</th>
                <th className="py-3 px-4">Petugas</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 text-slate-500 font-medium">{t.date}</td>
                  <td className="py-3 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">{t.transactionCode}</td>
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">{t.materialName}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{t.productionPurpose}</td>
                  <td className="py-3 px-4 font-black text-rose-600 dark:text-rose-400">-{t.quantity} {t.unit}</td>
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

      {/* Modal Input Barang Keluar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Input Transaksi Barang Keluar (Produksi)"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pilih Bahan Baku</label>
            <select
              value={formData.materialId}
              onChange={(e) => setFormData({ ...formData, materialId: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
            >
              {availableMaterials.map(m => (
                <option key={m.id} value={m.id}>
                  {m.code} - {m.name} (Tersedia: {m.currentStock} {m.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Jumlah Pengeluaran</label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-rose-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Keluar</label>
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Keperluan Produksi</label>
            <input
              type="text"
              required
              value={formData.productionPurpose}
              onChange={(e) => setFormData({ ...formData, productionPurpose: e.target.value })}
              placeholder="Contoh: Produksi Cireng Original 500 Pcs"
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Tambahan</label>
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
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md"
            >
              Simpan Barang Keluar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

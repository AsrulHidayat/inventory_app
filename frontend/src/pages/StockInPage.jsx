import React, { useState, useEffect } from 'react';
import { Plus, Search, ArrowDownLeft, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/common/Modal';
import Swal from 'sweetalert2';

export default function StockInPage() {
  const { activeUmkmId, user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [stockIns, setStockIns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    materialId: '',
    supplierId: '',
    quantity: 10,
    price: 15000,
    date: new Date().toISOString().split('T')[0],
    notes: 'Pembelian barang baru',
  });

  const fetchStockIns = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions/in', {
        params: activeUmkmId ? { umkmId: activeUmkmId } : {}
      });
      if (res.data?.success) {
        setStockIns(res.data.data.map(item => ({
          id: item.id,
          transactionCode: item.transactionCode,
          materialId: item.materialId,
          materialName: item.material?.name || '-',
          supplierName: item.supplier?.name || item.material?.supplier?.name || '-',
          quantity: item.quantity,
          unit: item.material?.unit || 'Kg',
          price: item.price,
          totalPrice: item.totalPrice,
          date: new Date(item.date).toISOString().split('T')[0],
          notes: item.notes,
          userName: item.user?.name || 'Petugas',
        })));
      }
    } catch (err) {
      console.error('Error fetching stock ins from API:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterialsAndSuppliers = async () => {
    try {
      const [matRes, supRes] = await Promise.all([
        api.get('/materials', { params: activeUmkmId ? { umkmId: activeUmkmId } : {} }),
        api.get('/suppliers')
      ]);
      if (matRes.data?.success) {
        setMaterials(matRes.data.data);
        if (matRes.data.data.length > 0 && !formData.materialId) {
          setFormData(prev => ({
            ...prev,
            materialId: matRes.data.data[0].id,
            price: matRes.data.data[0].price,
            supplierId: matRes.data.data[0].supplierId || ''
          }));
        }
      }
      if (supRes.data?.success) {
        setSuppliers(supRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching materials/suppliers for stockIn:', err);
    }
  };

  useEffect(() => {
    fetchStockIns();
    fetchMaterialsAndSuppliers();
  }, [activeUmkmId]);

  const availableMaterials = materials.filter(m => !activeUmkmId || Number(m.umkmId) === Number(activeUmkmId));

  const filteredTransactions = stockIns.filter(t => 
    (t.materialName || '').toLowerCase().includes(search.toLowerCase()) || 
    (t.transactionCode || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.supplierName || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        materialId: Number(formData.materialId),
        supplierId: formData.supplierId ? Number(formData.supplierId) : null,
        quantity: Number(formData.quantity),
        price: Number(formData.price),
        date: formData.date,
        notes: formData.notes
      };

      const res = await api.post('/transactions/in', payload);
      if (res.data?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Barang Masuk Berhasil!',
          text: res.data.message || 'Transaksi berhasil disimpan ke database MySQL.',
          timer: 1500,
          showConfirmButton: false,
        });
        fetchStockIns();
        fetchMaterialsAndSuppliers();
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Error saving stock in:', err);
      Swal.fire('Gagal', err.response?.data?.message || 'Gagal menyimpan transaksi barang masuk.', 'error');
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Hapus Transaksi?',
      text: 'Transaksi barang masuk ini akan dihapus dari database & stok akan disesuaikan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          const apiRes = await api.delete(`/transactions/in/${id}`);
          if (apiRes.data?.success) {
            Swal.fire('Terhapus!', 'Transaksi berhasil dihapus dari database.', 'success');
            fetchStockIns();
            fetchMaterialsAndSuppliers();
          }
        } catch (err) {
          console.error('Error deleting stockIn:', err);
          Swal.fire('Gagal Hapus', err.response?.data?.message || 'Gagal menghapus transaksi.', 'error');
        }
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
                <option value="">-- Pilih Supplier --</option>
                {suppliers.map(s => (
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

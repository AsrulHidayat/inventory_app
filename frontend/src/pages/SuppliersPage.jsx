import React, { useState } from 'react';
import { Plus, Users, Search, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { INITIAL_MOCK_DATA } from '../services/api';
import Modal from '../components/common/Modal';
import Swal from 'sweetalert2';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState(INITIAL_MOCK_DATA.suppliers);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase()) ||
    s.address.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (sup = null) => {
    if (sup) {
      setEditingSupplier(sup);
      setFormData({ ...sup });
    } else {
      setEditingSupplier(null);
      setFormData({
        code: `SUP-${String(suppliers.length + 1).padStart(3, '0')}`,
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingSupplier) {
      setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? { ...s, ...formData } : s));
      Swal.fire('Berhasil!', 'Data supplier diperbarui.', 'success');
    } else {
      const newSup = { id: Date.now(), ...formData };
      setSuppliers(prev => [...prev, newSup]);
      Swal.fire('Berhasil!', 'Supplier baru berhasil ditambahkan.', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id, name) => {
    Swal.fire({
      title: 'Hapus Supplier?',
      text: `Yakin ingin menghapus ${name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Hapus',
    }).then((res) => {
      if (res.isConfirmed) {
        setSuppliers(prev => prev.filter(s => s.id !== id));
        Swal.fire('Terhapus!', 'Supplier berhasil dihapus.', 'success');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" /> Data Supplier / Pemasok
          </h1>
          <p className="text-xs text-slate-400 mt-1">Daftar mitra pemasok bahan baku toko kue di Kabupaten Gowa</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Tambah Supplier Baru
        </button>
      </div>

      <div className="glass-panel p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, kode, atau alamat supplier..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl border border-transparent focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid Supplier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map((s) => (
          <div key={s.id} className="glass-card p-5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">{s.code}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenModal(s)}
                    className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id, s.name)}
                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{s.name}</h3>

              <div className="space-y-1.5 mt-3 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{s.phone || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{s.email || '-'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{s.address || '-'}</span>
                </div>
              </div>
            </div>

            {s.notes && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 italic">
                "{s.notes}"
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal CRUD Supplier */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'Edit Data Supplier' : 'Tambah Supplier Baru'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Supplier</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Supplier</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="UD Sumber Terigu..."
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">No. HP / WhatsApp</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0812..."
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="supplier@email.com"
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Alamat Alamat Lengkap</label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Jl. Poros..."
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Spesialis tepung terigu..."
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
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md"
            >
              Simpan Supplier
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

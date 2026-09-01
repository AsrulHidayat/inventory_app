import React, { useState, useEffect } from 'react';
import { Plus, Users, Search, Edit, Trash2, Phone, Mail, MapPin, Tag, Check, X } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/common/Modal';
import Swal from 'sweetalert2';

const CATEGORY_SUGGESTIONS = ['Tepung', 'Dairy & Lemak', 'Minyak & Bumbu', 'Isian & Toping', 'Kemasan & Packaging'];

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [newCatInput, setNewCatInput] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    selectedCategories: [],
  });

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/suppliers');
      if (res.data?.success) {
        setSuppliers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching suppliers from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter(s =>
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.code || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.address || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (sup = null) => {
    if (sup) {
      setEditingSupplier(sup);
      setFormData({
        code: sup.code || '',
        name: sup.name || '',
        phone: sup.phone || '',
        email: sup.email || '',
        address: sup.address || '',
        notes: sup.notes || '',
        selectedCategories: sup.categoriesList || [],
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        code: `SUP-${String(suppliers.length + 1).padStart(3, '0')}`,
        name: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
        selectedCategories: ['Tepung'],
      });
    }
    setNewCatInput('');
    setIsModalOpen(true);
  };

  const toggleCategory = (cat) => {
    setFormData(prev => {
      const exists = prev.selectedCategories.includes(cat);
      if (exists) {
        return { ...prev, selectedCategories: prev.selectedCategories.filter(c => c !== cat) };
      } else {
        return { ...prev, selectedCategories: [...prev.selectedCategories, cat] };
      }
    });
  };

  const handleAddCustomCategoryTag = () => {
    if (!newCatInput.trim()) return;
    const catName = newCatInput.trim();
    if (!formData.selectedCategories.includes(catName)) {
      setFormData(prev => ({
        ...prev,
        selectedCategories: [...prev.selectedCategories, catName]
      }));
    }
    setNewCatInput('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        code: formData.code,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        notes: formData.notes,
        categories: formData.selectedCategories
      };

      if (editingSupplier) {
        const res = await api.put(`/suppliers/${editingSupplier.id}`, payload);
        if (res.data?.success) {
          Swal.fire('Berhasil!', 'Data supplier dan kategori berhasil diperbarui!', 'success');
          fetchSuppliers();
        }
      } else {
        const res = await api.post('/suppliers', payload);
        if (res.data?.success) {
          Swal.fire('Berhasil!', 'Supplier baru dan daftar kategorinya berhasil ditambahkan!', 'success');
          fetchSuppliers();
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving supplier:', err);
      Swal.fire('Gagal', err.response?.data?.message || 'Gagal menyimpan supplier.', 'error');
    }
  };

  const handleDelete = (id, name) => {
    Swal.fire({
      title: 'Hapus Supplier?',
      text: `Yakin ingin menghapus supplier "${name}" dari database?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'Hapus',
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          const apiRes = await api.delete(`/suppliers/${id}`);
          if (apiRes.data?.success) {
            Swal.fire('Terhapus!', 'Supplier berhasil dihapus dari database.', 'success');
            fetchSuppliers();
          }
        } catch (err) {
          console.error('Error deleting supplier:', err);
          Swal.fire('Gagal Hapus', err.response?.data?.message || 'Gagal menghapus supplier.', 'error');
        }
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
          <p className="text-xs text-slate-400 mt-1">Atur daftar pemasok dan spesifikasi kategori bahan baku yang disediakan</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
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
        {filteredSuppliers.map((s) => {
          const cats = s.categoriesList || [];

          return (
            <div key={s.id} className="glass-card p-5 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">{s.code}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(s)}
                      className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg cursor-pointer"
                      title="Edit Supplier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id, s.name)}
                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg cursor-pointer"
                      title="Hapus Supplier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{s.name}</h3>

                {/* Categories Badges */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1">
                  {cats.length > 0 ? (
                    cats.map(c => (
                      <span key={c} className="px-2 py-0.5 rounded-md bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20">
                        {c}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">Kategori belum ditentukan</span>
                  )}
                </div>

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
          );
        })}
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
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold"
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
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          {/* Kategori Bahan Baku Yang Disediakan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kategori Yang Disediakan
            </label>
            <div className="p-3 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
              {/* Selected Categories Tags */}
              <div className="flex flex-wrap items-center gap-1.5 min-h-[28px]">
                {formData.selectedCategories.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">Belum ada kategori yang ditambahkan.</span>
                ) : (
                  formData.selectedCategories.map(cat => (
                    <span
                      key={cat}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      {cat}
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className="hover:bg-amber-600 rounded-full p-0.5 transition-colors cursor-pointer"
                        title="Hapus Kategori"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add Custom Category Input */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <input
                  type="text"
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  placeholder="Ketik nama kategori (contoh: Tepung, Kemasan)..."
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:border-amber-500 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomCategoryTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomCategoryTag}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  + Tambah
                </button>
              </div>
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Alamat Lengkap</label>
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
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              Simpan Supplier
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

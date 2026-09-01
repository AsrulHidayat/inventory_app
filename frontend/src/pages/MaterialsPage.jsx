import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  FileText, 
  Edit, 
  Trash2, 
  ArrowUpDown,
  RefreshCw,
  Tag,
  Building2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { INITIAL_MOCK_DATA } from '../services/api';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const DEFAULT_CATEGORIES = ['Tepung', 'Dairy & Lemak', 'Minyak & Bumbu', 'Isian & Toping'];

export default function MaterialsPage() {
  const { activeUmkmId } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('code');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: '',
    unit: 'Kg',
    minStock: 10,
    price: 15000,
    currentStock: 20,
    supplierId: '',
  });

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await api.get('/materials', {
        params: activeUmkmId ? { umkmId: activeUmkmId } : {}
      });
      if (res.data?.success) {
        setMaterials(res.data.data.map(m => ({
          ...m,
          supplierName: m.supplier?.name || '-'
        })));
      }
    } catch (err) {
      console.error('Error fetching materials from API:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers');
      if (res.data?.success) {
        setSuppliers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching suppliers from API:', err);
    }
  };

  useEffect(() => {
    fetchMaterials();
    fetchSuppliers();
  }, [activeUmkmId]);

  // Global Unique Available Categories for Filter Bar
  const allAvailableCategories = useMemo(() => {
    const existingCat = materials.map(m => m.category).filter(Boolean);
    const supplierCats = suppliers.flatMap(s => s.categoriesList || []);
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...existingCat, ...supplierCats]));
  }, [materials, suppliers]);

  // Categories provided by currently selected Supplier in Modal
  const selectedSupplierObj = useMemo(() => {
    if (!formData.supplierId) return null;
    return suppliers.find(s => Number(s.id) === Number(formData.supplierId));
  }, [suppliers, formData.supplierId]);

  const supplierCategories = useMemo(() => {
    if (!selectedSupplierObj) return [];
    const list = selectedSupplierObj.categoriesList || [];
    if (list.length > 0) return list;
    return allAvailableCategories; // fallback if supplier hasn't specified categories yet
  }, [selectedSupplierObj, allAvailableCategories]);

  // Filtered & Sorted Materials
  const filteredMaterials = useMemo(() => {
    return materials
      .filter(m => !activeUmkmId || Number(m.umkmId) === Number(activeUmkmId))
      .filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                              m.code.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !categoryFilter || m.category === categoryFilter;
        const matchesStatus = !statusFilter || m.statusCode === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [materials, activeUmkmId, search, categoryFilter, statusFilter, sortField, sortOrder]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage) || 1;
  const paginatedMaterials = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMaterials.slice(start, start + itemsPerPage);
  }, [filteredMaterials, currentPage]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleOpenModal = (material = null) => {
    if (material) {
      setEditingMaterial(material);
      const supId = material.supplierId || suppliers[0]?.id || '';
      const matchedSup = suppliers.find(s => Number(s.id) === Number(supId));
      const validCats = matchedSup?.categoriesList?.length ? matchedSup.categoriesList : allAvailableCategories;

      setFormData({
        code: material.code,
        name: material.name,
        category: material.category || validCats[0] || 'Tepung',
        unit: material.unit,
        minStock: material.minStock,
        price: material.price,
        currentStock: material.currentStock,
        supplierId: supId,
      });
    } else {
      setEditingMaterial(null);
      const defaultSupId = suppliers[0]?.id || '';
      const matchedSup = suppliers.find(s => Number(s.id) === Number(defaultSupId));
      const validCats = matchedSup?.categoriesList?.length ? matchedSup.categoriesList : allAvailableCategories;

      const newId = materials.length + 1;
      setFormData({
        code: `MAT-NEW-${String(newId).padStart(3, '0')}`,
        name: '',
        supplierId: defaultSupId,
        category: validCats[0] || 'Tepung',
        unit: 'Kg',
        minStock: 10,
        price: 15000,
        currentStock: 25,
      });
    }
    setIsModalOpen(true);
  };

  const handleSupplierChange = (newSupplierId) => {
    const supObj = suppliers.find(s => Number(s.id) === Number(newSupplierId));
    const supCats = supObj?.categoriesList || [];

    setFormData(prev => {
      let nextCategory = prev.category;
      if (supCats.length > 0 && !supCats.includes(prev.category)) {
        nextCategory = supCats[0];
      }
      return {
        ...prev,
        supplierId: newSupplierId,
        category: nextCategory
      };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.supplierId) {
      Swal.fire('Supplier Belum Dipilih', 'Silakan pilih Supplier Utama terlebih dahulu.', 'warning');
      return;
    }

    if (!formData.category) {
      Swal.fire('Kategori Wajib Diisi', 'Silakan pilih kategori yang disediakan supplier.', 'warning');
      return;
    }

    try {
      const payload = {
        code: formData.code,
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        price: Number(formData.price),
        minStock: Number(formData.minStock),
        currentStock: Number(formData.currentStock),
        supplierId: Number(formData.supplierId),
        umkmId: activeUmkmId || 1
      };

      if (editingMaterial) {
        const res = await api.put(`/materials/${editingMaterial.id}`, payload);
        if (res.data?.success) {
          Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data bahan baku berhasil diperbarui!', timer: 1500, showConfirmButton: false });
          fetchMaterials();
        }
      } else {
        const res = await api.post('/materials', payload);
        if (res.data?.success) {
          Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Bahan baku baru berhasil ditambahkan!', timer: 1500, showConfirmButton: false });
          fetchMaterials();
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving material:', err);
      Swal.fire('Gagal', err.response?.data?.message || 'Terjadi kesalahan saat menyimpan bahan baku.', 'error');
    }
  };

  const handleDelete = (id, name) => {
    Swal.fire({
      title: 'Hapus Bahan Baku?',
      text: `Apakah Anda yakin ingin menghapus "${name}" dari database?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/materials/${id}`);
          if (res.data?.success) {
            Swal.fire('Terhapus!', 'Data bahan baku telah terhapus dari database.', 'success');
            fetchMaterials();
          }
        } catch (err) {
          console.error('Error deleting material:', err);
          Swal.fire('Gagal Hapus', err.response?.data?.message || 'Gagal menghapus data dari database.', 'error');
        }
      }
    });
  };

  // Export Excel
  const exportExcel = () => {
    const exportData = filteredMaterials.map(m => ({
      'Kode Barang': m.code,
      'Nama Bahan Baku': m.name,
      'Kategori': m.category,
      'Satuan': m.unit,
      'Stok Saat Ini': m.currentStock,
      'Minimal Stok': m.minStock,
      'Harga (Rp)': m.price,
      'Supplier': m.supplierName,
      'Status': m.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Bahan Baku');
    XLSX.writeFile(workbook, `Master_Bahan_Baku_Gowa_${Date.now()}.xlsx`);
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Laporan Master Data Bahan Baku UMKM Gowa', 14, 15);
    const tableColumn = ['Kode', 'Nama Bahan', 'Kategori', 'Stok', 'Min', 'Harga (Rp)', 'Status'];
    const tableRows = filteredMaterials.map(m => [
      m.code,
      m.name,
      m.category,
      `${m.currentStock} ${m.unit}`,
      `${m.minStock} ${m.unit}`,
      `Rp ${m.price.toLocaleString('id-ID')}`,
      m.status,
    ]);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11] },
    });
    doc.save(`Master_Bahan_Baku_Gowa_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Master Data Bahan Baku</h1>
          <p className="text-xs text-slate-400 mt-1">Kelola seluruh persediaan stok bahan baku toko kue & kuliner</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportExcel}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
          <button
            onClick={exportPDF}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" /> PDF
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Bahan Baku
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode atau nama bahan baku..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl border border-transparent focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none font-medium"
          >
            <option value="">-- Semua Kategori ({allAvailableCategories.length}) --</option>
            {allAvailableCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none font-medium"
          >
            <option value="">-- Semua Status Stok --</option>
            <option value="AMAN">Stok Aman</option>
            <option value="HAMPIR_HABIS">Hampir Habis</option>
            <option value="HABIS">Stok Habis</option>
          </select>
        </div>
      </div>

      {/* Modern Data Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('code')}>
                  <div className="flex items-center gap-1">
                    Kode <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    Nama Bahan Baku <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('currentStock')}>
                  <div className="flex items-center gap-1">
                    Stok / Minimal <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('price')}>
                  <div className="flex items-center gap-1">
                    Harga Satuan <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedMaterials.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada bahan baku yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                paginatedMaterials.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">{item.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">{item.name}</td>
                    <td className="py-3 px-4 text-slate-500">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-[11px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold">
                      <span className={item.currentStock === 0 ? 'text-red-500' : item.currentStock <= item.minStock ? 'text-amber-500' : 'text-slate-800 dark:text-slate-200'}>
                        {item.currentStock}
                      </span> / {item.minStock} {item.unit}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                      Rp {item.price.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-slate-500 truncate max-w-[150px]">{item.supplierName}</td>
                    <td className="py-3 px-4">
                      <Badge status={item.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Bahan Baku"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Menampilkan {paginatedMaterials.length} dari {filteredMaterials.length} bahan baku
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg disabled:opacity-40 font-semibold cursor-pointer"
            >
              Prev
            </button>
            <span className="px-2 font-bold text-slate-800 dark:text-slate-200">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg disabled:opacity-40 font-semibold cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* CRUD Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMaterial ? 'Edit Bahan Baku' : 'Tambah Bahan Baku Baru'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Supplier Utama</label>
              <select
                required
                value={formData.supplierId}
                onChange={(e) => handleSupplierChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:outline-none"
              >
                <option value="">-- Pilih Supplier --</option>
                {suppliers.map(s => {
                  const catsStr = (s.categoriesList || []).join(', ');
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name} {catsStr ? `(${catsStr})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
              {!formData.supplierId ? (
                <div className="px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-dashed border-amber-400 rounded-xl text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Pilih supplier dulu
                </div>
              ) : (
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
                >
                  {supplierCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Barang</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Bahan Baku</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Tepung Terigu Segitiga Biru"
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Satuan</label>
              <input
                type="text"
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="Kg / Liter / Pcs"
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Minimal Stok</label>
              <input
                type="number"
                required
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-amber-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Stok Awal</label>
              <input
                type="number"
                required
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Harga Satuan (Rp)</label>
            <input
              type="number"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
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
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer"
            >
              Simpan Data
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

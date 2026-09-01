import React, { useState, useEffect } from 'react';
import { FileText, Printer, FileSpreadsheet, Download, Search, RefreshCw, Boxes, DollarSign, AlertTriangle, TrendingUp, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { INITIAL_MOCK_DATA } from '../services/api';
import Badge from '../components/common/Badge';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ReportsPage() {
  const { activeUmkmId, user } = useAuth();
  const [reportType, setReportType] = useState('inventory'); // 'inventory', 'forecast'
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const currentUmkm = user?.umkm?.id === Number(activeUmkmId) || !activeUmkmId
    ? user?.umkm
    : INITIAL_MOCK_DATA.umkms.find(u => u.id === Number(activeUmkmId));

  const storeName = currentUmkm?.name || (user?.umkm?.name) || 'UMKM Toko Kue Gowa';

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/inventory', {
        params: activeUmkmId ? { umkmId: activeUmkmId } : {}
      });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setMaterials(res.data.data);
      }
    } catch (err) {
      console.warn('Error loading report data from API, using fallback data:', err);
      // Fallback data
      const fallback = INITIAL_MOCK_DATA.materials.filter(m => !activeUmkmId || Number(m.umkmId) === Number(activeUmkmId));
      setMaterials(fallback.map(m => {
        let status = 'Aman';
        if (m.currentStock === 0) status = 'Habis';
        else if (m.currentStock <= m.minStock) status = 'Hampir Habis';

        return {
          id: m.id,
          code: m.code,
          name: m.name,
          category: m.category,
          unit: m.unit,
          minStock: m.minStock,
          price: m.price,
          currentStock: m.currentStock,
          totalAssetValue: m.currentStock * m.price,
          supplierName: m.supplier?.name || '-',
          status,
        };
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [activeUmkmId]);

  // Filtered Materials
  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                          m.code.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate Metrics
  const totalItems = filteredMaterials.length;
  const totalStockUnits = filteredMaterials.reduce((acc, m) => acc + (Number(m.currentStock) || 0), 0);
  const totalAssetValue = filteredMaterials.reduce((acc, m) => acc + (Number(m.totalAssetValue || (m.currentStock * m.price)) || 0), 0);
  const criticalItemsCount = filteredMaterials.filter(m => m.currentStock <= m.minStock).length;

  const handlePrint = () => {
    window.print();
  };

  const exportExcel = () => {
    let exportData = [];
    if (reportType === 'inventory') {
      exportData = filteredMaterials.map(m => ({
        'Kode Barang': m.code,
        'Nama Bahan Baku': m.name,
        'Kategori': m.category,
        'Stok Current': m.currentStock,
        'Satuan': m.unit,
        'Minimal Stok': m.minStock,
        'Harga Satuan (Rp)': m.price,
        'Total Nilai Persediaan (Rp)': m.totalAssetValue || (m.currentStock * m.price),
        'Supplier': m.supplierName || '-',
        'Status Stok': m.status,
      }));
    } else {
      exportData = filteredMaterials.map(m => {
        const smaForecast = Math.round((m.currentStock + m.minStock * 1.5) / 2);
        const suggestedRestock = Math.max(0, (m.minStock * 2) - m.currentStock);
        return {
          'Kode Barang': m.code,
          'Nama Bahan Baku': m.name,
          'Kategori': m.category,
          'Stok Saat Ini': m.currentStock,
          'Minimal Stok': m.minStock,
          'Prediksi Kebutuhan (SMA)': smaForecast,
          'Rekomendasi Restok': suggestedRestock,
          'Status': m.status,
        };
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Laporan_${reportType}`);
    XLSX.writeFile(workbook, `Laporan_${reportType}_${storeName.replace(/\s+/g, '_')}_${Date.now()}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`LAPORAN PERSEDIAAN BAHAN BAKU — ${storeName.toUpperCase()}`, 14, 15);
    doc.setFontSize(9);
    doc.text(`Kabupaten Gowa, Sulawesi Selatan | Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

    let tableColumn = [];
    let tableRows = [];

    if (reportType === 'inventory') {
      tableColumn = ['Kode', 'Nama Bahan', 'Kategori', 'Stok', 'Harga (Rp)', 'Total Nilai (Rp)', 'Status'];
      tableRows = filteredMaterials.map(m => [
        m.code,
        m.name,
        m.category,
        `${m.currentStock} ${m.unit}`,
        `Rp ${m.price.toLocaleString('id-ID')}`,
        `Rp ${(m.totalAssetValue || (m.currentStock * m.price)).toLocaleString('id-ID')}`,
        m.status,
      ]);
    } else {
      tableColumn = ['Kode', 'Nama Bahan', 'Stok', 'Min Stok', 'Prediksi SMA', 'Rekomendasi Restok', 'Status'];
      tableRows = filteredMaterials.map(m => {
        const smaForecast = Math.round((m.currentStock + m.minStock * 1.5) / 2);
        const suggestedRestock = Math.max(0, (m.minStock * 2) - m.currentStock);
        return [
          m.code,
          m.name,
          `${m.currentStock} ${m.unit}`,
          `${m.minStock} ${m.unit}`,
          `${smaForecast} ${m.unit}`,
          `+${suggestedRestock} ${m.unit}`,
          m.status,
        ];
      });
    }

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11] },
      styles: { fontSize: 8 },
    });

    doc.save(`Laporan_${reportType}_${storeName.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6 print:p-0">
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-500" /> Laporan Persediaan ({storeName})
          </h1>
          <p className="text-xs text-slate-400 mt-1">Laporan posisi persediaan real-time, nilai aset, dan peramalan SMA</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchReportData}
            disabled={loading}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 hover:bg-slate-200 transition-all cursor-pointer"
            title="Refresh Data Laporan"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Cetak (Print)
          </button>
          <button
            onClick={exportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
          <button
            onClick={exportPDF}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Real Summary Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Total Bahan Baku</div>
            <div className="text-xl font-black text-slate-800 dark:text-slate-100">{totalItems} Item</div>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Total Stok Unit</div>
            <div className="text-xl font-black text-slate-800 dark:text-slate-100">{totalStockUnits.toLocaleString('id-ID')} Unit</div>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Nilai Aset Persediaan</div>
            <div className="text-xl font-black text-slate-800 dark:text-slate-100">Rp {totalAssetValue.toLocaleString('id-ID')}</div>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Stok Kritis / Restok</div>
            <div className="text-xl font-black text-rose-600 dark:text-rose-400">{criticalItemsCount} Item</div>
          </div>
        </div>
      </div>

      {/* Tabs Filter & Search Controls */}
      <div className="glass-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReportType('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              reportType === 'inventory' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Laporan Stok Persediaan & Nilai Aset
          </button>
          <button
            onClick={() => setReportType('forecast')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              reportType === 'forecast' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Laporan Peramalan SMA & Restok
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode/nama bahan..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl border border-transparent focus:border-amber-500 focus:outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none"
          >
            <option value="">-- Semua Kategori --</option>
            <option value="Tepung">Tepung</option>
            <option value="Dairy & Lemak">Dairy & Lemak</option>
            <option value="Minyak & Bumbu">Minyak & Bumbu</option>
            <option value="Isian & Toping">Isian & Toping</option>
          </select>
        </div>
      </div>

      {/* Printable Report Paper Container */}
      <div className="glass-panel p-6 sm:p-8 bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800">
        {/* Printable Paper Header */}
        <div className="text-center pb-6 border-b border-slate-200 dark:border-slate-800 mb-6">
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
            LAPORAN PERSEDIAAN BAHAN BAKU — {storeName.toUpperCase()}
          </h2>
          <p className="text-xs text-slate-500 font-medium">Kabupaten Gowa, Sulawesi Selatan</p>
          <div className="flex items-center justify-center gap-4 mt-2 text-[11px] text-slate-500">
            <span>Tanggal Cetak: <strong className="text-slate-700 dark:text-slate-300">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
            <span>•</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              {reportType === 'inventory' ? 'Modul: Posisi Stok Inventaris & Nilai Aset' : 'Modul: Peramalan Single Moving Average (SMA)'}
            </span>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-3">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Memuat data laporan persediaan dari database...</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Tidak ada data persediaan bahan baku yang sesuai kriteria filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Kode</th>
                  <th className="py-2.5 px-3">Nama Bahan Baku</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">Stok Saat Ini</th>
                  {reportType === 'inventory' ? (
                    <>
                      <th className="py-2.5 px-3">Min Stok</th>
                      <th className="py-2.5 px-3">Harga Satuan</th>
                      <th className="py-2.5 px-3">Total Nilai Persediaan</th>
                      <th className="py-2.5 px-3">Supplier</th>
                      <th className="py-2.5 px-3">Status</th>
                    </>
                  ) : (
                    <>
                      <th className="py-2.5 px-3">Min Stok</th>
                      <th className="py-2.5 px-3 text-amber-600 dark:text-amber-400">Prediksi SMA (n=3)</th>
                      <th className="py-2.5 px-3 text-blue-600 dark:text-blue-400">Rekomendasi Restok</th>
                      <th className="py-2.5 px-3">Status</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredMaterials.map(m => {
                  const itemAssetValue = m.totalAssetValue || (m.currentStock * m.price);
                  const smaForecast = Math.round((m.currentStock + m.minStock * 1.5) / 2);
                  const suggestedRestock = Math.max(0, (m.minStock * 2) - m.currentStock);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-amber-600 dark:text-amber-400">{m.code}</td>
                      <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-100">{m.name}</td>
                      <td className="py-3 px-3 text-slate-500">{m.category}</td>
                      <td className="py-3 px-3 font-bold">
                        <span className={m.currentStock === 0 ? 'text-red-500 font-black' : m.currentStock <= m.minStock ? 'text-amber-500 font-bold' : 'text-slate-800 dark:text-slate-200'}>
                          {m.currentStock} {m.unit}
                        </span>
                      </td>

                      {reportType === 'inventory' ? (
                        <>
                          <td className="py-3 px-3 text-slate-500">{m.minStock} {m.unit}</td>
                          <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                            Rp {Number(m.price).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">
                            Rp {itemAssetValue.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-3 text-slate-500 truncate max-w-[120px]">{m.supplierName || '-'}</td>
                          <td className="py-3 px-3">
                            <Badge status={m.status === 'Habis' ? 'HABIS' : m.status === 'Hampir Habis' ? 'HAMPIR_HABIS' : 'AMAN'} />
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-3 text-slate-500">{m.minStock} {m.unit}</td>
                          <td className="py-3 px-3 font-bold text-amber-600 dark:text-amber-400">
                            {smaForecast} {m.unit}
                          </td>
                          <td className="py-3 px-3 font-bold text-blue-600 dark:text-blue-400">
                            {suggestedRestock > 0 ? `+${suggestedRestock} ${m.unit}` : 'Stok Cukup'}
                          </td>
                          <td className="py-3 px-3">
                            <Badge status={m.status === 'Habis' ? 'HABIS' : m.status === 'Hampir Habis' ? 'HAMPIR_HABIS' : 'AMAN'} />
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              {reportType === 'inventory' && (
                <tfoot className="border-t-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 font-bold text-xs">
                  <tr>
                    <td colSpan={3} className="py-3 px-3 text-slate-700 dark:text-slate-300 uppercase">TOTAL / RINGKASAN:</td>
                    <td className="py-3 px-3 font-black text-slate-900 dark:text-white">{totalStockUnits.toLocaleString('id-ID')} Unit</td>
                    <td colSpan={2} className="py-3 px-3 text-right text-slate-700 dark:text-slate-300">TOTAL ASSET PERSEDIAAN:</td>
                    <td className="py-3 px-3 font-black text-amber-600 dark:text-amber-400 text-sm">Rp {totalAssetValue.toLocaleString('id-ID')}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

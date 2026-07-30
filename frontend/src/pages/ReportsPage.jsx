import React, { useState } from 'react';
import { FileText, Printer, FileSpreadsheet, Download, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_MOCK_DATA } from '../services/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ReportsPage() {
  const { activeUmkmId } = useAuth();
  const [reportType, setReportType] = useState('inventory'); // 'inventory', 'stock_in', 'stock_out', 'forecast'

  const materials = INITIAL_MOCK_DATA.materials.filter(m => !activeUmkmId || m.umkmId === activeUmkmId);

  const handlePrint = () => {
    window.print();
  };

  const exportExcel = () => {
    let exportData = [];
    if (reportType === 'inventory') {
      exportData = materials.map(m => ({
        'Kode': m.code,
        'Nama Bahan Baku': m.name,
        'Kategori': m.category,
        'Stok Current': m.currentStock,
        'Satuan': m.unit,
        'Harga (Rp)': m.price,
        'Total Nilai (Rp)': m.currentStock * m.price,
        'Status': m.status,
      }));
    } else {
      exportData = materials.map(m => ({
        'Kode': m.code,
        'Nama Bahan Baku': m.name,
        'Stok Saat Ini': m.currentStock,
        'Prediksi SMA (Periode Depan)': Math.round(m.minStock * 1.5),
        'Rekomendasi Restok': Math.max(0, (m.minStock * 2) - m.currentStock),
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Laporan_${reportType}`);
    XLSX.writeFile(workbook, `Laporan_${reportType}_${Date.now()}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Laporan Persediaan (${reportType.toUpperCase()}) UMKM Gowa`, 14, 15);
    const tableColumn = ['Kode', 'Nama Bahan', 'Kategori', 'Stok', 'Harga (Rp)', 'Status'];
    const tableRows = materials.map(m => [
      m.code,
      m.name,
      m.category,
      `${m.currentStock} ${m.unit}`,
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
    doc.save(`Laporan_${reportType}_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6 print:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-500" /> Laporan Persediaan
          </h1>
          <p className="text-xs text-slate-400 mt-1">Cetak dan ekspor laporan inventaris, transaksi, dan peramalan SMA</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 hover:bg-slate-900 transition-all"
          >
            <Printer className="w-4 h-4" /> Cetak (Print)
          </button>
          <button
            onClick={exportExcel}
            className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 hover:bg-emerald-700 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
          <button
            onClick={exportPDF}
            className="px-3.5 py-2 bg-red-600 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 hover:bg-red-700 transition-all"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="glass-panel p-2 flex flex-wrap gap-2 print:hidden">
        <button
          onClick={() => setReportType('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            reportType === 'inventory' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
          }`}
        >
          Laporan Stok Persediaan
        </button>
        <button
          onClick={() => setReportType('forecast')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            reportType === 'forecast' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
          }`}
        >
          Laporan Peramalan Single Moving Average
        </button>
      </div>

      {/* Printable Report Paper Container */}
      <div className="glass-panel p-8 bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="text-center pb-6 border-b border-slate-200 dark:border-slate-800 mb-6">
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
            LAPORAN PERSEDIAAN BAHAN BAKU UMKM TOKO KUE
          </h2>
          <p className="text-xs text-slate-500 font-medium">Kabupaten Gowa, Sulawesi Selatan</p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-1">
            {reportType === 'inventory' ? 'Modul: Posisi Stok Inventaris' : 'Modul: Forecasting Single Moving Average (SMA)'}
          </p>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px]">
              <th className="py-2.5 px-3">Kode</th>
              <th className="py-2.5 px-3">Nama Bahan Baku</th>
              <th className="py-2.5 px-3">Kategori</th>
              <th className="py-2.5 px-3">Stok Saat Ini</th>
              <th className="py-2.5 px-3">Harga Satuan</th>
              <th className="py-2.5 px-3">Total Nilai Persediaan</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {materials.map(m => (
              <tr key={m.id}>
                <td className="py-2.5 px-3 font-mono font-bold">{m.code}</td>
                <td className="py-2.5 px-3 font-bold">{m.name}</td>
                <td className="py-2.5 px-3">{m.category}</td>
                <td className="py-2.5 px-3 font-bold">{m.currentStock} {m.unit}</td>
                <td className="py-2.5 px-3">Rp {m.price.toLocaleString('id-ID')}</td>
                <td className="py-2.5 px-3 font-semibold">Rp {(m.currentStock * m.price).toLocaleString('id-ID')}</td>
                <td className="py-2.5 px-3 font-bold">{m.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

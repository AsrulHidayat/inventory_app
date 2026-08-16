import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Boxes,
  AlertTriangle,
  XCircle,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  ShoppingBag,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Badge from '../components/common/Badge';

export default function DashboardPage() {
  const { activeUmkmId, user } = useAuth();
  const navigate = useNavigate();

  const [materials, setMaterials] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalJenisBahan: 0,
    totalStokUnit: 0,
    barangHampirHabis: 0,
    barangHabis: 0,
    barangMasukHariIni: 0,
    barangKeluarHariIni: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [matRes, sumRes] = await Promise.all([
          api.get('/materials', { params: activeUmkmId ? { umkmId: activeUmkmId } : {} }),
          api.get('/materials/dashboard-summary', { params: activeUmkmId ? { umkmId: activeUmkmId } : {} })
        ]);

        if (matRes.data?.success) {
          setMaterials(matRes.data.data.map(m => ({
            ...m,
            supplierName: m.supplier?.name || '-'
          })));
        }

        if (sumRes.data?.success) {
          setSummaryData(sumRes.data.data);
        }
      } catch (err) {
        console.error('Error loading dashboard data from API:', err);
      }
    };

    fetchDashboardData();
  }, [activeUmkmId]);

  const filteredMaterials = materials;

  const totalJenisBahan = summaryData.totalJenisBahan || filteredMaterials.length;
  const totalStokUnit = summaryData.totalStokUnit || filteredMaterials.reduce((acc, m) => acc + (Number(m.currentStock) || 0), 0);
  const hampirHabisCount = summaryData.barangHampirHabis !== undefined ? summaryData.barangHampirHabis : filteredMaterials.filter(m => m.currentStock > 0 && m.currentStock <= m.minStock).length;
  const habisCount = summaryData.barangHabis !== undefined ? summaryData.barangHabis : filteredMaterials.filter(m => m.currentStock === 0).length;

  const lowStockItems = filteredMaterials.filter(m => m.currentStock <= m.minStock);

  // Data Grafik Barang Masuk vs Keluar Murni Real dari Database
  const currentMonths = ['Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul'];
  const chartDataMonthly = summaryData.chartMonthly || currentMonths.map(b => ({ bulan: b, masuk: 0, keluar: 0 }));

  // Data Grafik Area Tren Penggunaan Murni Real dari Database
  const topNames = summaryData.topMaterialNames || (filteredMaterials.slice(0, 2).map(m => m.name));
  const mat1 = topNames[0] || 'Bahan Utama 1';
  const mat2 = topNames[1] || 'Bahan Utama 2';

  const chartDataUsage = summaryData.chartUsage || [
    { minggu: 'Mg 1', [mat1]: 0, [mat2]: 0 },
    { minggu: 'Mg 2', [mat1]: 0, [mat2]: 0 },
    { minggu: 'Mg 3', [mat1]: 0, [mat2]: 0 },
    { minggu: 'Mg 4', [mat1]: 0, [mat2]: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Welcome Banner */}
      <div className="glass-panel p-6 bg-amber-500/10 dark:bg-slate-900/80 border border-amber-500/20 dark:border-slate-800 backdrop-blur-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Selamat Datang, {user?.name || 'Pengguna'}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
              Sistem Informasi Persediaan Bahan Baku Real-time untuk UMKM Toko Kue di Kabupaten Gowa. Pantau pergerakan stok, warning minimal, dan peramalan kebutuhan mendatang.
            </p>
          </div>

          <button
            onClick={() => navigate('/forecasting')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-none flex items-center justify-center gap-2 transition-all self-start md:self-auto shrink-0"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Hitung Peramalan SMA</span>
          </button>
        </div>
      </div>

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Jenis Bahan */}
        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Jenis Bahan</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-800 dark:text-slate-100">{totalJenisBahan}</div>
          <div className="text-[10px] text-slate-400">Item Bahan Baku</div>
        </div>

        {/* Total Stok Unit */}
        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Total Stok</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-800 dark:text-slate-100">{totalStokUnit}</div>
          <div className="text-[10px] text-slate-400">Unit Tersebar</div>
        </div>

        {/* Hampir Habis */}
        <div className="glass-card p-4 space-y-2 border-amber-200/80 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase">Hampir Habis</span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">{hampirHabisCount}</div>
          <div className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-medium">Stok &lt;= Minimal</div>
        </div>

        {/* Habis */}
        <div className="glass-card p-4 space-y-2 border-red-200/80 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase">Stok Habis</span>
            <div className="p-2 rounded-xl bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-red-600 dark:text-red-400">{habisCount}</div>
          <div className="text-[10px] text-red-600/80 dark:text-red-400/80 font-medium">Kritis (0 Unit)</div>
        </div>

        {/* Masuk Hari Ini */}
        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Masuk Hari Ini</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-800 dark:text-slate-100">+{summaryData.barangMasukHariIni || 0}</div>
          <div className="text-[10px] text-slate-400">Unit Masuk</div>
        </div>

        {/* Keluar Hari Ini */}
        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Keluar Hari Ini</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-800 dark:text-slate-100">-{summaryData.barangKeluarHariIni || 0}</div>
          <div className="text-[10px] text-slate-400">Dipakai Produksi</div>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Masuk vs Keluar */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Grafik Barang Masuk vs Keluar</h3>
              <p className="text-xs text-slate-400">Perbandingan pergerakan volume stok 6 bulan terakhir</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-amber-500" /> Masuk
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-slate-400" /> Keluar
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataMonthly}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="bulan" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="masuk" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                <Bar dataKey="keluar" fill="#64748b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area Chart: Tren Penggunaan */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Tren Penggunaan Bahan Baku Utama</h3>
              <p className="text-xs text-slate-400">Estimasi konsumsi bahan baku per minggu bulan ini</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500">
              Update Real-time
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartDataUsage}>
                <defs>
                  <linearGradient id="colorTerigu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTelur" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="minggu" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey={mat1} name={mat1} stroke="#F59E0B" fillOpacity={1} fill="url(#colorTerigu)" strokeWidth={2} />
                <Area type="monotone" dataKey={mat2} name={mat2} stroke="#3B82F6" fillOpacity={1} fill="url(#colorTelur)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Critical Stock Alert Feed & Single Moving Average Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Items Alert Feed */}
        <div className="lg:col-span-2 glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Daftar Bahan Hampir Habis & Habis</h3>
            </div>
            <button
              onClick={() => navigate('/inventory/stock')}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
            >
              Lihat Semua Stok →
            </button>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              🎉 Semua stok bahan baku dalam kondisi aman melebihi batas minimal.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Kode & Nama Bahan</th>
                    <th className="py-2.5 px-3">Supplier</th>
                    <th className="py-2.5 px-3">Stok / Min</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {lowStockItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{item.name}</div>
                        <div className="text-[10px] text-slate-400">{item.code} • {item.category}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{item.supplierName}</td>
                      <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                        <span className={item.currentStock === 0 ? 'text-red-500 font-black' : 'text-amber-600'}>
                          {item.currentStock}
                        </span> / {item.minStock} {item.unit}
                      </td>
                      <td className="py-3 px-3">
                        <Badge status={item.status} />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => navigate(`/forecasting?materialId=${item.id}`)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-bold shadow-none transition-all flex items-center gap-1 ml-auto"
                        >
                          <TrendingUp className="w-3 h-3" /> Hitung Restok
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Widget Summary Peramalan SMA - Primary Color Background Model */}
        <div className="p-6 space-y-4 rounded-2xl border-2 border-amber-500 bg-amber-500/15 dark:bg-amber-950/40 shadow-sm h-fit self-start sticky top-20 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-extrabold text-amber-950 dark:text-amber-200">Prediksi SMA Minggu Depan</h3>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-none">
              SMA (n=3)
            </span>
          </div>

          <p className="text-xs text-amber-900 dark:text-amber-200 font-semibold leading-relaxed">
            Metode Single Moving Average (n=3) menghitung rata-rata bergerak konsumsi bahan baku untuk rekomendasi pengadaan yang akurat.
          </p>

          <div className="space-y-2.5 pt-1">
            <div className="p-3 rounded-xl border border-amber-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-none">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Keju Cheddar Prochiz</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">Prediksi: 15 Pcs</div>
              </div>
              <span className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-extrabold shadow-none">
                Order +25 Pcs
              </span>
            </div>

            <div className="p-3 rounded-xl border border-amber-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-none">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Mentega Wijsman</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">Prediksi: 8 Kg</div>
              </div>
              <span className="px-3 py-1 rounded-lg bg-amber-500 text-white text-xs font-extrabold shadow-none">
                Order +15 Kg
              </span>
            </div>

            <div className="p-3 rounded-xl border border-amber-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-none">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Minyak Goreng Bimoli</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">Prediksi: 25 Liter</div>
              </div>
              <span className="px-3 py-1 rounded-lg bg-amber-500 text-white text-xs font-extrabold shadow-none">
                Order +38 Liter
              </span>
            </div>
          </div>

          {/* CTA Button without shadow */}
          <button
            onClick={() => navigate('/forecasting')}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-xl font-extrabold text-xs shadow-none border-none transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <span>Buka Modul Peramalan Lengkap</span>
            <TrendingUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

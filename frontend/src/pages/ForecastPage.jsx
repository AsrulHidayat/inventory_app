import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  TrendingUp, 
  Calculator, 
  Sparkles, 
  ShoppingBag, 
  HelpCircle, 
  ArrowRight,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { INITIAL_MOCK_DATA } from '../services/api';
import { calculateSingleMovingAverage } from '../utils/movingAverage.js';

export default function ForecastPage() {
  const [searchParams] = useSearchParams();
  const { activeUmkmId } = useAuth();

  const materials = INITIAL_MOCK_DATA.materials.filter(m => !activeUmkmId || m.umkmId === activeUmkmId);

  const paramMaterialId = searchParams.get('materialId');
  const [selectedMaterialId, setSelectedMaterialId] = useState(
    paramMaterialId ? Number(paramMaterialId) : (materials[0]?.id || 1)
  );

  const [periodN, setPeriodN] = useState(3);
  const [result, setResult] = useState(null);

  const selectedMaterial = materials.find(m => m.id === Number(selectedMaterialId)) || materials[0];

  useEffect(() => {
    if (!selectedMaterial) return;

    // Histori sampel 6 periode (bulan)
    const baseUsage = Math.max(12, selectedMaterial.minStock * 1.4);
    const historical = [
      Math.round(baseUsage * 0.9),
      Math.round(baseUsage * 1.1),
      Math.round(baseUsage * 1.0),
      Math.round(baseUsage * 1.2),
      Math.round(baseUsage * 0.95),
      Math.round(baseUsage * 1.15),
    ];

    const smaResult = calculateSingleMovingAverage(
      historical,
      periodN,
      selectedMaterial.currentStock,
      selectedMaterial.minStock
    );

    const months = ['Feb 2026', 'Mar 2026', 'Apr 2026', 'Mei 2026', 'Jun 2026', 'Jul 2026'];
    const chartData = historical.map((val, idx) => ({
      periode: months[idx],
      pemakaianHistoris: val,
      forecast: idx >= historical.length - periodN ? smaResult.forecastResult : null,
    }));

    chartData.push({
      periode: 'Prediksi (Agu 2026)',
      pemakaianHistoris: null,
      forecast: smaResult.forecastResult,
      isPrediction: true
    });

    setResult({
      ...smaResult,
      historical,
      chartData,
    });
  }, [selectedMaterialId, periodN, selectedMaterial]);

  if (!selectedMaterial) {
    return <div className="p-8 text-center text-xs text-slate-400">Tidak ada bahan baku yang tersedia.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Single Moving Average Algorithm
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          Peramalan Kebutuhan Bahan Baku (Forecasting)
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Simulasi kalkulasi prediksi kuantitas kebutuhan stok masa depan berdasarkan histori transaksi pemakaian
        </p>
      </div>

      {/* Control Selector Panel */}
      <div className="glass-panel p-6 bg-gradient-to-r from-amber-500/10 via-slate-900/40 to-slate-950 border border-amber-500/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              Pilih Bahan Baku
            </label>
            <select
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 shadow-sm focus:ring-2 focus:ring-amber-500"
            >
              {materials.map(m => (
                <option key={m.id} value={m.id}>
                  {m.code} - {m.name} (Stok: {m.currentStock} {m.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              Jumlah Periode Moving Average (n)
            </label>
            <select
              value={periodN}
              onChange={(e) => setPeriodN(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 shadow-sm focus:ring-2 focus:ring-amber-500"
            >
              <option value={3}>n = 3 Periode (Direkomendasikan)</option>
              <option value={4}>n = 4 Periode</option>
              <option value={5}>n = 5 Periode</option>
            </select>
          </div>

          <div className="glass-card p-3 flex items-center gap-3 bg-white/50 dark:bg-slate-900/50">
            <div className="p-2 rounded-xl bg-amber-500 text-white font-bold text-xs shrink-0">
              STOK
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Stok Saat Ini / Min</div>
              <div className="text-sm font-black text-slate-800 dark:text-slate-100">
                {selectedMaterial.currentStock} / {selectedMaterial.minStock} {selectedMaterial.unit}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Results Grid */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Visual Line Chart & Formula */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recharts Visual Comparison */}
            <div className="glass-panel p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Grafik Tren Pemakaian Historis vs Hasil Prediksi SMA
                  </h3>
                  <p className="text-xs text-slate-400">Periode moving average n = {periodN}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 font-bold text-xs border border-amber-500/30">
                  {result.forecastResult} {selectedMaterial.unit}
                </span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="periode" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="pemakaianHistoris" name="Pemakaian Historis" stroke="#64748b" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="forecast" name="Forecast SMA (Prediksi)" stroke="#F59E0B" strokeWidth={3} strokeDasharray="4 4" dot={{ r: 6, fill: '#F59E0B' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Formula & Step-by-Step Calculation Breakdown */}
            <div className="glass-panel p-6 space-y-4">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <Calculator className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold">Langkah Perhitungan Rumus Single Moving Average</h3>
              </div>

              {/* Mathematical Formula Box */}
              <div className="p-4 rounded-xl bg-slate-900 text-amber-400 font-mono text-xs space-y-2 border border-slate-800">
                <div className="font-bold text-white">RUMUS MATEMATIKA:</div>
                <div>SMA_(t+1) = (X_t + X_(t-1) + ... + X_(t-n+1)) / n</div>
                <div className="text-slate-400 text-[11px] font-sans">
                  Dimana: X_t = Data pemakaian historis pada periode t, n = {periodN} periode moving average.
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="font-bold text-slate-800 dark:text-slate-100">Rincian Kalkulasi:</div>
                <p className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 font-mono text-amber-600 dark:text-amber-400">
                  {result.calculationDetails}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Key Forecast Output & Purchasing Recommendation Card */}
          <div className="space-y-6">
            {/* Forecast Output Card */}
            <div className="glass-panel p-6 space-y-4 bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-950 border border-amber-500/40 shadow-xl">
              <div className="flex items-center gap-2 text-amber-400">
                <TrendingUp className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Hasil Prediksi Peramalan</span>
              </div>

              <div>
                <div className="text-xs text-slate-300">Estimasi Kebutuhan Bulan Depan:</div>
                <div className="text-3xl font-black text-amber-400 mt-1">
                  {result.forecastResult} <span className="text-sm font-normal text-white">{selectedMaterial.unit}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <div className="text-xs text-slate-300">Rekomendasi Kuantitas Pembelian (Restok):</div>
                <div className="text-2xl font-extrabold text-emerald-400 mt-1 flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6" />
                  +{result.suggestedOrder} {selectedMaterial.unit}
                </div>
              </div>
            </div>

            {/* Restock Recommendation & Supplier Info Card */}
            <div className="glass-panel p-6 space-y-4">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <Info className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold">Rekomendasi Pengadaan</h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {result.suggestedOrder > 0 ? (
                  <>
                    Stok <span className="font-bold text-amber-600 dark:text-amber-400">{selectedMaterial.name}</span> saat ini ({selectedMaterial.currentStock} {selectedMaterial.unit}) berada dibawah batas aman untuk memenuhi kebutuhan periode mendatang ({result.forecastResult} {selectedMaterial.unit}).
                  </>
                ) : (
                  <>
                    Stok persediaan <span className="font-bold text-emerald-600">{selectedMaterial.name}</span> masih mencukupi untuk memenuhi proyeksi kebutuhan.
                  </>
                )}
              </p>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200">Supplier Direkomendasikan:</div>
                <div className="text-slate-600 dark:text-slate-400">{selectedMaterial.supplierName}</div>
                <div className="text-amber-600 font-semibold pt-1">
                  Estimasi Total Biaya: Rp {(result.suggestedOrder * selectedMaterial.price).toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

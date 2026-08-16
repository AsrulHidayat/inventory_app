import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  TrendingUp, 
  Calculator, 
  Sparkles, 
  ShoppingBag, 
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
import api from '../services/api';

const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
        <p className="font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 font-semibold" style={{ color: entry.color }}>
            <span>{entry.name}:</span>
            <span className="font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ForecastPage() {
  const [searchParams] = useSearchParams();
  const { activeUmkmId } = useAuth();

  const [materials, setMaterials] = useState([]);
  const paramMaterialId = searchParams.get('materialId');
  const [selectedMaterialId, setSelectedMaterialId] = useState(
    paramMaterialId ? Number(paramMaterialId) : ''
  );

  const [periodN, setPeriodN] = useState(3);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMaterials = async () => {
    try {
      const res = await api.get('/materials', { params: activeUmkmId ? { umkmId: activeUmkmId } : {} });
      if (res.data?.success) {
        setMaterials(res.data.data);
        if (res.data.data.length > 0 && !selectedMaterialId) {
          setSelectedMaterialId(paramMaterialId ? Number(paramMaterialId) : res.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching materials for forecast:', err);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [activeUmkmId]);

  const selectedMaterial = materials.find(m => m.id === Number(selectedMaterialId)) || materials[0];

  useEffect(() => {
    if (!selectedMaterialId) return;

    const runForecast = async () => {
      try {
        setLoading(true);
        const res = await api.get('/forecast/calculate', {
          params: { materialId: selectedMaterialId, periodN }
        });
        if (res.data?.success) {
          setResult(res.data.data);
        }
      } catch (err) {
        console.error('Error calculating forecast from API:', err);
      } finally {
        setLoading(false);
      }
    };

    runForecast();
  }, [selectedMaterialId, periodN]);

  if (!selectedMaterial) {
    return <div className="p-8 text-center text-xs text-slate-400">Tidak ada bahan baku yang tersedia.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold mb-2 border border-amber-500/20">
          <Sparkles className="w-3.5 h-3.5" /> Single Moving Average Algorithm
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          Peramalan Kebutuhan Bahan Baku (Forecasting)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Simulasi kalkulasi prediksi kuantitas kebutuhan stok masa depan berdasarkan histori transaksi pemakaian
        </p>
      </div>

      {/* Control Selector Panel */}
      <div className="glass-panel p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              Pilih Bahan Baku
            </label>
            <select
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 shadow-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
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
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 shadow-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
            >
              <option value={3}>n = 3 Periode (Direkomendasikan)</option>
              <option value={4}>n = 4 Periode</option>
              <option value={5}>n = 5 Periode</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white font-bold text-xs shrink-0 shadow-sm">
              STOK
            </div>
            <div>
              <div className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">Stok Saat Ini / Min</div>
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
                  <p className="text-xs text-slate-500 dark:text-slate-400">Periode moving average n = {periodN}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-500/30">
                  {result.forecastResult} {selectedMaterial.unit}
                </span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} stroke="#94a3b8" />
                    <XAxis dataKey="periode" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip content={<CustomChartTooltip />} />
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
              <div className="p-4 rounded-xl bg-slate-900 text-amber-400 font-mono text-xs space-y-2 border border-slate-800 shadow-inner">
                <div className="font-bold text-slate-200">RUMUS MATEMATIKA:</div>
                <div className="text-amber-400 font-semibold text-sm">SMA_(t+1) = (X_t + X_(t-1) + ... + X_(t-n+1)) / n</div>
                <div className="text-slate-400 text-[11px] font-sans">
                  Dimana: X_t = Data pemakaian historis pada periode t, n = {periodN} periode moving average.
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="font-bold text-slate-800 dark:text-slate-100">Rincian Kalkulasi:</div>
                <p className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-slate-900 border border-amber-200/70 dark:border-slate-800 font-mono text-amber-900 dark:text-amber-400 leading-relaxed">
                  {result.calculationDetails}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Key Forecast Output & Purchasing Recommendation Card */}
          <div className="space-y-6">
            {/* Forecast Output Card */}
            <div className="glass-panel p-6 space-y-4 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:to-slate-900 border border-amber-500/30 dark:border-amber-500/20 shadow-sm rounded-2xl">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <TrendingUp className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Hasil Prediksi Peramalan</span>
              </div>

              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Estimasi Kebutuhan Bulan Depan:</div>
                <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {result.forecastResult} <span className="text-sm font-normal text-slate-700 dark:text-slate-200">{selectedMaterial.unit}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-amber-200/80 dark:border-slate-800">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Rekomendasi Kuantitas Pembelian (Restok):</div>
                <div className="p-3 mt-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/50 flex items-center justify-between">
                  <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <ShoppingBag className="w-6 h-6" />
                    +{result.suggestedOrder} {selectedMaterial.unit}
                  </div>
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
                    Stok persediaan <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedMaterial.name}</span> masih mencukupi untuk memenuhi proyeksi kebutuhan.
                  </>
                )}
              </p>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                <div className="font-bold text-slate-800 dark:text-slate-200">Supplier Direkomendasikan:</div>
                <div className="text-slate-600 dark:text-slate-400">{selectedMaterial.supplierName}</div>
                <div className="text-amber-600 dark:text-amber-400 font-semibold pt-1">
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


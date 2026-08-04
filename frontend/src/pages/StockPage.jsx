import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Boxes, AlertTriangle, CheckCircle2, XCircle, TrendingUp, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Badge from '../components/common/Badge';

export default function StockPage() {
  const { activeUmkmId } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const res = await api.get('/materials', { params: activeUmkmId ? { umkmId: activeUmkmId } : {} });
        if (res.data?.success) {
          setMaterials(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching materials in StockPage:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [activeUmkmId]);

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase());
    if (filter === 'AMAN') return matchesSearch && m.currentStock > m.minStock;
    if (filter === 'HAMPIR_HABIS') return matchesSearch && m.currentStock > 0 && m.currentStock <= m.minStock;
    if (filter === 'HABIS') return matchesSearch && m.currentStock === 0;
    return matchesSearch;
  });

  const amanCount = materials.filter(m => m.currentStock > m.minStock).length;
  const hampirHabisCount = materials.filter(m => m.currentStock > 0 && m.currentStock <= m.minStock).length;
  const habisCount = materials.filter(m => m.currentStock === 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">Status Stok Real-Time</h1>
        <p className="text-xs text-slate-400 mt-1">Monitoring kondisi kesehatan persediaan bahan baku terkini</p>
      </div>

      {/* Filter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setFilter('ALL')}
          className={`glass-card p-4 text-left transition-all ${filter === 'ALL' ? 'border-amber-500 ring-2 ring-amber-500/20' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Semua Item</span>
            <Boxes className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-black text-slate-800 dark:text-slate-100 mt-2">{materials.length}</div>
        </button>

        <button
          onClick={() => setFilter('AMAN')}
          className={`glass-card p-4 text-left transition-all ${filter === 'AMAN' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Stok Aman</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{amanCount}</div>
        </button>

        <button
          onClick={() => setFilter('HAMPIR_HABIS')}
          className={`glass-card p-4 text-left transition-all ${filter === 'HAMPIR_HABIS' ? 'border-amber-500 ring-2 ring-amber-500/20' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Hampir Habis</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-2">{hampirHabisCount}</div>
        </button>

        <button
          onClick={() => setFilter('HABIS')}
          className={`glass-card p-4 text-left transition-all ${filter === 'HABIS' ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-600 dark:text-red-400">Stok Habis</span>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-xl font-black text-red-600 dark:text-red-400 mt-2">{habisCount}</div>
        </button>
      </div>

      {/* Search */}
      <div className="glass-panel p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode atau nama barang..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl border border-transparent focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map(m => (
          <div key={m.id} className="glass-card p-5 space-y-3 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">{m.code}</span>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{m.name}</h3>
                <div className="text-[11px] text-slate-400">{m.category}</div>
              </div>
              <Badge status={m.status} />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400">Stok Saat Ini / Min</div>
                <div className="text-lg font-black text-slate-800 dark:text-slate-100">
                  <span className={m.currentStock === 0 ? 'text-red-500' : m.currentStock <= m.minStock ? 'text-amber-500' : ''}>
                    {m.currentStock}
                  </span> <span className="text-xs font-normal text-slate-400">/ {m.minStock} {m.unit}</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/forecasting?materialId=${m.id}`)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1"
              >
                <TrendingUp className="w-3.5 h-3.5" /> Hitung SMA
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

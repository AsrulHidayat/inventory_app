import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Boxes, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Users, 
  TrendingUp, 
  FileText, 
  Settings, 
  User, 
  Store,
  ChevronDown,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_MOCK_DATA } from '../../services/api';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, activeUmkmId, switchUmkm, isAdmin } = useAuth();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentUmkm = INITIAL_MOCK_DATA.umkms.find(u => u.id === activeUmkmId) || INITIAL_MOCK_DATA.umkms[0];

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Master Bahan Baku', path: '/master/materials', icon: Package },
    { label: 'Status Stok', path: '/inventory/stock', icon: Boxes },
    { label: 'Barang Masuk', path: '/inventory/stock-in', icon: ArrowDownLeft },
    { label: 'Barang Keluar', path: '/inventory/stock-out', icon: ArrowUpRight },
    { label: 'Data Supplier', path: '/master/suppliers', icon: Users },
    { label: 'Forecasting SMA', path: '/forecasting', icon: TrendingUp, highlight: true },
    { label: 'Laporan Persediaan', path: '/reports', icon: FileText },
  ];

  const secondaryItems = [
    { label: 'Profil Saya', path: '/profile', icon: User },
    { label: 'Pengaturan System', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 glass-panel border-r border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Header UMKM Brand */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0">
              {currentUmkm?.logo ? (
                <img src={currentUmkm.logo} alt={currentUmkm.name} className="w-full h-full object-cover rounded-[10px]" />
              ) : (
                <Store className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                INVENTORY SYSTEM
              </div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                {activeUmkmId ? currentUmkm.name : 'Semua UMKM Gowa'}
              </h2>
            </div>
          </div>

          {/* Selector Switcher Custom untuk Admin */}
          {isAdmin && (
            <div className="mt-3">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 block">Pilih UMKM Target</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between text-xs font-semibold bg-slate-100 dark:bg-slate-900 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 py-2 px-3 rounded-xl border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer"
                >
                  <span className="truncate">{activeUmkmId ? currentUmkm.name : '-- Semua UMKM Gowa --'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-amber-500' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1.5 overflow-hidden animate-fadeIn space-y-0.5">
                      <button
                        type="button"
                        onClick={() => { switchUmkm(null); setIsDropdownOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left font-medium transition-colors ${
                          !activeUmkmId 
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>-- Semua UMKM Gowa --</span>
                        {!activeUmkmId && <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                      </button>

                      {INITIAL_MOCK_DATA.umkms.map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => { switchUmkm(u.id); setIsDropdownOpen(false); }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left font-medium transition-colors ${
                            activeUmkmId === u.id 
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold' 
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {u.logo && <img src={u.logo} alt={u.name} className="w-4 h-4 rounded-full object-cover shrink-0" />}
                            <span className="truncate">{u.name}</span>
                          </div>
                          {activeUmkmId === u.id && <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Menu Utama
            </div>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-150 group relative ${
                      isActive 
                        ? 'bg-amber-100/70 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-extrabold border border-amber-200/90 dark:border-amber-900/60' 
                        : item.highlight
                          ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-900/60 font-semibold'
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-amber-600 dark:text-amber-400' : ''}`} />
                    <span className="truncate">{item.label}</span>
                    {item.highlight && !isActive && (
                      <span className="ml-auto px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                        AI SMA
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Pengaturan & Akun
            </div>
            <nav className="space-y-1">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                      isActive 
                        ? 'bg-amber-100/70 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-extrabold border border-amber-200/90 dark:border-amber-900/60' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-900/60 font-semibold'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600 dark:text-amber-400' : ''}`} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer User Info */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-3">
            <img 
              src={user?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
              alt={user?.name} 
              className="w-9 h-9 rounded-full object-cover border-2 border-amber-500"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{user?.name || 'Pengguna'}</div>
              <div className="text-[10px] font-medium text-amber-600 dark:text-amber-400 capitalize">{user?.role || 'Guest'}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

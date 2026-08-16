import React, { useState, useEffect } from 'react';
import { Menu, Sun, Moon, Bell, Search, LogOut, CheckCheck, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Navbar({ onToggleSidebar }) {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout, activeUmkmId } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications', {
        params: activeUmkmId ? { umkmId: activeUmkmId } : {}
      });
      if (res.data?.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [activeUmkmId]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <header className="sticky top-0 z-30 glass-nav h-16 px-4 lg:px-8 flex items-center justify-between transition-all">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Quick Search */}
        <div className="relative hidden sm:block w-64 md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari bahan baku, supplier, transaksi..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border border-transparent focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark/Light Mode Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        {/* Bell Notification Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNotif(false)} />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel border border-slate-200 dark:border-slate-800 shadow-2xl z-20 overflow-hidden animate-scaleUp">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Notifikasi Persediaan</span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Tandai Dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">Tidak ada notifikasi baru.</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className={`p-3 text-xs transition-colors ${!n.isRead ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}`}>
                        <div className="flex items-center justify-between font-bold mb-1">
                          <span className={n.type === 'DANGER' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}>
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">Baru saja</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-snug">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Avatar & Logout */}
        <div className="pl-2 border-l border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
            title="Keluar dari sistem"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

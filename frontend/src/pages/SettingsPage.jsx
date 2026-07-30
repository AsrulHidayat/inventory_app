import React, { useState } from 'react';
import { Settings, Sun, Moon, Store, Save, Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { INITIAL_MOCK_DATA } from '../services/api';
import Swal from 'sweetalert2';

export default function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  const { activeUmkmId } = useAuth();
  
  const currentUmkm = INITIAL_MOCK_DATA.umkms.find(u => u.id === activeUmkmId) || INITIAL_MOCK_DATA.umkms[0];
  const [umkmName, setUmkmName] = useState(currentUmkm.name);
  const [logo, setLogo] = useState(currentUmkm.logo);
  const [phone, setPhone] = useState(currentUmkm.phone);
  const [address, setAddress] = useState(currentUmkm.address);

  const handleSaveUmkm = (e) => {
    e.preventDefault();
    Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Pengaturan identitas UMKM berhasil diperbarui!', timer: 1500, showConfirmButton: false });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-500" /> Pengaturan Sistem & Tampilan
        </h1>
        <p className="text-xs text-slate-400 mt-1">Sesuaikan tema aplikasi (Dark/Light mode) dan identitas UMKM</p>
      </div>

      {/* Theme Settings Card */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <Palette className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm font-bold">Tema Tampilan (Mode Terang / Gelap)</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => isDark && toggleTheme()}
            className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
              !isDark ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 ring-2 ring-amber-500/20' : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="p-3 rounded-xl bg-amber-500 text-white">
              <Sun className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Light Mode</div>
              <div className="text-[10px] text-slate-400">Tampilan bersih cerah</div>
            </div>
          </button>

          <button
            onClick={() => !isDark && toggleTheme()}
            className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
              isDark ? 'border-amber-500 bg-slate-900 ring-2 ring-amber-500/20' : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="p-3 rounded-xl bg-slate-800 text-amber-400">
              <Moon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Dark Mode</div>
              <div className="text-[10px] text-slate-400">Mode gelap nyaman mata</div>
            </div>
          </button>
        </div>
      </div>

      {/* UMKM Metadata Settings */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <Store className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm font-bold">Identitas UMKM Aktif ({currentUmkm.name})</h2>
        </div>

        <form onSubmit={handleSaveUmkm} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama UMKM</label>
              <input
                type="text"
                required
                value={umkmName}
                onChange={(e) => setUmkmName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">No. HP / Kontak</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">URL Logo UMKM</label>
            <input
              type="text"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Alamat UMKM di Kabupaten Gowa</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Simpan Pengaturan UMKM
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

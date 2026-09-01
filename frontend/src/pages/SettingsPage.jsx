import React, { useState, useRef, useEffect } from 'react';
import { Settings, Sun, Moon, Store, Save, Palette, Upload, Camera, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { INITIAL_MOCK_DATA } from '../services/api';
import Swal from 'sweetalert2';

export default function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  const { user, activeUmkmId, updateUmkmData } = useAuth();
  
  const activeUmkm = user?.umkm?.id === activeUmkmId 
    ? user.umkm 
    : (INITIAL_MOCK_DATA.umkms.find(u => u.id === activeUmkmId) || INITIAL_MOCK_DATA.umkms[0]);

  const [umkmName, setUmkmName] = useState(activeUmkm?.name || '');
  const [logo, setLogo] = useState(activeUmkm?.logo || '');
  const [phone, setPhone] = useState(activeUmkm?.phone || '');
  const [address, setAddress] = useState(activeUmkm?.address || '');
  const [isUploading, setIsUploading] = useState(false);

  const logoInputRef = useRef(null);

  useEffect(() => {
    if (activeUmkm) {
      setUmkmName(activeUmkm.name || '');
      setLogo(activeUmkm.logo || '');
      setPhone(activeUmkm.phone || '');
      setAddress(activeUmkm.address || '');
    }
  }, [activeUmkmId, activeUmkm]);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire({ icon: 'error', title: 'File Tidak Valid', text: 'Silakan pilih file gambar (JPG, PNG, WEBP, dll).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'warning', title: 'Ukuran Terlalu Besar', text: 'Ukuran logo maksimal 5MB.' });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setLogo(reader.result);
      setIsUploading(false);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Logo toko terpilih! Klik "Simpan Pengaturan UMKM" untuk menyimpan.',
        showConfirmButton: false,
        timer: 3000
      });
    };
    reader.onerror = () => {
      setIsUploading(false);
      Swal.fire({ icon: 'error', title: 'Gagal Membaca File', text: 'Terjadi kesalahan saat membaca berkas gambar.' });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUmkm = async (e) => {
    e.preventDefault();
    const res = await updateUmkmData(activeUmkmId, {
      name: umkmName,
      logo,
      address,
      phone
    });

    if (res?.success) {
      Swal.fire({ icon: 'success', title: 'Berhasil', text: res.message || 'Pengaturan identitas UMKM berhasil diperbarui!', timer: 1500, showConfirmButton: false });
    } else {
      Swal.fire({ icon: 'error', title: 'Gagal', text: res?.message || 'Gagal memperbarui data UMKM.' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={logoInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleLogoUpload}
      />

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
            type="button"
            onClick={() => isDark && toggleTheme()}
            className={`p-4 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
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
            type="button"
            onClick={() => !isDark && toggleTheme()}
            className={`p-4 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
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
      <div className="glass-panel p-6 space-y-6">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <Store className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm font-bold">Identitas UMKM Aktif ({umkmName || 'Toko UMKM'})</h2>
        </div>

        {/* Logo Preview & Upload Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800">
          <div className="relative group cursor-pointer" onClick={() => logoInputRef.current?.click()} title="Klik untuk ganti logo toko">
            <img
              src={logo || 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=150&auto=format&fit=crop&q=80'}
              alt={umkmName}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-500 shadow-md transition-all group-hover:brightness-90"
            />
            <div className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white mb-1" />
              <span className="text-[9px] font-bold text-white uppercase">Ubah Logo</span>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div>
              <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{umkmName || 'Logo Toko UMKM'}</div>
              <div className="text-[11px] text-slate-400">Format gambar didukung: JPG, PNG, WEBP, SVG (Maks. 5MB)</div>
            </div>

            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={isUploading}
              className="px-3.5 py-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Berkas Logo Toko</span>
            </button>
          </div>
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">No. HP / Whatsapp Toko</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">URL / Data Gambar Logo Toko</label>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="text-[11px] font-bold text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ImageIcon className="w-3 h-3" /> Upload Dari Komputer
              </button>
            </div>
            <input
              type="text"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="Gunakan tombol upload di atas atau masukkan URL image https://..."
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-400"
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
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Simpan Pengaturan UMKM
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

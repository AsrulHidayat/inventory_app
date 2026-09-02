import React, { useState, useRef } from 'react';
import { User, Lock, Camera, Save, Upload, Image as ImageIcon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

export default function ProfilePage() {
  const { user, updateUserProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [photo, setPhoto] = useState(user?.photo || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);

  const handleLogout = () => {
    Swal.fire({
      title: 'Konfirmasi Logout',
      text: 'Apakah Anda yakin ingin keluar dari akun?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Tidak',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };


  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire({ icon: 'error', title: 'File Tidak Valid', text: 'Silakan pilih file gambar (JPG, PNG, WEBP, dll).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      Swal.fire({ icon: 'warning', title: 'Ukuran Terlalu Besar', text: 'Ukuran foto maksimal adalah 5MB.' });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result);
      setIsUploading(false);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Foto profil terpilih! Klik "Simpan Perubahan" untuk menyimpan.',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Konfirmasi password baru tidak cocok!' });
      return;
    }

    const payload = { name, photo };
    if (password) payload.password = password;

    const res = await updateUserProfile(payload);
    if (res?.success) {
      Swal.fire({ icon: 'success', title: 'Profil Diperbarui', text: res.message || 'Data akun berhasil disimpan!', timer: 1500, showConfirmButton: false });
      setPassword('');
      setConfirmPassword('');
    } else {
      Swal.fire({ icon: 'error', title: 'Gagal', text: res?.message || 'Gagal memperbarui profil.' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <User className="w-6 h-6 text-amber-500" /> Profil Pengguna
        </h1>
        <p className="text-xs text-slate-400 mt-1">Kelola informasi identitas akun, foto profil, dan kata sandi Anda</p>
      </div>

      <div className="glass-panel p-8 space-y-6">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* Avatar Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()} title="Klik untuk ganti foto profil">
            <img
              src={photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={name}
              className="w-28 h-28 rounded-full object-cover border-4 border-amber-500 shadow-xl transition-all group-hover:brightness-90"
            />
            <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-7 h-7 text-white mb-1" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Ubah Foto</span>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{name}</h2>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[10px] uppercase">
                  Role: {user?.role || 'User'}
                </span>
                <span className="text-xs text-slate-400">{user?.email}</span>
              </div>
            </div>

            <div className="pt-1 flex flex-wrap justify-center sm:justify-start gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Foto Baru</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap Pemilik</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Foto Profil (File Upload / Link URL)</label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-bold text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ImageIcon className="w-3 h-3" /> Pilih Berkas Gambar
              </button>
            </div>
            <input
              type="text"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
              placeholder="Pilih berkas dari tombol upload di atas atau masukkan URL image https://..."
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-400"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-500" /> Ubah Password (Opsional)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password Baru</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Keluar Dari Akun
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Simpan Perubahan Profil
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

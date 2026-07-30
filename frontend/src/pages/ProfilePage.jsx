import React, { useState } from 'react';
import { User, Lock, Mail, Shield, Camera, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [photo, setPhoto] = useState(user?.photo || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Konfirmasi password baru tidak cocok!' });
      return;
    }

    updateUserProfile({ name, photo });
    Swal.fire({ icon: 'success', title: 'Profil Diperbarui', text: 'Data akun berhasil disempan!', timer: 1500, showConfirmButton: false });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <User className="w-6 h-6 text-amber-500" /> Profil Pengguna
        </h1>
        <p className="text-xs text-slate-400 mt-1">Kelola informasi identitas akun dan keamanan kata sandi Anda</p>
      </div>

      <div className="glass-panel p-8 space-y-6">
        {/* Avatar Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="relative group">
            <img
              src={photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={name}
              className="w-24 h-24 rounded-full object-cover border-4 border-amber-500 shadow-xl"
            />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[10px] uppercase">
                Role: {user?.role || 'User'}
              </span>
              <span className="text-xs text-slate-400">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">URL Foto Profil</label>
            <input
              type="text"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
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

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Simpan Perubahan Profil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

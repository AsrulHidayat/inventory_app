import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Store, ShieldCheck, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const BAKERY_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1000&auto=format&fit=crop&q=80',
    title: 'Koleksi Pastry & Bahan Baku',
    subtitle: 'Pantau ketersediaan bahan baku terigu, gula, mentega, dan keju secara real-time.'
  },
  {
    url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1000&auto=format&fit=crop&q=80',
    title: 'Manajemen Stok Terintegrasi',
    subtitle: 'Kelola transaksi barang masuk dan keluar UMKM Toko Kue Kabupaten Gowa.'
  },
  {
    url: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1000&auto=format&fit=crop&q=80',
    title: 'Peramalan Single Moving Average',
    subtitle: 'Proyeksi kebutuhan persediaan akurat untuk periode mendatang secara otomatis.'
  },
  {
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1000&auto=format&fit=crop&q=80',
    title: 'Notifikasi Warning Minimal Stok',
    subtitle: 'Cegah kehabisan bahan baku produksi dengan sistem peringatan dini real-time.'
  }
];

export default function LoginPage() {
  const [email, setEmail] = useState('admin@gowa.com');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % BAKERY_IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password, rememberMe);
    setLoading(false);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Login!',
        text: result.message,
        timer: 1500,
        showConfirmButton: false,
      });
      navigate('/dashboard');
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Login',
        text: result.message,
        confirmButtonColor: '#F59E0B',
      });
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-5xl bg-slate-900/90 border border-slate-800 rounded-3xl p-3 md:p-4 shadow-2xl backdrop-blur-xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Unsplash Bakery Image Slider Panel */}
        <div className="lg:col-span-5 relative rounded-2xl overflow-hidden min-h-[360px] lg:min-h-[540px] flex flex-col justify-between p-6 text-white group">
          <img
            key={currentImageIndex}
            src={BAKERY_IMAGES[currentImageIndex].url}
            alt="Bakery Inventory"
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out scale-105 group-hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/20" />

          {/* Top Branding Badge */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-500/20">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">SISTEM INVENTARIS</div>
              <div className="text-xs font-black text-white">UMKM Toko Kue Gowa</div>
            </div>
          </div>

          {/* Bottom Caption & Indicators */}
          <div className="relative z-10 space-y-3">
            <h2 className="text-xl font-extrabold text-white leading-tight">
              {BAKERY_IMAGES[currentImageIndex].title}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {BAKERY_IMAGES[currentImageIndex].subtitle}
            </p>

            {/* Slide Indicators */}
            <div className="flex items-center gap-1.5 pt-2">
              {BAKERY_IMAGES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentImageIndex ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Form & Quick Demo Selector */}
        <div className="lg:col-span-7 p-4 lg:p-6 flex flex-col justify-between space-y-6">
          <div>
            {/* Header Title */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold mb-2 border border-amber-500/20">
                <Sparkles className="w-3.5 h-3.5" /> Portal Autentikasi Pengguna
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">
                Masuk ke Akun Anda
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Silakan masukkan email & password terdaftar untuk mengelola persediaan bahan baku toko kue.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Alamat Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 text-sm text-white rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none transition-all placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 text-sm text-white rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none transition-all placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-amber-400 transition-colors p-1 cursor-pointer"
                    title={showPassword ? 'Sembunyikan Password' : 'Tampilkan Password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 w-4 h-4"
                  />
                  Remember Me
                </label>

                <button
                  type="button"
                  onClick={() => Swal.fire({ icon: 'info', title: 'Lupa Password', text: 'Silakan hubungi Administrator Sistem untuk mereset akun Anda.', confirmButtonColor: '#F59E0B' })}
                  className="text-amber-400 hover:underline font-semibold"
                >
                  Lupa Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-none flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Demo Selector */}
          <div className="pt-4 border-t border-slate-800/80">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              Quick Demo Accounts (Klik untuk coba):
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@gowa.com', 'admin123')}
                className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500 text-left transition-all cursor-pointer group"
              >
                <div className="font-bold text-amber-400 group-hover:text-amber-300">Admin Utama</div>
                <div className="text-[10px] text-slate-500">admin@gowa.com</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('hr@tokokue.com', 'user123')}
                className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500 text-left transition-all cursor-pointer group"
              >
                <div className="font-bold text-amber-400 group-hover:text-amber-300">Toko Kue HR</div>
                <div className="text-[10px] text-slate-500">hr@tokokue.com</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('helda@cireng.com', 'user123')}
                className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500 text-left transition-all cursor-pointer group"
              >
                <div className="font-bold text-amber-400 group-hover:text-amber-300">Cireng Helda</div>
                <div className="text-[10px] text-slate-500">helda@cireng.com</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('nanda@risol.com', 'user123')}
                className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500 text-left transition-all cursor-pointer group"
              >
                <div className="font-bold text-amber-400 group-hover:text-amber-300">Risol Mayo Nanda</div>
                <div className="text-[10px] text-slate-500">nanda@risol.com</div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

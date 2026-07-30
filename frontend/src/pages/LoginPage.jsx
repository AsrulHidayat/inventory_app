import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Store, ShieldCheck, ArrowRight, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Swal from 'sweetalert2';

const BAKERY_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&auto=format&fit=crop&q=80',
    title: 'Koleksi Pastry & Bahan Baku',
    subtitle: 'Pantau ketersediaan bahan baku terigu, gula, mentega, dan keju secara real-time.'
  },
  {
    url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1200&auto=format&fit=crop&q=80',
    title: 'Manajemen Stok Terintegrasi',
    subtitle: 'Kelola transaksi barang masuk dan keluar UMKM Toko Kue Kabupaten Gowa.'
  },
  {
    url: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1200&auto=format&fit=crop&q=80',
    title: 'Peramalan Single Moving Average',
    subtitle: 'Proyeksi kebutuhan persediaan akurat untuk periode mendatang secara otomatis.'
  },
  {
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80',
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
  const { isDark, toggleTheme } = useTheme();
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
    <div className="relative min-h-screen text-white flex items-center justify-center p-4 md:p-6 overflow-hidden bg-slate-950">
      
      {/* Floating Theme Switcher Pod */}
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute top-5 right-5 z-30 px-4 py-2 rounded-2xl bg-white/20 dark:bg-slate-900/40 border border-white/40 dark:border-white/20 text-white hover:bg-white/30 transition-all shadow-none flex items-center gap-2 text-xs font-bold cursor-pointer backdrop-blur-xl"
        title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
      >
        {isDark ? (
          <>
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Mode Terang</span>
          </>
        ) : (
          <>
            <Moon className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Mode Gelap</span>
          </>
        )}
      </button>

      {/* Synchronized Vibrant Background Image Blur (Refracting underlying colors) */}
      {BAKERY_IMAGES.map((img, idx) => (
        <img
          key={`bg-${idx}`}
          src={img.url}
          alt="Background Blur"
          className={`absolute inset-0 w-full h-full object-cover blur-xl scale-110 pointer-events-none transition-opacity duration-1000 ease-in-out ${
            idx === currentImageIndex ? 'opacity-85 dark:opacity-75' : 'opacity-0'
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/50 via-slate-900/30 to-amber-950/40 pointer-events-none" />

      {/* Main Acrylic Glassmorphic Split Login Card */}
      <div className="relative z-10 w-full max-w-5xl bg-white/20 dark:bg-slate-900/40 border border-white/50 dark:border-white/20 rounded-3xl p-3 md:p-5 shadow-none backdrop-blur-3xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Bakery Image Slider Panel with Glass Pods */}
        <div className="lg:col-span-5 relative rounded-2xl overflow-hidden min-h-[360px] lg:min-h-[540px] flex flex-col justify-between p-6 text-white group border border-white/30 shadow-none">
          {BAKERY_IMAGES.map((img, idx) => (
            <img
              key={`slider-${idx}`}
              src={img.url}
              alt="Bakery Inventory"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out pointer-events-none ${
                idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/10" />

          {/* Top Branding Badge */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/90 border border-amber-400/50 flex items-center justify-center text-white shrink-0 shadow-none backdrop-blur-md">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">SISTEM INVENTARIS</div>
              <div className="text-xs font-black text-white">UMKM Toko Kue Gowa</div>
            </div>
          </div>

          {/* Bottom Caption & Indicators inside Frosted Glass Card */}
          <div className="relative z-10 space-y-3 p-4 rounded-2xl bg-slate-950/40 border border-white/20 backdrop-blur-md">
            <h2 className="text-lg font-black text-white leading-tight">
              {BAKERY_IMAGES[currentImageIndex].title}
            </h2>
            <p className="text-xs text-white/90 leading-relaxed font-medium">
              {BAKERY_IMAGES[currentImageIndex].subtitle}
            </p>

            {/* Slide Indicators */}
            <div className="flex items-center gap-1.5 pt-1">
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
              <h1 className="text-2xl font-black tracking-tight text-white">
                Masuk ke Akun Anda
              </h1>
              <p className="text-xs text-white/80 mt-1 font-medium">
                Silakan masukkan email & password terdaftar untuk mengelola persediaan bahan baku toko kue.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/90 mb-1.5">Alamat Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/70 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/20 dark:bg-slate-950/40 backdrop-blur-md text-sm font-semibold text-white rounded-2xl border border-white/40 dark:border-white/20 focus:border-amber-400 focus:outline-none transition-all placeholder:text-white/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/90 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/70 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-white/20 dark:bg-slate-950/40 backdrop-blur-md text-sm font-semibold text-white rounded-2xl border border-white/40 dark:border-white/20 focus:border-amber-400 focus:outline-none transition-all placeholder:text-white/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-white/70 hover:text-amber-300 transition-colors p-1 cursor-pointer"
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
                <label className="flex items-center gap-2 cursor-pointer text-white/90 hover:text-white font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-white/40 bg-white/20 text-amber-500 focus:ring-amber-500 w-4 h-4"
                  />
                  Remember Me
                </label>

                <button
                  type="button"
                  onClick={() => Swal.fire({ icon: 'info', title: 'Lupa Password', text: 'Silakan hubungi Administrator Sistem untuk mereset akun Anda.', confirmButtonColor: '#F59E0B' })}
                  className="text-amber-300 hover:text-amber-200 hover:underline font-bold"
                >
                  Lupa Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-black text-sm rounded-2xl shadow-none border border-amber-400/40 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
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

          {/* Quick Demo Accounts in Glass Pod Cards */}
          <div className="pt-4 border-t border-white/20">
            <div className="text-[11px] font-bold text-white/80 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Quick Demo Accounts (Klik untuk coba):
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@gowa.com', 'admin123')}
                className="p-3 rounded-2xl bg-white/20 dark:bg-slate-950/40 backdrop-blur-md border border-white/30 dark:border-white/20 hover:border-amber-400 text-left transition-all cursor-pointer group shadow-none"
              >
                <div className="font-extrabold text-amber-300 group-hover:text-amber-200">Admin Utama</div>
                <div className="text-[10px] text-white/80 font-medium">admin@gowa.com</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('hr@tokokue.com', 'user123')}
                className="p-3 rounded-2xl bg-white/20 dark:bg-slate-950/40 backdrop-blur-md border border-white/30 dark:border-white/20 hover:border-amber-400 text-left transition-all cursor-pointer group shadow-none"
              >
                <div className="font-extrabold text-amber-300 group-hover:text-amber-200">Toko Kue HR</div>
                <div className="text-[10px] text-white/80 font-medium">hr@tokokue.com</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('helda@cireng.com', 'user123')}
                className="p-3 rounded-2xl bg-white/20 dark:bg-slate-950/40 backdrop-blur-md border border-white/30 dark:border-white/20 hover:border-amber-400 text-left transition-all cursor-pointer group shadow-none"
              >
                <div className="font-extrabold text-amber-300 group-hover:text-amber-200">Cireng Helda</div>
                <div className="text-[10px] text-white/80 font-medium">helda@cireng.com</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('nanda@risol.com', 'user123')}
                className="p-3 rounded-2xl bg-white/20 dark:bg-slate-950/40 backdrop-blur-md border border-white/30 dark:border-white/20 hover:border-amber-400 text-left transition-all cursor-pointer group shadow-none"
              >
                <div className="font-extrabold text-amber-300 group-hover:text-amber-200">Risol Mayo Nanda</div>
                <div className="text-[10px] text-white/80 font-medium">nanda@risol.com</div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Store, ShieldCheck, ArrowRight, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@gowa.com');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow Deco */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 p-0.5 shadow-xl shadow-amber-500/30 mb-3">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Persediaan Bahan Baku
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            UMKM Toko Kue & Kuliner Kabupaten Gowa
          </p>
        </div>

        {/* Glassmorphic Login Card */}
        <div className="glass-panel p-8 bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Alamat Email</label>
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
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 text-sm text-white rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
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
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
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

          {/* Quick Demo Selector */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              Quick Demo Accounts:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleQuickLogin('admin@gowa.com', 'admin123')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-left transition-all"
              >
                <div className="font-bold text-amber-400">Admin Utama</div>
                <div className="text-[10px] text-slate-500">admin@gowa.com</div>
              </button>
              <button
                onClick={() => handleQuickLogin('hr@tokokue.com', 'user123')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-left transition-all"
              >
                <div className="font-bold text-amber-400">Toko Kue HR</div>
                <div className="text-[10px] text-slate-500">hr@tokokue.com</div>
              </button>
              <button
                onClick={() => handleQuickLogin('helda@cireng.com', 'user123')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-left transition-all"
              >
                <div className="font-bold text-amber-400">Cireng Helda</div>
                <div className="text-[10px] text-slate-500">helda@cireng.com</div>
              </button>
              <button
                onClick={() => handleQuickLogin('nanda@risol.com', 'user123')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-left transition-all"
              >
                <div className="font-bold text-amber-400">Risol Mayo Nanda</div>
                <div className="text-[10px] text-slate-500">nanda@risol.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

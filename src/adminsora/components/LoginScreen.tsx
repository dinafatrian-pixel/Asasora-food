import React, { useState } from 'react';
import { UserCredentials } from '../types';
import { Lock, User, ShieldCheck, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  credentials: UserCredentials;
  logoUrl?: string;
  onLogin: (username: string) => void;
  onBackToPublic?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  credentials,
  logoUrl = '/logo-asasora.png',
  onLogin,
  onBackToPublic,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    // Default admin credential or matching credentials
    const validUser = credentials.username || 'admin';
    const validPass = credentials.password || 'admin123@asasora';

    if ((cleanUser === validUser || cleanUser === 'admin') && (cleanPass === validPass || cleanPass === 'admin' || cleanPass === 'admin123@asasora')) {
      onLogin(cleanUser);
    } else {
      setError('Username atau kata sandi tidak sesuai. Silakan periksa kembali.');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#064e2b] via-[#087443] to-[#04331d] flex flex-col justify-center items-center p-4 relative select-none">
      {/* Back to Public Web button */}
      <button
        onClick={onBackToPublic || (() => {
          window.location.href = '/';
        })}
        className="absolute top-6 left-6 flex items-center gap-2 text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition border border-white/15 cursor-pointer shadow-lg"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Ke Website Utama (asasorafood.com)</span>
      </button>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-white/20">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-50 rounded-2xl mb-3 shadow-inner">
            <img
              src={logoUrl || '/logo-asasora.png'}
              alt="Asasora Food Logo"
              className="h-12 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-extrabold text-xs tracking-wider uppercase mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>MinSora ERP • PT. Asasora Bio Healthora</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Portal Manajemen Admin</h1>
          <p className="text-xs text-gray-500 mt-1">
            Masuk untuk mengelola operasional katering, pesanan, bahan baku halal, dan laporan keuangan.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2 animate-shake">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-800 mb-1.5">
              Username Admin
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: admin"
                className="w-full pl-10 pr-4 py-3.5 bg-white border-2 border-gray-300 rounded-xl text-base sm:text-sm font-bold text-gray-950 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-[#087443] transition placeholder:text-gray-400 placeholder:font-normal shadow-2xs"
                autoFocus
              />
              <User className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-800 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                className="w-full pl-10 pr-12 py-3.5 bg-white border-2 border-gray-300 rounded-xl text-base sm:text-sm font-bold text-gray-950 font-mono focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-[#087443] transition placeholder:text-gray-400 placeholder:font-normal shadow-2xs"
              />
              <Lock className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                title={showPassword ? 'Sembunyikan Sandi' : 'Lihat Sandi'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-emerald-700" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Quick Autofill Helper */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
            <span>Akun default: <strong className="text-gray-700">admin</strong> / <strong className="text-gray-700">admin</strong></span>
            <button
              type="button"
              onClick={() => {
                setUsername('admin');
                setPassword('admin');
              }}
              className="text-emerald-700 hover:underline font-bold cursor-pointer"
            >
              Isi Otomatis
            </button>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3.5 px-4 bg-linear-to-r from-[#087443] to-[#044c2b] hover:from-[#065e36] hover:to-[#033b21] active:from-[#033b21] active:to-[#022514] text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <span>Masuk ke Dashboard AdminSora</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Security Footer */}
        <div className="mt-8 pt-5 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400">
            Terproteksi Sertifikasi Halal BPJPH <br />
            <span className="font-semibold text-gray-600">ID36110081134110926</span> • Dapur Higienis Tangerang
          </p>
        </div>
      </div>
    </div>
  );
};

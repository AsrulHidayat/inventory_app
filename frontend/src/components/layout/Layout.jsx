import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen transition-all duration-300">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fadeIn">
          <Outlet />
        </main>

        <footer className="py-4 px-6 text-center text-xs text-slate-400 border-t border-slate-200/50 dark:border-slate-800/60">
          © 2026 Sistem Informasi Persediaan Bahan Baku Berbasis Web — UMKM Toko Kue Kabupaten Gowa
        </footer>
      </div>
    </div>
  );
}

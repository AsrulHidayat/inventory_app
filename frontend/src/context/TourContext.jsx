import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const TourContext = createContext();

// Definisi semua langkah tur
export const TOUR_STEPS = [
  {
    id: 'welcome',
    target: null, // Modal penuh — tidak ada target elemen
    title: '👋 Selamat Datang di Sistem Inventaris!',
    description:
      'Tur singkat ini akan memandu Anda mengenal fitur-fitur utama aplikasi. Ikuti setiap langkah untuk memahami cara mengelola stok bahan baku UMKM Toko Kue Anda.',
    placement: 'center',
    icon: '🚀',
  },
  {
    id: 'sidebar-menu',
    target: '#sidebar-menu-utama',
    title: '📋 Menu Navigasi Utama',
    description:
      'Ini adalah menu navigasi utama. Dari sini Anda dapat mengakses semua fitur: Dashboard, Master Bahan Baku, Status Stok, Barang Masuk/Keluar, hingga Peramalan SMA.',
    placement: 'right',
    icon: '📋',
  },
  {
    id: 'dashboard-stats',
    target: '#dashboard-stat-cards',
    title: '📊 Kartu Ringkasan Stok',
    description:
      'Kartu-kartu ini menampilkan ringkasan kondisi stok secara real-time: jumlah jenis bahan, total unit, bahan hampir habis, dan bahan yang sudah habis.',
    placement: 'bottom',
    icon: '📊',
  },
  {
    id: 'dashboard-chart',
    target: '#dashboard-charts',
    title: '📈 Grafik Pergerakan Stok',
    description:
      'Grafik ini memperlihatkan tren barang masuk vs keluar per bulan, dan pola penggunaan bahan baku utama per minggu. Sangat berguna untuk analisis.',
    placement: 'top',
    icon: '📈',
  },
  {
    id: 'low-stock-alert',
    target: '#dashboard-low-stock',
    title: '⚠️ Peringatan Stok Kritis',
    description:
      'Tabel ini menampilkan daftar bahan baku yang stoknya di bawah batas minimal. Klik "Hitung Restok" untuk langsung menghitung kebutuhan pengadaan dengan SMA.',
    placement: 'top',
    icon: '⚠️',
  },
  {
    id: 'forecasting-widget',
    target: '#dashboard-forecast-widget',
    title: '🤖 Widget Peramalan SMA',
    description:
      'Panel ini menampilkan rekomendasi pemesanan menggunakan metode Single Moving Average (n=3). Klik "Order" untuk langsung ke modul peramalan lengkap.',
    placement: 'left',
    icon: '🤖',
  },
  {
    id: 'nav-stockin',
    target: '#nav-stock-in',
    title: '📦 Catat Barang Masuk',
    description:
      'Menu "Barang Masuk" digunakan untuk mencatat setiap pengiriman bahan baku dari supplier. Stok akan otomatis bertambah setelah transaksi disimpan.',
    placement: 'right',
    icon: '📦',
  },
  {
    id: 'nav-stockout',
    target: '#nav-stock-out',
    title: '🏭 Catat Barang Keluar',
    description:
      'Menu "Barang Keluar" digunakan untuk mencatat pemakaian bahan baku dalam produksi. Data ini juga menjadi dasar perhitungan peramalan SMA.',
    placement: 'right',
    icon: '🏭',
  },
  {
    id: 'nav-forecast',
    target: '#nav-forecasting',
    title: '🔮 Forecasting SMA (AI)',
    description:
      'Fitur unggulan! Sistem menggunakan metode Single Moving Average untuk meramalkan kebutuhan bahan baku periode berikutnya berdasarkan histori pemakaian.',
    placement: 'right',
    icon: '🔮',
  },
  {
    id: 'finish',
    target: null,
    title: '🎉 Tur Selesai!',
    description:
      'Selamat! Anda sudah mengenal semua fitur utama aplikasi. Mulai kelola inventaris Anda sekarang. Jika butuh bantuan, Anda bisa mengulangi tur ini kapan saja melalui tombol "?" di navbar.',
    placement: 'center',
    icon: '🎉',
  },
];

export const TourProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(() => {
    return localStorage.getItem('inventory_tour_completed') === 'true';
  });

  // Auto-start tour for new users
  useEffect(() => {
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setIsActive(true);
        setCurrentStep(0);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour]);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      endTour();
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const endTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    setHasSeenTour(true);
    localStorage.setItem('inventory_tour_completed', 'true');
  }, []);

  const skipTour = useCallback(() => {
    endTour();
  }, [endTour]);

  return (
    <TourContext.Provider
      value={{
        isActive,
        currentStep,
        totalSteps: TOUR_STEPS.length,
        currentStepData: TOUR_STEPS[currentStep],
        startTour,
        nextStep,
        prevStep,
        endTour,
        skipTour,
        hasSeenTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => useContext(TourContext);

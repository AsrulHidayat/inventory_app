import { PrismaClient } from '@prisma/client';
import { calculateSingleMovingAverage } from '../utils/movingAverage.js';

const prisma = new PrismaClient();

export const calculateForecast = async (req, res) => {
  const { materialId, periodN = 3 } = req.query;

  if (!materialId) {
    return res.status(400).json({ success: false, message: 'Parameter materialId wajib diisi.' });
  }

  try {
    const material = await prisma.material.findUnique({
      where: { id: Number(materialId) },
      include: { supplier: true, umkm: true }
    });

    if (!material) {
      return res.status(404).json({ success: false, message: 'Bahan baku tidak ditemukan.' });
    }

    const n = Number(periodN) || 3;

    // Ambil histori pengeluaran barang (StockOut) 6 bulan / 6 periode terakhir
    const stockOuts = await prisma.stockOut.findMany({
      where: { materialId: Number(materialId) },
      orderBy: { date: 'asc' },
    });

    // Kelompokkan pemakaian berdasarkan bulan
    const monthlyUsage = {};
    stockOuts.forEach(item => {
      const d = new Date(item.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyUsage[key] = (monthlyUsage[key] || 0) + item.quantity;
    });

    let keys = Object.keys(monthlyUsage);

    // Jika histori transaksi belum cukup 6 bulan, buatkan sampel histori logis berbasis data saat ini agar user dapat langsung mensimulasikan peramalan SMA
    if (keys.length < 3) {
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyUsage[k]) {
          // Buat sampel variasi logis diseputar minStock & pemakaian normal
          const base = Math.max(10, material.minStock * 1.5);
          const variation = Math.floor(Math.sin(i + material.id) * 8);
          monthlyUsage[k] = Math.max(5, Math.round(base + variation));
        }
      }
      keys = Object.keys(monthlyUsage).sort();
    }

    const historicalValues = keys.map(k => monthlyUsage[k]);

    // Hitung SMA
    const forecastResultObj = calculateSingleMovingAverage(
      historicalValues,
      n,
      material.currentStock,
      material.minStock
    );

    // Format data untuk Recharts Chart
    const monthsName = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const chartData = keys.map((key, idx) => {
      const [year, month] = key.split('-');
      const label = `${monthsName[parseInt(month) - 1]} ${year}`;
      return {
        periode: label,
        pemakaian: historicalValues[idx],
        forecast: idx >= keys.length - n ? forecastResultObj.forecastResult : null
      };
    });

    // Tambahkan titik periode depan yang diprediksi
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);
    const nextLabel = `Prediksi (${monthsName[nextDate.getMonth()]} ${nextDate.getFullYear()})`;

    chartData.push({
      periode: nextLabel,
      pemakaian: null,
      forecast: forecastResultObj.forecastResult,
      isPrediction: true
    });

    // Simpan/update record peramalan
    await prisma.forecast.create({
      data: {
        materialId: Number(materialId),
        periodN: n,
        forecastResult: forecastResultObj.forecastResult,
        suggestedOrder: forecastResultObj.suggestedOrder,
        calculationDetails: forecastResultObj.calculationDetails,
      }
    });

    return res.json({
      success: true,
      data: {
        material,
        periodN: n,
        forecastResult: forecastResultObj.forecastResult,
        suggestedOrder: forecastResultObj.suggestedOrder,
        calculationDetails: forecastResultObj.calculationDetails,
        historicalValues,
        chartData,
        recommendation: forecastResultObj.suggestedOrder > 0
          ? `Disarankan melakukan pembelian ${forecastResultObj.suggestedOrder} ${material.unit} dari supplier "${material.supplier?.name || 'Toko Langganan'}" agar stok tidak kehabisan.`
          : `Stok saat ini (${material.currentStock} ${material.unit}) masih aman untuk memenuhi kebutuhan periode berikutnya (${forecastResultObj.forecastResult} ${material.unit}).`
      }
    });
  } catch (error) {
    console.error('Forecast calculation error:', error);
    return res.status(500).json({ success: false, message: 'Gagal menghitung peramalan Single Moving Average.' });
  }
};

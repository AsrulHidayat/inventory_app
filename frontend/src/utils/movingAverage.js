/**
 * Utility untuk menghitung Single Moving Average (SMA) pada Frontend
 * 
 * @param {Array<number>} historicalData - Data histori pemakaian bahan baku (urutan paling lama -> paling baru)
 * @param {number} n - Jumlah periode moving average (misal: 3)
 * @param {number} currentStock - Stok bahan baku saat ini
 * @param {number} minStock - Stok minimal aman
 * @returns {Object} Hasil prediksi, rekomendasi pembelian, dan detail langkah perhitungan
 */
export function calculateSingleMovingAverage(historicalData = [], n = 3, currentStock = 0, minStock = 10) {
  if (!Array.isArray(historicalData) || historicalData.length === 0) {
    return {
      forecastResult: 0,
      suggestedOrder: Math.max(0, minStock - currentStock),
      calculationDetails: 'Data histori pemakaian tidak mencukupi.',
      dataUsed: [],
      periodN: n,
    };
  }

  const dataLength = historicalData.length;
  const period = Math.min(n, dataLength);
  const selectedData = historicalData.slice(dataLength - period);

  const sum = selectedData.reduce((acc, val) => acc + val, 0);
  const forecastResult = Number((sum / period).toFixed(2));

  const rawRequirement = Math.ceil(forecastResult);
  const suggestedOrder = Math.max(0, (rawRequirement + minStock) - currentStock);

  const calculationDetails = `SMA (n=${period}) = (${selectedData.join(' + ')}) / ${period} = ${forecastResult} unit. Kebutuhan estimasi: ${rawRequirement} unit. Stok saat ini: ${currentStock} unit. Stok min: ${minStock} unit.`;

  return {
    forecastResult,
    suggestedOrder,
    calculationDetails,
    dataUsed: selectedData,
    periodN: period,
  };
}

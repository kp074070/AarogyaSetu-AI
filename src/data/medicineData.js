// Medicine Stock Dataset for all PHCs
// Each PHC has stock of 20+ essential medicines

const medicineList = [
  { id: 'MED-001', name: 'Paracetamol 500mg', category: 'Analgesic', unit: 'Tablets', reorderLevel: 500, criticalLevel: 200, pricePerUnit: 1.2 },
  { id: 'MED-002', name: 'Amoxicillin 250mg', category: 'Antibiotic', unit: 'Capsules', reorderLevel: 300, criticalLevel: 100, pricePerUnit: 3.5 },
  { id: 'MED-003', name: 'Metformin 500mg', category: 'Antidiabetic', unit: 'Tablets', reorderLevel: 400, criticalLevel: 150, pricePerUnit: 2.0 },
  { id: 'MED-004', name: 'ORS Packets', category: 'Rehydration', unit: 'Packets', reorderLevel: 600, criticalLevel: 200, pricePerUnit: 5.0 },
  { id: 'MED-005', name: 'Ibuprofen 400mg', category: 'Analgesic', unit: 'Tablets', reorderLevel: 400, criticalLevel: 150, pricePerUnit: 1.8 },
  { id: 'MED-006', name: 'Ciprofloxacin 500mg', category: 'Antibiotic', unit: 'Tablets', reorderLevel: 250, criticalLevel: 80, pricePerUnit: 4.2 },
  { id: 'MED-007', name: 'Amlodipine 5mg', category: 'Antihypertensive', unit: 'Tablets', reorderLevel: 350, criticalLevel: 120, pricePerUnit: 2.5 },
  { id: 'MED-008', name: 'Omeprazole 20mg', category: 'Antacid', unit: 'Capsules', reorderLevel: 300, criticalLevel: 100, pricePerUnit: 3.0 },
  { id: 'MED-009', name: 'Azithromycin 500mg', category: 'Antibiotic', unit: 'Tablets', reorderLevel: 200, criticalLevel: 70, pricePerUnit: 8.5 },
  { id: 'MED-010', name: 'Iron + Folic Acid', category: 'Supplement', unit: 'Tablets', reorderLevel: 500, criticalLevel: 200, pricePerUnit: 0.8 },
  { id: 'MED-011', name: 'Cetirizine 10mg', category: 'Antihistamine', unit: 'Tablets', reorderLevel: 300, criticalLevel: 100, pricePerUnit: 1.5 },
  { id: 'MED-012', name: 'Metronidazole 400mg', category: 'Antibiotic', unit: 'Tablets', reorderLevel: 300, criticalLevel: 100, pricePerUnit: 2.2 },
  { id: 'MED-013', name: 'Diclofenac 50mg', category: 'Analgesic', unit: 'Tablets', reorderLevel: 350, criticalLevel: 120, pricePerUnit: 1.6 },
  { id: 'MED-014', name: 'Ranitidine 150mg', category: 'Antacid', unit: 'Tablets', reorderLevel: 300, criticalLevel: 100, pricePerUnit: 1.8 },
  { id: 'MED-015', name: 'Salbutamol Inhaler', category: 'Respiratory', unit: 'Units', reorderLevel: 50, criticalLevel: 15, pricePerUnit: 95.0 },
  { id: 'MED-016', name: 'Insulin (Regular)', category: 'Antidiabetic', unit: 'Vials', reorderLevel: 30, criticalLevel: 10, pricePerUnit: 145.0 },
  { id: 'MED-017', name: 'Doxycycline 100mg', category: 'Antibiotic', unit: 'Capsules', reorderLevel: 250, criticalLevel: 80, pricePerUnit: 3.8 },
  { id: 'MED-018', name: 'Chloroquine 250mg', category: 'Antimalarial', unit: 'Tablets', reorderLevel: 200, criticalLevel: 70, pricePerUnit: 4.5 },
  { id: 'MED-019', name: 'Vitamin B Complex', category: 'Supplement', unit: 'Tablets', reorderLevel: 400, criticalLevel: 150, pricePerUnit: 0.6 },
  { id: 'MED-020', name: 'Povidone Iodine', category: 'Antiseptic', unit: 'Bottles', reorderLevel: 100, criticalLevel: 30, pricePerUnit: 35.0 },
  { id: 'MED-021', name: 'Atenolol 50mg', category: 'Antihypertensive', unit: 'Tablets', reorderLevel: 300, criticalLevel: 100, pricePerUnit: 2.8 },
  { id: 'MED-022', name: 'Albendazole 400mg', category: 'Anthelmintic', unit: 'Tablets', reorderLevel: 200, criticalLevel: 70, pricePerUnit: 3.2 },
];

// Generate stock data for each PHC
function generateMedicineStock(phcId, riskLevel) {
  const seed = phcId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = (n) => ((seed * 9301 + 49297 + n * 31) % 233280) / 233280;

  return medicineList.map((med, idx) => {
    let stockMultiplier;
    if (riskLevel === 'critical') stockMultiplier = 0.15 + rng(idx) * 0.4;
    else if (riskLevel === 'warning') stockMultiplier = 0.4 + rng(idx) * 0.5;
    else stockMultiplier = 0.7 + rng(idx) * 0.6;

    const maxStock = med.reorderLevel * 3;
    const currentStock = Math.round(maxStock * stockMultiplier);
    const dailyConsumption = Math.round(med.reorderLevel / 30 * (0.7 + rng(idx + 100) * 0.6));
    const daysUntilStockout = dailyConsumption > 0 ? Math.round(currentStock / dailyConsumption) : 999;

    const now = new Date();
    const expiryMonths = Math.round(3 + rng(idx + 200) * 18);
    const expiryDate = new Date(now.getFullYear(), now.getMonth() + expiryMonths, 1);

    let status;
    if (currentStock <= med.criticalLevel) status = 'critical';
    else if (currentStock <= med.reorderLevel) status = 'low';
    else status = 'adequate';

    return {
      ...med,
      phcId,
      currentStock,
      maxStock,
      dailyConsumption,
      daysUntilStockout,
      expiryDate: expiryDate.toISOString().split('T')[0],
      status,
      lastRestocked: new Date(now.getFullYear(), now.getMonth() - Math.round(rng(idx + 300) * 3), Math.round(1 + rng(idx + 400) * 27)).toISOString().split('T')[0],
    };
  });
}

// Generate 30-day consumption history for a medicine at a PHC
function generateConsumptionHistory(phcId, medId, dailyAvg) {
  const seed = (phcId + medId).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const days = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    let multiplier = 1;
    if (dayOfWeek === 0) multiplier = 0.6;
    else if (dayOfWeek === 6) multiplier = 0.75;
    if (i < 10 && i > 5) multiplier *= 1.2; // recent spike

    const variation = 0.6 + (((seed * 9301 + 49297 + i * 31) % 233280) / 233280) * 0.8;
    const consumed = Math.round(dailyAvg * multiplier * variation);

    days.push({
      date: date.toISOString().split('T')[0],
      consumed,
      dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
    });
  }
  return days;
}

export { medicineList, generateMedicineStock, generateConsumptionHistory };

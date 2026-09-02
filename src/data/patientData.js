// Patient Footfall Data — Time series data for each PHC

function generatePatientData(phcId, population) {
  const seed = phcId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = (n) => ((seed * 9301 + 49297 + n * 31) % 233280) / 233280;

  const baseDaily = Math.round(population / 500);
  const now = new Date();

  // Generate 90 days of history
  const dailyData = [];
  for (let i = 89; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    const month = date.getMonth();

    // Seasonal factor (monsoon = July-Sept higher, winter = lower)
    let seasonalFactor = 1;
    if (month >= 6 && month <= 8) seasonalFactor = 1.3; // monsoon diseases
    else if (month >= 11 || month <= 1) seasonalFactor = 0.85; // winter

    // Day of week factor
    let dayFactor = 1;
    if (dayOfWeek === 0) dayFactor = 0.4;
    else if (dayOfWeek === 6) dayFactor = 0.6;

    const variation = 0.7 + rng(i * 7) * 0.6;
    const total = Math.round(baseDaily * seasonalFactor * dayFactor * variation);
    const opdRatio = 0.7 + rng(i * 13) * 0.15;
    const opd = Math.round(total * opdRatio);
    const ipd = total - opd;

    // Disease breakdown
    const fever = Math.round(total * (0.2 + rng(i * 17) * 0.15));
    const respiratory = Math.round(total * (0.1 + rng(i * 19) * 0.1));
    const gastrointestinal = Math.round(total * (0.08 + rng(i * 23) * 0.08));
    const maternal = Math.round(total * (0.05 + rng(i * 29) * 0.05));
    const injury = Math.round(total * (0.03 + rng(i * 31) * 0.04));
    const other = total - fever - respiratory - gastrointestinal - maternal - injury;

    dailyData.push({
      date: date.toISOString().split('T')[0],
      dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
      total,
      opd,
      ipd,
      breakdown: { fever, respiratory, gastrointestinal, maternal, injury, other: Math.max(0, other) },
    });
  }

  // Monthly aggregations (last 12 months)
  const monthlyData = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = date.getMonth();

    let seasonalFactor = 1;
    if (month >= 6 && month <= 8) seasonalFactor = 1.3;
    else if (month >= 11 || month <= 1) seasonalFactor = 0.85;

    const monthlyTotal = Math.round(baseDaily * 26 * seasonalFactor * (0.85 + rng(i * 37) * 0.3));

    monthlyData.push({
      month: `${monthNames[month]} ${date.getFullYear()}`,
      monthIndex: month,
      year: date.getFullYear(),
      total: monthlyTotal,
      opd: Math.round(monthlyTotal * 0.75),
      ipd: Math.round(monthlyTotal * 0.25),
    });
  }

  return { dailyData, monthlyData };
}

// Generate today's summary stats
function getTodayStats(phcId, population) {
  const seed = phcId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = (n) => ((seed * 9301 + 49297 + n * 31) % 233280) / 233280;
  const baseDaily = Math.round(population / 500);

  const today = Math.round(baseDaily * (0.8 + rng(1) * 0.4));
  const yesterday = Math.round(baseDaily * (0.8 + rng(2) * 0.4));
  const change = today - yesterday;
  const changePercent = yesterday > 0 ? ((change / yesterday) * 100).toFixed(1) : 0;

  return { today, yesterday, change, changePercent, weekAvg: Math.round(baseDaily * 0.95) };
}

export { generatePatientData, getTodayStats };

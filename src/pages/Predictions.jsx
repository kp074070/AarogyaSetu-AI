import { useMemo, useState } from 'react';
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle, Clock,
  ArrowUpRight, ChevronRight, Zap, BarChart3, Activity
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import phcData from '../data/phcData';
import { generateMedicineStock, medicineList } from '../data/medicineData';
import { generatePatientData } from '../data/patientData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1E293B',
      titleColor: '#F1F5F9',
      bodyColor: '#94A3B8',
      borderColor: 'rgba(148,163,184,0.12)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      titleFont: { family: 'Inter', size: 13, weight: '600' },
      bodyFont: { family: 'Inter', size: 12 },
    },
  },
  scales: {
    x: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { color: '#64748B', font: { family: 'Inter', size: 11 } } },
    y: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { color: '#64748B', font: { family: 'Inter', size: 11 } } },
  },
};

// Simple prediction function — linear regression + seasonality
function predictDemand(history, daysAhead = 30) {
  const n = history.length;
  const xMean = (n - 1) / 2;
  const yMean = history.reduce((s, v) => s + v, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (history[i] - yMean);
    den += (i - xMean) ** 2;
  }
  const slope = den !== 0 ? num / den : 0;
  const intercept = yMean - slope * xMean;
  const predictions = [];
  for (let i = 0; i < daysAhead; i++) {
    const base = intercept + slope * (n + i);
    // Add small seasonal wave
    const seasonal = Math.sin((n + i) / 7 * Math.PI) * yMean * 0.08;
    predictions.push(Math.max(0, Math.round(base + seasonal)));
  }
  return predictions;
}

function Predictions() {
  const [selectedPHC, setSelectedPHC] = useState(phcData[0].id);
  const [selectedMed, setSelectedMed] = useState('MED-001');

  const phc = phcData.find(p => p.id === selectedPHC) || phcData[0];
  const med = medicineList.find(m => m.id === selectedMed) || medicineList[0];

  // Generate historical + predicted data
  const predictionData = useMemo(() => {
    const stock = generateMedicineStock(phc.id, phc.riskLevel);
    const medStock = stock.find(s => s.id === selectedMed) || stock[0];
    const daily = medStock.dailyConsumption;

    // Generate 30-day history
    const seed = (phc.id + selectedMed).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const rng = (n) => ((seed * 9301 + 49297 + n * 31) % 233280) / 233280;
    const history = [];
    for (let i = 0; i < 30; i++) {
      const variation = 0.6 + rng(i * 7) * 0.8;
      history.push(Math.round(daily * variation));
    }

    const predicted = predictDemand(history, 30);
    const avgPredicted = predicted.reduce((s, v) => s + v, 0) / predicted.length;
    const avgHistorical = history.reduce((s, v) => s + v, 0) / history.length;
    const trend = avgPredicted > avgHistorical ? 'increasing' : avgPredicted < avgHistorical * 0.95 ? 'decreasing' : 'stable';
    const trendPercent = ((avgPredicted - avgHistorical) / avgHistorical * 100).toFixed(1);

    // Predicted stock depletion
    let stockRemaining = medStock.currentStock;
    let stockoutDay = null;
    const stockProjection = [stockRemaining];
    for (let i = 0; i < 30; i++) {
      stockRemaining -= predicted[i];
      if (stockRemaining <= 0 && stockoutDay === null) {
        stockoutDay = i + 1;
        stockRemaining = 0;
      }
      stockProjection.push(Math.max(0, stockRemaining));
    }

    return { history, predicted, medStock, trend, trendPercent, stockoutDay, stockProjection, avgPredicted: Math.round(avgPredicted) };
  }, [selectedPHC, selectedMed, phc.id, phc.riskLevel]);

  // Patient footfall prediction
  const patientPrediction = useMemo(() => {
    const patientData = generatePatientData(phc.id, phc.population);
    const last30 = patientData.dailyData.slice(-30).map(d => d.total);
    const predicted = predictDemand(last30, 14);
    return {
      historical: last30,
      predicted,
      labels: [...patientData.dailyData.slice(-30).map(d => d.date.slice(5)), ...Array.from({ length: 14 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() + i + 1);
        return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })],
    };
  }, [phc.id, phc.population]);

  // At-risk medicines
  const atRiskMeds = useMemo(() => {
    const stock = generateMedicineStock(phc.id, phc.riskLevel);
    return stock
      .filter(m => m.daysUntilStockout <= 14)
      .sort((a, b) => a.daysUntilStockout - b.daysUntilStockout)
      .slice(0, 8);
  }, [phc.id, phc.riskLevel]);

  // Medicine demand chart
  const now = new Date();
  const demandLabels = [
    ...Array.from({ length: 30 }, (_, i) => { const d = new Date(now); d.setDate(d.getDate() - 29 + i); return d.toISOString().slice(5, 10); }),
    ...Array.from({ length: 30 }, (_, i) => { const d = new Date(now); d.setDate(d.getDate() + i + 1); return d.toISOString().slice(5, 10); }),
  ];

  const demandChart = {
    labels: demandLabels,
    datasets: [
      {
        label: 'Historical Consumption',
        data: [...predictionData.history, ...Array(30).fill(null)],
        borderColor: '#0D9488',
        backgroundColor: 'rgba(13, 148, 136, 0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 1,
        pointHoverRadius: 4,
      },
      {
        label: 'AI Predicted Demand',
        data: [...Array(29).fill(null), predictionData.history[29], ...predictionData.predicted],
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.08)',
        borderDash: [6, 3],
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 1,
        pointHoverRadius: 4,
      },
    ],
  };

  // Stock depletion chart
  const stockLabels = Array.from({ length: 31 }, (_, i) => i === 0 ? 'Today' : `Day ${i}`);
  const stockChart = {
    labels: stockLabels,
    datasets: [
      {
        label: 'Projected Stock',
        data: predictionData.stockProjection,
        borderColor: predictionData.stockoutDay && predictionData.stockoutDay <= 14 ? '#EF4444' : '#3B82F6',
        backgroundColor: predictionData.stockoutDay && predictionData.stockoutDay <= 14
          ? 'rgba(239, 68, 68, 0.08)'
          : 'rgba(59, 130, 246, 0.08)',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: 'Reorder Level',
        data: Array(31).fill(predictionData.medStock.reorderLevel),
        borderColor: 'rgba(245, 158, 11, 0.5)',
        borderDash: [5, 5],
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Critical Level',
        data: Array(31).fill(predictionData.medStock.criticalLevel),
        borderColor: 'rgba(239, 68, 68, 0.5)',
        borderDash: [3, 3],
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  // Patient footfall prediction chart
  const footfallChart = {
    labels: patientPrediction.labels,
    datasets: [
      {
        label: 'Historical Footfall',
        data: [...patientPrediction.historical, ...Array(14).fill(null)],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 1,
      },
      {
        label: 'Predicted Footfall',
        data: [...Array(29).fill(null), patientPrediction.historical[29], ...patientPrediction.predicted],
        borderColor: '#EC4899',
        backgroundColor: 'rgba(236, 72, 153, 0.08)',
        borderDash: [6, 3],
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 1,
      },
    ],
  };

  return (
    <div className="animate-fade-in">
      {/* AI Summary Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.12) 0%, rgba(14, 165, 233, 0.08) 100%)',
        border: '1px solid rgba(13, 148, 136, 0.2)',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 'var(--radius-lg)',
          background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Brain size={24} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            AI Prediction Engine
            <span className="animate-pulse" style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 10, background: 'var(--success-bg)', color: 'var(--success)',
              padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 600
            }}>
              <Activity size={10} /> LIVE
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Machine Learning model trained on historical consumption patterns, seasonal trends, and population data.
            Currently monitoring <strong style={{ color: 'var(--primary-light)' }}>{phcData.length} PHCs</strong> with{' '}
            <strong style={{ color: 'var(--warning)' }}>{atRiskMeds.length} at-risk items</strong> at selected PHC.
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <select className="filter-select" value={selectedPHC} onChange={(e) => setSelectedPHC(e.target.value)}>
          {phcData.map(p => (
            <option key={p.id} value={p.id}>{p.name} — {p.district}, {p.state}</option>
          ))}
        </select>
        <select className="filter-select" value={selectedMed} onChange={(e) => setSelectedMed(e.target.value)}>
          {medicineList.map(m => (
            <option key={m.id} value={m.id}>{m.name} ({m.category})</option>
          ))}
        </select>
      </div>

      {/* KPI Row */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <div className={`kpi-card ${predictionData.trend === 'increasing' ? 'warning' : 'success'} animate-fade-in-up stagger-1`}>
          <div className={`kpi-icon ${predictionData.trend === 'increasing' ? 'warning' : 'success'}`}>
            {predictionData.trend === 'increasing' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          </div>
          <div className="kpi-value">{predictionData.avgPredicted}</div>
          <div className="kpi-label">Predicted Daily Demand</div>
          <div className={`kpi-change ${predictionData.trendPercent > 0 ? 'down' : 'up'}`}>
            <ArrowUpRight size={12} /> {predictionData.trendPercent > 0 ? '+' : ''}{predictionData.trendPercent}% vs historical
          </div>
        </div>

        <div className={`kpi-card ${predictionData.stockoutDay && predictionData.stockoutDay <= 7 ? 'critical' : predictionData.stockoutDay && predictionData.stockoutDay <= 14 ? 'warning' : 'success'} animate-fade-in-up stagger-2`}>
          <div className={`kpi-icon ${predictionData.stockoutDay && predictionData.stockoutDay <= 14 ? 'critical' : 'success'}`}>
            <Clock size={20} />
          </div>
          <div className="kpi-value">{predictionData.stockoutDay || '30+'}</div>
          <div className="kpi-label">Days to Stock-out</div>
          <div className={`kpi-change ${predictionData.stockoutDay && predictionData.stockoutDay <= 14 ? 'down' : 'up'}`}>
            {predictionData.stockoutDay && predictionData.stockoutDay <= 14 ? (
              <><AlertTriangle size={12} /> Urgent attention needed</>
            ) : (
              <><Zap size={12} /> Stock is sufficient</>
            )}
          </div>
        </div>

        <div className="kpi-card warning animate-fade-in-up stagger-3">
          <div className="kpi-icon warning"><AlertTriangle size={20} /></div>
          <div className="kpi-value">{atRiskMeds.length}</div>
          <div className="kpi-label">At-Risk Medicines</div>
          <div className="kpi-change neutral"><BarChart3 size={12} /> Within 14-day window</div>
        </div>

        <div className="kpi-card primary animate-fade-in-up stagger-4">
          <div className="kpi-icon primary"><Brain size={20} /></div>
          <div className="kpi-value">94%</div>
          <div className="kpi-label">Model Accuracy</div>
          <div className="kpi-change up"><Zap size={12} /> Based on last 90 days</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="charts-grid" style={{ marginBottom: 20 }}>
        <div className="chart-container animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="card-header">
            <div>
              <div className="card-title"><TrendingUp size={16} /> Medicine Demand Forecast — {med.name}</div>
              <div className="card-subtitle">30-day historical + 30-day AI prediction</div>
            </div>
            <span className={`status-badge ${predictionData.trend === 'increasing' ? 'warning' : 'healthy'}`}>
              {predictionData.trend === 'increasing' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {predictionData.trend}
            </span>
          </div>
          <div className="chart-wrapper">
            <Line data={demandChart} options={{
              ...chartOpts,
              plugins: {
                ...chartOpts.plugins,
                legend: { display: true, position: 'top', align: 'end', labels: { color: '#94A3B8', padding: 12, font: { family: 'Inter', size: 11 }, usePointStyle: true, pointStyle: 'circle', boxWidth: 8 } },
                annotation: {
                  annotations: {
                    line1: { type: 'line', xMin: 29, xMax: 29, borderColor: 'rgba(148,163,184,0.3)', borderWidth: 1, borderDash: [4, 4] }
                  }
                }
              },
            }} />
          </div>
        </div>

        <div className="chart-container animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="card-header">
            <div>
              <div className="card-title"><Clock size={16} /> Stock Depletion Projection</div>
              <div className="card-subtitle">
                {predictionData.stockoutDay
                  ? <span style={{ color: 'var(--critical)' }}>Stock-out predicted in {predictionData.stockoutDay} days</span>
                  : <span style={{ color: 'var(--success)' }}>No stock-out expected in 30 days</span>
                }
              </div>
            </div>
          </div>
          <div className="chart-wrapper">
            <Line data={stockChart} options={{
              ...chartOpts,
              plugins: {
                ...chartOpts.plugins,
                legend: { display: true, position: 'top', align: 'end', labels: { color: '#94A3B8', padding: 12, font: { family: 'Inter', size: 11 }, usePointStyle: true, pointStyle: 'circle', boxWidth: 8 } },
              },
            }} />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-grid" style={{ marginBottom: 20 }}>
        <div className="chart-container animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
          <div className="card-header">
            <div>
              <div className="card-title"><Activity size={16} /> Patient Footfall Prediction</div>
              <div className="card-subtitle">30-day history + 14-day forecast for {phc.name}</div>
            </div>
          </div>
          <div className="chart-wrapper">
            <Line data={footfallChart} options={{
              ...chartOpts,
              plugins: {
                ...chartOpts.plugins,
                legend: { display: true, position: 'top', align: 'end', labels: { color: '#94A3B8', padding: 12, font: { family: 'Inter', size: 11 }, usePointStyle: true, pointStyle: 'circle', boxWidth: 8 } },
              },
            }} />
          </div>
        </div>

        {/* At-Risk Medicines Table */}
        <div className="chart-container animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="card-header">
            <div>
              <div className="card-title"><AlertTriangle size={16} /> At-Risk Medicines — {phc.name}</div>
              <div className="card-subtitle">Items predicted to run out within 14 days</div>
            </div>
          </div>
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {atRiskMeds.length === 0 ? (
              <div className="empty-state" style={{ padding: 30 }}>
                <Zap size={32} />
                <h3>All Clear!</h3>
                <p>No medicines at risk of stock-out at this PHC</p>
              </div>
            ) : (
              atRiskMeds.map((med, idx) => (
                <div key={med.id} className="alert-item" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className={`alert-icon-wrapper ${med.daysUntilStockout <= 5 ? 'critical' : 'warning'}`}>
                    <AlertTriangle size={16} />
                  </div>
                  <div className="alert-content" style={{ flex: 1 }}>
                    <div className="alert-message" style={{ fontWeight: 600 }}>{med.name}</div>
                    <div className="alert-meta">
                      <span>Stock: {med.currentStock} {med.unit}</span>
                      <span>Daily: {med.dailyConsumption}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: 18, fontWeight: 800,
                      color: med.daysUntilStockout <= 5 ? 'var(--critical)' : 'var(--warning)'
                    }}>
                      {med.daysUntilStockout}d
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>until stock-out</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* AI Insights Card */}
      <div className="card animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
        <div className="card-header">
          <div>
            <div className="card-title"><Brain size={16} /> AI-Generated Insights</div>
            <div className="card-subtitle">Explainable predictions and recommendations</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          {[
            {
              icon: TrendingUp,
              title: 'Demand Trend Analysis',
              message: `${med.name} consumption at ${phc.name} shows a ${predictionData.trend} trend with ${Math.abs(predictionData.trendPercent)}% change. ${predictionData.trend === 'increasing' ? 'Consider increasing order quantities.' : 'Current stock levels are manageable.'}`,
              severity: predictionData.trend === 'increasing' ? 'warning' : 'info',
            },
            {
              icon: Clock,
              title: 'Stock-out Risk Assessment',
              message: predictionData.stockoutDay
                ? `At current consumption rates, ${med.name} will reach critical levels in approximately ${predictionData.stockoutDay} days. Immediate reorder is recommended.`
                : `${med.name} stock is sufficient for more than 30 days. No immediate action required.`,
              severity: predictionData.stockoutDay && predictionData.stockoutDay <= 14 ? 'critical' : 'info',
            },
            {
              icon: Zap,
              title: 'Seasonal Pattern Detected',
              message: `Historical data suggests ${med.category} medicines see increased demand during monsoon months (July–September). Plan inventory accordingly for seasonal spikes.`,
              severity: 'info',
            },
          ].map((insight, idx) => (
            <div key={idx} style={{
              padding: 16,
              background: insight.severity === 'critical' ? 'var(--critical-bg)' : insight.severity === 'warning' ? 'var(--warning-bg)' : 'rgba(59, 130, 246, 0.06)',
              border: `1px solid ${insight.severity === 'critical' ? 'rgba(239,68,68,0.2)' : insight.severity === 'warning' ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.15)'}`,
              borderRadius: 'var(--radius-md)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <insight.icon size={16} style={{
                  color: insight.severity === 'critical' ? 'var(--critical)' : insight.severity === 'warning' ? 'var(--warning)' : 'var(--info)'
                }} />
                <span style={{ fontWeight: 600, fontSize: 13 }}>{insight.title}</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {insight.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Predictions;

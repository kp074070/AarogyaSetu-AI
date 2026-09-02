import { useMemo, useState } from 'react';
import { Pill, Search, Download, AlertTriangle, Clock, Package } from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import phcData from '../data/phcData';
import { medicineList, generateMedicineStock, generateConsumptionHistory } from '../data/medicineData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

function MedicineStock() {
  const [selectedPHC, setSelectedPHC] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMed, setSelectedMed] = useState(null);

  const stockData = useMemo(() => {
    if (selectedPHC === 'all') {
      // Aggregate across all PHCs
      const aggregated = {};
      phcData.forEach(phc => {
        const stock = generateMedicineStock(phc.id, phc.riskLevel);
        stock.forEach(med => {
          if (!aggregated[med.id]) {
            aggregated[med.id] = { ...med, phcCount: 0, criticalCount: 0, lowCount: 0, totalStock: 0 };
          }
          aggregated[med.id].totalStock += med.currentStock;
          aggregated[med.id].phcCount++;
          if (med.status === 'critical') aggregated[med.id].criticalCount++;
          if (med.status === 'low') aggregated[med.id].lowCount++;
        });
      });
      return Object.values(aggregated).map(m => ({
        ...m,
        currentStock: m.totalStock,
        maxStock: m.maxStock * m.phcCount,
        status: m.criticalCount > 5 ? 'critical' : m.lowCount > 10 ? 'low' : 'adequate',
        daysUntilStockout: m.dailyConsumption > 0 ? Math.round(m.totalStock / (m.dailyConsumption * m.phcCount)) : 999,
      }));
    }
    const phc = phcData.find(p => p.id === selectedPHC);
    return generateMedicineStock(selectedPHC, phc?.riskLevel || 'healthy');
  }, [selectedPHC]);

  const filteredStock = useMemo(() => {
    return stockData.filter(med => {
      const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           med.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || med.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [stockData, searchTerm, statusFilter]);

  const criticalCount = stockData.filter(m => m.status === 'critical').length;
  const lowCount = stockData.filter(m => m.status === 'low').length;
  const adequateCount = stockData.filter(m => m.status === 'adequate').length;

  // Consumption trend for selected medicine
  const consumptionChart = useMemo(() => {
    if (!selectedMed) return null;
    const phc = selectedPHC !== 'all' ? phcData.find(p => p.id === selectedPHC) : phcData[0];
    const history = generateConsumptionHistory(phc.id, selectedMed.id, selectedMed.dailyConsumption);
    return {
      labels: history.map(d => d.date.slice(5)),
      datasets: [{
        label: 'Daily Consumption',
        data: history.map(d => d.consumed),
        borderColor: '#0D9488',
        backgroundColor: 'rgba(13, 148, 136, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 5,
      }],
    };
  }, [selectedMed, selectedPHC]);

  return (
    <div className="animate-fade-in">
      {/* Summary Cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
        <div className="kpi-card critical animate-fade-in-up stagger-1">
          <div className="kpi-icon critical"><AlertTriangle size={20} /></div>
          <div className="kpi-value">{criticalCount}</div>
          <div className="kpi-label">Critical Stock Items</div>
        </div>
        <div className="kpi-card warning animate-fade-in-up stagger-2">
          <div className="kpi-icon warning"><Package size={20} /></div>
          <div className="kpi-value">{lowCount}</div>
          <div className="kpi-label">Low Stock Items</div>
        </div>
        <div className="kpi-card success animate-fade-in-up stagger-3">
          <div className="kpi-icon success"><Pill size={20} /></div>
          <div className="kpi-value">{adequateCount}</div>
          <div className="kpi-label">Adequate Stock Items</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="header-search" style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} size={16} />
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)',
              padding: '8px 12px 8px 36px', borderRadius: 'var(--radius-md)', fontSize: 13, width: 250, outline: 'none',
              fontFamily: 'var(--font-family)'
            }}
          />
        </div>

        <select className="filter-select" value={selectedPHC} onChange={(e) => setSelectedPHC(e.target.value)}>
          <option value="all">All PHCs (Aggregated)</option>
          {phcData.map(phc => (
            <option key={phc.id} value={phc.id}>{phc.name} — {phc.district}</option>
          ))}
        </select>

        <span className={`filter-chip ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>All</span>
        <span className={`filter-chip ${statusFilter === 'critical' ? 'active' : ''}`} onClick={() => setStatusFilter('critical')}>Critical</span>
        <span className={`filter-chip ${statusFilter === 'low' ? 'active' : ''}`} onClick={() => setStatusFilter('low')}>Low</span>
        <span className={`filter-chip ${statusFilter === 'adequate' ? 'active' : ''}`} onClick={() => setStatusFilter('adequate')}>Adequate</span>

        <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedMed ? '1fr 1fr' : '1fr', gap: 16 }}>
        {/* Medicine Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ maxHeight: selectedMed ? 500 : 600, overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Category</th>
                  <th>Stock Level</th>
                  <th>Daily Use</th>
                  <th>Days Left</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStock.map((med) => {
                  const stockPercent = Math.min(100, Math.round((med.currentStock / med.maxStock) * 100));
                  return (
                    <tr
                      key={med.id}
                      onClick={() => setSelectedMed(med)}
                      style={{ cursor: 'pointer', background: selectedMed?.id === med.id ? 'rgba(13, 148, 136, 0.08)' : undefined }}
                    >
                      <td style={{ fontWeight: 600 }}>{med.name}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{med.category}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ width: 60 }}>
                            <div
                              className={`progress-fill ${stockPercent > 50 ? 'good' : stockPercent > 25 ? 'medium' : 'low'}`}
                              style={{ width: `${stockPercent}%` }}
                            ></div>
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 65 }}>
                            {med.currentStock.toLocaleString()} {med.unit}
                          </span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{med.dailyConsumption}</td>
                      <td>
                        <span style={{
                          color: med.daysUntilStockout <= 7 ? 'var(--critical)' : med.daysUntilStockout <= 14 ? 'var(--warning)' : 'var(--text-secondary)',
                          fontWeight: med.daysUntilStockout <= 7 ? 700 : 400, fontSize: 13
                        }}>
                          {med.daysUntilStockout > 90 ? '90+' : med.daysUntilStockout} days
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${med.status}`}>
                          <span className={`status-dot ${med.status}`}></span>
                          {med.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Medicine Detail Panel */}
        {selectedMed && (
          <div className="card animate-fade-in">
            <div className="card-header">
              <div>
                <div className="card-title"><Pill size={16} /> {selectedMed.name}</div>
                <div className="card-subtitle">{selectedMed.category} — {selectedMed.unit}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedMed(null)}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Current Stock</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{selectedMed.currentStock.toLocaleString()}</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Daily Consumption</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{selectedMed.dailyConsumption}</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Days Until Stock-out</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: selectedMed.daysUntilStockout <= 7 ? 'var(--critical)' : 'var(--text-primary)' }}>
                  {selectedMed.daysUntilStockout > 90 ? '90+' : selectedMed.daysUntilStockout}
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Reorder Level</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{selectedMed.reorderLevel}</div>
              </div>
            </div>

            {consumptionChart && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                  <Clock size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  30-Day Consumption Trend
                </div>
                <div style={{ height: 200 }}>
                  <Line
                    data={consumptionChart}
                    options={{
                      responsive: true, maintainAspectRatio: false,
                      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1E293B', titleColor: '#F1F5F9', bodyColor: '#94A3B8', borderColor: 'rgba(148,163,184,0.12)', borderWidth: 1, padding: 10, cornerRadius: 8 } },
                      scales: {
                        x: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { color: '#64748B', font: { size: 10 }, maxRotation: 45 } },
                        y: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { color: '#64748B', font: { size: 10 } } },
                      }
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm"><Package size={14} /> Restock Now</button>
              <button className="btn btn-secondary btn-sm"><AlertTriangle size={14} /> Set Alert</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MedicineStock;

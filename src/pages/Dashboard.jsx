import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, AlertTriangle, Pill, BedDouble, Users, TrendingUp,
  TrendingDown, ArrowUpRight, ArrowDownRight, Activity, Clock
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import phcData from '../data/phcData';
import { generateMedicineStock } from '../data/medicineData';
import { generateAlerts } from '../data/alertsData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1E293B',
      titleColor: '#F1F5F9',
      bodyColor: '#94A3B8',
      borderColor: 'rgba(148, 163, 184, 0.12)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      titleFont: { family: 'Inter', size: 13, weight: '600' },
      bodyFont: { family: 'Inter', size: 12 },
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(148, 163, 184, 0.06)' },
      ticks: { color: '#64748B', font: { family: 'Inter', size: 11 } },
    },
    y: {
      grid: { color: 'rgba(148, 163, 184, 0.06)' },
      ticks: { color: '#64748B', font: { family: 'Inter', size: 11 } },
    },
  },
};

function Dashboard() {
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const totalPHCs = phcData.length;
    const criticalPHCs = phcData.filter(p => p.riskLevel === 'critical').length;
    const warningPHCs = phcData.filter(p => p.riskLevel === 'warning').length;
    const healthyPHCs = phcData.filter(p => p.riskLevel === 'healthy').length;

    let totalMedsLow = 0;
    let totalMedsCritical = 0;
    phcData.forEach(phc => {
      const stock = generateMedicineStock(phc.id, phc.riskLevel);
      totalMedsLow += stock.filter(m => m.status === 'low').length;
      totalMedsCritical += stock.filter(m => m.status === 'critical').length;
    });

    const avgBedOccupancy = Math.round(
      phcData.reduce((sum, p) => sum + (p.bedsOccupied / p.beds) * 100, 0) / totalPHCs
    );

    const alerts = generateAlerts();
    const activeAlerts = alerts.filter(a => !a.isResolved).length;

    return { totalPHCs, criticalPHCs, warningPHCs, healthyPHCs, totalMedsLow, totalMedsCritical, avgBedOccupancy, activeAlerts };
  }, []);

  const alerts = useMemo(() => generateAlerts().slice(0, 6), []);

  // Patient footfall chart data (7 days)
  const footfallData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Patient Footfall',
      data: [2840, 3120, 2960, 3380, 3200, 1980, 1240],
      borderColor: '#0D9488',
      backgroundColor: 'rgba(13, 148, 136, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#0D9488',
      pointBorderColor: '#0B1120',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  // Risk distribution doughnut
  const riskData = {
    labels: ['Healthy', 'Warning', 'Critical'],
    datasets: [{
      data: [stats.healthyPHCs, stats.warningPHCs, stats.criticalPHCs],
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
      borderColor: '#1E293B',
      borderWidth: 3,
      hoverOffset: 8,
    }],
  };

  // State-wise medicine stock bar chart
  const stateData = {
    labels: ['MH', 'KA', 'TN', 'RJ', 'UP', 'GJ', 'MP', 'KL', 'WB', 'OD'],
    datasets: [
      {
        label: 'Adequate',
        data: [65, 72, 58, 45, 38, 55, 42, 80, 50, 48],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderRadius: 4,
      },
      {
        label: 'Low Stock',
        data: [25, 18, 28, 35, 40, 30, 38, 15, 30, 32],
        backgroundColor: 'rgba(245, 158, 11, 0.7)',
        borderRadius: 4,
      },
      {
        label: 'Critical',
        data: [10, 10, 14, 20, 22, 15, 20, 5, 20, 20],
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="animate-fade-in">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card primary animate-fade-in-up stagger-1">
          <div className="kpi-icon primary"><Building2 size={20} /></div>
          <div className="kpi-value">{stats.totalPHCs}</div>
          <div className="kpi-label">Total PHCs Monitored</div>
          <div className="kpi-change up"><ArrowUpRight size={12} /> +3 this month</div>
        </div>

        <div className="kpi-card critical animate-fade-in-up stagger-2">
          <div className="kpi-icon critical"><AlertTriangle size={20} /></div>
          <div className="kpi-value">{stats.activeAlerts}</div>
          <div className="kpi-label">Active Alerts</div>
          <div className="kpi-change down"><ArrowDownRight size={12} /> {stats.criticalPHCs} critical</div>
        </div>

        <div className="kpi-card warning animate-fade-in-up stagger-3">
          <div className="kpi-icon warning"><Pill size={20} /></div>
          <div className="kpi-value">{stats.totalMedsCritical}</div>
          <div className="kpi-label">Medicine Stock-out Risk</div>
          <div className="kpi-change down"><TrendingDown size={12} /> {stats.totalMedsLow} low stock</div>
        </div>

        <div className="kpi-card success animate-fade-in-up stagger-4">
          <div className="kpi-icon info"><BedDouble size={20} /></div>
          <div className="kpi-value">{stats.avgBedOccupancy}%</div>
          <div className="kpi-label">Avg Bed Occupancy</div>
          <div className="kpi-change neutral"><Activity size={12} /> Across all PHCs</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        <div className="chart-container animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="card-header">
            <div>
              <div className="card-title"><TrendingUp size={16} /> Patient Footfall Trend</div>
              <div className="card-subtitle">Last 7 days across all PHCs</div>
            </div>
            <span className="status-badge info">Weekly</span>
          </div>
          <div className="chart-wrapper">
            <Line data={footfallData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-container animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="card-header">
            <div>
              <div className="card-title">PHC Risk Distribution</div>
              <div className="card-subtitle">Current status breakdown</div>
            </div>
          </div>
          <div className="chart-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 200, height: 200 }}>
              <Doughnut
                data={riskData}
                options={{
                  ...chartOptions,
                  cutout: '65%',
                  scales: undefined,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: { display: true, position: 'bottom', labels: { color: '#94A3B8', padding: 16, font: { family: 'Inter', size: 12 }, usePointStyle: true, pointStyle: 'circle' } }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* State-wise + Alerts Row */}
      <div className="charts-grid">
        <div className="chart-container animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
          <div className="card-header">
            <div>
              <div className="card-title"><Pill size={16} /> State-wise Medicine Stock Status (%)</div>
              <div className="card-subtitle">Percentage distribution by stock level</div>
            </div>
          </div>
          <div className="chart-wrapper">
            <Bar
              data={stateData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: { display: true, position: 'top', align: 'end', labels: { color: '#94A3B8', padding: 12, font: { family: 'Inter', size: 11 }, usePointStyle: true, pointStyle: 'circle', boxWidth: 8 } }
                },
                scales: {
                  ...chartOptions.scales,
                  x: { ...chartOptions.scales.x, stacked: true },
                  y: { ...chartOptions.scales.y, stacked: true, max: 100 },
                },
              }}
            />
          </div>
        </div>

        <div className="chart-container animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="card-header">
            <div>
              <div className="card-title"><Bell size={16} /> Recent Alerts</div>
              <div className="card-subtitle">{stats.activeAlerts} active alerts</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/alerts')}>View All</button>
          </div>
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            {alerts.map((alert, idx) => (
              <div key={alert.id} className="alert-item" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className={`alert-icon-wrapper ${alert.severity}`}>
                  <AlertTriangle size={16} />
                </div>
                <div className="alert-content">
                  <div className="alert-message">{alert.message}</div>
                  <div className="alert-meta">
                    <span><Clock size={10} /> {alert.timeAgo}</span>
                    <span>{alert.state}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick PHC Status Table */}
      <div className="card animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
        <div className="card-header">
          <div>
            <div className="card-title"><Building2 size={16} /> PHC Status Overview</div>
            <div className="card-subtitle">Click on a PHC to view details</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="filter-chip active">All</span>
            <span className="filter-chip">Critical</span>
            <span className="filter-chip">Warning</span>
            <span className="filter-chip">Healthy</span>
          </div>
        </div>
        <div style={{ maxHeight: 350, overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>PHC Name</th>
                <th>State</th>
                <th>District</th>
                <th>Risk Level</th>
                <th>Bed Occupancy</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {phcData.slice(0, 15).map((phc) => {
                const bedPercent = Math.round((phc.bedsOccupied / phc.beds) * 100);
                return (
                  <tr key={phc.id} onClick={() => navigate(`/phc/${phc.id}`)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontWeight: 600 }}>{phc.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{phc.state}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{phc.district}</td>
                    <td>
                      <span className={`status-badge ${phc.riskLevel}`}>
                        <span className={`status-dot ${phc.riskLevel}`}></span>
                        {phc.riskLevel}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ width: 80 }}>
                          <div
                            className={`progress-fill ${bedPercent > 80 ? 'low' : bedPercent > 60 ? 'medium' : 'good'}`}
                            style={{ width: `${bedPercent}%` }}
                          ></div>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{bedPercent}%</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: phc.buildingCondition === 'Good' ? 'var(--success)' : phc.buildingCondition === 'Fair' ? 'var(--warning)' : 'var(--critical)' }}>
                        {phc.buildingCondition}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

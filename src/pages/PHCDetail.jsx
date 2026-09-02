import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Building2, MapPin, BedDouble, Users, Pill, Clock,
  TrendingUp, AlertTriangle, Activity, Calendar, Heart, ChevronRight
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import phcData from '../data/phcData';
import { generateMedicineStock } from '../data/medicineData';
import { generatePatientData, getTodayStats } from '../data/patientData';
import { getStaffSummary } from '../data/staffData';
import { generateAlerts } from '../data/alertsData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1E293B', titleColor: '#F1F5F9', bodyColor: '#94A3B8',
      borderColor: 'rgba(148,163,184,0.12)', borderWidth: 1, padding: 12, cornerRadius: 8,
    },
  },
  scales: {
    x: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { color: '#64748B', font: { size: 11 } } },
    y: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { color: '#64748B', font: { size: 11 } } },
  },
};

function PHCDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const phc = phcData.find(p => p.id === id);
  if (!phc) {
    return (
      <div className="empty-state">
        <Building2 size={48} />
        <h3>PHC Not Found</h3>
        <p>The Primary Health Centre with ID "{id}" does not exist.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
    );
  }

  const bedPercent = Math.round((phc.bedsOccupied / phc.beds) * 100);
  const todayStats = getTodayStats(phc.id, phc.population);
  const staffSummary = getStaffSummary(phc.id, phc.riskLevel);
  const medicineStock = generateMedicineStock(phc.id, phc.riskLevel);
  const patientData = generatePatientData(phc.id, phc.population);
  const phcAlerts = generateAlerts().filter(a => a.phcId === phc.id);

  const criticalMeds = medicineStock.filter(m => m.status === 'critical').length;
  const lowMeds = medicineStock.filter(m => m.status === 'low').length;

  // Patient footfall chart (30 days)
  const footfallChart = {
    labels: patientData.dailyData.slice(-30).map(d => d.date.slice(5)),
    datasets: [{
      label: 'Patient Footfall',
      data: patientData.dailyData.slice(-30).map(d => d.total),
      borderColor: '#0D9488',
      backgroundColor: 'rgba(13,148,136,0.1)',
      fill: true, tension: 0.4, borderWidth: 2, pointRadius: 1, pointHoverRadius: 4,
    }],
  };

  // Disease breakdown for today
  const lastDay = patientData.dailyData[patientData.dailyData.length - 1];
  const diseaseChart = {
    labels: ['Fever', 'Respiratory', 'GI', 'Maternal', 'Injury', 'Other'],
    datasets: [{
      data: [lastDay.breakdown.fever, lastDay.breakdown.respiratory, lastDay.breakdown.gastrointestinal,
             lastDay.breakdown.maternal, lastDay.breakdown.injury, lastDay.breakdown.other],
      backgroundColor: ['#EF4444', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#64748B'],
      borderColor: '#1E293B', borderWidth: 2, hoverOffset: 8,
    }],
  };

  // Monthly footfall bar chart
  const monthlyChart = {
    labels: patientData.monthlyData.map(d => d.month.split(' ')[0]),
    datasets: [
      {
        label: 'OPD', data: patientData.monthlyData.map(d => d.opd),
        backgroundColor: 'rgba(13,148,136,0.7)', borderRadius: 4,
      },
      {
        label: 'IPD', data: patientData.monthlyData.map(d => d.ipd),
        backgroundColor: 'rgba(139,92,246,0.7)', borderRadius: 4,
      },
    ],
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'medicine', label: 'Medicine Stock' },
    { key: 'staff', label: 'Staff' },
    { key: 'patients', label: 'Patients' },
    { key: 'alerts', label: `Alerts (${phcAlerts.length})` },
  ];

  return (
    <div className="animate-fade-in">
      {/* Back Button + PHC Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ padding: 8 }}>
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>{phc.name}</h2>
            <span className={`status-badge ${phc.riskLevel}`}>
              <span className={`status-dot ${phc.riskLevel}`}></span>
              {phc.riskLevel}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {phc.district}, {phc.state}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> Est. {phc.established}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={12} /> Pop. {phc.population.toLocaleString()}</span>
            <span>Building: <span style={{
              color: phc.buildingCondition === 'Good' ? 'var(--success)' : phc.buildingCondition === 'Fair' ? 'var(--warning)' : 'var(--critical)',
              fontWeight: 600
            }}>{phc.buildingCondition}</span></span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <div className="kpi-card primary animate-fade-in-up stagger-1">
          <div className="kpi-icon primary"><Activity size={20} /></div>
          <div className="kpi-value">{todayStats.today}</div>
          <div className="kpi-label">Today's Patients</div>
          <div className={`kpi-change ${todayStats.change >= 0 ? 'up' : 'down'}`}>
            {todayStats.change >= 0 ? '+' : ''}{todayStats.changePercent}% vs yesterday
          </div>
        </div>
        <div className={`kpi-card ${bedPercent > 80 ? 'critical' : bedPercent > 60 ? 'warning' : 'success'} animate-fade-in-up stagger-2`}>
          <div className={`kpi-icon ${bedPercent > 80 ? 'critical' : bedPercent > 60 ? 'warning' : 'success'}`}><BedDouble size={20} /></div>
          <div className="kpi-value">{phc.bedsOccupied}/{phc.beds}</div>
          <div className="kpi-label">Bed Occupancy ({bedPercent}%)</div>
          <div className="progress-bar" style={{ marginTop: 8 }}>
            <div className={`progress-fill ${bedPercent > 80 ? 'low' : bedPercent > 60 ? 'medium' : 'good'}`} style={{ width: `${bedPercent}%` }}></div>
          </div>
        </div>
        <div className={`kpi-card ${criticalMeds > 0 ? 'critical' : lowMeds > 0 ? 'warning' : 'success'} animate-fade-in-up stagger-3`}>
          <div className={`kpi-icon ${criticalMeds > 0 ? 'critical' : 'warning'}`}><Pill size={20} /></div>
          <div className="kpi-value">{criticalMeds + lowMeds}</div>
          <div className="kpi-label">Low/Critical Medicines</div>
          <div className="kpi-change down">{criticalMeds} critical, {lowMeds} low</div>
        </div>
        <div className={`kpi-card ${staffSummary.fillRate < 60 ? 'critical' : staffSummary.fillRate < 80 ? 'warning' : 'success'} animate-fade-in-up stagger-4`}>
          <div className={`kpi-icon ${staffSummary.fillRate < 60 ? 'critical' : staffSummary.fillRate < 80 ? 'warning' : 'success'}`}><Users size={20} /></div>
          <div className="kpi-value">{staffSummary.fillRate}%</div>
          <div className="kpi-label">Staff Fill Rate</div>
          <div className="kpi-change neutral">{staffSummary.totalAvailable}/{staffSummary.totalSanctioned} available</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map(tab => (
          <button key={tab.key} className={`tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="animate-fade-in">
          <div className="charts-grid" style={{ marginBottom: 20 }}>
            <div className="chart-container">
              <div className="card-header">
                <div>
                  <div className="card-title"><TrendingUp size={16} /> Patient Footfall (30 Days)</div>
                  <div className="card-subtitle">Daily patient visits</div>
                </div>
              </div>
              <div className="chart-wrapper"><Line data={footfallChart} options={chartOpts} /></div>
            </div>
            <div className="chart-container">
              <div className="card-header">
                <div>
                  <div className="card-title"><Heart size={16} /> Disease Breakdown (Today)</div>
                  <div className="card-subtitle">Distribution by condition</div>
                </div>
              </div>
              <div className="chart-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 200, height: 200 }}>
                  <Doughnut data={diseaseChart} options={{
                    ...chartOpts, cutout: '60%', scales: undefined,
                    plugins: { ...chartOpts.plugins, legend: { display: true, position: 'bottom', labels: { color: '#94A3B8', padding: 10, font: { size: 11 }, usePointStyle: true, pointStyle: 'circle', boxWidth: 8 } } }
                  }} />
                </div>
              </div>
            </div>
          </div>
          <div className="chart-container" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <div>
                <div className="card-title"><Activity size={16} /> Monthly OPD/IPD Trend</div>
                <div className="card-subtitle">Last 12 months</div>
              </div>
            </div>
            <div className="chart-wrapper">
              <Bar data={monthlyChart} options={{
                ...chartOpts,
                plugins: { ...chartOpts.plugins, legend: { display: true, position: 'top', align: 'end', labels: { color: '#94A3B8', padding: 12, font: { size: 11 }, usePointStyle: true, pointStyle: 'circle', boxWidth: 8 } } },
                scales: { ...chartOpts.scales, x: { ...chartOpts.scales.x, stacked: true }, y: { ...chartOpts.scales.y, stacked: true } },
              }} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'medicine' && (
        <div className="card animate-fade-in" style={{ overflow: 'hidden' }}>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Category</th>
                  <th>Stock Level</th>
                  <th>Daily Use</th>
                  <th>Days Left</th>
                  <th>Expiry</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {medicineStock.map(med => {
                  const pct = Math.min(100, Math.round((med.currentStock / med.maxStock) * 100));
                  return (
                    <tr key={med.id}>
                      <td style={{ fontWeight: 600 }}>{med.name}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{med.category}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ width: 60 }}>
                            <div className={`progress-fill ${pct > 50 ? 'good' : pct > 25 ? 'medium' : 'low'}`} style={{ width: `${pct}%` }}></div>
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{med.currentStock}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{med.dailyConsumption}</td>
                      <td>
                        <span style={{
                          color: med.daysUntilStockout <= 7 ? 'var(--critical)' : med.daysUntilStockout <= 14 ? 'var(--warning)' : 'var(--text-secondary)',
                          fontWeight: med.daysUntilStockout <= 7 ? 700 : 400, fontSize: 13
                        }}>
                          {med.daysUntilStockout > 90 ? '90+' : med.daysUntilStockout}d
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{med.expiryDate}</td>
                      <td>
                        <span className={`status-badge ${med.status}`}>
                          <span className={`status-dot ${med.status === 'adequate' ? 'healthy' : med.status}`}></span>
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
      )}

      {activeTab === 'staff' && (
        <div className="animate-fade-in">
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <div>
                <div className="card-title"><Users size={16} /> Staff Overview</div>
                <div className="card-subtitle">Fill Rate: {staffSummary.fillRate}% — {staffSummary.totalVacant} vacancies</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {staffSummary.details.map((staff, idx) => (
                <div key={idx} style={{
                  padding: 16,
                  background: staff.status === 'critical' ? 'var(--critical-bg)' : staff.status === 'understaffed' ? 'var(--warning-bg)' : 'var(--success-bg)',
                  border: `1px solid ${staff.status === 'critical' ? 'rgba(239,68,68,0.2)' : staff.status === 'understaffed' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}`,
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{staff.role}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Sanctioned</div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{staff.sanctioned}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Available</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: staff.available === 0 ? 'var(--critical)' : 'var(--text-primary)' }}>{staff.available}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>On Leave</div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{staff.onLeave}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Vacant</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: staff.vacant > 0 ? 'var(--critical)' : 'var(--success)' }}>{staff.vacant}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="animate-fade-in">
          <div className="charts-grid" style={{ marginBottom: 20 }}>
            <div className="chart-container">
              <div className="card-header">
                <div>
                  <div className="card-title"><TrendingUp size={16} /> Daily Footfall (30 Days)</div>
                  <div className="card-subtitle">Patient visits per day</div>
                </div>
              </div>
              <div className="chart-wrapper"><Line data={footfallChart} options={chartOpts} /></div>
            </div>
            <div className="chart-container">
              <div className="card-header">
                <div>
                  <div className="card-title"><Heart size={16} /> Disease Distribution</div>
                  <div className="card-subtitle">Today's breakdown</div>
                </div>
              </div>
              <div className="chart-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 200, height: 200 }}>
                  <Doughnut data={diseaseChart} options={{
                    ...chartOpts, cutout: '60%', scales: undefined,
                    plugins: { ...chartOpts.plugins, legend: { display: true, position: 'bottom', labels: { color: '#94A3B8', padding: 10, font: { size: 11 }, usePointStyle: true, pointStyle: 'circle', boxWidth: 8 } } }
                  }} />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Patient Data Table */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Recent Daily Records</div>
                <div className="card-subtitle">Last 14 days of patient data</div>
              </div>
            </div>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Total</th>
                    <th>OPD</th>
                    <th>IPD</th>
                    <th>Fever</th>
                    <th>Respiratory</th>
                    <th>GI</th>
                  </tr>
                </thead>
                <tbody>
                  {patientData.dailyData.slice(-14).reverse().map(day => (
                    <tr key={day.date}>
                      <td style={{ fontWeight: 600 }}>{day.date}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{day.dayOfWeek}</td>
                      <td style={{ fontWeight: 700 }}>{day.total}</td>
                      <td>{day.opd}</td>
                      <td>{day.ipd}</td>
                      <td>{day.breakdown.fever}</td>
                      <td>{day.breakdown.respiratory}</td>
                      <td>{day.breakdown.gastrointestinal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="card animate-fade-in">
          {phcAlerts.length === 0 ? (
            <div className="empty-state">
              <AlertTriangle size={40} />
              <h3>No Alerts</h3>
              <p>No active alerts for this PHC</p>
            </div>
          ) : (
            phcAlerts.map((alert, idx) => (
              <div key={alert.id} className="alert-item" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className={`alert-icon-wrapper ${alert.severity}`}>
                  <AlertTriangle size={16} />
                </div>
                <div className="alert-content" style={{ flex: 1 }}>
                  <div className="alert-message">{alert.message}</div>
                  <div className="alert-meta">
                    <span><Clock size={10} /> {alert.timeAgo}</span>
                    <span>{alert.category}</span>
                    <span className={`status-badge ${alert.severity}`} style={{ fontSize: 10 }}>{alert.severity}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default PHCDetail;

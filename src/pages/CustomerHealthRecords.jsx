import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAppointmentStats } from '../data/appointmentData';
import {
  FileHeart, Calendar, Stethoscope, Pill, AlertCircle,
  ChevronRight, Activity, Clock, MapPin, TrendingUp
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

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
    },
  },
  scales: {
    x: { grid: { color: 'rgba(148, 163, 184, 0.06)' }, ticks: { color: '#64748B', font: { family: 'Inter', size: 11 } } },
    y: { grid: { color: 'rgba(148, 163, 184, 0.06)' }, ticks: { color: '#64748B', font: { family: 'Inter', size: 11 } } },
  },
};

function CustomerHealthRecords() {
  const { user } = useAuth();

  const { appointments } = useMemo(
    () => getAppointmentStats(user?.id || 'USR-C-001'),
    [user]
  );

  const completedVisits = appointments.filter(a => a.status === 'completed' && a.diagnosis);

  // Diagnosis distribution
  const diagnosisCount = {};
  completedVisits.forEach(v => {
    const cond = v.diagnosis?.condition || 'Unknown';
    diagnosisCount[cond] = (diagnosisCount[cond] || 0) + 1;
  });
  const topDiagnoses = Object.entries(diagnosisCount).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const diagChartData = {
    labels: topDiagnoses.map(d => d[0].length > 20 ? d[0].substring(0, 20) + '...' : d[0]),
    datasets: [{
      data: topDiagnoses.map(d => d[1]),
      backgroundColor: ['#0D9488', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
      borderColor: '#1E293B',
      borderWidth: 3,
    }],
  };

  // Monthly visits
  const monthlyVisits = {};
  completedVisits.forEach(v => {
    const monthKey = new Date(v.date).toLocaleString('default', { month: 'short', year: '2-digit' });
    monthlyVisits[monthKey] = (monthlyVisits[monthKey] || 0) + 1;
  });
  const months = Object.keys(monthlyVisits).slice(-8);

  const monthlyChartData = {
    labels: months,
    datasets: [{
      label: 'Visits',
      data: months.map(m => monthlyVisits[m]),
      backgroundColor: 'rgba(13, 148, 136, 0.6)',
      borderRadius: 6,
    }],
  };

  // Severity stats
  const severityCounts = { mild: 0, moderate: 0, severe: 0, routine: 0 };
  completedVisits.forEach(v => {
    const sev = v.diagnosis?.severity || 'routine';
    severityCounts[sev] = (severityCounts[sev] || 0) + 1;
  });

  return (
    <div className="animate-fade-in">
      {/* Summary Cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        <div className="kpi-card primary animate-fade-in-up stagger-1">
          <div className="kpi-icon primary"><Activity size={20} /></div>
          <div className="kpi-value">{completedVisits.length}</div>
          <div className="kpi-label">Total Visits</div>
        </div>
        <div className="kpi-card success animate-fade-in-up stagger-2">
          <div className="kpi-icon success"><Stethoscope size={20} /></div>
          <div className="kpi-value">{Object.keys(diagnosisCount).length}</div>
          <div className="kpi-label">Unique Diagnoses</div>
        </div>
        <div className="kpi-card warning animate-fade-in-up stagger-3">
          <div className="kpi-icon warning"><AlertCircle size={20} /></div>
          <div className="kpi-value">{severityCounts.severe}</div>
          <div className="kpi-label">Severe Cases</div>
        </div>
        <div className="kpi-card info animate-fade-in-up stagger-4">
          <div className="kpi-icon info"><Pill size={20} /></div>
          <div className="kpi-value">{completedVisits.filter(v => v.prescription).length}</div>
          <div className="kpi-label">Prescriptions</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-container animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="card-header">
            <div>
              <div className="card-title"><TrendingUp size={16} /> Visit Frequency</div>
              <div className="card-subtitle">Monthly hospital visits</div>
            </div>
          </div>
          <div className="chart-wrapper">
            <Bar data={monthlyChartData} options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                y: { ...chartOptions.scales.y, beginAtZero: true, ticks: { ...chartOptions.scales.y.ticks, stepSize: 1 } }
              }
            }} />
          </div>
        </div>

        <div className="chart-container animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="card-header">
            <div>
              <div className="card-title"><FileHeart size={16} /> Diagnosis Distribution</div>
              <div className="card-subtitle">Top conditions diagnosed</div>
            </div>
          </div>
          <div className="chart-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 200, height: 200 }}>
              <Doughnut data={diagChartData} options={{
                ...chartOptions,
                cutout: '60%',
                scales: undefined,
                plugins: {
                  ...chartOptions.plugins,
                  legend: { display: true, position: 'bottom', labels: { color: '#94A3B8', padding: 10, font: { family: 'Inter', size: 10 }, usePointStyle: true, pointStyle: 'circle' } }
                }
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Health Record Timeline */}
      <div className="card animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
        <div className="card-header">
          <div>
            <div className="card-title"><FileHeart size={16} /> Health Record Timeline</div>
            <div className="card-subtitle">Complete medical history</div>
          </div>
        </div>

        <div className="health-timeline">
          {completedVisits.slice(0, 12).map((visit, idx) => (
            <div key={visit.id} className="timeline-item" style={{ animationDelay: `${idx * 0.04}s` }}>
              <div className="timeline-line">
                <div className={`timeline-dot ${visit.diagnosis?.severity || 'routine'}`}></div>
                {idx < completedVisits.length - 1 && <div className="timeline-connector"></div>}
              </div>
              <div className="timeline-content">
                <div className="timeline-date">
                  <Calendar size={12} />
                  {new Date(visit.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
                <div className="timeline-card">
                  <div className="timeline-header">
                    <div>
                      <div className="timeline-condition">{visit.diagnosis?.condition || 'General Checkup'}</div>
                      <div className="timeline-meta">
                        <span><Stethoscope size={11} /> {visit.doctor.name}</span>
                        <span><MapPin size={11} /> {visit.phcName}</span>
                      </div>
                    </div>
                    <span className={`status-badge ${
                      visit.diagnosis?.severity === 'severe' ? 'critical' :
                      visit.diagnosis?.severity === 'moderate' ? 'warning' : 'healthy'
                    }`}>
                      {visit.diagnosis?.severity || 'routine'}
                    </span>
                  </div>
                  {visit.prescription && (
                    <div className="timeline-prescription">
                      <div className="timeline-rx-label"><Pill size={12} /> Prescription:</div>
                      <ul>
                        {visit.prescription.slice(0, 3).map((rx, i) => (
                          <li key={i}>{rx}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {visit.notes && (
                    <div className="timeline-notes">
                      <Clock size={11} /> {visit.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CustomerHealthRecords;

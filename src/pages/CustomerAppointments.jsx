import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  CalendarCheck, Clock, MapPin, User, FileText,
  Filter, ChevronDown, Stethoscope, Hash, IndianRupee
} from 'lucide-react';

function CustomerAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusCounts, setStatusCounts] = useState({ all: 0, upcoming: 0, completed: 0, cancelled: 0 });

  useEffect(() => {
    async function fetchData() {
      try {
        const [aptData, statsData] = await Promise.all([
          api.getAppointments({ status: filterStatus === 'all' ? undefined : filterStatus, limit: 50 }),
          api.getAppointmentStats(),
        ]);
        setAppointments(aptData.appointments || []);
        setStatusCounts({ all: statsData.total, upcoming: statsData.upcoming, completed: statsData.completed, cancelled: statsData.cancelled });
      } catch (err) {
        console.error('Appointments fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filterStatus]);

  if (loading) return <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="loading-spinner" style={{ width: 40, height: 40 }}></div></div>;

  return (
    <div className="animate-fade-in">
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <Filter size={16} style={{ color: 'var(--text-tertiary)' }} />
        {['all', 'upcoming', 'completed', 'cancelled'].map(status => (
          <button key={status} className={`filter-chip ${filterStatus === status ? 'active' : ''}`} onClick={() => { setFilterStatus(status); setLoading(true); }}>
            {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
          </button>
        ))}
      </div>

      <div className="appointments-list">
        {appointments.length === 0 ? (
          <div className="empty-state"><CalendarCheck size={48} /><h3>No appointments found</h3><p>No {filterStatus !== 'all' ? filterStatus : ''} appointments to display</p></div>
        ) : (
          appointments.map((apt, idx) => (
            <div key={apt._id} className={`appointment-card ${apt.status} ${expandedId === apt._id ? 'expanded' : ''}`} style={{ animationDelay: `${idx * 0.03}s` }}>
              <div className="apt-main" onClick={() => setExpandedId(expandedId === apt._id ? null : apt._id)}>
                <div className="apt-date-badge">
                  <div className="apt-date-day">{new Date(apt.date).getDate()}</div>
                  <div className="apt-date-month">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</div>
                  <div className="apt-date-year">{new Date(apt.date).getFullYear()}</div>
                </div>
                <div className="apt-info">
                  <div className="apt-doctor-name"><Stethoscope size={14} />{apt.doctor.name}</div>
                  <div className="apt-department">{apt.department}</div>
                  <div className="apt-meta">
                    <span><Clock size={12} /> {apt.time}</span>
                    <span><MapPin size={12} /> {apt.phcName}</span>
                    <span><Hash size={12} /> Token {apt.tokenNumber}</span>
                  </div>
                </div>
                <div className="apt-right">
                  <span className={`status-badge ${apt.status === 'completed' ? 'healthy' : apt.status === 'upcoming' ? 'info' : 'critical'}`}>{apt.status}</span>
                  <ChevronDown size={16} className={`apt-expand-icon ${expandedId === apt._id ? 'rotated' : ''}`} />
                </div>
              </div>

              {expandedId === apt._id && (
                <div className="apt-details animate-fade-in">
                  <div className="apt-detail-grid">
                    <div className="apt-detail-section">
                      <h4><User size={14} /> Doctor Details</h4>
                      <div className="apt-detail-item"><span>Name:</span> <strong>{apt.doctor.name}</strong></div>
                      <div className="apt-detail-item"><span>Qualification:</span> <strong>{apt.doctor.qualification}</strong></div>
                      <div className="apt-detail-item"><span>Department:</span> <strong>{apt.department}</strong></div>
                    </div>
                    <div className="apt-detail-section">
                      <h4><MapPin size={14} /> Visit Details</h4>
                      <div className="apt-detail-item"><span>PHC:</span> <strong>{apt.phcName}</strong></div>
                      <div className="apt-detail-item"><span>Location:</span> <strong>{apt.district}, {apt.state}</strong></div>
                      <div className="apt-detail-item"><span>Fee:</span> <strong><IndianRupee size={12} />{apt.fee}</strong></div>
                    </div>
                    {apt.diagnosis && (
                      <div className="apt-detail-section">
                        <h4><FileText size={14} /> Diagnosis</h4>
                        <div className="apt-detail-item"><span>Condition:</span> <strong>{apt.diagnosis.condition}</strong></div>
                        <div className="apt-detail-item"><span>ICD Code:</span> <strong>{apt.diagnosis.code}</strong></div>
                        <div className="apt-detail-item"><span>Severity:</span><span className={`status-badge ${apt.diagnosis.severity === 'severe' ? 'critical' : apt.diagnosis.severity === 'moderate' ? 'warning' : 'healthy'}`}>{apt.diagnosis.severity}</span></div>
                      </div>
                    )}
                    {apt.prescription && (
                      <div className="apt-detail-section full-width">
                        <h4><FileText size={14} /> Prescription</h4>
                        <ul className="prescription-list">{apt.prescription.map((rx, i) => <li key={i}>{rx}</li>)}</ul>
                      </div>
                    )}
                    {apt.notes && <div className="apt-detail-section full-width"><h4>Doctor&apos;s Notes</h4><p className="apt-notes">{apt.notes}</p></div>}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CustomerAppointments;

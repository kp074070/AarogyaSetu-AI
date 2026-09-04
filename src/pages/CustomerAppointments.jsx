import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAppointmentStats } from '../data/appointmentData';
import {
  CalendarCheck, Clock, MapPin, User, FileText,
  Filter, ChevronDown, Stethoscope, Hash, IndianRupee
} from 'lucide-react';

function CustomerAppointments() {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const { appointments } = useMemo(
    () => getAppointmentStats(user?.id || 'USR-C-001'),
    [user]
  );

  const filtered = useMemo(() => {
    if (filterStatus === 'all') return appointments;
    return appointments.filter(a => a.status === filterStatus);
  }, [appointments, filterStatus]);

  const statusCounts = useMemo(() => ({
    all: appointments.length,
    upcoming: appointments.filter(a => a.status === 'upcoming').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  }), [appointments]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="animate-fade-in">
      {/* Filter Bar */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <Filter size={16} style={{ color: 'var(--text-tertiary)' }} />
        {['all', 'upcoming', 'completed', 'cancelled'].map(status => (
          <button
            key={status}
            className={`filter-chip ${filterStatus === status ? 'active' : ''}`}
            onClick={() => setFilterStatus(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
          </button>
        ))}
      </div>

      {/* Appointment List */}
      <div className="appointments-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <CalendarCheck size={48} />
            <h3>No appointments found</h3>
            <p>No {filterStatus !== 'all' ? filterStatus : ''} appointments to display</p>
          </div>
        ) : (
          filtered.map((apt, idx) => (
            <div
              key={apt.id}
              className={`appointment-card ${apt.status} ${expandedId === apt.id ? 'expanded' : ''}`}
              style={{ animationDelay: `${idx * 0.03}s` }}
            >
              <div className="apt-main" onClick={() => toggleExpand(apt.id)}>
                <div className="apt-date-badge">
                  <div className="apt-date-day">{new Date(apt.date).getDate()}</div>
                  <div className="apt-date-month">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</div>
                  <div className="apt-date-year">{new Date(apt.date).getFullYear()}</div>
                </div>

                <div className="apt-info">
                  <div className="apt-doctor-name">
                    <Stethoscope size={14} />
                    {apt.doctor.name}
                  </div>
                  <div className="apt-department">{apt.department}</div>
                  <div className="apt-meta">
                    <span><Clock size={12} /> {apt.time}</span>
                    <span><MapPin size={12} /> {apt.phcName}</span>
                    <span><Hash size={12} /> Token {apt.tokenNumber}</span>
                  </div>
                </div>

                <div className="apt-right">
                  <span className={`status-badge ${
                    apt.status === 'completed' ? 'healthy' :
                    apt.status === 'upcoming' ? 'info' :
                    apt.status === 'cancelled' ? 'critical' : 'warning'
                  }`}>
                    {apt.status}
                  </span>
                  <ChevronDown size={16} className={`apt-expand-icon ${expandedId === apt.id ? 'rotated' : ''}`} />
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === apt.id && (
                <div className="apt-details animate-fade-in">
                  <div className="apt-detail-grid">
                    <div className="apt-detail-section">
                      <h4><User size={14} /> Doctor Details</h4>
                      <div className="apt-detail-item">
                        <span>Name:</span> <strong>{apt.doctor.name}</strong>
                      </div>
                      <div className="apt-detail-item">
                        <span>Qualification:</span> <strong>{apt.doctor.qualification}</strong>
                      </div>
                      <div className="apt-detail-item">
                        <span>Department:</span> <strong>{apt.department}</strong>
                      </div>
                    </div>

                    <div className="apt-detail-section">
                      <h4><MapPin size={14} /> Visit Details</h4>
                      <div className="apt-detail-item">
                        <span>PHC:</span> <strong>{apt.phcName}</strong>
                      </div>
                      <div className="apt-detail-item">
                        <span>Location:</span> <strong>{apt.district}, {apt.state}</strong>
                      </div>
                      <div className="apt-detail-item">
                        <span>Fee:</span> <strong><IndianRupee size={12} />{apt.fee}</strong>
                      </div>
                    </div>

                    {apt.diagnosis && (
                      <div className="apt-detail-section">
                        <h4><FileText size={14} /> Diagnosis</h4>
                        <div className="apt-detail-item">
                          <span>Condition:</span> <strong>{apt.diagnosis.condition}</strong>
                        </div>
                        <div className="apt-detail-item">
                          <span>ICD Code:</span> <strong>{apt.diagnosis.code}</strong>
                        </div>
                        <div className="apt-detail-item">
                          <span>Severity:</span>
                          <span className={`status-badge ${
                            apt.diagnosis.severity === 'severe' ? 'critical' :
                            apt.diagnosis.severity === 'moderate' ? 'warning' : 'healthy'
                          }`}>
                            {apt.diagnosis.severity}
                          </span>
                        </div>
                      </div>
                    )}

                    {apt.prescription && (
                      <div className="apt-detail-section full-width">
                        <h4><FileText size={14} /> Prescription</h4>
                        <ul className="prescription-list">
                          {apt.prescription.map((rx, i) => (
                            <li key={i}>{rx}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {apt.notes && (
                      <div className="apt-detail-section full-width">
                        <h4>Doctor&apos;s Notes</h4>
                        <p className="apt-notes">{apt.notes}</p>
                      </div>
                    )}
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

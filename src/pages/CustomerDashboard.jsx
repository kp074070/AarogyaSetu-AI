import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAppointmentStats } from '../data/appointmentData';
import { getNearbyPHCs } from '../data/hospitalProfileData';
import {
  CalendarCheck, Search, FileHeart, Pill, Phone, MapPin,
  Clock, Star, BedDouble, ArrowUpRight, Heart, Activity,
  Stethoscope, AlertCircle, ChevronRight, Sparkles, Shield
} from 'lucide-react';

function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const appointmentStats = useMemo(
    () => getAppointmentStats(user?.id || 'USR-C-001'),
    [user]
  );

  const nearbyPHCs = useMemo(
    () => getNearbyPHCs(user?.state || 'Maharashtra', 4),
    [user]
  );

  const healthTips = [
    'Stay hydrated — drink at least 8 glasses of water daily',
    'Get 30 minutes of moderate exercise every day',
    'Maintain a balanced diet rich in fruits and vegetables',
    'Ensure 7-8 hours of quality sleep each night',
  ];

  const tipIdx = new Date().getDate() % healthTips.length;

  return (
    <div className="animate-fade-in customer-dashboard">
      {/* Welcome Banner */}
      <div className="customer-welcome-banner">
        <div className="welcome-content">
          <div className="welcome-greeting">
            <h2>
              Welcome back, <span className="text-primary">{user?.fullName?.split(' ')[0] || 'Patient'}</span> 👋
            </h2>
            <p>Here's your health overview for today</p>
          </div>
          <div className="welcome-tip">
            <Sparkles size={16} />
            <span>💡 Health Tip: {healthTips[tipIdx]}</span>
          </div>
        </div>
        <div className="welcome-decoration">
          <Heart size={64} className="welcome-icon" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-grid">
        <div className="quick-action-card" onClick={() => navigate('/customer/appointments')}>
          <div className="qa-icon qa-icon-blue">
            <CalendarCheck size={22} />
          </div>
          <div className="qa-label">Book Appointment</div>
          <ArrowUpRight size={16} className="qa-arrow" />
        </div>
        <div className="quick-action-card" onClick={() => navigate('/customer/find-phc')}>
          <div className="qa-icon qa-icon-teal">
            <Search size={22} />
          </div>
          <div className="qa-label">Find Nearby PHC</div>
          <ArrowUpRight size={16} className="qa-arrow" />
        </div>
        <div className="quick-action-card" onClick={() => navigate('/customer/health-records')}>
          <div className="qa-icon qa-icon-purple">
            <FileHeart size={22} />
          </div>
          <div className="qa-label">Health Records</div>
          <ArrowUpRight size={16} className="qa-arrow" />
        </div>
        <div className="quick-action-card emergency" onClick={() => alert('Emergency helpline: 108')}>
          <div className="qa-icon qa-icon-red">
            <Phone size={22} />
          </div>
          <div className="qa-label">Emergency: 108</div>
          <ArrowUpRight size={16} className="qa-arrow" />
        </div>
      </div>

      {/* Stats KPI */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi-card primary animate-fade-in-up stagger-1">
          <div className="kpi-icon primary"><CalendarCheck size={20} /></div>
          <div className="kpi-value">{appointmentStats.upcoming}</div>
          <div className="kpi-label">Upcoming Appointments</div>
        </div>
        <div className="kpi-card success animate-fade-in-up stagger-2">
          <div className="kpi-icon success"><Activity size={20} /></div>
          <div className="kpi-value">{appointmentStats.completed}</div>
          <div className="kpi-label">Visits Completed</div>
        </div>
        <div className="kpi-card info animate-fade-in-up stagger-3">
          <div className="kpi-icon info"><Stethoscope size={20} /></div>
          <div className="kpi-value">{appointmentStats.total}</div>
          <div className="kpi-label">Total Appointments</div>
        </div>
        <div className="kpi-card warning animate-fade-in-up stagger-4">
          <div className="kpi-icon warning"><Shield size={20} /></div>
          <div className="kpi-value">{user?.bloodGroup || 'B+'}</div>
          <div className="kpi-label">Blood Group</div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="customer-grid">
        {/* Next Appointment */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="card-header">
            <div>
              <div className="card-title"><CalendarCheck size={16} /> Next Appointment</div>
              <div className="card-subtitle">Your upcoming visit</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/customer/appointments')}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          {appointmentStats.nextAppointment ? (
            <div className="next-appointment-card">
              <div className="na-date">
                <div className="na-day">{new Date(appointmentStats.nextAppointment.date).getDate()}</div>
                <div className="na-month">{new Date(appointmentStats.nextAppointment.date).toLocaleString('default', { month: 'short' })}</div>
              </div>
              <div className="na-details">
                <div className="na-doctor">{appointmentStats.nextAppointment.doctor.name}</div>
                <div className="na-dept">{appointmentStats.nextAppointment.department}</div>
                <div className="na-meta">
                  <span><Clock size={12} /> {appointmentStats.nextAppointment.time}</span>
                  <span><MapPin size={12} /> {appointmentStats.nextAppointment.phcName}</span>
                </div>
              </div>
              <span className="status-badge info">Token #{appointmentStats.nextAppointment.tokenNumber}</span>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px 20px' }}>
              <CalendarCheck size={32} />
              <p>No upcoming appointments</p>
            </div>
          )}

          {/* Recent appointments */}
          <div style={{ marginTop: 16 }}>
            <div className="card-subtitle" style={{ marginBottom: 8, fontWeight: 600, color: 'var(--text-secondary)' }}>Recent Visits</div>
            {appointmentStats.appointments.filter(a => a.status === 'completed').slice(0, 3).map(apt => (
              <div key={apt.id} className="recent-apt-item">
                <div className="recent-apt-date">{new Date(apt.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                <div className="recent-apt-info">
                  <div style={{ fontWeight: 500 }}>{apt.diagnosis?.condition || 'General Checkup'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{apt.doctor.name} • {apt.phcName}</div>
                </div>
                <span className={`status-badge ${apt.diagnosis?.severity === 'severe' ? 'critical' : apt.diagnosis?.severity === 'moderate' ? 'warning' : 'healthy'}`}>
                  {apt.diagnosis?.severity || 'routine'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Nearby PHCs */}
        <div className="card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="card-header">
            <div>
              <div className="card-title"><MapPin size={16} /> Nearby Health Centres</div>
              <div className="card-subtitle">PHCs in {user?.state || 'Maharashtra'}</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/customer/find-phc')}>
              See All <ChevronRight size={14} />
            </button>
          </div>
          <div className="nearby-phc-list">
            {nearbyPHCs.map((phc, idx) => (
              <div key={phc.id} className="nearby-phc-item" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="phc-item-left">
                  <div className={`phc-status-indicator ${phc.riskLevel}`}></div>
                  <div>
                    <div className="phc-item-name">{phc.name}</div>
                    <div className="phc-item-meta">
                      <span><MapPin size={11} /> {phc.district}, {phc.state}</span>
                    </div>
                  </div>
                </div>
                <div className="phc-item-right">
                  <div className="phc-item-rating">
                    <Star size={12} fill="var(--accent)" color="var(--accent)" />
                    <span>{phc.rating}</span>
                  </div>
                  <div className="phc-item-beds">
                    <BedDouble size={12} />
                    <span>{phc.availableBeds} beds</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Health Advisory */}
      <div className="card health-advisory animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
        <div className="card-header">
          <div>
            <div className="card-title"><AlertCircle size={16} /> Health Advisory</div>
            <div className="card-subtitle">Important health information for your region</div>
          </div>
        </div>
        <div className="advisory-cards">
          <div className="advisory-item advisory-monsoon">
            <div className="advisory-icon">🌧️</div>
            <div>
              <strong>Monsoon Season Alert</strong>
              <p>Increased risk of Dengue, Malaria, and Waterborne diseases. Use mosquito nets and drink boiled water.</p>
            </div>
          </div>
          <div className="advisory-item advisory-vaccination">
            <div className="advisory-icon">💉</div>
            <div>
              <strong>Vaccination Drive</strong>
              <p>Free COVID-19 booster shots available at all PHCs. Carry your Aadhaar card for registration.</p>
            </div>
          </div>
          <div className="advisory-item advisory-checkup">
            <div className="advisory-icon">🩺</div>
            <div>
              <strong>Annual Health Checkup</strong>
              <p>Free annual health screening for citizens above 30 years. Visit your nearest PHC.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerDashboard;

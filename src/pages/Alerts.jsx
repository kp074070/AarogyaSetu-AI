import { useMemo, useState } from 'react';
import {
  AlertTriangle, Bell, Check, Clock, Filter, Package,
  Users, BedDouble, Brain, ArrowLeftRight, Pill, TrendingUp,
  CheckCircle, XCircle, Eye
} from 'lucide-react';
import { generateAlerts } from '../data/alertsData';

const iconMap = {
  AlertTriangle, Package, BedDouble: BedDouble, Users, UserX: Users,
  TrendingUp, Clock, Brain, ArrowLeftRight,
};

function getAlertIcon(iconName) {
  switch(iconName) {
    case 'AlertTriangle': return AlertTriangle;
    case 'Package': return Package;
    case 'Bed': return BedDouble;
    case 'Users': return Users;
    case 'UserX': return Users;
    case 'TrendingUp': return TrendingUp;
    case 'Clock': return Clock;
    case 'Brain': return Brain;
    case 'ArrowLeftRight': return ArrowLeftRight;
    default: return Bell;
  }
}

function Alerts() {
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showResolved, setShowResolved] = useState(false);

  const allAlerts = useMemo(() => generateAlerts(), []);

  const filtered = useMemo(() => {
    return allAlerts.filter(alert => {
      if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
      if (categoryFilter !== 'all' && alert.category !== categoryFilter) return false;
      if (!showResolved && alert.isResolved) return false;
      return true;
    });
  }, [allAlerts, severityFilter, categoryFilter, showResolved]);

  const stats = useMemo(() => ({
    total: allAlerts.length,
    active: allAlerts.filter(a => !a.isResolved).length,
    critical: allAlerts.filter(a => a.severity === 'critical' && !a.isResolved).length,
    warning: allAlerts.filter(a => a.severity === 'warning' && !a.isResolved).length,
    info: allAlerts.filter(a => a.severity === 'info' && !a.isResolved).length,
    resolved: allAlerts.filter(a => a.isResolved).length,
    unread: allAlerts.filter(a => !a.isRead).length,
  }), [allAlerts]);

  const categories = useMemo(() => {
    const cats = {};
    allAlerts.forEach(a => { cats[a.category] = (cats[a.category] || 0) + 1; });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]);
  }, [allAlerts]);

  const [selectedAlert, setSelectedAlert] = useState(null);

  return (
    <div className="animate-fade-in">
      {/* KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <div className="kpi-card critical animate-fade-in-up stagger-1">
          <div className="kpi-icon critical"><AlertTriangle size={20} /></div>
          <div className="kpi-value">{stats.critical}</div>
          <div className="kpi-label">Critical Alerts</div>
          <div className="kpi-change down">Immediate action required</div>
        </div>
        <div className="kpi-card warning animate-fade-in-up stagger-2">
          <div className="kpi-icon warning"><Bell size={20} /></div>
          <div className="kpi-value">{stats.warning}</div>
          <div className="kpi-label">Warning Alerts</div>
          <div className="kpi-change neutral"><Clock size={12} /> Monitor closely</div>
        </div>
        <div className="kpi-card info animate-fade-in-up stagger-3">
          <div className="kpi-icon info"><Eye size={20} /></div>
          <div className="kpi-value">{stats.unread}</div>
          <div className="kpi-label">Unread Notifications</div>
          <div className="kpi-change neutral">Requires attention</div>
        </div>
        <div className="kpi-card success animate-fade-in-up stagger-4">
          <div className="kpi-icon success"><CheckCircle size={20} /></div>
          <div className="kpi-value">{stats.resolved}</div>
          <div className="kpi-label">Resolved</div>
          <div className="kpi-change up">Successfully handled</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <Filter size={16} style={{ color: 'var(--text-tertiary)' }} />

        {[
          { key: 'all', label: `All (${stats.active})` },
          { key: 'critical', label: `Critical (${stats.critical})` },
          { key: 'warning', label: `Warning (${stats.warning})` },
          { key: 'info', label: `Info (${stats.info})` },
        ].map(f => (
          <span key={f.key} className={`filter-chip ${severityFilter === f.key ? 'active' : ''}`} onClick={() => setSeverityFilter(f.key)}>
            {f.label}
          </span>
        ))}

        <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }} />

        <select className="filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map(([cat, count]) => (
            <option key={cat} value={cat}>{cat} ({count})</option>
          ))}
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer', marginLeft: 'auto' }}>
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            style={{ accentColor: 'var(--primary)' }}
          />
          Show Resolved
        </label>
      </div>

      {/* Alert List with Detail Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedAlert ? '1fr 1fr' : '1fr', gap: 16 }}>
        {/* Alert List */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ maxHeight: selectedAlert ? 600 : 700, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div className="empty-state">
                <Bell size={40} />
                <h3>No Alerts</h3>
                <p>No alerts match your current filters</p>
              </div>
            ) : (
              filtered.map((alert, idx) => {
                const Icon = getAlertIcon(alert.icon);
                return (
                  <div
                    key={alert.id}
                    className="alert-item"
                    style={{
                      animationDelay: `${idx * 0.03}s`,
                      background: selectedAlert?.id === alert.id ? 'rgba(13,148,136,0.08)' : alert.isResolved ? 'rgba(148,163,184,0.03)' : undefined,
                      opacity: alert.isResolved ? 0.6 : 1,
                    }}
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <div className={`alert-icon-wrapper ${alert.severity}`}>
                      <Icon size={16} />
                    </div>
                    <div className="alert-content" style={{ flex: 1, minWidth: 0 }}>
                      <div className="alert-message" style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        textDecoration: alert.isResolved ? 'line-through' : 'none',
                      }}>
                        {alert.message}
                      </div>
                      <div className="alert-meta">
                        <span><Clock size={10} /> {alert.timeAgo}</span>
                        <span>{alert.phcName}</span>
                        <span>{alert.category}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                      <span className={`status-badge ${alert.severity}`} style={{ fontSize: 10 }}>
                        {alert.severity}
                      </span>
                      {!alert.isRead && (
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--info)', display: 'block' }} />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedAlert && (
          <div className="card animate-fade-in">
            <div className="card-header">
              <div>
                <div className="card-title">
                  {(() => { const Icon = getAlertIcon(selectedAlert.icon); return <Icon size={16} />; })()}
                  Alert Details
                </div>
                <div className="card-subtitle">{selectedAlert.id}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedAlert(null)}>✕</button>
            </div>

            <div className={`status-badge ${selectedAlert.severity}`} style={{ marginBottom: 16 }}>
              <span className={`status-dot ${selectedAlert.severity}`}></span>
              {selectedAlert.severity} — {selectedAlert.category}
            </div>

            <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: 20 }}>
              {selectedAlert.message}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PHC</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{selectedAlert.phcName}</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{selectedAlert.district}, {selectedAlert.state}</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Time</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{selectedAlert.timeAgo}</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4, color: selectedAlert.isResolved ? 'var(--success)' : 'var(--warning)' }}>
                  {selectedAlert.isResolved ? 'Resolved' : 'Active'}
                </div>
              </div>
            </div>

            {/* AI Recommendation */}
            <div style={{
              padding: 14,
              background: 'rgba(13,148,136,0.06)',
              border: '1px solid rgba(13,148,136,0.12)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Brain size={14} style={{ color: 'var(--primary-light)' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary-light)' }}>AI Recommendation</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {selectedAlert.severity === 'critical'
                  ? `This is a high-priority alert requiring immediate intervention. Consider initiating resource redistribution from nearby PHCs with surplus capacity. Check the Redistribution page for AI-generated transfer recommendations.`
                  : selectedAlert.severity === 'warning'
                  ? `Monitor this situation closely. If the trend continues for the next 48 hours, consider proactive measures such as placing advance orders or adjusting resource allocation.`
                  : `This is an informational alert. No immediate action is required, but it should be noted for planning and inventory management purposes.`
                }
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {!selectedAlert.isResolved && (
                <>
                  <button className="btn btn-primary btn-sm"><CheckCircle size={14} /> Mark Resolved</button>
                  <button className="btn btn-secondary btn-sm"><ArrowLeftRight size={14} /> Redistribute</button>
                </>
              )}
              <button className="btn btn-ghost btn-sm"><Pill size={14} /> View Stock</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Alerts;

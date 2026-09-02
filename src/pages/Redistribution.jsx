import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight, ArrowRight, MapPin, Pill, Check, X,
  TrendingUp, Clock, Truck, ChevronDown, ChevronUp, Building2
} from 'lucide-react';
import phcData from '../data/phcData';
import { generateMedicineStock, medicineList } from '../data/medicineData';

// Calculate distance between two lat/lng points (Haversine formula)
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// AI-based redistribution recommendation engine
function generateRedistributions() {
  const recommendations = [];

  phcData.forEach(destPHC => {
    const destStock = generateMedicineStock(destPHC.id, destPHC.riskLevel);
    const criticalMeds = destStock.filter(m => m.status === 'critical');

    criticalMeds.forEach(critMed => {
      // Find nearby PHCs with surplus of this medicine
      const candidates = phcData
        .filter(p => p.id !== destPHC.id)
        .map(srcPHC => {
          const srcStock = generateMedicineStock(srcPHC.id, srcPHC.riskLevel);
          const srcMed = srcStock.find(m => m.id === critMed.id);
          const distance = haversine(destPHC.lat, destPHC.lng, srcPHC.lat, srcPHC.lng);
          return { srcPHC, srcMed, distance };
        })
        .filter(c => c.srcMed && c.srcMed.status === 'adequate' && c.distance < 200)
        .sort((a, b) => a.distance - b.distance);

      if (candidates.length > 0) {
        const best = candidates[0];
        const transferQty = Math.min(
          Math.round(best.srcMed.currentStock * 0.3),
          critMed.reorderLevel - critMed.currentStock
        );

        if (transferQty > 20) {
          recommendations.push({
            id: `RD-${String(recommendations.length + 1).padStart(3, '0')}`,
            medicine: critMed,
            source: best.srcPHC,
            sourceStock: best.srcMed,
            destination: destPHC,
            destStock: critMed,
            distance: Math.round(best.distance),
            transferQty,
            priority: critMed.daysUntilStockout <= 5 ? 'critical' : critMed.daysUntilStockout <= 10 ? 'high' : 'medium',
            estimatedTime: `${Math.round(best.distance / 40)}–${Math.round(best.distance / 30)} hours`,
            costSaving: Math.round(transferQty * critMed.pricePerUnit * 0.4),
            aiConfidence: Math.round(75 + Math.random() * 20),
            status: Math.random() > 0.7 ? 'approved' : Math.random() > 0.5 ? 'pending' : 'review',
            createdAt: new Date(Date.now() - Math.random() * 72 * 60 * 60 * 1000).toISOString(),
          });
        }
      }
    });
  });

  return recommendations.sort((a, b) => {
    const prio = { critical: 0, high: 1, medium: 2 };
    return prio[a.priority] - prio[b.priority];
  }).slice(0, 20);
}

function Redistribution() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const recommendations = useMemo(() => generateRedistributions(), []);

  const filtered = useMemo(() => {
    if (filter === 'all') return recommendations;
    return recommendations.filter(r => r.priority === filter || r.status === filter);
  }, [recommendations, filter]);

  const stats = useMemo(() => ({
    total: recommendations.length,
    critical: recommendations.filter(r => r.priority === 'critical').length,
    pending: recommendations.filter(r => r.status === 'pending').length,
    approved: recommendations.filter(r => r.status === 'approved').length,
    totalSavings: recommendations.reduce((s, r) => s + r.costSaving, 0),
  }), [recommendations]);

  return (
    <div className="animate-fade-in">
      {/* KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: 20 }}>
        <div className="kpi-card primary animate-fade-in-up stagger-1">
          <div className="kpi-icon primary"><ArrowLeftRight size={20} /></div>
          <div className="kpi-value">{stats.total}</div>
          <div className="kpi-label">AI Recommendations</div>
          <div className="kpi-change neutral"><TrendingUp size={12} /> Auto-generated</div>
        </div>
        <div className="kpi-card critical animate-fade-in-up stagger-2">
          <div className="kpi-icon critical"><Clock size={20} /></div>
          <div className="kpi-value">{stats.critical}</div>
          <div className="kpi-label">Critical Transfers</div>
          <div className="kpi-change down">Immediate action needed</div>
        </div>
        <div className="kpi-card warning animate-fade-in-up stagger-3">
          <div className="kpi-icon warning"><Truck size={20} /></div>
          <div className="kpi-value">{stats.pending}</div>
          <div className="kpi-label">Pending Approval</div>
          <div className="kpi-change neutral"><Clock size={12} /> Awaiting review</div>
        </div>
        <div className="kpi-card success animate-fade-in-up stagger-4">
          <div className="kpi-icon success"><Check size={20} /></div>
          <div className="kpi-value">₹{(stats.totalSavings / 1000).toFixed(1)}K</div>
          <div className="kpi-label">Estimated Savings</div>
          <div className="kpi-change up">Via redistribution</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ marginBottom: 16 }}>
        {[
          { key: 'all', label: `All (${stats.total})` },
          { key: 'critical', label: `Critical (${stats.critical})` },
          { key: 'pending', label: `Pending (${stats.pending})` },
          { key: 'approved', label: `Approved (${stats.approved})` },
        ].map(f => (
          <span key={f.key} className={`filter-chip ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </span>
        ))}
      </div>

      {/* Recommendations List */}
      {filtered.map((rec, idx) => (
        <div key={rec.id} className="redistribution-card animate-fade-in-up" style={{ animationDelay: `${idx * 0.04}s` }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)',
                background: 'var(--bg-surface)', padding: '3px 10px', borderRadius: 'var(--radius-full)',
              }}>{rec.id}</span>
              <span className={`status-badge ${rec.priority}`}>
                <span className={`status-dot ${rec.priority}`}></span>
                {rec.priority} priority
              </span>
              <span className={`status-badge ${rec.status === 'approved' ? 'healthy' : rec.status === 'pending' ? 'warning' : 'info'}`}>
                {rec.status}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                AI Confidence: <strong style={{ color: rec.aiConfidence > 85 ? 'var(--success)' : 'var(--warning)' }}>{rec.aiConfidence}%</strong>
              </span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
              >
                {expandedId === rec.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          {/* Medicine Name */}
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Pill size={16} style={{ color: 'var(--primary-light)' }} />
            {rec.medicine.name}
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 400 }}>
              — {rec.transferQty} {rec.medicine.unit}
            </span>
          </div>

          {/* Flow Visualization */}
          <div className="redistribution-flow">
            <div className="redistribution-phc source">
              <Building2 size={18} style={{ marginBottom: 4, color: 'var(--success)' }} />
              <div style={{ fontWeight: 600, fontSize: 13 }}>{rec.source.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{rec.source.district}, {rec.source.state}</div>
              <div style={{ fontSize: 12, marginTop: 6, color: 'var(--success)' }}>
                Stock: {rec.sourceStock.currentStock} {rec.medicine.unit}
              </div>
            </div>

            <div className="redistribution-arrow">
              <ArrowRight size={24} style={{ color: 'var(--primary)' }} />
              <div style={{ fontWeight: 600, color: 'var(--primary-light)', fontSize: 13 }}>{rec.transferQty} {rec.medicine.unit}</div>
              <div style={{ fontSize: 11 }}>{rec.distance} km • {rec.estimatedTime}</div>
            </div>

            <div className="redistribution-phc dest">
              <Building2 size={18} style={{ marginBottom: 4, color: 'var(--critical)' }} />
              <div style={{ fontWeight: 600, fontSize: 13 }}>{rec.destination.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{rec.destination.district}, {rec.destination.state}</div>
              <div style={{ fontSize: 12, marginTop: 6, color: 'var(--critical)' }}>
                Stock: {rec.destStock.currentStock} {rec.medicine.unit}
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {expandedId === rec.id && (
            <div style={{
              marginTop: 16, padding: 16,
              background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
              animation: 'fadeIn 0.2s ease',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Transfer Qty</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{rec.transferQty} {rec.medicine.unit}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Distance</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{rec.distance} km</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Est. Time</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{rec.estimatedTime}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cost Saved</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--success)' }}>₹{rec.costSaving}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, padding: 12, background: 'rgba(13,148,136,0.06)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(13,148,136,0.1)' }}>
                <strong style={{ color: 'var(--primary-light)' }}>AI Reasoning:</strong> {rec.destination.name} has critically low stock of {rec.medicine.name} ({rec.destStock.currentStock} remaining, ~{rec.destStock.daysUntilStockout} days until stock-out). {rec.source.name} has surplus ({rec.sourceStock.currentStock} units, adequate level). Transferring {rec.transferQty} units will stabilize supply for approximately {Math.round(rec.transferQty / rec.destStock.dailyConsumption)} additional days while maintaining adequate levels at source.
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="redistribution-actions">
            <button className="btn btn-primary btn-sm"><Check size={14} /> Approve Transfer</button>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/phc/${rec.destination.id}`)}>
              <MapPin size={14} /> View PHC
            </button>
            <button className="btn btn-ghost btn-sm"><X size={14} /> Reject</button>
            <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} />
              {new Date(rec.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="empty-state">
          <ArrowLeftRight size={40} />
          <h3>No Recommendations</h3>
          <p>No redistribution recommendations match your current filter.</p>
        </div>
      )}
    </div>
  );
}

export default Redistribution;

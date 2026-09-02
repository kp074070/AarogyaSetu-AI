import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { Building2, BedDouble, Users, Pill, ExternalLink } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import phcData from '../data/phcData';

const riskColors = {
  critical: '#EF4444',
  warning: '#F59E0B',
  healthy: '#10B981',
};

function MapView() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const filteredPHCs = useMemo(() => {
    if (filter === 'all') return phcData;
    return phcData.filter(p => p.riskLevel === filter);
  }, [filter]);

  const centerLat = 22.5;
  const centerLng = 79.0;

  return (
    <div className="animate-fade-in">
      <div className="filter-bar">
        <span className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All PHCs ({phcData.length})</span>
        <span className={`filter-chip ${filter === 'critical' ? 'active' : ''}`} onClick={() => setFilter('critical')}>
          Critical ({phcData.filter(p => p.riskLevel === 'critical').length})
        </span>
        <span className={`filter-chip ${filter === 'warning' ? 'active' : ''}`} onClick={() => setFilter('warning')}>
          Warning ({phcData.filter(p => p.riskLevel === 'warning').length})
        </span>
        <span className={`filter-chip ${filter === 'healthy' ? 'active' : ''}`} onClick={() => setFilter('healthy')}>
          Healthy ({phcData.filter(p => p.riskLevel === 'healthy').length})
        </span>
      </div>

      <div className="map-container" style={{ height: 'calc(100vh - 220px)' }}>
        <MapContainer center={[centerLat, centerLng]} zoom={5} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredPHCs.map((phc) => (
            <CircleMarker
              key={phc.id}
              center={[phc.lat, phc.lng]}
              radius={phc.riskLevel === 'critical' ? 10 : phc.riskLevel === 'warning' ? 8 : 6}
              fillColor={riskColors[phc.riskLevel]}
              color={riskColors[phc.riskLevel]}
              weight={2}
              opacity={0.9}
              fillOpacity={0.6}
            >
              <Popup>
                <div style={{ minWidth: 220, fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: '#0F172A' }}>{phc.name}</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>{phc.district}, {phc.state}</div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                    <div style={{ background: '#F1F5F9', padding: '6px 10px', borderRadius: 6 }}>
                      <div style={{ fontSize: 10, color: '#64748B' }}>Beds</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{phc.bedsOccupied}/{phc.beds}</div>
                    </div>
                    <div style={{ background: '#F1F5F9', padding: '6px 10px', borderRadius: 6 }}>
                      <div style={{ fontSize: 10, color: '#64748B' }}>Risk</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: riskColors[phc.riskLevel], textTransform: 'capitalize' }}>{phc.riskLevel}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: 11, color: '#64748B', marginBottom: 6 }}>
                    <strong>Population:</strong> {phc.population.toLocaleString()} | <strong>Est:</strong> {phc.established}
                  </div>

                  <button
                    onClick={() => navigate(`/phc/${phc.id}`)}
                    style={{
                      width: '100%', padding: '6px', background: '#0D9488', color: 'white',
                      border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                    }}
                  >
                    <ExternalLink size={12} /> View Details
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#10B981' }}></div> Healthy
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#F59E0B' }}></div> Warning
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#EF4444' }}></div> Critical
        </div>
        <div className="legend-item" style={{ marginLeft: 'auto', color: 'var(--text-tertiary)', fontSize: 11 }}>
          Showing {filteredPHCs.length} of {phcData.length} PHCs
        </div>
      </div>
    </div>
  );
}

export default MapView;

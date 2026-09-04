import { useState, useEffect } from 'react';
import api from '../services/api';
import { onSocketEvent, offSocketEvent } from '../services/socket';
import {
  Search, MapPin, Star, BedDouble, Clock, Phone,
  Ambulance, Wifi, Filter, Building2, ChevronDown,
  ChevronUp, ExternalLink, Stethoscope, CheckCircle
} from 'lucide-react';

function CustomerFindPHC() {
  const [query, setQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [expandedId, setExpandedId] = useState(null);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPHCs() {
      setLoading(true);
      try {
        const params = { sort: sortBy, limit: 50 };
        if (query) params.search = query;
        if (stateFilter !== 'all') params.state = stateFilter;
        if (riskFilter !== 'all') params.riskLevel = riskFilter;

        const data = await api.getPHCs(params);
        setResults(data.phcs || []);
        setTotal(data.total || 0);
      } catch (err) {
        console.error('PHC fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    const debounce = setTimeout(fetchPHCs, 300);
    return () => clearTimeout(debounce);
  }, [query, stateFilter, riskFilter, sortBy]);

  // Real-time bed updates
  useEffect(() => {
    const handleBedUpdate = (data) => {
      setResults(prev => prev.map(p => p.phcId === data.phcId ? { ...p, availableBeds: data.availableBeds } : p));
    };
    onSocketEvent('bedUpdate', handleBedUpdate);
    return () => offSocketEvent('bedUpdate', handleBedUpdate);
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="phc-search-bar">
        <div className="phc-search-input-wrapper">
          <Search size={20} className="phc-search-icon" />
          <input type="text" placeholder="Search by name, district, state, or specialization..." value={query} onChange={(e) => setQuery(e.target.value)} className="phc-search-input" />
        </div>
      </div>

      <div className="filter-bar">
        <Filter size={16} style={{ color: 'var(--text-tertiary)' }} />
        <select className="filter-select" value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
          <option value="all">All States</option>
          {['Andhra Pradesh','Gujarat','Haryana','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="healthy">Healthy</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
        <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="rating">Sort: Rating</option>
          <option value="beds">Sort: Available Beds</option>
        </select>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-tertiary)' }}>{total} results</span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="loading-spinner" style={{ width: 32, height: 32 }}></div></div>
      ) : (
        <div className="phc-results-grid">
          {results.length === 0 ? (
            <div className="empty-state"><Search size={48} /><h3>No PHCs found</h3><p>Try adjusting your search or filters</p></div>
          ) : (
            results.map((phc, idx) => (
              <div key={phc.phcId} className={`phc-result-card animate-fade-in-up ${expandedId === phc.phcId ? 'expanded' : ''}`} style={{ animationDelay: `${idx * 0.03}s` }}>
                <div className="phc-card-header" onClick={() => setExpandedId(expandedId === phc.phcId ? null : phc.phcId)}>
                  <div className="phc-card-left">
                    <div className={`phc-card-status-dot ${phc.riskLevel}`}></div>
                    <div>
                      <div className="phc-card-name"><Building2 size={16} />{phc.name}</div>
                      <div className="phc-card-location"><MapPin size={12} /> {phc.district}, {phc.state}</div>
                    </div>
                  </div>
                  <div className="phc-card-badges">
                    <div className="phc-card-rating"><Star size={14} fill="var(--accent)" color="var(--accent)" /><span>{phc.rating}</span><span className="rating-count">({phc.reviewCount})</span></div>
                    <span className={`status-badge ${phc.riskLevel}`}><span className={`status-dot ${phc.riskLevel}`}></span>{phc.riskLevel}</span>
                    {expandedId === phc.phcId ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
                <div className="phc-card-stats">
                  <div className="phc-stat"><BedDouble size={14} /><span>{phc.availableBeds}/{phc.beds} beds</span></div>
                  <div className="phc-stat"><Clock size={14} /><span>{phc.operatingHours}</span></div>
                  <div className="phc-stat"><Stethoscope size={14} /><span>{phc.doctors} doctors</span></div>
                </div>
                <div className="phc-card-specs">
                  {(phc.specializations || []).slice(0, 4).map(spec => <span key={spec} className="spec-chip"><Stethoscope size={10} /> {spec}</span>)}
                  {(phc.specializations || []).length > 4 && <span className="spec-chip more">+{phc.specializations.length - 4} more</span>}
                </div>

                {expandedId === phc.phcId && (
                  <div className="phc-card-expanded animate-fade-in">
                    <div className="phc-expanded-grid">
                      <div className="phc-expanded-section">
                        <h4>Facilities</h4>
                        <div className="phc-facilities-list">{(phc.facilities || []).map(fac => <div key={fac} className="facility-item"><CheckCircle size={12} /><span>{fac}</span></div>)}</div>
                      </div>
                      <div className="phc-expanded-section">
                        <h4>Services</h4>
                        <div className="phc-services-list">
                          {phc.ambulanceAvailable && <div className="service-item available"><Ambulance size={14} /> Ambulance Available</div>}
                          {phc.telemedicineEnabled && <div className="service-item available"><Wifi size={14} /> Telemedicine Enabled</div>}
                          {phc.ayushUnit && <div className="service-item available"><Stethoscope size={14} /> AYUSH Unit</div>}
                        </div>
                      </div>
                      <div className="phc-expanded-section">
                        <h4>Contact</h4>
                        <div className="phc-contact-info"><div><Phone size={12} /> {phc.phone}</div><div><ExternalLink size={12} /> {phc.email}</div></div>
                      </div>
                      <div className="phc-expanded-section">
                        <h4>Infrastructure</h4>
                        <div className="phc-infra-info">
                          <div>Established: <strong>{phc.established}</strong></div>
                          <div>Building: <strong style={{ color: phc.buildingCondition === 'Good' ? 'var(--success)' : phc.buildingCondition === 'Fair' ? 'var(--warning)' : 'var(--critical)' }}>{phc.buildingCondition}</strong></div>
                          <div>Population: <strong>{phc.population?.toLocaleString()}</strong></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default CustomerFindPHC;

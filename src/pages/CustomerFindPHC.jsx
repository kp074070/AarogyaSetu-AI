import { useState, useMemo } from 'react';
import { searchPHCs } from '../data/hospitalProfileData';
import { indianStates } from '../data/userData';
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

  const results = useMemo(() => {
    let phcs = searchPHCs(query, stateFilter, riskFilter);

    // Sort
    if (sortBy === 'rating') phcs.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'distance') phcs.sort((a, b) => a.distance - b.distance);
    else if (sortBy === 'beds') phcs.sort((a, b) => b.availableBeds - a.availableBeds);

    return phcs;
  }, [query, stateFilter, riskFilter, sortBy]);

  return (
    <div className="animate-fade-in">
      {/* Search Bar */}
      <div className="phc-search-bar">
        <div className="phc-search-input-wrapper">
          <Search size={20} className="phc-search-icon" />
          <input
            type="text"
            placeholder="Search by name, district, state, or specialization..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="phc-search-input"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <Filter size={16} style={{ color: 'var(--text-tertiary)' }} />

        <select
          className="filter-select"
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
        >
          <option value="all">All States</option>
          {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          className="filter-select"
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="healthy">Healthy</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>

        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="rating">Sort: Rating</option>
          <option value="distance">Sort: Distance</option>
          <option value="beds">Sort: Available Beds</option>
        </select>

        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-tertiary)' }}>
          {results.length} results
        </span>
      </div>

      {/* Results */}
      <div className="phc-results-grid">
        {results.length === 0 ? (
          <div className="empty-state">
            <Search size={48} />
            <h3>No PHCs found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          results.map((phc, idx) => (
            <div
              key={phc.id}
              className={`phc-result-card animate-fade-in-up ${expandedId === phc.id ? 'expanded' : ''}`}
              style={{ animationDelay: `${idx * 0.03}s` }}
            >
              <div className="phc-card-header" onClick={() => setExpandedId(expandedId === phc.id ? null : phc.id)}>
                <div className="phc-card-left">
                  <div className={`phc-card-status-dot ${phc.riskLevel}`}></div>
                  <div>
                    <div className="phc-card-name">
                      <Building2 size={16} />
                      {phc.name}
                    </div>
                    <div className="phc-card-location">
                      <MapPin size={12} /> {phc.district}, {phc.state}
                    </div>
                  </div>
                </div>

                <div className="phc-card-badges">
                  <div className="phc-card-rating">
                    <Star size={14} fill="var(--accent)" color="var(--accent)" />
                    <span>{phc.rating}</span>
                    <span className="rating-count">({phc.reviewCount})</span>
                  </div>
                  <span className={`status-badge ${phc.riskLevel}`}>
                    <span className={`status-dot ${phc.riskLevel}`}></span>
                    {phc.riskLevel}
                  </span>
                  {expandedId === phc.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="phc-card-stats">
                <div className="phc-stat">
                  <BedDouble size={14} />
                  <span>{phc.availableBeds}/{phc.beds} beds</span>
                </div>
                <div className="phc-stat">
                  <Clock size={14} />
                  <span>{phc.waitTime} wait</span>
                </div>
                <div className="phc-stat">
                  <MapPin size={14} />
                  <span>{phc.distance} km</span>
                </div>
                <div className="phc-stat">
                  <Clock size={14} />
                  <span>{phc.operatingHours}</span>
                </div>
              </div>

              {/* Specializations chips */}
              <div className="phc-card-specs">
                {phc.specializations.slice(0, 4).map(spec => (
                  <span key={spec} className="spec-chip">
                    <Stethoscope size={10} /> {spec}
                  </span>
                ))}
                {phc.specializations.length > 4 && (
                  <span className="spec-chip more">+{phc.specializations.length - 4} more</span>
                )}
              </div>

              {/* Expanded Details */}
              {expandedId === phc.id && (
                <div className="phc-card-expanded animate-fade-in">
                  <div className="phc-expanded-grid">
                    <div className="phc-expanded-section">
                      <h4>Facilities</h4>
                      <div className="phc-facilities-list">
                        {phc.facilities.map(fac => (
                          <div key={fac} className="facility-item">
                            <CheckCircle size={12} />
                            <span>{fac}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="phc-expanded-section">
                      <h4>Services</h4>
                      <div className="phc-services-list">
                        {phc.ambulanceAvailable && (
                          <div className="service-item available">
                            <Ambulance size={14} /> Ambulance Available
                          </div>
                        )}
                        {phc.telemedicineEnabled && (
                          <div className="service-item available">
                            <Wifi size={14} /> Telemedicine Enabled
                          </div>
                        )}
                        {phc.ayushUnit && (
                          <div className="service-item available">
                            <Stethoscope size={14} /> AYUSH Unit
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="phc-expanded-section">
                      <h4>Contact</h4>
                      <div className="phc-contact-info">
                        <div><Phone size={12} /> {phc.phone}</div>
                        <div><ExternalLink size={12} /> {phc.email}</div>
                      </div>
                    </div>

                    <div className="phc-expanded-section">
                      <h4>Infrastructure</h4>
                      <div className="phc-infra-info">
                        <div>Established: <strong>{phc.established}</strong></div>
                        <div>Building: <strong style={{ color: phc.buildingCondition === 'Good' ? 'var(--success)' : phc.buildingCondition === 'Fair' ? 'var(--warning)' : 'var(--critical)' }}>{phc.buildingCondition}</strong></div>
                        <div>Population Served: <strong>{phc.population.toLocaleString()}</strong></div>
                        <div>Last Inspection: <strong>{phc.lastInspection}</strong></div>
                      </div>
                    </div>
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

export default CustomerFindPHC;

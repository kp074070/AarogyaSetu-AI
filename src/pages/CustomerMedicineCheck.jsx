import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateMedicineStock, medicineList } from '../data/medicineData';
import { getNearbyPHCs } from '../data/hospitalProfileData';
import {
  Pill, Search, MapPin, Building2, AlertTriangle,
  CheckCircle, Filter, Package
} from 'lucide-react';

function CustomerMedicineCheck() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const nearbyPHCs = useMemo(
    () => getNearbyPHCs(user?.state || 'Maharashtra', 8),
    [user]
  );

  const categories = useMemo(() => {
    const cats = [...new Set(medicineList.map(m => m.category))];
    return ['all', ...cats.sort()];
  }, []);

  // Build medicine availability across nearby PHCs
  const medicineAvailability = useMemo(() => {
    let medicines = medicineList;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      medicines = medicines.filter(m =>
        m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'all') {
      medicines = medicines.filter(m => m.category === categoryFilter);
    }

    return medicines.map(med => {
      const availability = nearbyPHCs.map(phc => {
        const stock = generateMedicineStock(phc.id, phc.riskLevel);
        const medStock = stock.find(s => s.id === med.id);
        return {
          phcId: phc.id,
          phcName: phc.name,
          district: phc.district,
          state: phc.state,
          distance: phc.distance,
          currentStock: medStock?.currentStock || 0,
          status: medStock?.status || 'unknown',
          daysUntilStockout: medStock?.daysUntilStockout || 0,
        };
      });

      const availableCount = availability.filter(a => a.status === 'adequate').length;
      const lowCount = availability.filter(a => a.status === 'low').length;
      const criticalCount = availability.filter(a => a.status === 'critical').length;

      return {
        ...med,
        availability,
        availableCount,
        lowCount,
        criticalCount,
        overallStatus: availableCount > 0 ? 'available' : lowCount > 0 ? 'limited' : 'unavailable',
      };
    });
  }, [nearbyPHCs, searchQuery, categoryFilter]);

  return (
    <div className="animate-fade-in">
      {/* Search */}
      <div className="phc-search-bar" style={{ marginBottom: 16 }}>
        <div className="phc-search-input-wrapper">
          <Search size={20} className="phc-search-icon" />
          <input
            type="text"
            placeholder="Search medicines by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="phc-search-input"
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <Filter size={16} style={{ color: 'var(--text-tertiary)' }} />
        {categories.slice(0, 8).map(cat => (
          <button
            key={cat}
            className={`filter-chip ${categoryFilter === cat ? 'active' : ''}`}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat === 'all' ? 'All Categories' : cat}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="medicine-check-grid">
        {medicineAvailability.length === 0 ? (
          <div className="empty-state">
            <Pill size={48} />
            <h3>No medicines found</h3>
            <p>Try a different search or category</p>
          </div>
        ) : (
          medicineAvailability.map((med, idx) => (
            <div key={med.id} className="medicine-check-card animate-fade-in-up" style={{ animationDelay: `${idx * 0.03}s` }}>
              <div className="med-check-header">
                <div className="med-check-info">
                  <div className="med-check-name">
                    <Pill size={16} />
                    {med.name}
                  </div>
                  <div className="med-check-category">{med.category} • {med.unit}</div>
                </div>
                <span className={`status-badge ${
                  med.overallStatus === 'available' ? 'healthy' :
                  med.overallStatus === 'limited' ? 'warning' : 'critical'
                }`}>
                  {med.overallStatus === 'available' ? (
                    <><CheckCircle size={12} /> Available</>
                  ) : med.overallStatus === 'limited' ? (
                    <><AlertTriangle size={12} /> Limited</>
                  ) : (
                    <><AlertTriangle size={12} /> Unavailable</>
                  )}
                </span>
              </div>

              <div className="med-check-summary">
                <div className="med-check-stat available">
                  <Package size={14} />
                  <span>{med.availableCount} PHCs have stock</span>
                </div>
                <div className="med-check-stat low">
                  <AlertTriangle size={14} />
                  <span>{med.lowCount} low stock</span>
                </div>
                <div className="med-check-stat critical">
                  <AlertTriangle size={14} />
                  <span>{med.criticalCount} critical</span>
                </div>
              </div>

              {/* PHC availability list */}
              <div className="med-phc-list">
                {med.availability
                  .filter(a => a.status !== 'critical')
                  .sort((a, b) => b.currentStock - a.currentStock)
                  .slice(0, 4)
                  .map(a => (
                    <div key={a.phcId} className="med-phc-item">
                      <div className="med-phc-info">
                        <Building2 size={12} />
                        <span>{a.phcName}</span>
                      </div>
                      <div className="med-phc-stock">
                        <span className={`stock-indicator ${a.status}`}>{a.currentStock} {med.unit.toLowerCase()}</span>
                        <span className="med-phc-distance">
                          <MapPin size={10} /> {a.distance} km
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CustomerMedicineCheck;

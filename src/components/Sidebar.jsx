import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Map, Pill, TrendingUp, ArrowLeftRight, Bell,
  Settings, HelpCircle, Shield
} from 'lucide-react';

const navItems = [
  { section: 'Main', items: [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/map', label: 'Map View', icon: Map },
    { path: '/medicine', label: 'Medicine Stock', icon: Pill },
    { path: '/predictions', label: 'Predictions', icon: TrendingUp },
    { path: '/redistribution', label: 'Redistribution', icon: ArrowLeftRight },
    { path: '/alerts', label: 'Alerts', icon: Bell, badge: 12 },
  ]},
  { section: 'System', items: [
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/help', label: 'Help & Docs', icon: HelpCircle },
  ]},
];

function Sidebar({ currentPath, onNavigate }) {
  const navigate = useNavigate();

  const handleNav = (path) => {
    onNavigate(path);
    navigate(path);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Shield size={20} />
        </div>
        <div className="sidebar-brand">
          <h1>AarogyaSetu AI</h1>
          <span>Healthcare Intelligence</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div className="nav-section" key={section.section}>
            <div className="nav-section-title">{section.section}</div>
            {section.items.map((item) => (
              <div
                key={item.path}
                className={`nav-item ${currentPath === item.path ? 'active' : ''}`}
                onClick={() => handleNav(item.path)}
              >
                <item.icon className="nav-icon" size={18} />
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </div>
            ))}
          </div>
        ))}
      </nav>

      <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
        <div style={{
          padding: '12px',
          background: 'rgba(13, 148, 136, 0.08)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(13, 148, 136, 0.15)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>System Status</div>
          <div style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
            All Systems Operational
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

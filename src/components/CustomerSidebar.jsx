import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, CalendarCheck, Search, FileHeart, Pill,
  UserCircle, LogOut, Shield, Heart
} from 'lucide-react';

const navItems = [
  { section: 'Main', items: [
    { path: '/customer', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/customer/appointments', label: 'My Appointments', icon: CalendarCheck },
    { path: '/customer/find-phc', label: 'Find PHC', icon: Search },
    { path: '/customer/health-records', label: 'Health Records', icon: FileHeart },
    { path: '/customer/medicine-check', label: 'Medicine Check', icon: Pill },
  ]},
  { section: 'Account', items: [
    { path: '/customer/profile', label: 'My Profile', icon: UserCircle },
  ]},
];

function CustomerSidebar({ currentPath, onNavigate }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleNav = (path) => {
    onNavigate(path);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar customer-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo customer-logo">
          <Heart size={20} />
        </div>
        <div className="sidebar-brand">
          <h1>AarogyaSetu</h1>
          <span>Patient Portal</span>
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
              </div>
            ))}
          </div>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="sidebar-footer">
        <div className="sidebar-user-info">
          <div className="sidebar-user-avatar">
            {user?.avatar || 'U'}
          </div>
          <div className="sidebar-user-details">
            <div className="sidebar-user-name">{user?.fullName || 'User'}</div>
            <div className="sidebar-user-role">Patient</div>
          </div>
        </div>
        <button className="sidebar-logout-btn" onClick={handleLogout} title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}

export default CustomerSidebar;

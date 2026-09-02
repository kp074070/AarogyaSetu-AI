import { Search, Bell, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

function Header({ title, subtitle }) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="top-header">
      <div className="header-left">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="header-right">
        <div className="header-search">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            placeholder="Search PHCs, medicines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button className="header-btn" title="Notifications">
          <Bell size={18} />
          <span className="badge-dot"></span>
        </button>

        <div className="header-profile">
          <div className="profile-avatar">DM</div>
          <div className="profile-info">
            <span className="name">Dr. Mehta</span>
            <span className="role">Health Commissioner</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

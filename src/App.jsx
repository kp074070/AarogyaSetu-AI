import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import MapView from './pages/MapView';
import MedicineStock from './pages/MedicineStock';
import Predictions from './pages/Predictions';
import Redistribution from './pages/Redistribution';
import Alerts from './pages/Alerts';
import PHCDetail from './pages/PHCDetail';
import ChatAssistant from './components/ChatAssistant';
import './index.css';

const pageConfig = {
  '/': { title: 'Dashboard Overview', subtitle: 'Real-time healthcare resource monitoring' },
  '/map': { title: 'Map View', subtitle: 'Geographic distribution of PHCs' },
  '/medicine': { title: 'Medicine Stock', subtitle: 'Inventory management & tracking' },
  '/predictions': { title: 'Predictions & Analytics', subtitle: 'AI-powered forecasting' },
  '/redistribution': { title: 'Resource Redistribution', subtitle: 'AI-recommended resource transfers' },
  '/alerts': { title: 'Alerts & Notifications', subtitle: 'System-wide alert management' },
};

function App() {
  const [currentPath, setCurrentPath] = useState('/');

  const config = pageConfig[currentPath] || pageConfig['/'];

  return (
    <Router>
      <div className="app-layout">
        <Sidebar currentPath={currentPath} onNavigate={setCurrentPath} />
        <div className="main-content">
          <Header title={config.title} subtitle={config.subtitle} />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/medicine" element={<MedicineStock />} />
              <Route path="/predictions" element={<Predictions />} />
              <Route path="/redistribution" element={<Redistribution />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/phc/:id" element={<PHCDetail />} />
            </Routes>
          </div>
        </div>
        <ChatAssistant />
      </div>
    </Router>
  );
}

export default App;

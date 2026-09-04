import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import CustomerSidebar from '../components/CustomerSidebar';
import Header from '../components/Header';
import CustomerDashboard from '../pages/CustomerDashboard';
import CustomerAppointments from '../pages/CustomerAppointments';
import CustomerFindPHC from '../pages/CustomerFindPHC';
import CustomerHealthRecords from '../pages/CustomerHealthRecords';
import CustomerMedicineCheck from '../pages/CustomerMedicineCheck';

const pageConfig = {
  '/customer': { title: 'Patient Dashboard', subtitle: 'Your health at a glance' },
  '/customer/appointments': { title: 'My Appointments', subtitle: 'View and manage your appointments' },
  '/customer/find-phc': { title: 'Find PHC', subtitle: 'Search nearby health centres' },
  '/customer/health-records': { title: 'Health Records', subtitle: 'Your complete medical history' },
  '/customer/medicine-check': { title: 'Medicine Availability', subtitle: 'Check medicine stock at nearby PHCs' },
  '/customer/profile': { title: 'My Profile', subtitle: 'Manage your account' },
};

function CustomerLayout() {
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState(location.pathname);

  const config = pageConfig[currentPath] || pageConfig['/customer'];

  return (
    <div className="app-layout">
      <CustomerSidebar currentPath={currentPath} onNavigate={setCurrentPath} />
      <div className="main-content">
        <Header title={config.title} subtitle={config.subtitle} />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<CustomerDashboard />} />
            <Route path="/appointments" element={<CustomerAppointments />} />
            <Route path="/find-phc" element={<CustomerFindPHC />} />
            <Route path="/health-records" element={<CustomerHealthRecords />} />
            <Route path="/medicine-check" element={<CustomerMedicineCheck />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default CustomerLayout;

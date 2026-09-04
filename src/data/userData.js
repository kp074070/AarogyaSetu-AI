// User Data — Pre-seeded demo accounts & profile schemas
// Modeled after Hospital Patient Data Records (Kaggle)

const demoUsers = [
  {
    id: 'USR-C-001',
    email: 'patient@demo.com',
    password: 'demo1234',
    role: 'customer',
    fullName: 'Priya Sharma',
    phone: '+91 98765 43210',
    avatar: 'PS',
    aadhaar: 'XXXX-XXXX-4521',
    bloodGroup: 'B+',
    emergencyContact: '+91 98765 43211',
    dateOfBirth: '1994-03-15',
    gender: 'Female',
    address: 'Flat 302, Sunrise Apartments, Andheri West, Mumbai',
    state: 'Maharashtra',
    district: 'Mumbai',
    registeredAt: '2024-06-10',
    preferredPHC: 'PHC-MH-002',
  },
  {
    id: 'USR-H-001',
    email: 'hospital@demo.com',
    password: 'demo1234',
    role: 'hospital',
    fullName: 'Dr. Rajesh Kumar',
    phone: '+91 87654 32109',
    avatar: 'RK',
    hospitalName: 'PHC Phaltan',
    hospitalId: 'PHC-MH-002',
    registrationId: 'MH-PHC-2024-0842',
    designation: 'Chief Medical Officer',
    state: 'Maharashtra',
    district: 'Satara',
    registeredAt: '2024-01-15',
  },
];

// Blood group options
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Indian states for registration
const indianStates = [
  'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Rajasthan', 'Uttar Pradesh',
  'Gujarat', 'Madhya Pradesh', 'Kerala', 'West Bengal', 'Odisha',
  'Andhra Pradesh', 'Telangana', 'Bihar', 'Punjab', 'Haryana',
  'Jharkhand', 'Chhattisgarh', 'Assam', 'Uttarakhand', 'Goa',
];

function getStoredUsers() {
  try {
    const stored = localStorage.getItem('aarogyasetu_users');
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  // Initialize with demo users
  localStorage.setItem('aarogyasetu_users', JSON.stringify(demoUsers));
  return [...demoUsers];
}

function saveUsers(users) {
  localStorage.setItem('aarogyasetu_users', JSON.stringify(users));
}

export { demoUsers, bloodGroups, indianStates, getStoredUsers, saveUsers };

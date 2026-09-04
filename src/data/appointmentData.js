// Appointment Data — Synthetic patient appointment records
// Modeled after Hospital Patient Data Records Dataset (Kaggle)
// Fields: appointmentId, patientId, phcId, date, doctor, department, status, diagnosis, prescription

import phcData from './phcData';

const departments = [
  'General Medicine', 'Pediatrics', 'Obstetrics & Gynecology',
  'Orthopedics', 'Dermatology', 'ENT', 'Ophthalmology',
  'Dental', 'Emergency', 'Preventive Care',
];

const doctors = [
  { name: 'Dr. Ananya Desai', department: 'General Medicine', qualification: 'MBBS, MD' },
  { name: 'Dr. Vikram Singh', department: 'Pediatrics', qualification: 'MBBS, DCH' },
  { name: 'Dr. Meera Patel', department: 'Obstetrics & Gynecology', qualification: 'MBBS, MS (OBG)' },
  { name: 'Dr. Suresh Nair', department: 'Orthopedics', qualification: 'MBBS, MS (Ortho)' },
  { name: 'Dr. Kavitha Reddy', department: 'Dermatology', qualification: 'MBBS, MD (Derm)' },
  { name: 'Dr. Rajan Menon', department: 'General Medicine', qualification: 'MBBS, DNB' },
  { name: 'Dr. Pooja Gupta', department: 'ENT', qualification: 'MBBS, MS (ENT)' },
  { name: 'Dr. Arjun Rao', department: 'Emergency', qualification: 'MBBS, MD (EM)' },
  { name: 'Dr. Sunita Joshi', department: 'Preventive Care', qualification: 'MBBS, MPH' },
  { name: 'Dr. Karthik Iyer', department: 'Dental', qualification: 'BDS, MDS' },
];

const diagnoses = [
  { condition: 'Acute Upper Respiratory Infection', code: 'J06.9', severity: 'mild' },
  { condition: 'Type 2 Diabetes Mellitus', code: 'E11', severity: 'moderate' },
  { condition: 'Essential Hypertension', code: 'I10', severity: 'moderate' },
  { condition: 'Acute Gastroenteritis', code: 'K52.9', severity: 'mild' },
  { condition: 'Iron Deficiency Anemia', code: 'D50.9', severity: 'moderate' },
  { condition: 'Dengue Fever', code: 'A90', severity: 'severe' },
  { condition: 'Viral Fever', code: 'B34.9', severity: 'mild' },
  { condition: 'Urinary Tract Infection', code: 'N39.0', severity: 'mild' },
  { condition: 'Osteoarthritis', code: 'M19.9', severity: 'moderate' },
  { condition: 'Allergic Rhinitis', code: 'J30.4', severity: 'mild' },
  { condition: 'Migraine', code: 'G43.9', severity: 'moderate' },
  { condition: 'Skin Dermatitis', code: 'L30.9', severity: 'mild' },
  { condition: 'Malaria (P. vivax)', code: 'B51.9', severity: 'severe' },
  { condition: 'Pregnancy Checkup (Normal)', code: 'Z34.0', severity: 'routine' },
  { condition: 'Child Immunization', code: 'Z23', severity: 'routine' },
  { condition: 'Fracture - Lower Limb', code: 'S82', severity: 'severe' },
  { condition: 'Conjunctivitis', code: 'H10.9', severity: 'mild' },
  { condition: 'Asthma Exacerbation', code: 'J45.9', severity: 'moderate' },
];

const prescriptions = [
  ['Paracetamol 500mg (1-0-1, 5 days)', 'Cetirizine 10mg (0-0-1, 5 days)', 'Steam inhalation'],
  ['Metformin 500mg (1-0-1)', 'Glimepiride 1mg (1-0-0)', 'Dietary modification advised'],
  ['Amlodipine 5mg (1-0-0)', 'Telmisartan 40mg (1-0-0)', 'Low salt diet, exercise'],
  ['ORS Packets (as needed)', 'Ondansetron 4mg (SOS)', 'Bland diet, fluids'],
  ['Iron + Folic Acid (1-0-0, 3 months)', 'Vitamin C 500mg (1-0-0)', 'Iron-rich diet'],
  ['Paracetamol 500mg (1-1-1)', 'Platelet monitoring daily', 'Bed rest, adequate fluids'],
  ['Paracetamol 500mg (1-0-1, 3 days)', 'Rest and fluids', 'Follow up if fever persists >3 days'],
  ['Ciprofloxacin 500mg (1-0-1, 5 days)', 'Adequate water intake', 'Urine culture if no improvement'],
  ['Diclofenac 50mg (1-0-1, 7 days)', 'Physiotherapy referral', 'Hot compress twice daily'],
  ['Cetirizine 10mg (0-0-1)', 'Nasal saline spray', 'Avoid dust and allergens'],
  ['Sumatriptan 50mg (SOS)', 'Amitriptyline 10mg (0-0-1)', 'Stress management, sleep hygiene'],
  ['Betamethasone cream (apply twice daily)', 'Cetirizine 10mg (0-0-1)', 'Avoid irritants'],
  ['Chloroquine 250mg (as per protocol)', 'Paracetamol 500mg (SOS)', 'Complete course, follow up'],
  ['Iron + Folic Acid', 'Calcium 500mg', 'Regular checkups, balanced diet'],
  ['Vaccination as per NIS schedule', 'Paracetamol drops (SOS for fever)', 'Next visit in 4 weeks'],
  ['Immobilization + Plaster cast', 'Diclofenac 50mg (1-0-1)', 'Orthopedic follow up in 2 weeks'],
  ['Moxifloxacin eye drops (4 times daily)', 'Cold compress', 'No eye rubbing, follow up in 5 days'],
  ['Salbutamol Inhaler (2 puffs SOS)', 'Budesonide Inhaler (2 puffs BD)', 'Avoid triggers, peak flow monitoring'],
];

const statuses = ['completed', 'upcoming', 'cancelled', 'no-show'];

function generateAppointments(patientId) {
  const seed = patientId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = (n) => ((seed * 9301 + 49297 + n * 31) % 233280) / 233280;
  const now = new Date();
  const appointments = [];

  // Generate 20 past appointments
  for (let i = 0; i < 20; i++) {
    const daysAgo = Math.round(3 + rng(i * 7) * 350);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    const phcIdx = Math.floor(rng(i * 11) * Math.min(10, phcData.length));
    const phc = phcData[phcIdx];
    const diagIdx = Math.floor(rng(i * 13) * diagnoses.length);
    const docIdx = Math.floor(rng(i * 17) * doctors.length);

    const status = rng(i * 23) > 0.15 ? 'completed' : (rng(i * 29) > 0.5 ? 'cancelled' : 'no-show');

    appointments.push({
      id: `APT-${String(i + 1).padStart(4, '0')}`,
      patientId,
      phcId: phc.id,
      phcName: phc.name,
      state: phc.state,
      district: phc.district,
      date: date.toISOString().split('T')[0],
      time: `${9 + Math.floor(rng(i * 31) * 8)}:${rng(i * 37) > 0.5 ? '00' : '30'}`,
      doctor: doctors[docIdx],
      department: doctors[docIdx].department,
      diagnosis: status === 'completed' ? diagnoses[diagIdx] : null,
      prescription: status === 'completed' ? prescriptions[diagIdx] : null,
      status,
      notes: status === 'completed' ? `Patient responded well to treatment. Follow-up ${rng(i * 41) > 0.5 ? 'recommended' : 'not required'}.` : '',
      tokenNumber: Math.floor(rng(i * 43) * 80) + 1,
      fee: Math.round((50 + rng(i * 47) * 250) / 10) * 10,
    });
  }

  // Generate 5 upcoming appointments
  for (let i = 0; i < 5; i++) {
    const daysAhead = Math.round(1 + rng((i + 20) * 7) * 30);
    const date = new Date(now);
    date.setDate(date.getDate() + daysAhead);

    const phcIdx = Math.floor(rng((i + 20) * 11) * Math.min(10, phcData.length));
    const phc = phcData[phcIdx];
    const docIdx = Math.floor(rng((i + 20) * 17) * doctors.length);

    appointments.push({
      id: `APT-${String(i + 21).padStart(4, '0')}`,
      patientId,
      phcId: phc.id,
      phcName: phc.name,
      state: phc.state,
      district: phc.district,
      date: date.toISOString().split('T')[0],
      time: `${9 + Math.floor(rng((i + 20) * 31) * 8)}:${rng((i + 20) * 37) > 0.5 ? '00' : '30'}`,
      doctor: doctors[docIdx],
      department: doctors[docIdx].department,
      diagnosis: null,
      prescription: null,
      status: 'upcoming',
      notes: '',
      tokenNumber: Math.floor(rng((i + 20) * 43) * 80) + 1,
      fee: Math.round((50 + rng((i + 20) * 47) * 250) / 10) * 10,
    });
  }

  return appointments.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getAppointmentStats(patientId) {
  const appointments = generateAppointments(patientId);
  const total = appointments.length;
  const completed = appointments.filter(a => a.status === 'completed').length;
  const upcoming = appointments.filter(a => a.status === 'upcoming').length;
  const cancelled = appointments.filter(a => a.status === 'cancelled').length;
  const nextAppointment = appointments.find(a => a.status === 'upcoming');

  return { total, completed, upcoming, cancelled, nextAppointment, appointments };
}

export { departments, doctors, diagnoses, generateAppointments, getAppointmentStats };
